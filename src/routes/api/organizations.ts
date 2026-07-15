import { createFileRoute } from '@tanstack/solid-router'
import { eq, asc, inArray } from 'drizzle-orm'
import { auth } from '../../lib/auth'
import { db } from '../../db'
import { organization, orgMember, user as userTable } from '../../db/schema'

export const Route = createFileRoute('/api/organizations')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authSession = await auth.api.getSession({ headers: request.headers })
          if (!authSession) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

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

          return new Response(JSON.stringify({ orgs, memberships, currentUserRole }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to fetch organizations' }),
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

          const body: { name?: string; domainAutoJoin?: boolean } = await request.json()
          if (!body.name?.trim()) {
            return new Response(JSON.stringify({ error: 'Organization name is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

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

          return new Response(JSON.stringify({ organization: { id, name: body.name.trim() } }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to create organization' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
      PATCH: async ({ request }) => {
        try {
          const authSession = await auth.api.getSession({ headers: request.headers })
          if (!authSession) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const body: { id: string; domainAutoJoin?: boolean } = await request.json()
          if (!body.id) {
            return new Response(JSON.stringify({ error: 'Organization ID is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const org = await db
            .select()
            .from(organization)
            .where(eq(organization.id, body.id))
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

          const updates: Record<string, unknown> = {}
          if (body.domainAutoJoin !== undefined) {
            updates.domainAutoJoin = body.domainAutoJoin
          }
          updates.updatedAt = new Date()

          await db.update(organization).set(updates).where(eq(organization.id, body.id))

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to update organization' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
