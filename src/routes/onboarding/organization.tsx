import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '../../lib/auth-client'
import { setSelectedOrg } from '../../lib/org-store'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card'

export const Route = createFileRoute('/onboarding/organization')({
  component: OnboardingOrganization,
})

function OnboardingOrganization() {
  const session = authClient.useSession()
  const navigate = useNavigate()
  const [name, setName] = createSignal('')
  const [domainAutoJoin, setDomainAutoJoin] = createSignal(false)
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleCreate = async (e: SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name(), domainAutoJoin: domainAutoJoin() }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error || 'Failed to create organization')
        return
      }

      const body = await res.json()
      setSelectedOrg(body.organization.id)
      navigate({ to: '/dashboard' })
    } catch {
      setError('Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div class="min-h-screen">
      <Show when={!session().data?.user}>
        <div class="flex items-center justify-center px-4 pt-16">
          <p class="text-muted-foreground">Please sign in first.</p>
        </div>
      </Show>

      <Show when={session().data?.user}>
        <nav class="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <a href="/dashboard" class="flex items-center gap-2">
            <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
            <span class="text-lg font-semibold font-heading">Everlight</span>
          </a>
        </nav>

        <div class="flex items-center justify-center px-4 pt-16">
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle class="text-center">Create Your Organization</CardTitle>
            </CardHeader>

            <form onSubmit={handleCreate}>
              <CardContent class="space-y-4">
                <p class="text-sm text-muted-foreground text-center">
                  You need an organization before you can access the dashboard.
                </p>

                <Show when={error()}>
                  <p class="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error()}</p>
                </Show>

                <div class="space-y-2">
                  <Label for="name">Organization Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    placeholder="e.g. Acme Corp"
                    required
                  />
                </div>

                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={domainAutoJoin()}
                    onChange={(e) => setDomainAutoJoin((e.target as HTMLInputElement).checked)}
                    class="mt-1"
                  />
                  <div>
                    <p class="text-sm font-medium">Auto-invite by domain</p>
                    <p class="text-xs text-muted-foreground">
                      Automatically invite new users with the same email domain.
                    </p>
                  </div>
                </label>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={loading()} class="w-full">
                  {loading() ? 'Creating...' : 'Create Organization'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </Show>
    </div>
  )
}
