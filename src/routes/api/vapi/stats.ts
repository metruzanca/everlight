import { createFileRoute } from '@tanstack/solid-router'
import { requireAuth } from '../../../lib/auth'
import { getStats, resolveOrgAssistantIds } from '../../../lib/vapi'
import { apiHandler, apiRespond } from '../../../lib/api-logger'

export const Route = createFileRoute('/api/vapi/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => apiHandler(request, async () => {
        const session = await requireAuth(request)

        const url = new URL(request.url)
        const orgId = url.searchParams.get('orgId')

        const assistantIds = await resolveOrgAssistantIds(session.user.id, orgId)
        const stats = await getStats(assistantIds?.length ? assistantIds : (assistantIds === null ? undefined : []))
        return apiRespond(stats)
      }, 'vapi-stats', { max: 30, windowMs: 60_000 }),
    },
  },
})
