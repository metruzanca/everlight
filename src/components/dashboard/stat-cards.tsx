import { DollarSign, PhoneIncoming, CalendarCheck, PhoneCall, Clock, TrendingUp, TrendingDown } from 'lucide-solid'
import { cn } from '../../lib/utils'

export type StatCardsData = {
  totalCallsLifetime: number
  callsAnswered: number
  appointmentsBooked: number | null
  avgCallLength: number
  monthlySpend: number
  spendChangePct: number
  callsAnsweredChangePct: number
  appointmentsChangePct: number
  afterHoursCalls: number
  bookingRatio: number | null
}

type Stat = {
  label: string
  value: string
  sub: string
  icon: typeof DollarSign
  change?: { value: string; positive: boolean }
}

export function StatCards(props: { data: StatCardsData }) {
  const d = props.data

  const stats: Stat[] = [
    {
      label: 'Organization spend',
      value: `$${d.monthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'This month',
      icon: DollarSign,
      change: { value: `${d.spendChangePct}%`, positive: false },
    },
    {
      label: 'Calls answered',
      value: d.callsAnswered.toLocaleString('en-US'),
      sub: 'Last 30 days',
      icon: PhoneIncoming,
      change: { value: `${d.callsAnsweredChangePct}%`, positive: true },
    },
    {
      label: 'Appointments booked',
      value: d.appointmentsBooked?.toLocaleString('en-US') ?? '—',
      sub: 'Last 30 days',
      icon: CalendarCheck,
      change: { value: `${d.appointmentsChangePct}%`, positive: true },
    },
    {
      label: 'Total calls (lifetime)',
      value: d.totalCallsLifetime.toLocaleString('en-US'),
      sub: 'Since launch',
      icon: PhoneCall,
    },
    {
      label: 'Average call length',
      value: formatDurationSimple(d.avgCallLength),
      sub: 'Minutes per call',
      icon: Clock,
    },
  ]

  return (
    <section id="overview" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <div class="rounded-2xl border border-border bg-card p-5">
          <div class="flex items-center justify-between">
            <span class="flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
              <stat.icon class="size-[18px] text-primary" strokeWidth={1.75} />
            </span>
            {stat.change && (
              <span
                class={cn(
                  'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                  stat.change.positive
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                {stat.change.positive
                  ? <TrendingUp class="size-3" strokeWidth={2} />
                  : <TrendingDown class="size-3" strokeWidth={2} />}
                {stat.change.value}
              </span>
            )}
          </div>
          <p class="mt-4 font-heading text-2xl font-bold tracking-tight">{stat.value}</p>
          <p class="mt-1 text-sm text-foreground">{stat.label}</p>
          <p class="text-xs text-muted-foreground">{stat.sub}</p>
        </div>
      ))}
    </section>
  )
}

function formatDurationSimple(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
