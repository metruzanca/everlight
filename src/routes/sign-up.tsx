import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'

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
  const [sent, setSent] = createSignal(false)

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

    setSent(true)
    setLoading(false)
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

      <Show when={!session().data?.user && !sent()}>
        <nav class="flex items-center justify-between px-6 py-4">
          <a href="/" class="flex items-center gap-2">
            <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
            <span class="text-lg font-semibold">Everlight</span>
          </a>
        </nav>

        <div class="flex items-center justify-center px-4 pt-16">
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle class="text-center">Create Account</CardTitle>
            </CardHeader>

            <form onSubmit={handleSignUp}>
              <CardContent class="space-y-4">
                <Show when={error()}>
                  <p class="text-sm text-accent bg-accent/10 px-3 py-2 rounded-md">{error()}</p>
                </Show>

                <div class="space-y-2">
                  <Label for="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    required
                  />
                </div>

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
                  {loading() ? 'Creating account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>

            <CardContent class="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/sign-in" class="text-accent hover:underline">
                Sign in
              </a>
            </CardContent>
          </Card>
        </div>
      </Show>

      <Show when={!session().data?.user && sent()}>
        <nav class="flex items-center justify-between px-6 py-4">
          <a href="/" class="flex items-center gap-2">
            <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
            <span class="text-lg font-semibold">Everlight</span>
          </a>
        </nav>

        <div class="flex items-center justify-center px-4 pt-16">
          <Card class="w-full max-w-sm text-center">
            <CardContent class="pt-6 space-y-4">
              <div class="text-3xl">✉️</div>
              <CardTitle>Check your email</CardTitle>
              <p class="text-muted-foreground">
                We sent a verification link to <strong class="text-foreground">{email()}</strong>.
              </p>
              <p class="text-sm text-muted-foreground">
                Click the link to verify your email and sign in.
              </p>
              <a href="/sign-in">
                <Button variant="outline">Go to sign in</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </Show>
    </div>
  )
}
