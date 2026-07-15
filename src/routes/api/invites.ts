import { createFileRoute } from '@tanstack/solid-router'
import { eq, and, gte } from 'drizzle-orm'
import { auth, baseUrl, sendEmail } from '../../lib/auth'
import { db } from '../../db'
import { organization, user as userTable, orgInvitation } from '../../db/schema'

export const Route = createFileRoute('/api/invites')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const token = url.searchParams.get('token')
          if (!token) {
            return new Response(JSON.stringify({ error: 'Token is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const invite = await db
            .select()
            .from(orgInvitation)
            .where(eq(orgInvitation.token, token))
            .limit(1)

          if (invite.length === 0) {
            return new Response(JSON.stringify({ error: 'Invitation not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const inv = invite[0]
          if (inv.status !== 'pending') {
            return new Response(
              JSON.stringify({ error: 'Invitation already accepted or declined' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (new Date() > inv.expiresAt) {
            return new Response(JSON.stringify({ error: 'Invitation has expired' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const org = await db
            .select({ name: organization.name })
            .from(organization)
            .where(eq(organization.id, inv.orgId))
            .limit(1)

          return new Response(
            JSON.stringify({
              id: inv.id,
              orgId: inv.orgId,
              orgName: org[0]?.name ?? 'Unknown',
              email: inv.email,
              role: inv.role,
              status: inv.status,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to fetch invitation' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
      POST: async ({ request }) => {
        try {
          const authSession = await auth.api.getSession({ headers: request.headers })
          if (!authSession) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const body: { orgId: string; email: string; role?: string } = await request.json()
          if (!body.orgId || !body.email) {
            return new Response(JSON.stringify({ error: 'orgId and email are required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const org = await db
            .select()
            .from(organization)
            .where(eq(organization.id, body.orgId))
            .limit(1)

          if (org.length === 0) {
            return new Response(JSON.stringify({ error: 'Organization not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const currentUser = await db
            .select({ role: userTable.role })
            .from(userTable)
            .where(eq(userTable.id, authSession.user.id))
            .limit(1)

          const isSiteAdmin = currentUser[0]?.role === 'admin'
          const isOwner = org[0].ownerId === authSession.user.id

          if (!isSiteAdmin && !isOwner) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const cooldown = new Date(Date.now() - 24 * 60 * 60 * 1000)
          const existing = await db
            .select()
            .from(orgInvitation)
            .where(
              and(
                eq(orgInvitation.orgId, body.orgId),
                eq(orgInvitation.email, body.email.toLowerCase().trim()),
                eq(orgInvitation.status, 'pending'),
                gte(orgInvitation.createdAt, cooldown),
              ),
            )
            .limit(1)

          if (existing.length > 0) {
            return new Response(
              JSON.stringify({
                error: 'An invite was already sent to this email in the last 24 hours',
              }),
              { status: 429, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const token = crypto.randomUUID()
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

          await db.insert(orgInvitation).values({
            id: crypto.randomUUID(),
            orgId: body.orgId,
            email: body.email.toLowerCase().trim(),
            role: body.role ?? 'member',
            token,
            status: 'pending',
            expiresAt,
            invitedBy: authSession.user.id,
            createdAt: new Date(),
          })

          const inviteUrl = `${baseUrl}/invite?token=${token}`
          await sendEmail(
            body.email,
            `You've been invited to join ${org[0].name}`,
            `<p>You've been invited to join <strong>${org[0].name}</strong> on Everlight.</p><p><a href="${inviteUrl}">Accept invitation</a></p>`,
            `Invite for ${body.email} to ${org[0].name}: ${inviteUrl}`,
          )

          return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to create invitation' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
