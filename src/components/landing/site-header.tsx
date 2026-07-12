import { createSignal } from 'solid-js'
import { AudioLines, Menu, X } from 'lucide-solid'
import { Button } from '../ui/button'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'FAQ', href: '#faq' },
]

export function SiteHeader() {
  const [open, setOpen] = createSignal(false)

  return (
    <header class="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" class="flex items-center gap-2">
          <span class="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <AudioLines class="size-5 text-primary" strokeWidth={1.75} />
          </span>
          <span class="font-heading text-lg font-semibold tracking-tight">
            Everlight
          </span>
        </a>

        <nav class="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
             
              href={link.href}
              class="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div class="hidden items-center gap-3 md:flex">
          <a
            href="/sign-in"
            class="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </a>
          <a href="/sign-up">
            <Button
              class="rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              Get started
            </Button>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v: boolean) => !v)}
          class="flex size-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label={open() ? 'Close menu' : 'Open menu'}
          aria-expanded={open()}
        >
          {open() ? (
            <X class="size-5" strokeWidth={1.75} />
          ) : (
            <Menu class="size-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {open() && (
        <div class="border-t border-border/60 bg-background/95 px-4 py-4 md:hidden">
          <nav class="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
               
                href={link.href}
                onClick={() => setOpen(false)}
                class="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a href="/sign-up">
              <Button class="mt-2 w-full rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90">
                Get started
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
