import { createFileRoute } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

function Dashboard() {
  const session = authClient.useSession()

  return (
    <div class="min-h-screen">
      <Show when={session().isPending}>
        <div class="flex items-center justify-center min-h-screen">
          <p class="text-muted-foreground">Loading...</p>
        </div>
      </Show>

      <Show when={session().data?.user}>
        {(user) => (
          <div class="p-8 max-w-lg mx-auto">
            <div class="flex items-center gap-2">
              <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
              <span class="text-lg font-semibold font-heading">Everlight</span>
            </div>
            <Card class="mt-6">
              <CardContent class="pt-6 space-y-4">
                <p>
                  Hello, <strong>{user().name}</strong>!
                </p>
                <p class="text-sm text-muted-foreground">{user().email}</p>
                <Button
                  onClick={() => { void authClient.signOut() }}
                  variant="outline"
                >
                  Sign out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </Show>
    </div>
  )
}
