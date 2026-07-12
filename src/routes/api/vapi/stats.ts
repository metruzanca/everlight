import { createFileRoute } from '@tanstack/solid-router'
import { auth } from '../../../lib/auth'
import { getStats } from '../../../lib/vapi'

export const Route = createFileRoute('/api/vapi/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const stats = await getStats()
        return new Response(JSON.stringify(stats), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
