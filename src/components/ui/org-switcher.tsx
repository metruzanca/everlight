import { For, createSignal, Show } from 'solid-js'
import { useUserContext } from '../../lib/user-provider'

export function OrgSwitcher() {
  const ctx = useUserContext()
  const [open, setOpen] = createSignal(false)

  const orgs = () => ctx.orgs()
  const isAdmin = () => ctx.isAdmin()

  const selectedName = () => {
    const s = getSelectedRaw()
    if (s === 'all') return 'All Organizations'
    return orgs().find((o) => o.id === s)?.name ?? 'Org'
  }

  function getSelectedRaw() {
    const stored = ctx.selectedOrgId()
    if (stored) return stored
    const list = orgs()
    if (list.length > 0) return isAdmin() ? 'all' : list[0].id
    return null
  }

  const handleSelect = (id: string | null) => {
    ctx.setSelectedOrgId(id)
    setOpen(false)
    window.location.reload()
  }

  return (
    <div class="relative">
      <button
        onClick={() => setOpen(!open())}
        class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-md px-2 py-1"
      >
        <span>{selectedName()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3">
          <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </button>

      <Show when={open()}>
        <div class="absolute right-0 top-full mt-1 w-48 bg-card border border-border/60 rounded-lg shadow-lg py-1 z-50">
          <For each={orgs()}>
            {(org) => (
              <button
                onClick={() => handleSelect(org.id)}
                class={`w-full text-left px-3 py-1.5 text-sm transition-colors ${getSelectedRaw() === org.id ? 'text-accent bg-accent/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
              >
                {org.name}
              </button>
            )}
          </For>
          <Show when={isAdmin()}>
            <div class="border-t border-border/40 my-1" />
            <button
              onClick={() => handleSelect('all')}
              class={`w-full text-left px-3 py-1.5 text-sm transition-colors ${getSelectedRaw() === 'all' ? 'text-accent bg-accent/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
            >
              All Organizations
            </button>
          </Show>
        </div>
      </Show>
    </div>
  )
}
