import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'

import '@fontsource/inter/400.css'

import { HydrationScript } from 'solid-js/web'
import { Show, Suspense, createSignal } from 'solid-js'

import styleCss from '../styles.css?url'
import { authClient } from '../lib/auth-client'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: 'stylesheet', href: styleCss }],
  }),
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <html>
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <Suspense>
          <VerifyBanner />
          <Outlet />
          <TanStackRouterDevtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}

function VerifyBanner() {
  const session = authClient.useSession()
  const [sent, setSent] = createSignal(false)

  const user = () => session().data?.user
  const show = () => !session().isPending && user() && !user()!.emailVerified

  const handleResend = async () => {
    await authClient.sendVerificationEmail({
      email: user()!.email,
      callbackURL: '/verify-email',
    })
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <Show when={show()}>
      <div class="flex items-center justify-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-800">
        <Show
          when={!sent()}
          fallback={<span>Verification email sent!</span>}
        >
          <span>Please verify your email address.</span>
          <button
            onClick={handleResend}
            class="underline font-medium hover:text-amber-900"
          >
            Resend verification email
          </button>
        </Show>
      </div>
    </Show>
  )
}
