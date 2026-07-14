import { createFileRoute, CatchBoundary } from '@tanstack/solid-router'
import { For, createSignal, createResource, Show, Suspense, onMount } from 'solid-js'
import { createSolidTable, getCoreRowModel, createColumnHelper, flexRender } from '@tanstack/solid-table'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { AppNav } from '../components/ui/app-nav'
import { getSelectedOrgId } from '../lib/org-store'

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
    (_) => {
      const orgId = getSelectedOrgId()()
      const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''
      return fetchVapi(`/api/vapi/stats${params}`)
        .then((res) => {
          if (res.status === 500) {
            setVapiKeyOk(false)
            throw new Error('Vapi not configured')
          }
          return res.json()
        })
    },
  )

  const [callLogs] = createResource<CallLogEntry[], boolean>(
    shouldFetch,
    (_) => {
      const orgId = getSelectedOrgId()()
      const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''
      return fetchVapi(`/api/vapi/calls${params}`)
        .then((res) => res.json())
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

  return (
    <div class="min-h-screen">
      <AppNav />

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

const columnHelper = createColumnHelper<CallLogEntry>()

const columns = [
  columnHelper.accessor('startedAt', {
    header: 'Date',
    cell: (info) => (
      <span class="text-muted-foreground whitespace-nowrap">{formatDate(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor('assistantName', {
    header: 'Assistant',
    cell: (info) => (
      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor((row) => row.customerNumber || row.phoneNumber || '—', {
    id: 'from',
    header: 'From',
    cell: (info) => <span class="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('duration', {
    header: 'Duration',
    cell: (info) => (
      <span class="text-muted-foreground whitespace-nowrap">{formatDuration(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor('endedReason', {
    header: 'Status',
    cell: (info) => {
      const value = info.getValue() || info.row.original.status
      const isComplete = value === 'completed'
      return (
        <span class={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isComplete ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {value}
        </span>
      )
    },
  }),
  columnHelper.accessor('cost', {
    header: 'Cost',
    cell: (info) => (
      <span class="text-muted-foreground whitespace-nowrap">{formatCurrency(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor('summary', {
    header: 'Summary',
    cell: (info) => (
      <span class="text-muted-foreground max-w-[200px] truncate block">{info.getValue() || '—'}</span>
    ),
  }),
]

function CallLogsTable(props: { calls: CallLogEntry[] }) {
  const table = createSolidTable({
    get data() { return props.calls },
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr class="border-b border-border text-left text-muted-foreground">
                <For each={headerGroup.headers}>
                  {(header) => (
                    <th class="pb-3 pr-4 last:pr-0 font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table.getRowModel().rows}>
            {(row) => (
              <tr class="border-b border-border/60 hover:bg-muted/30 transition-colors">
                <For each={row.getVisibleCells()}>
                  {(cell) => (
                    <td class="py-3 pr-4 last:pr-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}
