import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { AppNav } from '../components/ui/app-nav'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  const [currentPassword, setCurrentPassword] = createSignal('')
  const [newPassword, setNewPassword] = createSignal('')
  const [confirmPassword, setConfirmPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [success, setSuccess] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleChangePassword = async (e: SubmitEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword() !== confirmPassword()) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error: changeError } = await authClient.changePassword({
      currentPassword: currentPassword(),
      newPassword: newPassword(),
    })

    if (changeError) {
      if (changeError.code === 'UNAUTHORIZED') {
        window.location.href = '/sign-in'
        return
      }
      setError(changeError.message || changeError.code || 'Something went wrong')
      setLoading(false)
      return
    }

    setSuccess('Password changed successfully.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  return (
    <div class="min-h-screen">
      <AppNav>
        <a
          href="/dashboard"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </a>
      </AppNav>

      <main class="max-w-lg mx-auto px-4 py-8">
        <h1 class="text-2xl font-heading font-bold mb-6">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>

          <form onSubmit={handleChangePassword}>
            <CardContent class="space-y-4">
              <Show when={error()}>
                <p class="text-sm text-accent bg-accent/10 px-3 py-2 rounded-md">{error()}</p>
              </Show>

              <Show when={success()}>
                <p class="text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">{success()}</p>
              </Show>

              <div class="space-y-2">
                <Label for="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword()}
                  onInput={(e) => setCurrentPassword(e.currentTarget.value)}
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword()}
                  onInput={(e) => setNewPassword(e.currentTarget.value)}
                  required
                  minLength={8}
                />
              </div>

              <div class="space-y-2">
                <Label for="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword()}
                  onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading()} class="w-full">
                {loading() ? 'Changing...' : 'Change password'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  )
}
