import { createFileRoute, CatchBoundary } from '@tanstack/solid-router'
import { For, createSignal, createResource, Show, Suspense, onMount } from 'solid-js'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { AppNav } from '../components/ui/app-nav'

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
  assistantName: string
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
  const [vapiKeyOk, setVapiKeyOk] = createSignal(true)
  const [shouldFetch, triggerFetch] = createSignal(false)

  function log(...args: unknown[]) {
    console.log('[Dashboard]', ...args)
  }

  const fetchVapi = async (path: string): Promise<Response> => {
    log(`fetch ${path}`)
    try {
      const res = await fetch(path)
      log(`${path} -> ${res.status}`)
      if (res.status === 401) { window.location.href = '/sign-in'; throw new Error('Unauthorized') }
      return res
    } catch (err) {
      log('error', err instanceof Error ? err.message : err)
      throw err
    }
  }

  const [stats] = createResource<VapiStats, boolean>(
    shouldFetch,
    (_) =>
      fetchVapi('/api/vapi/stats')
        .then((res) => {
          if (res.status === 500) {
            setVapiKeyOk(false)
            throw new Error('Vapi not configured')
          }
          return res.json()
        }),
  )

  const [callLogs] = createResource<CallLogEntry[], boolean>(
    shouldFetch,
    (_) =>
      fetchVapi('/api/vapi/calls')
        .then((res) => res.json()),
  )

  onMount(() => triggerFetch(true))

  return (
    <div class="min-h-screen">
      <AppNav>
        <a
          href="/settings"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Settings
        </a>
      </AppNav>

      <CatchBoundary getResetKey={() => 0} errorComponent={(p) => <SectionError {...p} label="Dashboard" />}>
      <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 class="text-2xl font-heading font-bold mb-6">Dashboard</h1>

        <Card class="mb-6 border-accent/20 bg-accent/[0.03]">
          <CardContent class="pt-4 pb-4 text-sm text-muted-foreground">
            Dashboard values are not yet organized by organization.
            <span class="text-accent font-medium"> Multi-org support coming soon.</span>
          </CardContent>
        </Card>

        <Suspense fallback={<p class="text-sm text-muted-foreground">Loading...</p>}>
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

          <CatchBoundary getResetKey={() => 0} errorComponent={(p) => <SectionError {...p} label="Call metrics" />}>
            <Suspense fallback={<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={Array(6)}>{() => (
                <Card><CardHeader class="pb-2"><CardTitle class="text-sm font-medium text-muted-foreground">&nbsp;</CardTitle></CardHeader><CardContent><div class="h-8 w-20 bg-muted rounded animate-pulse" /></CardContent></Card>
              )}</For>
            </div>}>
              <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard title="Total Calls" value={stats()?.totalCalls} loading={stats.loading} />
                <MetricCard title="Calls Answered" value={stats()?.callsAnswered} loading={stats.loading} />
                <MetricCard
                  title="Avg Call Length"
                  value={stats()?.averageCallDuration != null ? formatDuration(stats()!.averageCallDuration) : undefined}
                  loading={stats.loading}
                />
                <MetricCard title="After-Hours Calls" value={stats()?.afterHoursCalls} loading={stats.loading} />
                <MetricCard
                  title="Appointments Booked"
                  value={stats()?.appointmentsBooked}
                  loading={stats.loading}
                  note={stats()?.appointmentsBooked == null ? '⚠️ Needs Vapi assistant config' : undefined}
                />
                <MetricCard
                  title="Booking Ratio"
                  value={stats()?.bookingRatio != null ? `${stats()!.bookingRatio}%` : undefined}
                  loading={stats.loading}
                  note={stats()?.bookingRatio == null ? '⚠️ Needs Vapi assistant config' : undefined}
                />
              </div>
            </Suspense>
          </CatchBoundary>

          <CatchBoundary getResetKey={() => 0} errorComponent={(p) => <SectionError {...p} label="Recent calls" />}>
            <Suspense fallback={<p class="text-sm text-muted-foreground">Loading calls...</p>}>
              <section class="mt-10">
                <h2 class="text-lg font-heading font-semibold mb-4">Recent Calls</h2>

                <Show when={callLogs.loading}><p class="text-sm text-muted-foreground">Loading calls...</p></Show>
                <Show when={callLogs.error}><p class="text-sm text-destructive">Failed to load call logs.</p></Show>
                <Show when={callLogs() && callLogs()!.length === 0}>
                  <Card><CardContent class="pt-6 text-center text-sm text-muted-foreground">No calls found.</CardContent></Card>
                </Show>

                <Show when={callLogs() && callLogs()!.length > 0}>
                  <CallLogsTable calls={callLogs()!} />
                </Show>
              </section>
            </Suspense>
          </CatchBoundary>
        </Suspense>
      </main>
      </CatchBoundary>
    </div>
  )
}

function SectionError(props: { error: Error; label?: string }) {
  return (
    <Card class="border-destructive/30 bg-destructive/5">
      <CardContent class="pt-6 space-y-2">
        <p class="text-destructive font-medium text-sm">Failed to load {props.label ?? 'section'}</p>
        <p class="text-xs text-muted-foreground">{props.error.message}</p>
      </CardContent>
    </Card>
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
        <CardTitle class="text-sm font-medium text-muted-foreground">{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Show when={props.loading}><div class="h-8 w-20 bg-muted rounded animate-pulse" /></Show>
        <Show when={!props.loading && props.value != null}><p class="text-3xl font-bold font-heading">{props.value}</p></Show>
        <Show when={!props.loading && props.value == null}><p class="text-3xl font-bold font-heading text-muted-foreground">—</p></Show>
        <Show when={props.note}><p class="text-xs text-muted-foreground mt-1">{props.note}</p></Show>
      </CardContent>
    </Card>
  )
}

function CallLogsTable(props: { calls: CallLogEntry[] }) {
  return (
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-left text-muted-foreground">
            <th class="pb-3 pr-4 font-medium">Date</th>
            <th class="pb-3 pr-4 font-medium">Assistant</th>
            <th class="pb-3 pr-4 font-medium">From</th>
            <th class="pb-3 pr-4 font-medium">Duration</th>
            <th class="pb-3 pr-4 font-medium">Status</th>
            <th class="pb-3 pr-4 font-medium">Cost</th>
            <th class="pb-3 font-medium">Summary</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.calls}>
            {(call) => (
              <tr class="border-b border-border/60 hover:bg-muted/30 transition-colors">
                <td class="py-3 pr-4 text-muted-foreground whitespace-nowrap">{formatDate(call.startedAt)}</td>
                <td class="py-3 pr-4">
                  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent">
                    {call.assistantName}
                  </span>
                </td>
                <td class="py-3 pr-4 font-medium">{call.customerNumber || call.phoneNumber || '—'}</td>
                <td class="py-3 pr-4 text-muted-foreground whitespace-nowrap">{formatDuration(call.duration)}</td>
                <td class="py-3 pr-4">
                  <span class={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${call.endedReason === 'completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {call.endedReason || call.status}
                  </span>
                </td>
                <td class="py-3 pr-4 text-muted-foreground whitespace-nowrap">{formatCurrency(call.cost)}</td>
                <td class="py-3 text-muted-foreground max-w-[200px] truncate">{call.summary || '—'}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}
