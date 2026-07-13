import {
  PhoneCall,
  ArrowRight,
  Sparkles,
  Clock,
  CalendarCheck,
  Globe,
} from 'lucide-solid'
import { Show } from 'solid-js'
import { Button } from '../ui/button'
import { VoiceWaveform } from '../ui/voice-waveform'

export function Hero(props: { authed?: boolean }) {
  return (
    <section class="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div
        class="pointer-events-none absolute left-1/2 top-24 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #22E6F2 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="mx-auto max-w-3xl text-center">
          <div class="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <Sparkles class="size-4 text-primary" strokeWidth={1.75} />
            <span class="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Powered by ElevenLabs &amp; Vapi
            </span>
          </div>

          <h1 class="mt-6 text-balance font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Never Miss a Call Again:{' '}
            <span class="text-primary">24/7 AI Voice Agents</span> Behind
            Your Business
          </h1>

          <p class="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Automate appointment booking, customer service, and more with our
            intelligent voice agents. Human-like conversations that answer every
            call, day or night.
          </p>

          <Show
            when={!props.authed}
            fallback={
              <div class="mt-8">
                <a href="/dashboard">
                  <Button
                    size="lg"
                    class="w-full rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    Dashboard
                    <ArrowRight class="size-4" strokeWidth={2} />
                  </Button>
                </a>
              </div>
            }
          >
            <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/sign-up">
                <Button
                  size="lg"
                  class="w-full rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  Get started
                  <ArrowRight class="size-4" strokeWidth={2} />
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                class="w-full rounded-full border-border bg-card font-medium text-foreground hover:bg-card/80 hover:text-foreground sm:w-auto"
              >
                <PhoneCall class="size-4" strokeWidth={1.75} />
                Hear a live agent
              </Button>
            </div>
          </Show>
        </div>

        <div class="relative mx-auto mt-16 max-w-2xl">
          <div class="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/40 sm:p-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="relative flex size-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <PhoneCall class="size-5 text-primary" strokeWidth={1.75} />
                  <span class="absolute -right-0.5 -top-0.5 flex size-3">
                    <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                    <span class="relative inline-flex size-3 rounded-full bg-primary" />
                  </span>
                </span>
                <div class="text-left">
                  <p class="text-sm font-medium">Everlight Agent · Live</p>
                  <p class="font-mono text-xs text-muted-foreground">
                    Incoming call · 00:42
                  </p>
                </div>
              </div>
              <span class="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                Answered
              </span>
            </div>

            <VoiceWaveform class="my-6" />

            <div class="grid grid-cols-3 gap-3">
              {[
                { icon: CalendarCheck, label: 'Booking confirmed' },
                { icon: Globe, label: '32 languages' },
                { icon: Clock, label: 'Avg. 1.2s reply' },
              ].map(({ icon: Icon, label }) => (
                <div
                  class="flex flex-col items-center gap-2 rounded-xl border border-border bg-background/60 px-2 py-3 text-center"
                >
                  <Icon class="size-5 text-primary" strokeWidth={1.75} />
                  <span class="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
