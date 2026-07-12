import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { tanstackStartCookies } from 'better-auth/tanstack-start/solid'
import { Resend } from 'resend'
import { env } from '../env'
import { db } from '../db'
import * as schema from '../db/schema'

const resend = new Resend(env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verifyUrl = `${env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=/verify-email`

      if (env.ENABLE_EMAIL) {
        await resend.emails.send({
          from: env.RESEND_FROM_EMAIL,
          to: user.email,
          subject: 'Verify your email',
          html: `<a href="${verifyUrl}">Verify your email</a>`,
        })
      } else {
        console.log(`[DEV] Verification URL for ${user.email}: ${verifyUrl}`)
      }
    },
  },
  plugins: [tanstackStartCookies()],
})
