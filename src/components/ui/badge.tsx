import type { Component, JSX } from 'solid-js'
import { cn } from '../../lib/utils'

interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

export const Badge: Component<BadgeProps> = (props) => {
  const variants = {
    default:
      'bg-primary text-primary-foreground',
    secondary:
      'bg-secondary text-secondary-foreground',
    outline:
      'border border-border text-foreground',
  }

  return (
    <span
      {...props}
      class={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[props.variant ?? 'default'],
        props.class,
      )}
    />
  )
}
