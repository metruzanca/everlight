import { createSignal, Show, onMount, onCleanup, type JSX, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import { cn } from '../../lib/utils'

interface DropdownMenuProps {
  trigger: JSX.Element
  children: JSX.Element
  align?: 'start' | 'end'
}

export function DropdownMenu(props: DropdownMenuProps) {
  const [open, setOpen] = createSignal(false)
  let triggerRef: HTMLDivElement | undefined
  let menuRef: HTMLDivElement | undefined
  const [pos, setPos] = createSignal({ top: 0, left: 0 })

  const close = () => setOpen(false)

  const onClickOutside = (e: MouseEvent) => {
    const target = e.target as Node
    if (triggerRef && !triggerRef.contains(target) && menuRef && !menuRef.contains(target)) {
      close()
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }

  onMount(() => {
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
  })
  onCleanup(() => {
    document.removeEventListener('mousedown', onClickOutside)
    document.removeEventListener('keydown', onKeyDown)
  })

  const openMenu = () => {
    if (triggerRef) {
      const rect = triggerRef.getBoundingClientRect()
      setPos({
        top: rect.bottom + 4,
        left: props.align === 'end' ? rect.right - 144 : rect.left,
      })
    }
    setOpen(true)
  }

  return (
    <div>
      <div ref={triggerRef} onClick={openMenu}>
        {props.trigger}
      </div>

      <Show when={open()}>
        <Portal>
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${pos().top}px`,
              left: `${pos().left}px`,
            }}
            class="min-w-36 bg-card border border-border/60 rounded-lg shadow-lg py-1 z-50"
          >
            <div onClick={close}>
              {props.children}
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

interface DropdownMenuItemProps {
  children: JSX.Element
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  hidden?: boolean
}

export const DropdownMenuItem: Component<DropdownMenuItemProps> = (props) => {
  return (
    <Show when={!props.hidden}>
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class={cn(
          'w-full text-left px-3 py-1.5 text-sm transition-colors',
          props.destructive
            ? 'text-destructive hover:text-destructive/80 hover:bg-destructive/5 disabled:opacity-40'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
          props.disabled && 'opacity-40',
        )}
      >
        {props.children}
      </button>
    </Show>
  )
}
