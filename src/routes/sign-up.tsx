import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/sign-up')({
  component: SignUp,
})

function SignUp() {
  const session = authClient.useSession()
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleSignUp = async (e: SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signUpError } = await authClient.signUp.email({
      name: name(),
      email: email(),
      password: password(),
    })

    if (signUpError) {
      setError(signUpError.message || signUpError.code || 'Something went wrong')
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div class="flex min-h-screen items-center justify-center">
      <div class="w-full max-w-sm mx-4">
        <h1 class="text-2xl font-bold mb-6 text-center">Create Account</h1>

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
          <form onSubmit={handleSignUp} class="space-y-4">
            <Show when={error()}>
              <p class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error()}</p>
            </Show>

            <div>
              <label for="name" class="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                required
                class="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

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
              {loading() ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p class="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <a href="/sign-in" class="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </Show>
      </div>
    </div>
  )
}
