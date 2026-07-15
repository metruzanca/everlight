import { createFileRoute } from '@tanstack/solid-router'
import { eq, and } from 'drizzle-orm'
import { auth } from '../../lib/auth'
import { db } from '../../db'
import { organization, orgMember, user as userTable } from '../../db/schema'

export const Route = createFileRoute('/api/org-members')({
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

          const url = new URL(request.url)
          const orgId = url.searchParams.get('orgId')
          if (!orgId) {
            return new Response(JSON.stringify({ error: 'orgId is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const membership = await db
            .select()
            .from(orgMember)
            .where(
              and(eq(orgMember.orgId, orgId), eq(orgMember.userId, authSession.user.id)),
            )
            .limit(1)

          if (membership.length === 0) {
            const currentUser = await db
              .select({ role: userTable.role })
              .from(userTable)
              .where(eq(userTable.id, authSession.user.id))
              .limit(1)

            if (currentUser[0]?.role !== 'admin') {
              return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
              })
            }
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
            .select({
              ownerId: organization.ownerId,
              domainAutoJoin: organization.domainAutoJoin,
            })
            .from(organization)
            .where(eq(organization.id, orgId))
            .limit(1)

          return new Response(
            JSON.stringify({
              members,
              ownerId: org[0]?.ownerId ?? null,
              domainAutoJoin: org[0]?.domainAutoJoin ?? false,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to fetch members' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
      DELETE: async ({ request }) => {
        try {
          const authSession = await auth.api.getSession({ headers: request.headers })
          if (!authSession) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const body: { orgId: string; userId: string } = await request.json()
          if (!body.orgId || !body.userId) {
            return new Response(JSON.stringify({ error: 'orgId and userId are required' }), {
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

          if (org[0].ownerId === body.userId) {
            return new Response(JSON.stringify({ error: 'Cannot remove the org owner' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          await db
            .delete(orgMember)
            .where(
              and(eq(orgMember.orgId, body.orgId), eq(orgMember.userId, body.userId)),
            )

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message || 'Failed to remove member' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
