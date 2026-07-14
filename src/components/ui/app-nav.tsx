import type { Component, JSX } from 'solid-js'
import { useLocation } from '@tanstack/solid-router'
import { authClient } from '../../lib/auth-client'
import { Button } from './button'
import { OrgSwitcher } from './org-switcher'

interface AppNavProps {
  children?: JSX.Element
}

function NavLink(props: { href: string; active: boolean; children: JSX.Element }) {
  return (
    <a
      href={props.href}
      class={`text-sm transition-colors ${props.active ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {props.children}
    </a>
  )
}

export const AppNav: Component<AppNavProps> = (props) => {
  const location = useLocation()

  return (
    <nav class="flex items-center justify-between px-6 py-4 border-b border-border/60">
      <a href="/dashboard" class="flex items-center gap-2">
        <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
        <span class="text-lg font-semibold font-heading">Everlight</span>
      </a>
      <div class="flex items-center gap-4">
        <NavLink href="/dashboard" active={location().pathname === '/dashboard'}>
          Dashboard
        </NavLink>
        <NavLink href="/users" active={location().pathname.startsWith('/users')}>
          Users
        </NavLink>
        <NavLink href="/settings" active={location().pathname.startsWith('/settings')}>
          Settings
        </NavLink>
        <OrgSwitcher />
        {props.children}
        <Button
          onClick={async () => { await authClient.signOut(); window.location.href = '/sign-in' }}
          variant="outline"
          size="sm"
        >
          Sign out
        </Button>
      </div>
    </nav>
  )
}
