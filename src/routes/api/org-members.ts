import { createFileRoute } from '@tanstack/solid-router'
import { eq, and } from 'drizzle-orm'
import { auth } from '../../lib/auth'
import { db } from '../../db'
import { organization, orgMember, user as userTable } from '../../db/schema'
import { apiHandler, apiRespond, apiError } from '../../lib/api-logger'

export const Route = createFileRoute('/api/org-members')({
  server: {
    handlers: {
      GET: async ({ request }) => apiHandler(request, async () => {
        const authSession = await auth.api.getSession({ headers: request.headers })
        if (!authSession) return apiError('Unauthorized', 401)

        const url = new URL(request.url)
        const orgId = url.searchParams.get('orgId')
        if (!orgId) return apiError('orgId is required')

        const membership = await db
          .select()
          .from(orgMember)
          .where(and(eq(orgMember.orgId, orgId), eq(orgMember.userId, authSession.user.id)))
          .limit(1)

        if (membership.length === 0) {
          const currentUser = await db
            .select({ role: userTable.role })
            .from(userTable)
            .where(eq(userTable.id, authSession.user.id))
            .limit(1)

          if (currentUser[0]?.role !== 'admin') return apiError('Forbidden', 403)
        }

        const members = await db
          .select({
            id: orgMember.id,
            userId: orgMember.userId,
            role: orgMember.role,
            createdAt: orgMember.createdAt,
            userName: userTable.name,
            userEmail: userTable.email,
          })
          .from(orgMember)
          .where(eq(orgMember.orgId, orgId))
          .innerJoin(userTable, eq(orgMember.userId, userTable.id))

        const org = await db
          .select({ ownerId: organization.ownerId, domainAutoJoin: organization.domainAutoJoin })
          .from(organization)
          .where(eq(organization.id, orgId))
          .limit(1)

        return apiRespond({
          members,
          ownerId: org[0]?.ownerId ?? null,
          domainAutoJoin: org[0]?.domainAutoJoin ?? false,
        })
      }, 'org-members'),

      DELETE: async ({ request }) => apiHandler(request, async () => {
        const authSession = await auth.api.getSession({ headers: request.headers })
        if (!authSession) return apiError('Unauthorized', 401)

        const body: { orgId: string; userId: string } = await request.json()
        if (!body.orgId || !body.userId) return apiError('orgId and userId are required')

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
        if (org[0].ownerId === body.userId) return apiError('Cannot remove the org owner')

        await db.delete(orgMember).where(and(eq(orgMember.orgId, body.orgId), eq(orgMember.userId, body.userId)))

        return apiRespond({ success: true })
      }, 'org-members'),
    },
  },
})
