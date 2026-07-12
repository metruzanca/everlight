import type { Component, JSX } from 'solid-js'
import { cn } from '../../lib/utils'

interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: Component<LabelProps> = (props) => {
  return (
    <label
      {...props}
      class={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class,
      )}
    />
  )
}
