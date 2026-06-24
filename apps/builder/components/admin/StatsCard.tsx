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
        backgroundColor: '#1A1A1A',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '20px'
      }}
      className="flex flex-col gap-2 transition-all hover:border-white/10"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-[#6B6B67] uppercase">
          {label}
        </span>
        <Icon size={20} className={colorClass} />
      </div>
      <div className="font-serif text-3xl font-bold text-white mt-1">
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
