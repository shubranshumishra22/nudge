'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, Building2 } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '/mo',
    description: 'For getting started',
    accent: false,
    features: [
      '1 store',
      '5 products',
      'Free subdomain',
      'Basic storefront',
      'Powered by Nudge badge',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹499',
    period: '/mo',
    description: 'For growing businesses',
    accent: true,
    badge: 'Most popular',
    features: [
      'Up to 5 stores',
      'Unlimited products',
      'Custom domain',
      'Remove Nudge branding',
      'Priority support',
      'Advanced analytics',
      'Bulk order management',
      'Early access to features',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '₹2,499',
    period: '/mo',
    description: 'For teams & agencies',
    accent: false,
    badge: 'Best value',
    features: [
      'Unlimited stores',
      'Unlimited products',
      'Custom domains',
      'White-label storefront',
      'API access',
      'Dedicated account manager',
      'Team collaboration',
      'Custom integrations',
      '99.9% uptime SLA',
    ],
  },
]

export default function UpgradeClient({ profile }: { profile: any }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentPlan = profile?.plan || 'free'

  const handleUpgrade = async () => {
    if (!selected || selected === currentPlan) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create subscription')

      if (data.short_url) {
        window.open(data.short_url, '_blank')
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Pricing</h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Choose the plan that fits your business</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id && plan.id !== 'free'
          const isSelected = selected === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => {
                if (!isCurrent) setSelected(plan.id)
              }}
              className={`relative rounded-xl p-6 transition-all cursor-pointer ${
                plan.accent && isSelected
                  ? 'border-2 shadow-lg'
                  : plan.accent
                  ? 'border-2 shadow-md'
                  : isSelected
                  ? 'border-2'
                  : 'border hover:border-[var(--text-primary)]/40'
              }`}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: plan.accent || isSelected ? 'var(--bg-inverse)' : 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>
                  {plan.badge}
                </span>
              )}

              <div className="flex items-center gap-2">
                {plan.id === 'free' ? <Zap size={20} style={{ color: 'var(--text-secondary)' }} /> :
                 plan.id === 'pro' ? <Zap size={20} style={{ color: 'var(--text-primary)' }} /> :
                 <Building2 size={20} style={{ color: 'var(--text-primary)' }} />}
                <h2 className="text-lg font-semibold">{plan.name}</h2>
              </div>

              <div className="mt-4">
                <span className="font-serif text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{plan.period}</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isCurrent) {
                    setSelected(plan.id)
                  }
                }}
                disabled={isCurrent || loading}
                className="mt-6 w-full rounded-[10px] py-3 text-sm font-semibold transition-all"
                style={
                  isCurrent
                    ? { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', cursor: 'default' }
                    : plan.accent
                    ? { backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }
                    : { border: '1px solid var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'transparent' }
                }
                onMouseEnter={(e) => {
                  if (!isCurrent && !plan.accent) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'
                  if (!isCurrent && plan.accent) e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent && !plan.accent) e.currentTarget.style.backgroundColor = 'transparent'
                  if (!isCurrent && plan.accent) e.currentTarget.style.opacity = '1'
                }}
              >
                {isCurrent ? 'Current plan' : loading && selected === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
