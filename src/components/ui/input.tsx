import type { Component, JSX } from 'solid-js'
import { cn } from '../../lib/utils'

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export const Input: Component<InputProps> = (props) => {
  return (
    <input
      {...props}
      class={cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )}
    />
  )
}
