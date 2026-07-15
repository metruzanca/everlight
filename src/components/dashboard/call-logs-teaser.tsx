import { ScrollText, AudioLines, Sparkles, Clock, Phone, Flag, PhoneOff } from 'lucide-solid'

const logFields = [
  { icon: AudioLines, label: 'Voice agent' },
  { icon: Sparkles, label: 'AI call summaries' },
  { icon: Clock, label: 'Duration & time' },
  { icon: Phone, label: 'Phone number' },
  { icon: Flag, label: 'Outcome' },
  { icon: PhoneOff, label: 'Hangup reason' },
]

export function CallLogsTeaser() {
  return (
    <div class="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-card p-5 sm:p-6">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <ScrollText class="size-[18px] text-primary" strokeWidth={1.75} />
          </span>
          <div>
            <h2 class="font-heading text-base font-semibold">Call logs</h2>
            <p class="text-sm text-muted-foreground">Deep per-call timelines & transcripts</p>
          </div>
        </div>
        <span class="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Coming soon
        </span>
      </div>

      <p class="mt-4 text-sm leading-relaxed text-muted-foreground">
        A full audit trail for every conversation. Replay recordings, read
        transcripts, and inspect exactly what each agent did — with structured
        metadata you can filter and export.
      </p>

      <ul class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {logFields.map(({ icon: Icon, label }) => (
          <li class="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
            <Icon class="size-4 text-primary" strokeWidth={1.75} />
            <span class="text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
