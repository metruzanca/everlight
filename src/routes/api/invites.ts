import { createFileRoute } from '@tanstack/solid-router'
import { eq, and, gte } from 'drizzle-orm'
import { apiHandler, apiRespond, apiError } from '../../lib/api-logger'
import { requireAuth, baseUrl, sendEmail } from '../../lib/auth'
import { db } from '../../db'
import { organization, user as userTable, orgInvitation } from '../../db/schema'
import { parseBody, createInviteSchema } from '../../lib/validation'

export const Route = createFileRoute('/api/invites')({
  server: {
    handlers: {
      GET: async ({ request }) => apiHandler(request, async () => {
        const url = new URL(request.url)
        const token = url.searchParams.get('token')
        if (!token) return apiError('Token is required')

        const invite = await db
          .select()
          .from(orgInvitation)
          .where(eq(orgInvitation.token, token))
          .limit(1)

        if (invite.length === 0) return apiError('Invitation not found', 404)

        const inv = invite[0]
        if (inv.status !== 'pending') return apiError('Invitation already accepted or declined')
        if (new Date() > inv.expiresAt) return apiError('Invitation has expired')

        const org = await db
          .select({ name: organization.name })
          .from(organization)
          .where(eq(organization.id, inv.orgId))
          .limit(1)

        return apiRespond({
          id: inv.id,
          orgId: inv.orgId,
          orgName: org[0]?.name ?? 'Unknown',
          email: inv.email,
          role: inv.role,
          status: inv.status,
        })
      }, 'invites'),

      POST: async ({ request }) => apiHandler(request, async () => {
        const authSession = await requireAuth(request)

        const parsed = parseBody(createInviteSchema, await request.json())
        if (parsed instanceof Response) return parsed
        const body = parsed

        const org = await db.select().from(organization).where(eq(organization.id, body.orgId)).limit(1)
        if (org.length === 0) return apiError('Organization not found', 404)

        const currentUser = await db
          .select({ role: userTable.role })
          .from(userTable)
          .where(eq(userTable.id, authSession.user.id))
          .limit(1)

        const isSiteAdmin = currentUser[0]?.role === 'admin'
        const isOwner = org[0].ownerId === authSession.user.id

        if (!isSiteAdmin && !isOwner) return apiError('Forbidden', 403)

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

        if (existing.length > 0) return apiError('An invite was already sent to this email in the last 24 hours', 429)

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

        return apiRespond({ success: true }, 201)
      }, 'invites', { max: 10, windowMs: 60_000 }),
    },
  },
})
