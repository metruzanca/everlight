import { createSignal, onCleanup } from 'solid-js'
import { Play, Pause } from 'lucide-solid'

type Variant = 'bad' | 'good'

const BAR_COUNT = 48

function buildProfile(variant: Variant) {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    let value: number
    if (variant === 'bad') {
      value = Math.min(1, 0.28 + (i % 3) * 0.08)
    } else {
      const wave =
        0.5 +
        0.4 * Math.sin(i * 0.45) +
        0.15 * Math.sin(i * 1.3) +
        0.1 * Math.cos(i * 0.7)
      value = Math.min(1, Math.max(0.15, wave))
    }
    return Math.round(value * 1000) / 1000
  })
}

export function AudioClipPlayer(props: {
  variant: Variant
  label: string
  caption: string
  transcript: string
}) {
  const [playing, setPlaying] = createSignal(false)
  let audioRef: HTMLAudioElement | undefined
  const profile = buildProfile(props.variant)

  onCleanup(() => {
    audioRef?.pause()
  })

  const toggle = () => {
    if (!audioRef) return
    if (playing()) {
      audioRef.pause()
      setPlaying(false)
    } else {
      audioRef.currentTime = 0
      audioRef.play()
      setPlaying(true)
    }
  }

  const onEnded = () => {
    setPlaying(false)
  }

  const isGood = props.variant === 'good'
  const accent = isGood ? 'text-primary' : 'text-muted-foreground'

  return (
    <div
      class={`flex h-full flex-col rounded-2xl border bg-card p-6 transition-colors ${
        isGood ? 'border-primary/40' : 'border-border'
      }`}
    >
      <audio
        ref={audioRef!}
        src="/placeholder-audio.ogg"
        onEnded={onEnded}
        preload="none"
      />

      <div class="flex items-center justify-between">
        <span class={`font-mono text-xs uppercase tracking-widest ${accent}`}>
          {props.label}
        </span>
        <span
          class={`rounded-full border px-2.5 py-0.5 text-xs ${
            isGood
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-secondary text-muted-foreground'
          }`}
        >
          {isGood ? 'Us' : 'Them'}
        </span>
      </div>

      <p class="mt-2 text-pretty text-lg font-semibold">{props.caption}</p>

      <div class="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing() ? `Pause ${props.label} clip` : `Play ${props.label} clip`}
          class={`flex size-12 shrink-0 items-center justify-center rounded-full border transition-colors ${
            isGood
              ? 'border-primary/40 bg-primary/15 text-primary hover:bg-primary/25'
              : 'border-border bg-secondary text-foreground hover:bg-secondary/70'
          }`}
        >
          {playing() ? (
            <Pause class="size-5" strokeWidth={1.75} />
          ) : (
            <Play class="size-5 translate-x-[1px]" strokeWidth={1.75} />
          )}
        </button>

        <div class="flex h-12 flex-1 items-center gap-[3px]" aria-hidden="true">
          {profile.map((h, i) => {
            const delay = (i % 12) * 0.06
            const duration = 0.7 + (i % 4) * 0.12
            return (
              <span
                class={`w-full rounded-full ${
                  isGood ? 'bg-primary/70' : 'bg-muted-foreground/50'
                }`}
                style={{
                  height: `${h * 100}%`,
                  animation: playing()
                    ? `clip-wave ${duration}s ease-in-out ${delay}s infinite`
                    : 'none',
                  opacity: playing() ? 1 : 0.55,
                }}
              />
            )
          })}
        </div>
      </div>

      <p class="mt-6 border-t border-border pt-4 text-sm italic leading-relaxed text-muted-foreground">
        {props.transcript}
      </p>

      <style>{`
        @keyframes clip-wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
