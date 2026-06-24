import { Check, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} className="text-muted-foreground/40" />
      <h3 className="mt-4 font-serif text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 rounded-full bg-gradient-to-br from-[var(--saffron)] to-[var(--saffron-deep)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all hover:brightness-105 active:scale-[0.97]"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
