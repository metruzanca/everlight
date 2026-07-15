import { createSignal, Show, For, type JSX } from 'solid-js'
import { AudioLines, LayoutDashboard, Phone, CalendarCheck, Users, CreditCard, Settings, X } from 'lucide-solid'
import { cn } from '../../lib/utils'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '#overview' },
  { label: 'Call database', icon: Phone, href: '#call-database' },
  { label: 'Appointments', icon: CalendarCheck, href: '#appointments' },
  { label: 'Voice agents', icon: AudioLines, href: '#voice-agents' },
  { label: 'Customers', icon: Users, href: '/customers' },
  { label: 'Billing', icon: CreditCard, href: '/billing' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export function DashboardShell(props: { children: JSX.Element }) {
  const [open, setOpen] = createSignal(false)

  return (
    <div class="lg:flex lg:flex-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        class="fixed bottom-4 left-4 z-30 flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-lg lg:hidden"
        aria-label="Open dashboard navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
      <aside
        class={cn(
          'fixed inset-y-0 left-0 z-50 w-56 border-r border-border bg-card/40 backdrop-blur-xl transition-transform duration-200',
          'lg:sticky lg:inset-auto lg:top-16 lg:z-0 lg:block lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:translate-x-0',
          open() ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div class="flex items-center justify-between border-b border-border px-4 h-14">
          <span class="font-heading text-sm font-semibold">Dashboard</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            class="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X class="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
        <nav class="flex flex-col gap-0.5 p-2">
          <For each={navItems}>
            {(item) => (
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                class={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-card hover:text-foreground',
                )}
              >
                <item.icon class="size-[18px]" strokeWidth={1.75} />
                {item.label}
              </a>
            )}
          </For>
        </nav>
      </aside>

      <Show when={open()}>
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          class="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      </Show>

      <div class="flex-1 min-w-0 px-4 py-6 sm:px-6 sm:py-8">
        {props.children}
      </div>
    </div>
  )
}
