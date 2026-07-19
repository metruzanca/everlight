import { createFileRoute } from '@tanstack/solid-router'
import { auth } from '../../../lib/auth'
import { getCallLogs, resolveOrgAssistantIds } from '../../../lib/vapi'
import { apiHandler, apiRespond } from '../../../lib/api-logger'

export const Route = createFileRoute('/api/vapi/calls')({
  server: {
    handlers: {
      GET: async ({ request }) => apiHandler(request, async () => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

        const url = new URL(request.url)
        const limit = Number(url.searchParams.get('limit')) || 20
        const orgId = url.searchParams.get('orgId')

        const assistantIds = await resolveOrgAssistantIds(session.user.id, orgId)
        const calls = await getCallLogs(limit, assistantIds?.length ? assistantIds : (assistantIds === null ? undefined : []))
        return apiRespond(calls)
      }, 'vapi-calls'),
    },
  },
})
