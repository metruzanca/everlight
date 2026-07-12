import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, createSignal, Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})

function SignIn() {
  const session = authClient.useSession()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  createEffect(() => {
    if (session().data?.user) {
      window.location.href = '/dashboard'
    }
  })

  const handleSignIn = async (e: SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await authClient.signIn.email({
      email: email(),
      password: password(),
    })

    if (signInError) {
      if (signInError.code === 'EMAIL_NOT_VERIFIED') {
        setError('Please check your email for the verification link before signing in.')
      } else {
        setError(signInError.message || signInError.code || 'Something went wrong')
      }
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div class="min-h-screen">
      <Show when={session().data?.user}>
        <div class="p-8 max-w-lg mx-auto">
          <div class="flex items-center gap-2">
            <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
            <span class="text-lg font-semibold">Everlight</span>
          </div>
          <Card class="mt-6 text-center">
            <CardContent class="pt-6 space-y-4">
              <p class="text-muted-foreground">
                Signed in as <strong class="text-foreground">{session().data?.user?.email}</strong>
              </p>
              <a href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </Show>

      <Show when={!session().data?.user}>
        <nav class="flex items-center justify-between px-6 py-4">
          <a href="/" class="flex items-center gap-2">
            <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
            <span class="text-lg font-semibold">Everlight</span>
          </a>
        </nav>

        <div class="flex items-center justify-center px-4 pt-16">
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle class="text-center">Sign In</CardTitle>
            </CardHeader>

            <form onSubmit={handleSignIn}>
              <CardContent class="space-y-4">
                <Show when={error()}>
                  <p class="text-sm text-accent bg-accent/10 px-3 py-2 rounded-md">{error()}</p>
                </Show>

                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    required
                  />
                </div>

                <div class="space-y-2">
                  <Label for="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    required
                  />
                </div>
              </CardContent>

              <CardFooter class="flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading()}
                  class="w-full"
                >
                  {loading() ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>

            <CardContent class="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="/sign-up" class="text-accent hover:underline">
                Sign up
              </a>
            </CardContent>
          </Card>
        </div>
      </Show>
    </div>
  )
}
