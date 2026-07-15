import { createFileRoute } from '@tanstack/solid-router'
import { eq, asc, inArray } from 'drizzle-orm'
import { auth } from '../../lib/auth'
import { db } from '../../db'
import { organization, orgMember, user as userTable } from '../../db/schema'
import { apiHandler, apiRespond, apiError } from '../../lib/api-logger'

export const Route = createFileRoute('/api/organizations')({
  server: {
    handlers: {
      GET: async ({ request }) => apiHandler(request, async () => {
        const authSession = await auth.api.getSession({ headers: request.headers })
        if (!authSession) return apiError('Unauthorized', 401)

        const currentUser = await db
          .select({ role: userTable.role })
          .from(userTable)
          .where(eq(userTable.id, authSession.user.id))
          .limit(1)
        const currentUserRole = currentUser[0]?.role ?? null

        const memberships = await db
          .select()
          .from(orgMember)
          .where(eq(orgMember.userId, authSession.user.id))

        const isAdmin = currentUserRole === 'admin'
        const orgs = isAdmin
          ? await db.select().from(organization).orderBy(asc(organization.name))
          : memberships.length > 0
            ? await db
                .select()
                .from(organization)
                .where(inArray(organization.id, memberships.map((m) => m.orgId)))
                .orderBy(asc(organization.name))
            : []

        return apiRespond({ orgs, memberships, currentUserRole })
      }, 'organizations'),

      POST: async ({ request }) => apiHandler(request, async () => {
        const authSession = await auth.api.getSession({ headers: request.headers })
        if (!authSession) return apiError('Unauthorized', 401)

        const body: { name?: string; domainAutoJoin?: boolean } = await request.json()
        if (!body.name?.trim()) return apiError('Organization name is required')

        const id = crypto.randomUUID()
        const now = new Date()
        const emailDomain = authSession.user.email?.split('@')[1]?.toLowerCase()

        await db.insert(organization).values({
          id,
          name: body.name.trim(),
          ownerId: authSession.user.id,
          domain: body.domainAutoJoin && emailDomain ? emailDomain : null,
          domainAutoJoin: body.domainAutoJoin ?? false,
          createdAt: now,
          updatedAt: now,
        })

        await db.insert(orgMember).values({
          id: crypto.randomUUID(),
          orgId: id,
          userId: authSession.user.id,
          role: 'member',
          createdAt: now,
        })

        return apiRespond({ organization: { id, name: body.name.trim() } }, 201)
      }, 'organizations'),

      PATCH: async ({ request }) => apiHandler(request, async () => {
        const authSession = await auth.api.getSession({ headers: request.headers })
        if (!authSession) return apiError('Unauthorized', 401)

        const body: { id: string; domainAutoJoin?: boolean } = await request.json()
        if (!body.id) return apiError('Organization ID is required')

        const org = await db
          .select()
          .from(organization)
          .where(eq(organization.id, body.id))
          .limit(1)

        if (org.length === 0) return apiError('Organization not found', 404)

        const currentUser = await db
          .select({ role: userTable.role })
          .from(userTable)
          .where(eq(userTable.id, authSession.user.id))
          .limit(1)

        const isSiteAdmin = currentUser[0]?.role === 'admin'
        const isOwner = org[0].ownerId === authSession.user.id

        if (!isSiteAdmin && !isOwner) return apiError('Forbidden', 403)

        const updates: Record<string, unknown> = {}
        if (body.domainAutoJoin !== undefined) {
          updates.domainAutoJoin = body.domainAutoJoin
        }
        updates.updatedAt = new Date()

        await db.update(organization).set(updates).where(eq(organization.id, body.id))

        return apiRespond({ success: true })
      }, 'organizations'),
    },
  },
})
