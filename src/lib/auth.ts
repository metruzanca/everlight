import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { tanstackStartCookies } from 'better-auth/tanstack-start/solid'
import { Resend } from 'resend'
import { env } from '../env'
import { db } from '../db'
import * as schema from '../db/schema'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

const baseUrl = env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${env.RAILWAY_PUBLIC_DOMAIN}`
  : env.BETTER_AUTH_URL ?? `http://localhost:${env.PORT}`

async function sendEmail(to: string, subject: string, html: string, devLog: string) {
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
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
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
