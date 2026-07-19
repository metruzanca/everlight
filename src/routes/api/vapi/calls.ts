import { createFileRoute } from '@tanstack/solid-router'
import { requireAuth } from '../../../lib/auth'
import { getCallLogs, resolveOrgAssistantIds } from '../../../lib/vapi'
import { apiHandler, apiRespond } from '../../../lib/api-logger'
import { parseQuery, vapiCallsQuerySchema } from '../../../lib/validation'

export const Route = createFileRoute('/api/vapi/calls')({
  server: {
    handlers: {
      GET: async ({ request }) => apiHandler(request, async () => {
        const session = await requireAuth(request)

        const url = new URL(request.url)
        const q = parseQuery(vapiCallsQuerySchema, url)
        if (q instanceof Response) return q
        const limit = q.limit ?? 20
        const orgId = q.orgId

        const assistantIds = await resolveOrgAssistantIds(session.user.id, orgId)
        const calls = await getCallLogs(limit, assistantIds?.length ? assistantIds : (assistantIds === null ? undefined : []))
        return apiRespond(calls)
      }, 'vapi-calls', { max: 30, windowMs: 60_000 }),
    },
  },
})
