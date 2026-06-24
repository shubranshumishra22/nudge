import Link from 'next/link'
import { Check, Zap, Building2, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ContactForm from '@/components/ContactForm'

export default function LandingPage() {
  const plans = [
    { name: 'Free', price: '₹0', icon: Zap, features: ['1 store', '5 products', 'Free subdomain', 'Basic storefront', 'Nudge badge', 'Email support'], cta: 'Get started', href: '/login' },
    { name: 'Pro', price: '₹499', icon: Zap, features: ['Up to 5 stores', 'Unlimited products', 'Custom domain', 'No Nudge branding', 'Priority support', 'Advanced analytics'], cta: 'Start free trial', href: '/login', accent: true, badge: 'Most popular' },
    { name: 'Agency', price: '₹2,499', icon: Building2, features: ['Unlimited stores', 'Unlimited products', 'Custom domains', 'White-label', 'API access', 'Dedicated manager'], cta: 'Contact sales', href: '/login' },
  ]

  const steps = [
    { title: 'Describe your business', desc: 'Tell us what you sell and we\'ll generate a stunning storefront tailored to your brand.' },
    { title: 'Preview your store', desc: 'Review the AI-generated design, tweak colors and content, and add your products.' },
    { title: 'Go live instantly', desc: 'Publish with one click. Your store is live on your own subdomain, ready for customers.' },
  ]

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Navbar />

      <main className="flex-1">
        <section className="flex min-h-[85vh] items-center justify-center px-4 pt-16">
          <div className="max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-6xl" style={{ color: 'var(--text-primary)' }}>
              Your store, live in{' '}
              <span style={{ color: '#F97316' }}>5 minutes</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'var(--text-secondary)' }}>
              Nudge uses AI to create a beautiful, Indian-optimized e-commerce storefront. No coding, no hassle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login" className="rounded-[10px] px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>
                Create my store
              </Link>
              <Link href="#how-it-works" className="flex items-center gap-2 rounded-[10px] px-8 py-3.5 text-sm font-medium transition-colors hover:opacity-80" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                See a demo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y py-8" style={{ borderColor: 'var(--border-default)' }}>
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Join 1,200+ small businesses already on Nudge</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>How it works</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={i} className="rounded-xl p-8" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}>{i + 1}</div>
                  <h3 className="mt-5 font-serif text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Beautiful storefronts</h2>
            <div className="mt-8 flex gap-6 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 w-60 flex-shrink-0 overflow-hidden rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <img src={`https://picsum.photos/seed/store${i}/240/320`} alt={`Store template ${i}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Simple pricing</h2>
            <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Start free, upgrade when you grow</p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative rounded-xl p-6 transition-all`} style={{ backgroundColor: 'var(--bg-surface)', border: plan.accent ? '2px solid var(--bg-inverse)' : '1px solid var(--border-default)', boxShadow: plan.accent ? '0 4px 24px rgba(0,0,0,0.08)' : 'none' }}>
                  {plan.badge && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>{plan.badge}</span>}
                  <div className="flex items-center gap-2"><plan.icon size={20} style={{ color: plan.accent ? 'var(--text-primary)' : 'var(--text-tertiary)' }} /><h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3></div>
                  <div className="mt-4"><span className="font-serif text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span><span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/mo</span></div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><Check size={14} className="mt-0.5 shrink-0" style={{ color: '#16a34a' }} /><span>{f}</span></li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`mt-6 flex w-full items-center justify-center rounded-[10px] py-3 text-sm font-semibold transition-all`} style={plan.accent ? { backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' } : { border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 py-16 border-t" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-base)' }}>
          <ContactForm />
        </section>
      </main>

      <footer className="border-t" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)' }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2">
                <img src="https://i.postimg.cc/fyvVwyF5/Chat-GPT-Image-Jun-22-2026-08-08-03-PM.png" alt="Nudge" className="h-7 w-7 rounded-[8px] object-cover" />
                <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Nudge</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>Built by</span>
                <a href="https://shubranshu.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-semibold underline underline-offset-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>Shubranshu</a>
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>AI-powered e-commerce for Indian small businesses</p>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">About</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Blog</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Instagram</a>
            </div>
          </div>
          <p className="mt-8 text-center text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>Made in Bengaluru</p>
        </div>
      </footer>
    </div>
  )
}
