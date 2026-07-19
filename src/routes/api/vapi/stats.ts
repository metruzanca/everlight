import { createFileRoute } from '@tanstack/solid-router'
import { auth } from '../../../lib/auth'
import { getStats, resolveOrgAssistantIds } from '../../../lib/vapi'
import { apiHandler, apiRespond } from '../../../lib/api-logger'

export const Route = createFileRoute('/api/vapi/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => apiHandler(request, async () => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

        const url = new URL(request.url)
        const orgId = url.searchParams.get('orgId')

        const assistantIds = await resolveOrgAssistantIds(session.user.id, orgId)
        const stats = await getStats(assistantIds?.length ? assistantIds : (assistantIds === null ? undefined : []))
        return apiRespond(stats)
      }, 'vapi-stats'),
    },
  },
})
