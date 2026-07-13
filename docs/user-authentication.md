# User Authentication

Built with [Better Auth](https://better-auth.com/) + Drizzle ORM + PostgreSQL.

## Implemented

- **Sign up** — `/sign-up` with name/email/password
- **Sign in** — `/sign-in` with email/password, redirects to `/dashboard`
- **Sign out** — from dashboard or any page
- **Email verification** — sent on sign-up via Resend (or logged to console in dev via `ENABLE_EMAIL` toggle)
- **Verify email page** — `/verify-email` (success confirmation after clicking email link)
- **Resend verification** — banner on all pages when unverified
- **Session management** — `authClient.useSession()` signal, session cookies via `tanstackStartCookies()`
- **Redirect logged-in users** — `/sign-in` redirects to `/dashboard` if already authenticated
- **Forgot password** — `/forgot-password` (email form → reset link via Resend)
- **Reset password** — `/reset-password?token=` (new password form)
- **Change password** — `/settings` (current + new password, requires authentication)
