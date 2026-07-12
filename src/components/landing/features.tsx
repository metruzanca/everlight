import {
  CalendarCheck,
  Headset,
  Languages,
  BookOpen,
  PhoneIncoming,
  TrendingUp,
} from 'lucide-solid'

const features = [
  {
    icon: CalendarCheck,
    title: 'Appointment Booking',
    description:
      'Agents check availability, schedule, reschedule, and confirm appointments directly in your calendar — no staff required.',
  },
  {
    icon: Headset,
    title: 'Customer Service',
    description:
      'Answer FAQs, resolve issues, and route complex requests to the right person, all with natural, human-like conversation.',
  },
  {
    icon: Languages,
    title: 'Multilingual Support',
    description:
      'Speak your customers\' language. Agents converse fluently across 30+ languages and switch mid-call automatically.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base Integration',
    description:
      'Connect your docs, help center, and internal data so agents answer with accurate, up-to-date information every time.',
  },
  {
    icon: PhoneIncoming,
    title: 'Never Miss a Call',
    description:
      'Every inbound call is answered instantly, 24/7 — no hold music, no voicemail, no lost leads.',
  },
  {
    icon: TrendingUp,
    title: 'Scales With You',
    description:
      'Handle one call or ten thousand at once. Capacity grows with demand without new hires or downtime.',
  },
]

export function Features() {
  return (
    <section id="features" class="py-20 sm:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="mx-auto max-w-2xl text-center">
          <span class="font-mono text-xs uppercase tracking-widest text-primary">
            Capabilities
          </span>
          <h2 class="mt-4 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your front desk does — automated
          </h2>
          <p class="mt-4 text-pretty text-muted-foreground">
            Intelligent voice agents that handle real conversations and take
            real action on behalf of your business.
          </p>
        </div>

        <div class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
             
              class="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span class="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Icon class="size-5 text-primary" strokeWidth={1.75} />
              </span>
              <h3 class="mt-5 font-heading text-lg font-semibold">
                {title}
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
