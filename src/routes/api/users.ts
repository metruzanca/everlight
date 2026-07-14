import { createFileRoute } from '@tanstack/solid-router'
import { eq, asc, inArray } from 'drizzle-orm'
import { auth } from '../../lib/auth'
import { db } from '../../db'
import { user as userTable, account, session as sessionTable, verification, orgMember, organization } from '../../db/schema'

export const Route = createFileRoute('/api/users')({
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

          const currentUser = (await db.select().from(userTable).where(eq(userTable.id, authSession.user.id)).limit(1))[0]

          const users = await db.select().from(userTable).orderBy(asc(userTable.createdAt))

          const userIds = users.map((u) => u.id)
          const allMemberships = userIds.length > 0
            ? await db.select().from(orgMember).where(inArray(orgMember.userId, userIds))
            : []
          const memberOrgIds = [...new Set(allMemberships.map((m) => m.orgId))]
          const allOrgs = memberOrgIds.length > 0
            ? await db.select({ id: organization.id, name: organization.name }).from(organization).where(inArray(organization.id, memberOrgIds))
            : []
          const orgMap = new Map(allOrgs.map((o) => [o.id, o.name]))
          const userOrgs: Record<string, { id: string; name: string }[]> = {}
          for (const m of allMemberships) {
            if (!userOrgs[m.userId]) userOrgs[m.userId] = []
            const name = orgMap.get(m.orgId)
            if (name) userOrgs[m.userId].push({ id: m.orgId, name })
          }

          const firstUserId = users.length > 0 ? users[0].id : null
          return new Response(JSON.stringify({ users, userOrgs, currentUserRole: currentUser?.role ?? 'user', firstUserId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: (err as Error).message || 'Failed to fetch users' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
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

          const currentUser = (await db.select().from(userTable).where(eq(userTable.id, authSession.user.id)).limit(1))[0]
          if (!currentUser || currentUser.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const body: { userId?: string } = await request.json()
          if (!body.userId) {
            return new Response(JSON.stringify({ error: 'userId required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const allUsers = await db.select({ id: userTable.id }).from(userTable).orderBy(asc(userTable.createdAt)).limit(1)
          const firstUserId = allUsers.length > 0 ? allUsers[0].id : null

          if (body.userId === firstUserId) {
            return new Response(JSON.stringify({ error: 'Cannot delete the first user' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          await db.transaction(async (tx) => {
            await tx.delete(orgMember).where(eq(orgMember.userId, body.userId!))
            await tx.delete(account).where(eq(account.userId, body.userId!))
            await tx.delete(sessionTable).where(eq(sessionTable.userId, body.userId!))
            await tx.delete(verification).where(eq(verification.identifier, body.userId!))
            await tx.delete(userTable).where(eq(userTable.id, body.userId!))
          })

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: (err as Error).message || 'Failed to delete user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
