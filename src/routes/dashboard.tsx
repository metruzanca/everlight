import { createFileRoute, CatchBoundary } from '@tanstack/solid-router'
import { For, createSignal, createResource, createMemo, Show, Suspense, onMount } from 'solid-js'
import { Card, CardContent } from '../components/ui/card'
import { AppNav } from '../components/ui/app-nav'
import { getSelectedOrgId } from '../lib/org-store'
import { DashboardShell } from '../components/dashboard/dashboard-shell'
import { StatCards, type StatCardsData } from '../components/dashboard/stat-cards'
import { SpendChart, type SpendSeriesEntry } from '../components/dashboard/spend-chart'
import { AgentStats, type AgentStat } from '../components/dashboard/agent-stats'
import { CallDatabase, type CallRecord, type CallOutcome } from '../components/dashboard/call-database'
import { CallLogsTeaser } from '../components/dashboard/call-logs-teaser'
import { formatDuration } from '../lib/format'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

type VapiStats = {
  totalCalls: number
  callsAnswered: number
  averageCallDuration: number
  afterHoursCalls: number
  appointmentsBooked: number | null
  bookingRatio: number | null
}

type VapiCallLogEntry = {
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

function Dashboard() {
  return (
    <div class="min-h-screen">
      <AppNav />

      <CatchBoundary getResetKey={() => 0} errorComponent={(p) => <SectionError {...p} label="Dashboard" />}>
        <DashboardShell>
          <Suspense fallback={<FullPageSkeleton />}>
            <DashboardContent />
          </Suspense>
        </DashboardShell>
      </CatchBoundary>
    </div>
  )
}

function DashboardContent() {
  const [vapiKeyOk, setVapiKeyOk] = createSignal(true)
  const [shouldFetch, triggerFetch] = createSignal(false)

  const fetchVapi = async (path: string): Promise<Response> => {
    try {
      const res = await fetch(path)
      if (res.status === 401) { window.location.href = '/sign-in'; throw new Error('Unauthorized') }
      return res
    } catch (err) {
      throw err
    }
  }

  const [stats] = createResource<VapiStats, boolean>(
    shouldFetch,
    async (_) => {
      const orgId = getSelectedOrgId()()
      const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''
      const res = await fetchVapi(`/api/vapi/stats${params}`)
      if (res.status === 500) {
        setVapiKeyOk(false)
        throw new Error('Vapi not configured')
      }
      return res.json()
    },
  )

  const [callLogs] = createResource<VapiCallLogEntry[], boolean>(
    shouldFetch,
    async (_) => {
      const orgId = getSelectedOrgId()()
      const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''
      const res = await fetchVapi(`/api/vapi/calls${params}`)
      return res.json()
    },
  )

  onMount(async () => {
    try {
      const res = await fetch('/api/organizations')
      if (res.ok) {
        const body = await res.json()
        if (body.orgs?.length === 0) {
          window.location.href = '/onboarding/organization'
          return
        }
      }
    } catch {}
    triggerFetch(true)
  })

  const statCardsData = createMemo((): StatCardsData | null => {
    const s = stats()
    if (!s) return null
    const callCost = (callLogs() ?? []).reduce((sum, c) => sum + c.cost, 0)
    return {
      totalCallsLifetime: s.totalCalls,
      callsAnswered: s.callsAnswered,
      appointmentsBooked: s.appointmentsBooked,
      avgCallLength: s.averageCallDuration,
      monthlySpend: callCost,
      spendChangePct: 0,
      callsAnsweredChangePct: 0,
      appointmentsChangePct: 0,
      afterHoursCalls: s.afterHoursCalls,
      bookingRatio: s.bookingRatio,
    }
  })

  const spendSeries = createMemo((): SpendSeriesEntry[] => {
    const logs = callLogs()
    if (!logs || logs.length === 0) return []
    const groups = new Map<string, { spend: number; order: number }>()
    for (const c of logs) {
      if (!c.startedAt) continue
      const d = new Date(c.startedAt)
      const key = d.toISOString().slice(0, 10)
      const existing = groups.get(key) || { spend: 0, order: d.getTime() }
      existing.spend += c.cost
      groups.set(key, existing)
    }
    return [...groups.entries()]
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, { spend }]) => {
        const d = new Date(key + 'T00:00:00')
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          spend: Math.round(spend * 100) / 100,
        }
      })
  })

  const totalMinutesUsed = createMemo(() => {
    const logs = callLogs()
    if (!logs) return 0
    return Math.round(logs.reduce((s, c) => s + c.duration, 0) / 60)
  })

  const agentStatsData = createMemo((): AgentStat[] => {
    const logs = callLogs()
    if (!logs || logs.length === 0) return []
    const groups = new Map<string, { calls: number; booked: number; totalDuration: number }>()
    for (const c of logs) {
      const name = c.assistantName || 'Unknown'
      const g = groups.get(name) || { calls: 0, booked: 0, totalDuration: 0 }
      g.calls++
      if (c.summary && /booked|confirmed|appointment|scheduled/i.test(c.summary)) {
        g.booked++
      }
      g.totalDuration += c.duration
      groups.set(name, g)
    }
    return [...groups.entries()].map(([name, g]) => ({
      name,
      calls: g.calls,
      booked: g.booked,
      successRate: g.calls > 0 ? Math.round((g.booked / g.calls) * 100) : 0,
      avgDuration: formatDuration(Math.round(g.totalDuration / Math.max(g.calls, 1))),
    }))
  })

  const callRecords = createMemo((): CallRecord[] => {
    const logs = callLogs()
    if (!logs) return []
    return logs.map(classifyCallRecord)
  })

  const hasCallLogs = createMemo(() => callLogs() !== undefined)

  return (
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="font-heading text-2xl font-bold tracking-tight text-balance">
          Organization overview
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Real-time voice agent performance and usage
        </p>
      </div>

      <Show when={!vapiKeyOk() && !stats.loading}>
        <Card class="mb-4 border-destructive/30 bg-destructive/5">
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
        <Show when={statCardsData()} fallback={<StatCardsSkeleton />}>
          {(data) => <StatCards data={data()} />}
        </Show>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div class="xl:col-span-2">
            <Show when={hasCallLogs()} fallback={<SpendChartSkeleton />}>
              <SpendChart
                series={spendSeries()}
                minutesUsed={totalMinutesUsed()}
              />
            </Show>
          </div>
          <Show when={hasCallLogs()} fallback={<AgentStatsSkeleton />}>
            <AgentStats agents={agentStatsData()} />
          </Show>
        </div>
      </CatchBoundary>

      <CatchBoundary getResetKey={() => 0} errorComponent={(p) => <SectionError {...p} label="Call database" />}>
        <Show when={hasCallLogs()} fallback={<CallDbSkeleton />}>
          <CallDatabase calls={callRecords()} />
        </Show>
      </CatchBoundary>

      <CallLogsTeaser />
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

function StatCardsSkeleton() {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      <For each={Array(5)}>
        {() => (
          <div class="rounded-2xl border border-border bg-card p-5">
            <div class="flex items-center justify-between">
              <div class="size-9 rounded-lg bg-muted animate-pulse" />
              <div class="h-5 w-14 rounded-full bg-muted animate-pulse" />
            </div>
            <div class="mt-4 h-8 w-24 bg-muted rounded animate-pulse" />
            <div class="mt-2 h-4 w-20 bg-muted rounded animate-pulse" />
            <div class="mt-1 h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        )}
      </For>
    </div>
  )
}

function SpendChartSkeleton() {
  return (
    <div class="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <div class="h-5 w-36 bg-muted rounded animate-pulse" />
          <div class="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div class="space-y-2 text-right">
          <div class="h-7 w-28 bg-muted rounded animate-pulse ml-auto" />
          <div class="h-4 w-32 bg-muted rounded animate-pulse ml-auto" />
        </div>
      </div>
      <div class="mt-6 h-64 w-full rounded-lg bg-muted animate-pulse" />
    </div>
  )
}

function AgentStatsSkeleton() {
  return (
    <div class="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div class="flex items-center justify-between">
        <div class="space-y-2">
          <div class="h-5 w-24 bg-muted rounded animate-pulse" />
          <div class="h-4 w-36 bg-muted rounded animate-pulse" />
        </div>
        <div class="size-5 bg-muted rounded animate-pulse" />
      </div>
      <div class="mt-5 flex flex-col gap-3">
        <For each={Array(4)}>
          {() => (
            <div class="rounded-xl border border-border bg-background/40 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="h-4 w-28 bg-muted rounded animate-pulse" />
                <div class="h-5 w-14 rounded-full bg-muted animate-pulse" />
              </div>
              <div class="mt-3 grid grid-cols-3 gap-2 text-center">
                <div class="space-y-1">
                  <div class="h-5 w-10 bg-muted rounded animate-pulse mx-auto" />
                  <div class="h-3 w-8 bg-muted rounded animate-pulse mx-auto" />
                </div>
                <div class="space-y-1">
                  <div class="h-5 w-10 bg-muted rounded animate-pulse mx-auto" />
                  <div class="h-3 w-8 bg-muted rounded animate-pulse mx-auto" />
                </div>
                <div class="space-y-1">
                  <div class="h-5 w-10 bg-muted rounded animate-pulse mx-auto" />
                  <div class="h-3 w-8 bg-muted rounded animate-pulse mx-auto" />
                </div>
              </div>
              <div class="mt-3 h-1.5 w-full rounded-full bg-muted animate-pulse" />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

function CallDbSkeleton() {
  return (
    <div class="rounded-2xl border border-border bg-card">
      <div class="flex flex-col gap-4 border-b border-border p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-2">
            <div class="h-5 w-28 bg-muted rounded animate-pulse" />
            <div class="h-4 w-52 bg-muted rounded animate-pulse" />
          </div>
          <div class="h-9 w-20 rounded-lg bg-muted animate-pulse" />
        </div>
        <div class="h-11 w-full rounded-xl bg-muted animate-pulse" />
        <div class="flex gap-2">
          <For each={Array(5)}>
            {() => <div class="h-7 w-20 rounded-full bg-muted animate-pulse" />}
          </For>
        </div>
      </div>
      <div class="px-5 py-3">
        <div class="h-4 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div class="hidden lg:block">
        <For each={Array(4)}>
          {() => (
            <div class="flex items-center gap-4 border-b border-border/60 px-6 py-4">
              <div class="flex-1 space-y-1">
                <div class="h-4 w-28 bg-muted rounded animate-pulse" />
                <div class="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div class="h-4 w-20 bg-muted rounded animate-pulse" />
              <div class="h-4 w-24 bg-muted rounded animate-pulse" />
              <div class="h-4 w-12 bg-muted rounded animate-pulse" />
              <div class="h-5 w-28 rounded-full bg-muted animate-pulse" />
              <div class="size-4 bg-muted rounded animate-pulse" />
            </div>
          )}
        </For>
      </div>
      <div class="flex flex-col divide-y divide-border lg:hidden">
        <For each={Array(3)}>
          {() => (
            <div class="flex flex-col gap-2 px-5 py-4">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="h-4 w-28 bg-muted rounded animate-pulse" />
                  <div class="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div class="h-5 w-24 rounded-full bg-muted animate-pulse" />
              </div>
              <div class="flex gap-2">
                <div class="h-3 w-16 bg-muted rounded animate-pulse" />
                <div class="h-3 w-3 bg-muted rounded animate-pulse" />
                <div class="h-3 w-20 bg-muted rounded animate-pulse" />
                <div class="h-3 w-3 bg-muted rounded animate-pulse" />
                <div class="h-3 w-12 bg-muted rounded animate-pulse" />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

function FullPageSkeleton() {
  return (
    <div class="flex flex-col gap-6">
      <div class="space-y-2">
        <div class="h-8 w-64 bg-muted rounded animate-pulse" />
        <div class="h-4 w-80 bg-muted rounded animate-pulse" />
      </div>
      <StatCardsSkeleton />
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div class="xl:col-span-2">
          <SpendChartSkeleton />
        </div>
        <AgentStatsSkeleton />
      </div>
      <CallDbSkeleton />
    </div>
  )
}

function classifyCallRecord(c: VapiCallLogEntry): CallRecord {
  const outcome = classifyOutcome(c)
  return {
    id: c.id,
    customer: c.customerNumber || c.phoneNumber || 'Unknown',
    phone: c.phoneNumber || c.customerNumber || '—',
    agent: c.assistantName || 'Unknown',
    summary: c.summary || 'No summary available.',
    durationSeconds: c.duration,
    timestamp: c.startedAt,
    outcome,
    hangupReason: c.endedReason || 'Unknown',
    language: 'English',
  }
}

function classifyOutcome(c: VapiCallLogEntry): CallOutcome {
  const ended = c.endedReason?.toLowerCase() ?? ''
  const status = c.status?.toLowerCase() ?? ''
  const summary = c.summary?.toLowerCase() ?? ''

  if (status === 'completed' || ended === 'completed') {
    if (/booked|confirmed|appointment|scheduled/.test(summary)) {
      return 'Appointment booked'
    }
    return 'Issue resolved'
  }
  if (ended.includes('voicemail') || status.includes('voicemail')) return 'Voicemail'
  if (ended.includes('no-answer') || ended === 'missed' || status === 'missed') return 'Missed'
  if (ended.includes('transfer')) return 'Transferred'

  return 'Info provided'
}
