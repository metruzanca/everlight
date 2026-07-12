import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})

function SignIn() {
  const session = authClient.useSession()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleSignIn = async (e: SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await authClient.signIn.email({
      email: email(),
      password: password(),
    })

    if (signInError) {
      setError(signInError.message || signInError.code || 'Something went wrong')
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div class="flex min-h-screen items-center justify-center">
      <div class="w-full max-w-sm mx-4">
        <h1 class="text-2xl font-bold mb-6 text-center">Sign In</h1>

        <Show when={session().data?.user}>
          <div class="text-center space-y-4">
            <p class="text-neutral-600">
              Signed in as <strong>{session().data?.user?.email}</strong>
            </p>
            <a href="/" class="text-sm text-blue-600 hover:underline">
              Go home
            </a>
          </div>
        </Show>

        <Show when={!session().data?.user}>
          <form onSubmit={handleSignIn} class="space-y-4">
            <Show when={error()}>
              <p class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error()}</p>
            </Show>

            <div>
              <label for="email" class="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
                class="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                required
                class="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading()}
              class="w-full py-2 px-4 bg-neutral-900 text-white rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading() ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p class="text-center text-sm text-neutral-500 mt-6">
            Don't have an account?{' '}
            <a href="/sign-up" class="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </Show>
      </div>
    </div>
  )
}
