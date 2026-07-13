import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export const Route = createFileRoute('/reset-password')({
  component: ResetPassword,
  validateSearch: (search: Record<string, string>) => ({
    token: search.token as string | undefined,
  }),
})

function ResetPassword() {
  const search = Route.useSearch()
  const token = () => search().token
  const [password, setPassword] = createSignal('')
  const [confirm, setConfirm] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [done, setDone] = createSignal(false)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setError('')

    if (password() !== confirm()) {
      setError('Passwords do not match')
      return
    }

    if (!token()) {
      setError('Invalid or missing reset token')
      return
    }

    setLoading(true)

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password(),
      token: token()!,
    })

    if (resetError) {
      setError(resetError.message || resetError.code || 'Something went wrong')
      setLoading(false)
      return
    }

    setDone(true)
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
          when={!done()}
          fallback={
            <Card class="w-full max-w-sm text-center">
              <CardContent class="pt-6 space-y-4">
                <div class="text-3xl">✅</div>
                <CardTitle>Password reset</CardTitle>
                <p class="text-muted-foreground">
                  Your password has been reset successfully.
                </p>
                <a href="/sign-in">
                  <Button>Sign in</Button>
                </a>
              </CardContent>
            </Card>
          }
        >
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle class="text-center">Reset Password</CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent class="space-y-4">
                <Show when={error()}>
                  <p class="text-sm text-accent bg-accent/10 px-3 py-2 rounded-md">{error()}</p>
                </Show>

                <Show when={!token()}>
                  <p class="text-sm text-accent bg-accent/10 px-3 py-2 rounded-md">
                    Invalid reset link. Please request a new one.
                  </p>
                </Show>

                <div class="space-y-2">
                  <Label for="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div class="space-y-2">
                  <Label for="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm()}
                    onInput={(e) => setConfirm(e.currentTarget.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading() || !token()} class="w-full">
                  {loading() ? 'Resetting...' : 'Reset password'}
                </Button>
              </CardContent>
            </form>
          </Card>
        </Show>
      </div>
    </div>
  )
}
