import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  const [email, setEmail] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [sent, setSent] = createSignal(false)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: reqError } = await authClient.requestPasswordReset({
      email: email(),
    })

    if (reqError) {
      setError(reqError.message || reqError.code || 'Something went wrong')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div class="min-h-screen">
      <nav class="flex items-center justify-between px-6 py-4">
        <a href="/" class="flex items-center gap-2">
          <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
          <span class="text-lg font-semibold">Everlight</span>
        </a>
      </nav>

      <div class="flex items-center justify-center px-4 pt-16">
        <Show
          when={!sent()}
          fallback={
            <Card class="w-full max-w-sm text-center">
              <CardContent class="pt-6 space-y-4">
                <div class="text-3xl">✉️</div>
                <CardTitle>Check your email</CardTitle>
                <p class="text-muted-foreground">
                  If an account exists with that email, we sent a password reset link.
                </p>
                <a href="/sign-in">
                  <Button variant="outline">Back to sign in</Button>
                </a>
              </CardContent>
            </Card>
          }
        >
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle class="text-center">Forgot Password</CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit}>
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

                <Button type="submit" disabled={loading()} class="w-full">
                  {loading() ? 'Sending...' : 'Send reset link'}
                </Button>
              </CardContent>
            </form>

            <CardContent class="text-center text-sm text-muted-foreground">
              <a href="/sign-in" class="text-accent hover:underline">Back to sign in</a>
            </CardContent>
          </Card>
        </Show>
      </div>
    </div>
  )
}
