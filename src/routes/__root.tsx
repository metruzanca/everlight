import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'

import { HydrationScript } from 'solid-js/web'
import { Show, Suspense, createSignal, type Component } from 'solid-js'

import styleCss from '../styles.css?url'
import { authClient } from '../lib/auth-client'
import { UserProvider } from '../lib/user-provider'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [
      { rel: 'stylesheet', href: styleCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'apple-touch-icon', href: '/logo-192.png' },
    ],
  }),
  errorComponent: (({ error, reset }) => (
    <AppError error={error} reset={reset} />
  )) as Component<any>,
  notFoundComponent: (() => <AppNotFound />) as Component<any>,
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
          <UserProvider>
            <Outlet />
          </UserProvider>
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
      <div class="flex items-center justify-center gap-3 px-4 py-2.5 bg-accent/10 border-b border-accent/20 text-sm text-accent">
        <Show
          when={!sent()}
          fallback={<span>Verification email sent!</span>}
        >
          <span>Please verify your email address.</span>
          <button
            onClick={handleResend}
            class="underline font-medium hover:text-accent/80"
          >
            Resend verification email
          </button>
        </Show>
      </div>
    </Show>
  )
}

function AppError(props: { error: unknown; reset?: () => void }) {
  const message = () =>
    props.error instanceof Error ? props.error.message : 'An unexpected error occurred'

  return (
    <div class="min-h-screen flex flex-col">
      <nav class="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <a href="/dashboard" class="flex items-center gap-2">
          <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
          <span class="text-lg font-semibold font-heading">Everlight</span>
        </a>
        <button
          onClick={() => props.reset?.()}
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again
        </button>
      </nav>

      <div class="flex-1 flex items-center justify-center px-4">
        <div class="w-full max-w-md">
          <div class="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6 text-destructive">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 class="text-xl font-heading font-bold">Something went wrong</h1>
            <p class="text-sm text-muted-foreground break-words">{message()}</p>
            <a
              href="/dashboard"
              class="inline-flex items-center h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppNotFound() {
  return (
    <div class="min-h-screen flex flex-col">
      <nav class="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <a href="/dashboard" class="flex items-center gap-2">
          <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
          <span class="text-lg font-semibold font-heading">Everlight</span>
        </a>
        <a href="/dashboard" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </a>
      </nav>

      <div class="flex-1 flex items-center justify-center px-4">
        <div class="max-w-md text-center space-y-4">
          <div class="text-3xl">🔍</div>
          <h1 class="text-xl font-heading font-bold">Page not found</h1>
          <p class="text-sm text-muted-foreground">This page doesn't exist or has been moved.</p>
          <a
            href="/dashboard"
            class="inline-block mt-2 h-9 px-4 leading-9 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
