import { VapiClient } from '@vapi-ai/server-sdk'
import { env } from '../env'

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

export async function getStats(): Promise<VapiStats> {
  const client = getClient()
  if (!client) {
    throw new Error('VAPI_API_KEY not configured')
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const analyticsResult = await client.analytics.get({
    queries: [
      {
        table: 'call',
        name: 'Total Calls',
        operations: [{ operation: 'count', column: 'id' }],
      },
      {
        table: 'call',
        name: 'Answered Calls',
        operations: [{ operation: 'count', column: 'id' }],
      },
      {
        table: 'call',
        name: 'Average Duration',
        operations: [{ operation: 'avg', column: 'duration' }],
      },
    ],
  })

  const totalCalls = Number((analyticsResult[0]?.result?.[0] as Record<string, unknown>)?.count ?? 0)
  const answeredCalls = Number((analyticsResult[1]?.result?.[0] as Record<string, unknown>)?.count ?? 0)
  const averageCallDuration = Number((analyticsResult[2]?.result?.[0] as Record<string, unknown>)?.avgDuration ?? 0)

  const recentCalls = await client.calls.list({
    limit: 100,
    createdAtGe: thirtyDaysAgo.toISOString(),
  })

  let afterHoursCalls = 0
  let appointmentKeywords = 0

  for (const call of recentCalls) {
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

export async function getCallLogs(limit = 20): Promise<VapiCallLogEntry[]> {
  const client = getClient()
  if (!client) {
    throw new Error('VAPI_API_KEY not configured')
  }

  const [assistants, calls] = await Promise.all([
    client.assistants.list().catch(() => []),
    client.calls.list({ limit }),
  ])

  const assistantNames = new Map<string, string>()
  for (const a of assistants) {
    if (a.id && a.name) assistantNames.set(a.id, a.name)
  }

  return calls.map((call) => {
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
