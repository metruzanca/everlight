import { createFileRoute } from '@tanstack/solid-router'
import { eq } from 'drizzle-orm'
import { auth } from '../../../lib/auth'
import { db } from '../../../db'
import { orgInvitation } from '../../../db/schema'

export const Route = createFileRoute('/api/invites/decline')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authSession = await auth.api.getSession({ headers: request.headers })
          if (!authSession) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const body: { token: string } = await request.json()
          if (!body.token) {
            return new Response(JSON.stringify({ error: 'Token is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const invite = await db
            .select()
            .from(orgInvitation)
            .where(eq(orgInvitation.token, body.token))
            .limit(1)

          if (invite.length === 0) {
            return new Response(JSON.stringify({ error: 'Invitation not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const inv = invite[0]
          if (inv.status !== 'pending') {
            return new Response(JSON.stringify({ error: 'Invitation already processed' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          if (inv.email.toLowerCase() !== authSession.user.email.toLowerCase()) {
            return new Response(
              JSON.stringify({ error: 'This invitation was sent to a different email address' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await db
            .update(orgInvitation)
            .set({ status: 'declined' })
            .where(eq(orgInvitation.id, inv.id))

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to decline invitation' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
