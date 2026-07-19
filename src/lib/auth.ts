import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { tanstackStartCookies } from 'better-auth/tanstack-start/solid'
import { eq, and, sql } from 'drizzle-orm'
import { Resend } from 'resend'
import { env } from '../env'
import { db } from '../db'
import * as schema from '../db/schema'
import { BLOCKED_DOMAINS } from './blocked-domains'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export const baseUrl = env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${env.RAILWAY_PUBLIC_DOMAIN}`
  : env.BETTER_AUTH_URL ?? `http://localhost:${env.PORT}`

export async function sendEmail(to: string, subject: string, html: string, devLog: string) {
  if (resend) {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    })
  } else {
    console.log(`[DEV] ${devLog}`)
  }
}

export const auth = betterAuth({
  baseURL: baseUrl,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.execute(sql`SELECT pg_advisory_lock(42)`)
          try {
            const rows = await db.select().from(schema.user).limit(2)
            if (rows.length === 1) {
              await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.id, user.id))
            }
          } finally {
            await db.execute(sql`SELECT pg_advisory_unlock(42)`)
          }

          const userDomain = user.email.split('@')[1]?.toLowerCase()
          if (!userDomain || BLOCKED_DOMAINS.has(userDomain)) return

          const orgs = await db
            .select()
            .from(schema.organization)
            .where(
              and(
                eq(schema.organization.domainAutoJoin, true),
                eq(schema.organization.domain, userDomain),
              ),
            )

          for (const org of orgs) {
            const token = crypto.randomUUID()
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

            await db.insert(schema.orgInvitation).values({
              id: crypto.randomUUID(),
              orgId: org.id,
              email: user.email,
              role: 'member',
              token,
              status: 'pending',
              expiresAt,
              invitedBy: user.id,
              createdAt: new Date(),
            })

            const inviteUrl = `${baseUrl}/invite?token=${token}`
            await sendEmail(
              user.email,
              `You've been invited to join ${org.name}`,
              `<p>You've been auto-invited to join <strong>${org.name}</strong> on Everlight.</p><p><a href="${inviteUrl}">Accept invitation</a></p>`,
              `Auto-invite for ${user.email} to ${org.name}: ${inviteUrl}`,
            )
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      await sendEmail(
        user.email,
        'Reset your password',
        `<a href="${resetUrl}">Reset your password</a>`,
        `Reset password URL for ${user.email}: ${resetUrl}`,
      )
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&callbackURL=/verify-email`
      await sendEmail(
        user.email,
        'Verify your email',
        `<a href="${verifyUrl}">Verify your email</a>`,
        `Verification URL for ${user.email}: ${verifyUrl}`,
      )
    },
  },
  plugins: [tanstackStartCookies()],
})

export class AuthError extends Error {
  response: Response
  constructor() {
    super('Unauthorized')
    this.name = 'AuthError'
    this.response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new AuthError()
  return session
}
