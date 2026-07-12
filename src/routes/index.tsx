import { createFileRoute } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const session = authClient.useSession()

  return (
    <div class="p-8">
      <h1 class="text-4xl font-bold">Welcome to Everlight</h1>

      <Show when={session().isPending}>
        <p class="mt-4 text-lg text-neutral-500">Loading session...</p>
      </Show>

      <Show when={session().data?.user}>
        {(user) => (
          <div class="mt-4 space-y-4">
            <p class="text-lg">
              Hello, <strong>{user().name}</strong>!
            </p>
            <p class="text-sm text-neutral-500">{user().email}</p>
            <button
              onClick={() => { void authClient.signOut() }}
              class="mt-4 h-9 px-4 text-sm font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              Sign out
            </button>
          </div>
        )}
      </Show>

      <Show when={!session().isPending && !session().data?.user}>
        <div class="mt-4 space-x-4">
          <a
            href="/sign-in"
            class="inline-flex h-9 px-4 items-center text-sm font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            class="inline-flex h-9 px-4 items-center text-sm font-medium border rounded hover:bg-neutral-50"
          >
            Create account
          </a>
        </div>
      </Show>
    </div>
  )
}
