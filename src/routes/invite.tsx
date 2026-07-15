import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, createResource, Show, Suspense } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/invite')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
  component: InvitePage,
})

type InviteDetails = {
  id: string
  orgId: string
  orgName: string
  email: string
  role: string
  status: string
}

function InvitePage() {
  const search = Route.useSearch()
  const token = () => search().token

  if (!token()) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-background p-4">
        <Card class="w-full max-w-md">
          <CardContent class="pt-6 text-center text-sm text-muted-foreground">
            No invitation token provided.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense
        fallback={
          <Card class="w-full max-w-md">
            <CardContent class="pt-6 text-center text-sm text-muted-foreground">
              Loading invitation...
            </CardContent>
          </Card>
        }
      >
        <InviteContent token={token()} />
      </Suspense>
    </div>
  )
}

function InviteContent(props: { token: string }) {
  const s = authClient.useSession()
  const [error, setError] = createSignal<string | null>(null)
  const [success, setSuccess] = createSignal<string | null>(null)
  const [processing, setProcessing] = createSignal(false)

  const [invite] = createResource(() => props.token, async (t: string) => {
    const res = await fetch(`/api/invites?token=${encodeURIComponent(t)}`)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to fetch invitation')
    }
    return res.json()
  })

  async function handleAccept() {
    setProcessing(true)
    setError(null)
    try {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: props.token }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to accept')
      }
      setSuccess(`You've joined the organization!`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleDecline() {
    setProcessing(true)
    setError(null)
    try {
      const res = await fetch('/api/invites/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: props.token }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to decline')
      }
      setSuccess('Invitation declined.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div class="flex flex-col items-center gap-4">
      <Show when={invite.error}>
        <Card class="w-full max-w-md">
          <CardContent class="pt-6 text-center text-sm text-destructive">
            {invite.error.message || 'Failed to load invitation'}
          </CardContent>
        </Card>
      </Show>

      <Show when={invite()}>
        {(inv) => {
          const details = inv() as InviteDetails
          return (
            <Card class="w-full max-w-md">
              <CardHeader>
                <CardTitle class="text-center">Organization Invitation</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="text-center">
                  <p class="text-sm text-muted-foreground">
                    You've been invited to join
                  </p>
                  <p class="mt-1 text-lg font-heading font-semibold">{details.orgName}</p>
                  <p class="mt-1 text-xs text-muted-foreground">
                    Role: {details.role}
                  </p>
                </div>

                <Show when={!s().data}>
                  <div class="rounded-lg border border-border bg-background/40 p-4 text-center text-sm text-muted-foreground space-y-3">
                    <p>Sign in or create an account to accept this invitation.</p>
                    <div class="flex items-center justify-center gap-3">
                      <a
                        href="/sign-in"
                        class="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Sign in
                      </a>
                      <a
                        href="/sign-up"
                        class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                      >
                        Create account
                      </a>
                    </div>
                  </div>
                </Show>

                <Show when={success()}>
                  <div class="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center text-sm text-primary">
                    {success()}
                  </div>
                </Show>

                <Show when={error()}>
                  <div class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {error()}
                  </div>
                </Show>

                <Show when={s().data && !success()}>
                  <div class="flex items-center justify-center gap-3">
                    <Button onClick={handleAccept} disabled={processing()}>
                      {processing() ? 'Processing...' : 'Accept'}
                    </Button>
                    <Button onClick={handleDecline} variant="outline" disabled={processing()}>
                      Decline
                    </Button>
                  </div>
                </Show>
              </CardContent>
            </Card>
          )
        }}
      </Show>
    </div>
  )
}
