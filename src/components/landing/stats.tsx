const stats = [
  { value: '24/7', label: 'Always answering' },
  { value: '30+', label: 'Languages supported' },
  { value: '<1.5s', label: 'Average response time' },
  { value: '0', label: 'Missed calls' },
]

export function Stats() {
  return (
    <section id="capabilities" class="py-20 sm:py-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div
             
              class="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <p class="font-heading text-4xl font-bold text-primary">
                {value}
              </p>
              <p class="mt-2 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
