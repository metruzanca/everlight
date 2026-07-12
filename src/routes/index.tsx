import { createFileRoute } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
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
            <div class="flex items-center gap-3">
              <img src="/logo.svg" alt="Everlight" class="h-8 w-8" />
              <h1 class="text-3xl font-bold">Everlight</h1>
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

      <Show when={!session().isPending && !session().data?.user}>
        <nav class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-2">
            <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
            <span class="text-lg font-semibold">Everlight</span>
          </div>
          <div class="flex gap-3">
            <a href="/sign-in">
              <Button variant="ghost">Sign in</Button>
            </a>
            <a href="/sign-up">
              <Button>Get started</Button>
            </a>
          </div>
        </nav>

        <section class="flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center">
          <Badge variant="outline" class="mb-6 text-accent border-accent/30">
            AI-Powered Business Solutions
          </Badge>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            AI Automation
            <br />
            <span class="text-primary">For Your Business</span>
          </h1>

          <p class="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            24/7 Voice Agents, AI Chatbots, and Targeted Lead
            Generation for Small Businesses.
          </p>

          <div class="mt-10 flex gap-4">
            <a href="/sign-up">
              <Button size="lg">Get started</Button>
            </a>
            <a href="/sign-in">
              <Button variant="outline" size="lg">Sign in</Button>
            </a>
          </div>
        </section>
      </Show>
    </div>
  )
}
