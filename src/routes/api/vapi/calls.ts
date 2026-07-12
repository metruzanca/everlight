import { createFileRoute } from '@tanstack/solid-router'
import { auth } from '../../../lib/auth'
import { getCallLogs } from '../../../lib/vapi'

export const Route = createFileRoute('/api/vapi/calls')({
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

        const url = new URL(request.url)
        const limit = Number(url.searchParams.get('limit')) || 20

        const calls = await getCallLogs(limit)
        return new Response(JSON.stringify(calls), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
