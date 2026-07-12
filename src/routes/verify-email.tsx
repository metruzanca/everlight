import { createFileRoute } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmail,
})

function VerifyEmail() {
  const session = authClient.useSession()

  return (
    <div class="flex min-h-screen items-center justify-center">
      <div class="w-full max-w-sm mx-4 text-center space-y-4">
        <div class="text-4xl">✅</div>
        <h1 class="text-2xl font-bold">Email verified</h1>
        <p class="text-neutral-600">
          Your email has been verified successfully.
        </p>

        <Show
          when={session().data?.user}
          fallback={
            <a
              href="/sign-in"
              class="inline-block mt-4 h-9 px-4 leading-9 text-sm font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              Sign in
            </a>
          }
        >
          <a
            href="/"
            class="inline-block mt-4 h-9 px-4 leading-9 text-sm font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800"
          >
            Go home
          </a>
        </Show>
      </div>
    </div>
  )
}
