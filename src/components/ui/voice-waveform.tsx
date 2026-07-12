const bars = Array.from({ length: 40 })

export function VoiceWaveform({ class: className }: { class?: string }) {
  return (
    <div
      class={`flex h-16 items-center justify-center gap-[3px] ${className ?? ''}`}
      aria-hidden="true"
    >
      {bars.map((_, i) => {
        const delay = (i % 10) * 0.09
        const duration = 0.9 + (i % 5) * 0.12
        return (
          <span
           
            class="w-[3px] rounded-full bg-primary/70"
            style={{
              height: '20%',
              animation: `wave ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes wave {
          0%, 100% { height: 15%; opacity: 0.5; }
          50% { height: 95%; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
