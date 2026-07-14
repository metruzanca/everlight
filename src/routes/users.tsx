import { createFileRoute } from '@tanstack/solid-router'
import { For, createSignal, createResource, Show, Suspense, onMount } from 'solid-js'
import { createSolidTable, getCoreRowModel, createColumnHelper, flexRender } from '@tanstack/solid-table'
import { AppNav } from '../components/ui/app-nav'
import { Card, CardContent } from '../components/ui/card'
import { DropdownMenu, DropdownMenuItem } from '../components/ui/dropdown-menu'

export const Route = createFileRoute('/users')({ component: Users })

type UserEntry = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string
  image: string | null
  createdAt: string
  updatedAt: string
}

type OrgInfo = { id: string; name: string }

type UsersResponse = {
  users: UserEntry[]
  userOrgs: Record<string, OrgInfo[]>
  currentUserRole: string
  firstUserId: string | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Users() {
  const [shouldFetch, triggerFetch] = createSignal(false)
  const [deleting, setDeleting] = createSignal<string | null>(null)

  const [data] = createResource<UsersResponse, boolean>(
    shouldFetch,
    (_) =>
      fetch('/api/users').then((res) => {
        if (res.status === 401) { window.location.href = '/sign-in'; throw new Error('Unauthorized') }
        return res.json()
      }),
  )

  const users = () => data()?.users ?? []
  const userOrgsData = () => data()?.userOrgs ?? {}
  const isAdmin = () => data()?.currentUserRole === 'admin'
  const firstUserId = () => data()?.firstUserId ?? null

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    setDeleting(userId)
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.status === 401) { window.location.href = '/sign-in'; return }
      if (!res.ok) {
        const body = await res.json()
        alert(body.error || 'Failed to delete user')
        return
      }
      triggerFetch((p) => !p)
    } finally {
      setDeleting(null)
    }
  }

  onMount(() => triggerFetch(true))

  const columnHelper = createColumnHelper<UserEntry>()

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <span class="font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => (
        <span class="text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => {
        const role = info.getValue()
        return (
          <span class={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
            {role}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'organizations',
      header: 'Organization',
      cell: (info) => {
        const orgs = userOrgsData()[info.row.original.id]
        if (!orgs || orgs.length === 0) return <span class="text-muted-foreground">—</span>
        return (
          <div class="flex flex-wrap gap-1">
            <For each={orgs}>
              {(org) => (
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                  {org.name}
                </span>
              )}
            </For>
          </div>
        )
      },
    }),
    columnHelper.accessor('emailVerified', {
      header: 'Verified',
      cell: (info) => (
        <span class={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${info.getValue() ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {info.getValue() ? 'Yes' : 'No'}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Joined',
      cell: (info) => (
        <span class="text-muted-foreground whitespace-nowrap">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <DropdownMenu
          align="end"
          trigger={
            <button class="text-muted-foreground hover:text-foreground transition-colors px-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
          }
        >
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(info.row.original.id)}>
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem
            hidden={info.row.original.id === firstUserId()}
            disabled={deleting() === info.row.original.id}
            destructive
            onClick={() => handleDelete(info.row.original.id)}
          >
            {deleting() === info.row.original.id ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenu>
      ),
    }),
  ]

  const table = () => {
    const u = users()
    deleting() // track for reactivity so button label updates
    if (u.length === 0) return null
    return createSolidTable({
      get data() { return u },
      get columns() { return isAdmin() ? columns : columns.slice(0, -1) },
      getCoreRowModel: getCoreRowModel(),
    })
  }

  return (
    <div class="min-h-screen">
      <AppNav />
      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 class="text-2xl font-heading font-bold mb-6">Users</h1>

        <Suspense fallback={<p class="text-sm text-muted-foreground">Loading users...</p>}>
          <Show when={data.error}>
            <Card class="border-destructive/30 bg-destructive/5 mb-6">
              <CardContent class="pt-6">
                <p class="text-destructive font-medium text-sm">Failed to load users</p>
                <p class="text-xs text-muted-foreground mt-1">{(data.error as Error).message}</p>
              </CardContent>
            </Card>
          </Show>

          <Show when={table()}>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <For each={table()!.getHeaderGroups()}>
                    {(headerGroup) => (
                      <tr class="border-b border-border text-left text-muted-foreground">
                        <For each={headerGroup.headers}>
                          {(header) => (
                            <th class="pb-3 pr-4 last:pr-0 font-medium">
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </thead>
                <tbody>
                  <For each={table()!.getRowModel().rows}>
                    {(row) => (
                      <tr class="border-b border-border/60 hover:bg-muted/30 transition-colors">
                        <For each={row.getVisibleCells()}>
                          {(cell) => (
                            <td class="py-3 pr-4 last:pr-0">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </Suspense>
      </main>
    </div>
  )
}
