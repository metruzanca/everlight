import { For, createSignal, createResource, createEffect, Show, onMount } from 'solid-js'
import { getSelectedOrgId, setSelectedOrg } from '../../lib/org-store'

type OrgEntry = { id: string; name: string }

type OrgsResponse = {
  orgs: OrgEntry[]
  memberships: { id: string; orgId: string; userId: string; role: string }[]
  currentUserRole: string | null
}

export function OrgSwitcher() {
  const [shouldFetch, triggerFetch] = createSignal(false)
  const [open, setOpen] = createSignal(false)

  const [data] = createResource<OrgsResponse, boolean>(
    shouldFetch,
    (_) =>
      fetch('/api/organizations').then((r) => {
        if (r.status === 401) window.location.href = '/sign-in'
        return r.json()
      }),
  )

  onMount(() => {
    triggerFetch(true)
  })

  const orgs = () => data()?.orgs ?? []
  const isAdmin = () => data()?.currentUserRole === 'admin'
  const selected = () => getSelectedOrgId()()

  createEffect(() => {
    const list = orgs()
    const current = selected()
    if (!current && list.length > 0) {
      setSelectedOrg(isAdmin() ? 'all' : list[0].id)
    }
  })

  const selectedName = () => {
    const s = selected()
    if (s === 'all') return 'All Organizations'
    const list = orgs()
    return list.find((o) => o.id === s)?.name ?? list[0]?.name ?? 'Org'
  }

  const handleSelect = (id: string | null) => {
    setSelectedOrg(id)
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
                class={`w-full text-left px-3 py-1.5 text-sm transition-colors ${selected() === org.id ? 'text-accent bg-accent/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
              >
                {org.name}
              </button>
            )}
          </For>
          <Show when={isAdmin()}>
            <div class="border-t border-border/40 my-1" />
            <button
              onClick={() => handleSelect('all')}
              class={`w-full text-left px-3 py-1.5 text-sm transition-colors ${selected() === 'all' ? 'text-accent bg-accent/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
            >
              All Organizations
            </button>
          </Show>
        </div>
      </Show>
    </div>
  )
}
