import { createFileRoute } from '@tanstack/solid-router'
import { For, createSignal, createEffect, Show, onCleanup } from 'solid-js'
import { createSolidTable, getCoreRowModel, createColumnHelper, flexRender } from '@tanstack/solid-table'
import { authClient } from '../lib/auth-client'
import { useUserContext } from '../lib/user-provider'
import { AppNav } from '../components/ui/app-nav'
import { Button } from '../components/ui/button'
import { DropdownMenu, DropdownMenuItem } from '../components/ui/dropdown-menu'
import { InviteDialog } from '../components/ui/invite-dialog'
import { createLogger } from '../lib/logger'

const log = createLogger('Users')

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Users() {
  const ctx = useUserContext()
  const session = authClient.useSession()
  const [deleting, setDeleting] = createSignal<string | null>(null)
  const [showInvite, setShowInvite] = createSignal(false)
  const [removing, setRemoving] = createSignal<string | null>(null)
  const [error, setError] = createSignal<string | null>(null)

  createEffect(() => {
    if (error()) {
      const t = setTimeout(() => setError(null), 4000)
      onCleanup(() => clearTimeout(t))
    }
  })

  const handleDelete = async (userId: string) => {
    log.debug({ userId, isAdmin: ctx.isAdmin() }, 'handleDelete')
    if (!confirm('Delete this user? This cannot be undone.')) return
    setDeleting(userId)
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.status === 401) { log.warn('Unauthorized, redirecting to sign-in'); window.location.href = '/sign-in'; return }
      if (!res.ok) {
        const body = await res.json()
        log.warn({ status: res.status, error: body.error }, 'delete failed')
        setError(body.error || 'Failed to delete user')
        return
      }
      log.debug('delete succeeded')
      ctx.refetchUsers()
    } catch (err) {
      log.error({ err }, 'delete error')
    } finally {
      setDeleting(null)
    }
  }

  async function handleRemove(userId: string) {
    const oid = ctx.selectedOrgId()
    log.debug({ userId, orgId: oid }, 'handleRemove')
    if (!oid || !confirm('Remove this member from the organization?')) return
    setRemoving(userId)
    try {
      const res = await fetch('/api/org-members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: oid, userId }),
      })
      if (!res.ok) {
        const body = await res.json()
        log.warn({ status: res.status, error: body.error }, 'remove failed')
        setError(body.error || 'Failed to remove member')
        return
      }
      log.debug('remove succeeded')
      ctx.refetchMembers()
    } catch (err) {
      log.error({ err }, 'remove error')
    } finally {
      setRemoving(null)
    }
  }

  async function handleLeave() {
    const oid = ctx.selectedOrgId()
    const uid = session().data?.user?.id
    log.debug({ orgId: oid, userId: uid }, 'handleLeave')
    if (!oid || !uid) return
    if (!confirm('Leave this organization?')) return
    const res = await fetch('/api/org-members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: oid, userId: uid }),
    })
    log.debug({ status: res.status }, 'leave response')
    if (!res.ok) {
      const body = await res.json()
      log.warn({ error: body.error }, 'leave failed')
      setError(body.error || 'Failed to leave')
      return
    }
    log.debug('leave succeeded')
    ctx.refetchMembers()
  }

  async function handleToggleAutoJoin() {
    const oid = ctx.selectedOrgId()
    const current = ctx.domainAutoJoin()
    log.debug({ orgId: oid, current, next: !current }, 'handleToggleAutoJoin')
    if (!oid) return
    try {
      const res = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: oid, domainAutoJoin: !current }),
      })
      if (!res.ok) {
        const body = await res.json()
        log.warn({ status: res.status, error: body.error }, 'toggle failed')
        setError(body.error || 'Failed to update setting')
        return
      }
      log.debug('toggle succeeded')
      ctx.refetchMembers()
    } catch (err) {
      log.error({ err }, 'toggle error')
    }
  }

  const columnHelper = createColumnHelper<UserEntry>()

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => <span class="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <span class="text-muted-foreground">{info.getValue()}</span>,
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
        const orgs = ctx.userOrgsData()[info.row.original.id]
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
            hidden={info.row.original.id === ctx.firstUserId()}
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
    const u = ctx.users()
    deleting()
    log.debug({ userCount: u.length }, 'table computed')
    if (u.length === 0) return null
    const cols = ctx.isAdmin() ? columns : columns.slice(0, -1)
    log.debug({ colCount: cols.length }, 'creating table')
    return createSolidTable({
      get data() { return u },
      get columns() { return cols },
      getCoreRowModel: getCoreRowModel(),
    })
  }

  return (
    <div class="min-h-screen">
      <AppNav />
      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Show when={error()}>
          {(msg) => (
            <div class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {msg()}
              <button onClick={() => setError(null)} class="ml-2 underline">Dismiss</button>
            </div>
          )}
        </Show>
        <h1 class="text-2xl font-heading font-bold">Users</h1>

        <Show when={table()}>
          {(t) => {
            log.debug({ rows: t().getRowModel().rows.length }, 'rendering user table')
            return (
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <For each={t().getHeaderGroups()}>
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
                    <For each={t().getRowModel().rows}>
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
            )
          }}
        </Show>

        <Show when={ctx.selectedOrgId()}>
          {(oid) => {
            log.debug({ orgId: oid(), memberCount: ctx.members().length }, 'rendering members section')
            return (
              <section>
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 class="text-lg font-heading font-semibold">Members</h2>
                    <p class="text-sm text-muted-foreground">
                      {ctx.members().length} {ctx.members().length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    <Show when={ctx.canManage()}>
                      <Button onClick={() => {
                        log.debug('open invite dialog')
                        setShowInvite(true)
                      }} size="sm">
                        Invite
                      </Button>
                    </Show>
                    <Show when={session().data?.user?.id && !ctx.isOwner() && !ctx.isAdmin()}>
                      <Button onClick={() => {
                        log.debug('leave org clicked')
                        handleLeave()
                      }} variant="outline" size="sm">
                        Leave
                      </Button>
                    </Show>
                  </div>
                </div>

                <Show when={ctx.canManage()}>
                  <div class="flex items-center gap-3 mb-4 p-3 rounded-lg border border-border bg-card">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        class="sr-only peer"
                        checked={ctx.domainAutoJoin()}
                        onChange={handleToggleAutoJoin}
                      />
                      <div class="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                    <div>
                      <p class="text-sm font-medium">Auto-invite by domain</p>
                      <p class="text-xs text-muted-foreground">
                        Automatically invite new users with the same email domain as your org.
                      </p>
                    </div>
                  </div>
                </Show>

                <Show
                  when={ctx.members().length > 0}
                  fallback={
                    <div class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      {ctx.membersLoading() ? 'Loading members...' : 'No members yet.'}
                    </div>
                  }
                >
                  <div class="overflow-x-auto rounded-2xl border border-border">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th class="px-4 py-3 font-medium">Name</th>
                          <th class="px-4 py-3 font-medium">Email</th>
                          <th class="px-4 py-3 font-medium">Role</th>
                          <th class="px-4 py-3 font-medium">Joined</th>
                          <th class="px-4 py-3 font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        <For each={ctx.members()}>
                          {(member) => (
                            <tr class="border-b border-border/60 hover:bg-muted/30 transition-colors">
                              <td class="px-4 py-3 font-medium">{member.userName}</td>
                              <td class="px-4 py-3 text-muted-foreground">{member.userEmail}</td>
                              <td class="px-4 py-3">
                                <Show
                                  when={member.userId === ctx.ownerId()}
                                  fallback={
                                    <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                                      {member.role}
                                    </span>
                                  }
                                >
                                  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent">
                                    Owner
                                  </span>
                                </Show>
                              </td>
                              <td class="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                                {formatDate(member.createdAt)}
                              </td>
                              <td class="px-4 py-3 text-right">
                                <Show
                                  when={
                                    ctx.canManage() &&
                                    member.userId !== ctx.ownerId() &&
                                    member.userId !== session().data?.user?.id
                                  }
                                >
                                  <Button
                                    onClick={() => {
                                      log.debug({ userId: member.userId, name: member.userName }, 'remove member clicked')
                                      handleRemove(member.userId)
                                    }}
                                    variant="destructive"
                                    size="xs"
                                    disabled={removing() === member.userId}
                                  >
                                    {removing() === member.userId ? '...' : 'Remove'}
                                  </Button>
                                </Show>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </section>
            )
          }}
        </Show>
      </main>

      <InviteDialog
        orgId={ctx.selectedOrgId()!}
        open={showInvite()}
        onClose={() => {
          log.debug('invite dialog closed, refetching members')
          setShowInvite(false)
          ctx.refetchMembers()
        }}
      />
    </div>
  )
}
