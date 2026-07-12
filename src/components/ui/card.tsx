import type { Component, JSX } from 'solid-js'
import { cn } from '../../lib/utils'

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Card: Component<CardProps> = (props) => {
  return (
    <div
      {...props}
      class={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        props.class,
      )}
    />
  )
}

export const CardHeader: Component<CardProps> = (props) => {
  return (
    <div
      {...props}
      class={cn('flex flex-col space-y-1.5 p-6', props.class)}
    />
  )
}

export const CardTitle: Component<CardProps> = (props) => {
  return (
    <h3
      {...props}
      class={cn('text-lg font-semibold leading-none tracking-tight', props.class)}
    />
  )
}

export const CardDescription: Component<CardProps> = (props) => {
  return (
    <p
      {...props}
      class={cn('text-sm text-muted-foreground', props.class)}
    />
  )
}

export const CardContent: Component<CardProps> = (props) => {
  return <div {...props} class={cn('p-6 pt-0', props.class)} />
}

export const CardFooter: Component<CardProps> = (props) => {
  return (
    <div
      {...props}
      class={cn('flex items-center p-6 pt-0', props.class)}
    />
  )
}
