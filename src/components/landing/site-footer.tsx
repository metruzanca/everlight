import { AudioLines } from 'lucide-solid'

const columns = [
  {
    title: 'Product',
    links: ['Features', 'How it works', 'Pricing', 'Integrations'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Status'],
  },
]

export function SiteFooter() {
  return (
    <footer class="border-t border-border/60 bg-card/30">
      <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div class="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <a href="/" class="flex items-center gap-2">
              <span class="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <AudioLines class="size-5 text-primary" strokeWidth={1.75} />
              </span>
              <span class="font-heading text-lg font-semibold tracking-tight">
                Everlight
              </span>
            </a>
            <p class="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              24/7 AI voice agents behind your business. Powered by ElevenLabs
              and Vapi.
            </p>
          </div>

          {columns.map((col) => (
            <div>
              <h3 class="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {col.title}
              </h3>
              <ul class="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li>
                    <a
                      href="#"
                      class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p class="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Everlight AI. All rights reserved.
          </p>
          <p class="font-mono text-xs text-muted-foreground">
            Built with ElevenLabs &amp; Vapi
          </p>
        </div>
      </div>
    </footer>
  )
}
