import { VapiClient } from '@vapi-ai/server-sdk'
import { eq, inArray } from 'drizzle-orm'
import { env } from '../env'
import { db } from '../db'
import { orgMember, orgAssistant, user as userSchema } from '../db/schema'

function createClient() {
  if (!env.VAPI_API_KEY) return null
  try {
    return new VapiClient({ token: env.VAPI_API_KEY })
  } catch {
    return null
  }
}

let _client: VapiClient | null | undefined = undefined

function getClient() {
  if (_client === undefined) _client = createClient()
  return _client
}

const businessHours = {
  startHour: 9,
  endHour: 17,
  timezone: 'America/New_York',
}

/**
 * Returns the assistant IDs a user is allowed to see.
 * Returns null for unrestricted access (admin without org filter).
 * Returns [] when the user has no access to any assistant.
 */
export async function getUserAssistantIds(userId: string): Promise<string[] | null> {
  const user = await db.select().from(userSchema).where(eq(userSchema.id, userId)).limit(1)
  if (user.length === 0) return []

  const memberships = await db.select().from(orgMember).where(eq(orgMember.userId, userId))
  if (memberships.length === 0) {
    return user[0].role === 'admin' ? null : []
  }

  const orgIds = memberships.map((m) => m.orgId)
  const assignments = await db.select().from(orgAssistant).where(inArray(orgAssistant.orgId, orgIds))
  return assignments.map((a) => a.assistantId)
}

export type VapiStats = {
  totalCalls: number
  callsAnswered: number
  averageCallDuration: number
  afterHoursCalls: number
  appointmentsBooked: number | null
  bookingRatio: number | null
}

export type VapiCallLogEntry = {
  id: string
  phoneNumber: string
  customerNumber: string
  duration: number
  status: string
  endedReason: string
  startedAt: string
  cost: number
  summary: string | null
  assistantName: string
}

function isInBusinessHours(date: Date): boolean {
  const hour = date.getHours()
  const day = date.getDay()
  return day >= 1 && day <= 5 && hour >= businessHours.startHour && hour < businessHours.endHour
}

export async function getStats(assistantIds?: string[]): Promise<VapiStats> {
  const client = getClient()
  if (!client) {
    throw new Error('VAPI_API_KEY not configured')
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const assistantFilter = assistantIds && assistantIds.length > 0
    ? (call: { assistantId?: string }) => call.assistantId != null && assistantIds.includes(call.assistantId)
    : () => true

  const recentCalls = await client.calls.list({
    limit: 100,
    createdAtGe: thirtyDaysAgo.toISOString(),
  })

  const filteredCalls = recentCalls.filter(assistantFilter)

  const totalCalls = filteredCalls.length
  const answeredCalls = filteredCalls.filter((c) => c.status === 'ended').length
  const totalDuration = filteredCalls.reduce((sum, c) => {
    if (c.startedAt && c.endedAt) {
      return sum + (new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()) / 1000
    }
    return sum
  }, 0)
  const averageCallDuration = answeredCalls > 0 ? totalDuration / answeredCalls : 0

  let afterHoursCalls = 0
  let appointmentKeywords = 0

  for (const call of filteredCalls) {
    if (call.startedAt && !isInBusinessHours(new Date(call.startedAt))) {
      afterHoursCalls++
    }

    const summary = call.analysis?.summary?.toLowerCase() ?? ''
    const structured = JSON.stringify(call.analysis?.structuredData ?? {}).toLowerCase()
    const combined = `${summary} ${structured}`
    if (/booked|confirmed|appointment|scheduled/.test(combined)) {
      appointmentKeywords++
    }
  }

  return {
    totalCalls,
    callsAnswered: answeredCalls,
    averageCallDuration,
    afterHoursCalls,
    appointmentsBooked: appointmentKeywords > 0 ? appointmentKeywords : null,
    bookingRatio:
      appointmentKeywords > 0 && answeredCalls > 0
        ? Math.round((appointmentKeywords / answeredCalls) * 1000) / 10
        : null,
  }
}

export async function getCallLogs(limit = 20, assistantIds?: string[]): Promise<VapiCallLogEntry[]> {
  const client = getClient()
  if (!client) {
    throw new Error('VAPI_API_KEY not configured')
  }

  const [assistants, calls] = await Promise.all([
    client.assistants.list().catch(() => []),
    client.calls.list({ limit }),
  ])

  const assistantFilter = assistantIds && assistantIds.length > 0
    ? (call: { assistantId?: string }) => call.assistantId != null && assistantIds.includes(call.assistantId)
    : () => true

  const assistantNames = new Map<string, string>()
  for (const a of assistants) {
    if (a.id && a.name) assistantNames.set(a.id, a.name)
  }

  return calls.filter(assistantFilter).map((call) => {
    const startedAt = call.startedAt ?? ''
    const endedAt = call.endedAt ?? ''
    const duration = startedAt && endedAt
      ? (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
      : 0

    const assistantName =
      call.assistant?.name
      ?? (call.assistantId ? assistantNames.get(call.assistantId) : undefined)
      ?? 'Unknown'

    return {
      id: call.id,
      phoneNumber: call.phoneNumber?.twilioPhoneNumber ?? '',
      customerNumber: call.customer?.number ?? '',
      duration,
      status: call.status ?? '',
      endedReason: call.endedReason ?? '',
      startedAt,
      cost: call.cost ?? 0,
      summary: call.analysis?.summary ?? null,
      assistantName,
    }
  })
}
