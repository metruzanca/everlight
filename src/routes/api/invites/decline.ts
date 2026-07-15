import { createFileRoute } from '@tanstack/solid-router'
import { apiHandler, apiRespond, apiError } from '../../../lib/api-logger'
import { eq } from 'drizzle-orm'
import { auth } from '../../../lib/auth'
import { db } from '../../../db'
import { orgInvitation } from '../../../db/schema'

export const Route = createFileRoute('/api/invites/decline')({
  server: {
    handlers: {
      POST: async ({ request }) => apiHandler(request, async () => {
        const authSession = await auth.api.getSession({ headers: request.headers })
        if (!authSession) return apiError('Unauthorized', 401)

        const body: { token: string } = await request.json()
        if (!body.token) return apiError('Token is required')

        const invite = await db
          .select()
          .from(orgInvitation)
          .where(eq(orgInvitation.token, body.token))
          .limit(1)

        if (invite.length === 0) return apiError('Invitation not found', 404)

        const inv = invite[0]
        if (inv.status !== 'pending') return apiError('Invitation already processed')

        if (inv.email.toLowerCase() !== authSession.user.email.toLowerCase()) {
          return apiError('This invitation was sent to a different email address', 403)
        }

        await db.update(orgInvitation).set({ status: 'declined' }).where(eq(orgInvitation.id, inv.id))

        return apiRespond({ success: true })
      }, 'invites-decline'),
    },
  },
})
