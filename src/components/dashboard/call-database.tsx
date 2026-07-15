import { createSignal, createMemo, Show, For } from 'solid-js'
import {
  Search, Phone, CalendarCheck, CheckCircle2, Info, ArrowRightLeft, Voicemail, PhoneMissed,
  ChevronDown, Download, SlidersHorizontal,
} from 'lucide-solid'
import { cn } from '../../lib/utils'
import { formatDuration, formatTimestamp } from '../../lib/format'

export type CallOutcome =
  | 'Appointment booked'
  | 'Issue resolved'
  | 'Info provided'
  | 'Transferred'
  | 'Voicemail'
  | 'Missed'

export type CallRecord = {
  id: string
  customer: string
  phone: string
  agent: string
  summary: string
  durationSeconds: number
  timestamp: string
  outcome: CallOutcome
  hangupReason: string
  language: string
}

const outcomeConfig: Record<CallOutcome, {
  icon: typeof CalendarCheck
  className: string
}> = {
  'Appointment booked': {
    icon: CalendarCheck,
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  'Issue resolved': {
    icon: CheckCircle2,
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  'Info provided': {
    icon: Info,
    className: 'border-border bg-background text-muted-foreground',
  },
  Transferred: {
    icon: ArrowRightLeft,
    className: 'border-border bg-background text-muted-foreground',
  },
  Voicemail: {
    icon: Voicemail,
    className: 'border-border bg-background text-muted-foreground',
  },
  Missed: {
    icon: PhoneMissed,
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
}

const filters: (CallOutcome | 'All')[] = [
  'All',
  'Appointment booked',
  'Issue resolved',
  'Info provided',
  'Transferred',
  'Voicemail',
  'Missed',
]

function OutcomeBadge(props: { outcome: CallOutcome }) {
  const { icon: Icon, className } = outcomeConfig[props.outcome]
  return (
    <span class={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', className)}>
      <Icon class="size-3.5" strokeWidth={1.75} />
      {props.outcome}
    </span>
  )
}

export function CallDatabase(props: { calls: CallRecord[] }) {
  const [query, setQuery] = createSignal('')
  const [filter, setFilter] = createSignal<'All' | CallOutcome>('All')
  const [expanded, setExpanded] = createSignal<string | null>(null)

  const filtered = createMemo(() => {
    const q = query().trim().toLowerCase()
    return props.calls.filter((call) => {
      const matchesFilter = filter() === 'All' || call.outcome === filter()
      if (!matchesFilter) return false
      if (!q) return true
      const haystack = [
        call.customer,
        call.phone,
        call.agent,
        call.summary,
        call.outcome,
        call.hangupReason,
        call.language,
        formatTimestamp(call.timestamp),
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  })

  return (
    <section id="call-database">
      <div class="rounded-2xl border border-border bg-card">
        <div class="flex flex-col gap-4 border-b border-border p-5 sm:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="font-heading text-base font-semibold">Call database</h2>
              <p class="text-sm text-muted-foreground">Search by customer, phone number, date, or keywords</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Download class="size-4" strokeWidth={1.75} />
              Export
            </button>
          </div>

          <div class="relative">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query()}
              onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
              placeholder="Search calls…  e.g. Maria, +1 (415), refund, Jul 8"
              class="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <SlidersHorizontal class="size-4 text-muted-foreground" strokeWidth={1.75} />
            {filters.map((f) => (
              <button
                type="button"
                onClick={() => setFilter(f as CallOutcome | 'All')}
                class={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filter() === f
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div class="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground sm:px-6">
          <span>
            {filtered().length} {filtered().length === 1 ? 'call' : 'calls'}
          </span>
          <span class="hidden sm:inline">Tap a row for details</span>
        </div>

        <div class="hidden overflow-x-auto lg:block">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th class="px-6 py-3 font-medium">Customer</th>
                <th class="px-4 py-3 font-medium">Voice agent</th>
                <th class="px-4 py-3 font-medium">Time</th>
                <th class="px-4 py-3 font-medium">Duration</th>
                <th class="px-4 py-3 font-medium">Outcome</th>
                <th class="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              <For each={filtered()}>
                {(call) => (
                  <CallRow
                    call={call}
                    expanded={expanded() === call.id}
                    onToggle={() => setExpanded((cur) => (cur === call.id ? null : call.id))}
                  />
                )}
              </For>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col divide-y divide-border lg:hidden">
          <For each={filtered()}>
            {(call) => <CallCard call={call} />}
          </For>
        </div>

        <Show when={filtered().length === 0}>
          <div class="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <span class="flex size-11 items-center justify-center rounded-full border border-border bg-background">
              <Phone class="size-5 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p class="text-sm font-medium">No calls found</p>
            <p class="text-xs text-muted-foreground">Try a different name, number, date, or keyword.</p>
          </div>
        </Show>
      </div>
    </section>
  )
}

function CallRow(props: {
  call: CallRecord
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr
        onClick={props.onToggle}
        class="cursor-pointer border-b border-border/60 transition-colors hover:bg-background/40"
      >
        <td class="px-6 py-4">
          <p class="font-medium">{props.call.customer}</p>
          <p class="font-mono text-xs text-muted-foreground">{props.call.phone}</p>
        </td>
        <td class="px-4 py-4 text-muted-foreground">{props.call.agent}</td>
        <td class="px-4 py-4 text-muted-foreground">{formatTimestamp(props.call.timestamp)}</td>
        <td class="px-4 py-4 font-mono text-muted-foreground">{formatDuration(props.call.durationSeconds)}</td>
        <td class="px-4 py-4"><OutcomeBadge outcome={props.call.outcome} /></td>
        <td class="px-6 py-4 text-right">
          <ChevronDown
            class={cn(
              'ml-auto size-4 text-muted-foreground transition-transform',
              props.expanded && 'rotate-180 text-primary',
            )}
            strokeWidth={1.75}
          />
        </td>
      </tr>
      <Show when={props.expanded}>
        <tr class="border-b border-border/60 bg-background/40">
          <td colSpan={6} class="px-6 py-5">
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="sm:col-span-2">
                <p class="text-xs font-medium uppercase tracking-wide text-primary">AI call summary</p>
                <p class="mt-1.5 text-sm leading-relaxed text-foreground">{props.call.summary}</p>
              </div>
              <dl class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-1">
                <div>
                  <dt class="text-xs text-muted-foreground">Hangup reason</dt>
                  <dd class="mt-0.5 font-medium">{props.call.hangupReason}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted-foreground">Language</dt>
                  <dd class="mt-0.5 font-medium">{props.call.language}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted-foreground">Call ID</dt>
                  <dd class="mt-0.5 font-mono text-xs">{props.call.id}</dd>
                </div>
              </dl>
            </div>
          </td>
        </tr>
      </Show>
    </>
  )
}

function CallCard(props: { call: CallRecord }) {
  const [open, setOpen] = createSignal(false)
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      class="flex flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-background/40"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-medium">{props.call.customer}</p>
          <p class="font-mono text-xs text-muted-foreground">{props.call.phone}</p>
        </div>
        <OutcomeBadge outcome={props.call.outcome} />
      </div>
      <div class="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{props.call.agent}</span>
        <span aria-hidden>·</span>
        <span>{formatTimestamp(props.call.timestamp)}</span>
        <span aria-hidden>·</span>
        <span class="font-mono">{formatDuration(props.call.durationSeconds)}</span>
      </div>
      <Show when={open()}>
        <div class="rounded-lg border border-border bg-card p-3">
          <p class="text-xs font-medium uppercase tracking-wide text-primary">AI call summary</p>
          <p class="mt-1 text-sm leading-relaxed">{props.call.summary}</p>
          <p class="mt-2 text-xs text-muted-foreground">
            Hangup: {props.call.hangupReason} · {props.call.language}
          </p>
        </div>
      </Show>
    </button>
  )
}
