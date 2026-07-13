import { ArrowRight, PhoneCall } from 'lucide-solid'
import { Show } from 'solid-js'
import { Button } from '../ui/button'
import { VoiceWaveform } from '../ui/voice-waveform'

export function Cta(props: { authed?: boolean }) {
  return (
    <section class="pb-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="relative overflow-hidden rounded-3xl border border-primary/20 bg-card px-6 py-14 text-center sm:px-12">
          <div
            class="pointer-events-none absolute left-1/2 top-0 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, #22E6F2 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <VoiceWaveform class="mb-8 opacity-70" />
          <h2 class="mx-auto max-w-2xl text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Stop losing customers to missed calls
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Deploy a 24/7 AI voice agent that books, answers, and never sleeps.
            See it live on your own use case.
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
                class="w-full rounded-full border-border bg-background font-medium text-foreground hover:bg-background/80 hover:text-foreground sm:w-auto"
              >
                <PhoneCall class="size-4" strokeWidth={1.75} />
                Talk to an agent now
              </Button>
            </div>
          </Show>
        </div>
      </div>
    </section>
  )
}
