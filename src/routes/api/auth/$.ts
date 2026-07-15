import { createFileRoute } from '@tanstack/solid-router'
import { apiHandler } from '../../../lib/api-logger'
import { auth } from '../../../lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => apiHandler(request, async () => auth.handler(request), 'auth'),
      POST: ({ request }) => apiHandler(request, async () => auth.handler(request), 'auth'),
    },
  },
})
