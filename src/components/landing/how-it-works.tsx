import { Plug, SlidersHorizontal, Rocket } from 'lucide-solid'

const steps = [
  {
    icon: Plug,
    step: '01',
    title: 'Connect your systems',
    description:
      'Link your phone number, calendar, and knowledge base in minutes. No engineering team needed.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Train your agent',
    description:
      'Choose a voice, set your tone, and define what the agent should handle. We tune it to your business.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Go live 24/7',
    description:
      'Your agent starts answering calls immediately — booking, resolving, and escalating around the clock.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      class="border-y border-border/60 bg-card/30 py-20 sm:py-28"
    >
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="mx-auto max-w-2xl text-center">
          <span class="font-mono text-xs uppercase tracking-widest text-primary">
            How it works
          </span>
          <h2 class="mt-4 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Live in a day, not a quarter
          </h2>
        </div>

        <div class="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div
             
              class="relative rounded-2xl border border-border bg-background p-6"
            >
              <span class="font-mono text-sm text-primary">{step}</span>
              <span class="mt-4 flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
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
