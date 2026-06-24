import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  colorClass?: string // Tailwind text color class, e.g. text-blue-500
  trend?: string
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  colorClass = 'text-[var(--admin-accent)]',
  trend
}: StatsCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1.5px solid var(--sand-border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}
      className="flex flex-col gap-2 transition-all hover:border-[var(--saffron)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase">
          {label}
        </span>
        <Icon size={20} className={colorClass} />
      </div>
      <div className="font-mono text-3xl font-medium text-[var(--indigo)] mt-1">
        {value}
      </div>
      {trend && (
        <span className="text-xs text-[#6B6B67] mt-1 font-mono">
          {trend}
        </span>
      )}
    </div>
  )
}
