const companies = [
  'Northwind',
  'Belmont Dental',
  'Cedar Clinic',
  'Apex Realty',
  'Lumen Spa',
  'Riverside Auto',
]

export function Logos() {
  return (
    <section class="border-y border-border/60 bg-card/30 py-10">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <p class="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Trusted by teams that never want to miss a customer
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span
             
              class="font-heading text-lg font-semibold text-muted-foreground/70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
