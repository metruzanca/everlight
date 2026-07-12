import { createFileRoute } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardTitle } from '../components/ui/card'

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmail,
})

function VerifyEmail() {
  const session = authClient.useSession()

  return (
    <div class="min-h-screen">
      <nav class="flex items-center justify-between px-6 py-4">
        <a href="/" class="flex items-center gap-2">
          <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
          <span class="text-lg font-semibold">Everlight</span>
        </a>
      </nav>

      <div class="flex items-center justify-center px-4 pt-16">
        <Card class="w-full max-w-sm text-center">
          <CardContent class="pt-6 space-y-4">
            <div class="text-3xl">✅</div>
            <CardTitle>Email verified</CardTitle>
            <p class="text-muted-foreground">
              Your email has been verified successfully.
            </p>

            <Show
              when={session().data?.user}
              fallback={
                <a href="/sign-in">
                  <Button>Sign in</Button>
                </a>
              }
            >
              <a href="/">
                <Button>Go home</Button>
              </a>
            </Show>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
