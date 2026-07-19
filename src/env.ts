import { config } from 'dotenv'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Only used in development
config({ path: '.env' })

export const env = createEnv({
  server: {
    BETTER_AUTH_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(1),
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().optional().default(3000),
    RAILWAY_PUBLIC_DOMAIN: z.string().optional(),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email(),
    SERVER_URL: z.string().url().optional(),
    VAPI_API_KEY: z.string().optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
  },

  runtimeEnv: { ...process.env, ...import.meta.env },

  emptyStringAsUndefined: true,
})
