import { createFileRoute } from '@tanstack/solid-router'
import { apiHandler, apiRespond, apiError } from '../../../lib/api-logger'
import { eq, and } from 'drizzle-orm'
import { auth } from '../../../lib/auth'
import { db } from '../../../db'
import { orgMember, orgInvitation } from '../../../db/schema'

export const Route = createFileRoute('/api/invites/accept')({
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
        if (new Date() > inv.expiresAt) {
          await db.update(orgInvitation).set({ status: 'expired' }).where(eq(orgInvitation.id, inv.id))
          return apiError('Invitation has expired')
        }

        if (inv.email.toLowerCase() !== authSession.user.email.toLowerCase()) {
          return apiError('This invitation was sent to a different email address', 403)
        }

        const existingMember = await db
          .select()
          .from(orgMember)
          .where(and(eq(orgMember.orgId, inv.orgId), eq(orgMember.userId, authSession.user.id)))
          .limit(1)

        if (existingMember.length === 0) {
          await db.insert(orgMember).values({
            id: crypto.randomUUID(),
            orgId: inv.orgId,
            userId: authSession.user.id,
            role: inv.role,
            createdAt: new Date(),
          })
        }

        await db.update(orgInvitation).set({ status: 'accepted' }).where(eq(orgInvitation.id, inv.id))

        return apiRespond({ success: true })
      }, 'invites-accept'),
    },
  },
})
