import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'rounded-full bg-[var(--indigo)] text-white shadow-sm hover:brightness-105 active:scale-[0.97] transition-all font-semibold',
        destructive: 'rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'rounded-full border border-zinc-200 bg-transparent text-[var(--ink)] hover:bg-zinc-50 active:scale-[0.97] transition-all font-semibold',
        secondary: 'rounded-full border border-[var(--saffron)] bg-transparent text-[var(--saffron-deep)] hover:bg-[var(--saffron-tint)] active:scale-[0.97] transition-all font-semibold',
        ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)] transition-colors',
        link: 'text-[var(--indigo)] underline-offset-4 hover:underline font-semibold',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
