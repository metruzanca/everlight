import { createFileRoute } from '@tanstack/solid-router'
import { eq } from 'drizzle-orm'
import { auth } from '../../../lib/auth'
import { db } from '../../../db'
import { orgMember, orgAssistant } from '../../../db/schema'
import { getCallLogs } from '../../../lib/vapi'

async function resolveOrgAssistantIds(userId: string, orgId?: string | null): Promise<string[] | null> {
  if (orgId === 'all') return null
  if (orgId) {
    const assignments = await db.select().from(orgAssistant).where(eq(orgAssistant.orgId, orgId))
    return assignments.map((a) => a.assistantId)
  }
  const memberships = await db.select().from(orgMember).where(eq(orgMember.userId, userId)).limit(1)
  if (memberships.length === 0) return []
  const firstOrg = await db.select().from(orgAssistant).where(eq(orgAssistant.orgId, memberships[0].orgId))
  return firstOrg.map((a) => a.assistantId)
}

export const Route = createFileRoute('/api/vapi/calls')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const session = await auth.api.getSession({ headers: request.headers })
          if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const url = new URL(request.url)
          const limit = Number(url.searchParams.get('limit')) || 20
          const orgId = url.searchParams.get('orgId')

          const assistantIds = await resolveOrgAssistantIds(session.user.id, orgId)
          const calls = await getCallLogs(limit, assistantIds?.length ? assistantIds : (assistantIds === null ? undefined : []))
          return new Response(JSON.stringify(calls), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: (err as Error).message || 'Vapi error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
