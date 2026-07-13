import { X, Check, Sparkles } from 'lucide-solid'
import { AudioClipPlayer } from './audio-clip-player'

const badPoints = [
  '"Please say your account number" — you do, but it doesn\u2019t listen',
  '"I didn\u2019t catch that, try again" — you say it louder',
  'Escalates from frustrating to infuriating in three seconds flat',
]

const goodPoints = [
  'Just talk — it understands and responds naturally',
  'Warm, human-sounding voice that actually listens',
  'Takes real action: books, answers, and follows up',
]

export function Comparison() {
  return (
    <section id="demo" class="py-20 sm:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="mx-auto max-w-2xl text-center">
          <span class="font-mono text-xs uppercase tracking-widest text-primary">
            Hear the difference
          </span>
          <h2 class="mt-4 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Not just another AI phone menu that sucks
          </h2>
          <p class="mt-4 text-pretty text-muted-foreground">
            You know the ones — endless menus, robot voices, and &ldquo;I
            didn&apos;t catch that.&rdquo; Ours feels like talking to Jarvis:
            intelligent, natural, and genuinely helpful. Press play and hear it
            for yourself.
          </p>
        </div>

        <div class="mt-14 grid gap-4 lg:grid-cols-2">
            <AudioClipPlayer
            variant="bad"
            label="The old way"
            caption="Bad AI voice system"
            transcript={'\u201CPlease say your account number.\u201D \u201CI didn\u2019t catch that, try again.\u201D \u201C\u2014 ACCOUNT NUMBER!\u201D'}
          />
          <AudioClipPlayer
            variant="good"
            label="Our voice agent"
            caption="A real conversation, powered by AI"
            transcript={'\u201CHi! I can help you book that appointment. I see Thursday at 2pm is open \u2014 want me to lock it in and send a confirmation?\u201D'}
          />
        </div>

        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <ul class="space-y-3 rounded-2xl border border-border bg-card p-6">
            {badPoints.map((point) => (
              <li class="flex items-start gap-3 text-sm">
                <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                  <X class="size-3 text-muted-foreground" strokeWidth={2} />
                </span>
                <span class="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>

          <ul class="space-y-3 rounded-2xl border border-primary/40 bg-card p-6">
            {goodPoints.map((point) => (
              <li class="flex items-start gap-3 text-sm">
                <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <Check class="size-3 text-primary" strokeWidth={2} />
                </span>
                <span class="text-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div class="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles class="size-4 text-primary" strokeWidth={1.75} />
          <span>
            Voices powered by ElevenLabs &amp; Vapi — indistinguishable from a
            real person.
          </span>
        </div>
      </div>
    </section>
  )
}
