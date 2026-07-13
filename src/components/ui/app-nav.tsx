import type { Component, JSX } from 'solid-js'
import { authClient } from '../../lib/auth-client'
import { Button } from './button'

interface AppNavProps {
  children?: JSX.Element
}

export const AppNav: Component<AppNavProps> = (props) => {
  return (
    <nav class="flex items-center justify-between px-6 py-4 border-b border-border/60">
      <a href="/dashboard" class="flex items-center gap-2">
        <img src="/logo.svg" alt="Everlight" class="h-7 w-7" />
        <span class="text-lg font-semibold font-heading">Everlight</span>
      </a>
      <div class="flex items-center gap-4">
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
