import type { Component, JSX } from 'solid-js'
import { cn } from '../../lib/utils'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: Component<ButtonProps> = (props) => {
  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline:
      'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
    ghost:
      'hover:bg-accent hover:text-accent-foreground',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  }

  return (
    <button
      {...props}
      class={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variants[props.variant ?? 'primary'],
        sizes[props.size ?? 'md'],
        props.class,
      )}
    />
  )
}
