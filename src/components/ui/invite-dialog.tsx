import { createSignal, Show } from 'solid-js'
import { Button } from './button'

interface InviteDialogProps {
  orgId: string
  open: boolean
  onClose: () => void
}

export function InviteDialog(props: InviteDialogProps) {
  const [email, setEmail] = createSignal('')
  const [role, setRole] = createSignal<'member' | 'admin'>('member')
  const [error, setError] = createSignal<string | null>(null)
  const [sending, setSending] = createSignal(false)
  const [done, setDone] = createSignal(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: props.orgId, email: email(), role: role() }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body.error || 'Failed to send invite')
      }
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  function handleClose() {
    setEmail('')
    setRole('member')
    setError(null)
    setDone(false)
    props.onClose()
  }

  return (
    <Show when={props.open}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
        <div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
          <Show when={!done()}>
            <h2 class="font-heading text-lg font-semibold">Invite user</h2>
            <p class="mt-1 text-sm text-muted-foreground">
              Send an invitation to join this organization.
            </p>

            <form onSubmit={handleSubmit} class="mt-5 space-y-4">
              <div>
                <label for="invite-email" class="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={email()}
                  onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                  placeholder="colleague@company.com"
                  class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>

              <div>
                <label for="invite-role" class="block text-sm font-medium text-foreground mb-1.5">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={role()}
                  onChange={(e) => setRole((e.target as HTMLSelectElement).value as 'member' | 'admin')}
                  class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <Show when={error()}>
                <p class="text-sm text-destructive">{error()}</p>
              </Show>

              <div class="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={sending()}>
                  {sending() ? 'Sending...' : 'Send invite'}
                </Button>
              </div>
            </form>
          </Show>

          <Show when={done()}>
            <div class="text-center py-6 space-y-4">
              <span class="inline-flex size-12 items-center justify-center rounded-full bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <p class="text-sm font-medium">Invitation sent!</p>
              <p class="text-xs text-muted-foreground">
                An email has been sent to {email()} with instructions to join.
              </p>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  )
}
