import { createFileRoute } from '@tanstack/solid-router'
import { Show, For, createSignal, createResource } from 'solid-js'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

type VapiStats = {
  totalCalls: number
  callsAnswered: number
  averageCallDuration: number
  afterHoursCalls: number
  appointmentsBooked: number | null
  bookingRatio: number | null
}

type CallLogEntry = {
  id: string
  phoneNumber: string
  customerNumber: string
  duration: number
  status: string
  endedReason: string
  startedAt: string
  cost: number
  summary: string | null
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m ${s}s`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(cents: number): string {
  return `$${cents.toFixed(4)}`
}

function Dashboard() {
  const session = authClient.useSession()

  const [vapiKeyOk, setVapiKeyOk] = createSignal(true)

  const [stats] = createResource<VapiStats>(
    () =>
      fetch('/api/vapi/stats')
        .then((res) => {
          if (res.status === 401) throw new Error('Unauthorized')
          if (res.status === 500) {
            setVapiKeyOk(false)
            throw new Error('Vapi not configured')
          }
          return res.json()
        }),
  )

  const [callLogs] = createResource<CallLogEntry[]>(
    () =>
      fetch('/api/vapi/calls')
        .then((res) => {
          if (res.status === 401) throw new Error('Unauthorized')
          return res.json()
        }),
  )

  return (
    <div class="min-h-screen">
      <Show when={session().isPending}>
        <div class="flex items-center justify-center min-h-screen">
          <p class="text-muted-foreground">Loading...</p>
        </div>
      </Show>

      <Show when={!session().isPending && !session().data?.user}>
        <div class="flex items-center justify-center min-h-screen">
          <Card class="w-full max-w-sm text-center">
            <CardContent class="pt-6 space-y-4">
              <p class="text-muted-foreground">You need to sign in first.</p>
              <a href="/sign-in">
                <Button>Sign in</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </Show>

      <Show when={session().data?.user}>
        <>
            <nav class="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div class="flex items-center gap-2">
                <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
                <span class="text-lg font-semibold font-heading">Everlight</span>
              </div>
              <div class="flex items-center gap-4">
                <a
                  href="/settings"
                  class="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Settings
                </a>
                <Button
                  onClick={() => { void authClient.signOut() }}
                  variant="outline"
                  size="sm"
                >
                  Sign out
                </Button>
              </div>
            </nav>

            <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <h1 class="text-2xl font-heading font-bold mb-6">Dashboard</h1>

              <Card class="mb-6 border-accent/20 bg-accent/[0.03]">
                <CardContent class="pt-4 pb-4 text-sm text-muted-foreground">
                  Dashboard values are not yet organized by organization.
                  <span class="text-accent font-medium"> Multi-org support coming soon.</span>
                </CardContent>
              </Card>

              <Show when={!vapiKeyOk() && !stats.loading}>
                <Card class="mb-6 border-destructive/30 bg-destructive/5">
                  <CardContent class="pt-6 space-y-2">
                    <p class="text-destructive font-medium">Vapi not configured</p>
                    <p class="text-sm text-muted-foreground">
                      Add your <code class="font-mono text-xs">VAPI_API_KEY</code> to
                      the environment variables to see call metrics.
                    </p>
                  </CardContent>
                </Card>
              </Show>

              <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Total Calls"
                  value={stats()?.totalCalls}
                  loading={stats.loading}
                />
                <MetricCard
                  title="Calls Answered"
                  value={stats()?.callsAnswered}
                  loading={stats.loading}
                />
                <MetricCard
                  title="Avg Call Length"
                  value={
                    stats()?.averageCallDuration != null
                      ? formatDuration(stats()!.averageCallDuration)
                      : undefined
                  }
                  loading={stats.loading}
                />
                <MetricCard
                  title="After-Hours Calls"
                  value={stats()?.afterHoursCalls}
                  loading={stats.loading}
                />
                <MetricCard
                  title="Appointments Booked"
                  value={stats()?.appointmentsBooked}
                  loading={stats.loading}
                  note={
                    stats()?.appointmentsBooked == null
                      ? '⚠️ Needs Vapi assistant config'
                      : undefined
                  }
                />
                <MetricCard
                  title="Booking Ratio"
                  value={
                    stats()?.bookingRatio != null
                      ? `${stats()!.bookingRatio}%`
                      : undefined
                  }
                  loading={stats.loading}
                  note={
                    stats()?.bookingRatio == null
                      ? '⚠️ Needs Vapi assistant config'
                      : undefined
                  }
                />
              </div>

              <section class="mt-10">
                <h2 class="text-lg font-heading font-semibold mb-4">
                  Recent Calls
                </h2>

                <Show when={callLogs.loading}>
                  <p class="text-sm text-muted-foreground">Loading calls...</p>
                </Show>

                <Show when={callLogs.error}>
                  <p class="text-sm text-destructive">Failed to load call logs.</p>
                </Show>

                <Show when={callLogs() && callLogs()!.length === 0}>
                  <Card>
                    <CardContent class="pt-6 text-center text-sm text-muted-foreground">
                      No calls found.
                    </CardContent>
                  </Card>
                </Show>

                <Show when={callLogs() && callLogs()!.length > 0}>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-border text-left text-muted-foreground">
                          <th class="pb-3 pr-4 font-medium">Date</th>
                          <th class="pb-3 pr-4 font-medium">From</th>
                          <th class="pb-3 pr-4 font-medium">Duration</th>
                          <th class="pb-3 pr-4 font-medium">Status</th>
                          <th class="pb-3 pr-4 font-medium">Cost</th>
                          <th class="pb-3 font-medium">Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={callLogs()}>
                          {(call) => (
                            <tr class="border-b border-border/60 hover:bg-muted/30 transition-colors">
                              <td class="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                                {formatDate(call.startedAt)}
                              </td>
                              <td class="py-3 pr-4 font-medium">
                                {call.customerNumber || call.phoneNumber || '—'}
                              </td>
                              <td class="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                                {formatDuration(call.duration)}
                              </td>
                              <td class="py-3 pr-4">
                                <span
                                  class={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    call.endedReason === 'completed'
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {call.endedReason || call.status}
                                </span>
                              </td>
                              <td class="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                                {formatCurrency(call.cost)}
                              </td>
                              <td class="py-3 text-muted-foreground max-w-[200px] truncate">
                                {call.summary || '—'}
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </section>
            </main>
          </>
      </Show>
    </div>
  )
}

function MetricCard(props: {
  title: string
  value: number | string | undefined | null
  loading: boolean
  note?: string
}) {
  return (
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">
          {props.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Show when={props.loading}>
          <div class="h-8 w-20 bg-muted rounded animate-pulse" />
        </Show>
        <Show when={!props.loading && props.value != null}>
          <p class="text-3xl font-bold font-heading">{props.value}</p>
        </Show>
        <Show when={!props.loading && props.value == null}>
          <p class="text-3xl font-bold font-heading text-muted-foreground">—</p>
        </Show>
        <Show when={props.note}>
          <p class="text-xs text-muted-foreground mt-1">{props.note}</p>
        </Show>
      </CardContent>
    </Card>
  )
}
