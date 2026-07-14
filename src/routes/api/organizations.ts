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

          const currentUser = (await db.select({ role: userTable.role }).from(userTable).where(eq(userTable.id, authSession.user.id)).limit(1))
          const currentUserRole = currentUser[0]?.role ?? null

          const memberships = await db
            .select()
            .from(orgMember)
            .where(eq(orgMember.userId, authSession.user.id))

          const isAdmin = currentUserRole === 'admin'
          const orgs = isAdmin
            ? await db.select().from(organization).orderBy(asc(organization.name))
            : memberships.length > 0
              ? await db.select().from(organization).where(inArray(organization.id, memberships.map((m) => m.orgId))).orderBy(asc(organization.name))
              : []

          return new Response(JSON.stringify({ orgs, memberships, currentUserRole }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: (err as Error).message || 'Failed to fetch organizations' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
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

          const body: { name?: string } = await request.json()
          if (!body.name?.trim()) {
            return new Response(JSON.stringify({ error: 'Organization name is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const id = crypto.randomUUID()
          const now = new Date()

          await db.insert(organization).values({
            id,
            name: body.name.trim(),
            createdAt: now,
            updatedAt: now,
          })

          await db.insert(orgMember).values({
            id: crypto.randomUUID(),
            orgId: id,
            userId: authSession.user.id,
            role: 'admin',
            createdAt: now,
          })

          return new Response(JSON.stringify({ organization: { id, name: body.name.trim() } }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: (err as Error).message || 'Failed to create organization' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
