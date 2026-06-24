'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  Zap, 
  Building2, 
  ArrowRight, 
  Play, 
  Plus
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import ContactForm from '@/components/ContactForm'

export default function LandingPage() {

  const phrases = [
    { q: "Want to build a website?" },
    { q: "वेबसाइट चाहिए?" },
    { q: "ওয়েবসাইট চান?" },
    { q: "வெப்சைட் வேண்டுமா?" },
    { q: "వెబ్‌సైట్ కావాలా?" },
    { q: "वेबसाईट हवी आहे?" },
    { q: "વેબસાઇટ જોઈએ છે?" },
    { q: "ವೆಬ್‌ಸೈಟ್ ಬೇಕೇ?" }
  ]

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 3800)
    return () => clearInterval(interval)
  }, [phrases.length])

  const plans = [
    { name: 'Free', price: '₹0', icon: Zap, features: ['1 active store', '5 products', 'Karoji subdomain', 'Basic payment options', 'Karoji footer branding', 'Community support'], cta: 'Get started', href: '/login' },
    { name: 'Pro', price: '₹499', icon: Zap, features: ['Up to 5 active stores', 'Unlimited products', 'Custom domain mapping', 'Zero Karoji branding', 'WhatsApp order notifications', '24/7 Priority support'], cta: 'Start free trial', href: '/login', accent: true, badge: 'Most Popular' },
    { name: 'Enterprise', price: '₹2,499', icon: Building2, features: ['Unlimited stores', 'Unlimited products', 'Custom domain mapping', 'White-labeled dashboard', 'Custom API & webhook access', 'Dedicated localization advisor'], cta: 'Contact sales', href: '/login' },
  ]

  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-[#0C0D16] text-[#141414] dark:text-white antialiased font-sans transition-colors duration-300">
      {/* Floating Indian Tricolor Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="sutra-blob-saffron -top-[10%] -left-[10%] opacity-85" />
        <div className="sutra-blob-white top-[20%] left-[15%] opacity-95" />
        <div className="sutra-blob-green -bottom-[10%] -right-[10%] opacity-85" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-4 pt-20 sm:pt-24 lg:pt-28 pb-10 overflow-hidden">

          <div className="relative mx-auto max-w-4xl w-full text-center z-10 flex flex-col items-center">
            {/* Title / Animating Multi-lingual Question Stack */}
            <div className="h-[140px] sm:h-[240px] lg:h-[300px] flex items-center justify-center overflow-hidden w-full relative mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhraseIndex}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 font-serif text-4xl sm:text-[4.2rem] lg:text-[5.2rem] font-normal tracking-tight text-[#141414] dark:text-white leading-[1.25] text-center w-full px-4"
                >
                  {phrases[currentPhraseIndex].q}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fixed Answer below the question */}
            <div className="font-sora text-2xl sm:text-4xl lg:text-[3rem] font-extrabold tracking-tight text-[#E6651B] dark:text-[#F38858] mt-6 mb-6 select-none leading-none">
              karoji.ai
            </div>

            <p className="mt-3 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              Describe your brand in your native language. Our custom layout and localization engines generate a high-performing digital storefront in 5 minutes. Powered by karoji.ai.
            </p>
            
            <div className="mt-7 flex items-center justify-center gap-4">
              <Link href="/login" className="rounded-full px-8 py-3.5 text-xs font-semibold bg-[#1E2245] text-white hover:bg-[#151833] dark:bg-white dark:text-[#1E2245] dark:hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-md shadow-indigo-900/5 hover:shadow-lg hover:shadow-indigo-900/10">
                Go to Dashboard
              </Link>
              <Link href="#contact" className="rounded-full px-8 py-3.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/10 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 backdrop-blur-sm transition-all active:scale-[0.98]">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Services Marquee */}
          <div className="relative w-full max-w-7xl mx-auto mt-10 z-10 px-4 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] block text-center mb-8" style={{ color: 'var(--text-tertiary)' }}>Build a store for any business</span>
            <div className="relative w-full overflow-hidden">
              <div className="flex gap-16 animate-marquee" style={{ width: 'max-content' }}>
                {[...Array(2)].map((_, dup) => (
                  <div key={dup} className="flex gap-16 items-center shrink-0">
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>☕ Coffee Shop</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>👗 Clothing</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>🍞 Bakery</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>💄 Beauty</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>🏋️ Fitness</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>🛍️ Handmade</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>🌿 Organic</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>📚 Books</span>
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>💎 Jewelry</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI AGENCY SECTION */}
        <section id="developers" className="px-4 py-28">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="font-serif text-3xl sm:text-[2.75rem] font-medium tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              An entire AI agency<br />working for your business.
            </h2>
            <p className="mt-4 text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Karoji researches, designs, develops, optimizes and deploys your website automatically — in your language.
            </p>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left: AI Workflow Card */}
              <div className="lg:col-span-7 rounded-3xl overflow-hidden text-left sutra-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
                {/* Card header */}
                <div className="px-7 pt-7 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">☕</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Premium Coffee Store</span>
                  </div>
                </div>

                {/* Workflow steps */}
                <div className="p-7 space-y-0">
                  {[
                    { label: 'Researching top coffee brands', done: true },
                    { label: 'Analyzing design patterns', done: true },
                    { label: 'Generating content', done: true },
                    { label: 'Building storefront', done: false, active: true },
                    { label: 'Optimizing mobile experience', done: false },
                    { label: 'Deploying website', done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5">
                      <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full" style={{
                        backgroundColor: step.done ? '#FF7A00' : step.active ? 'rgba(255,122,0,0.15)' : 'var(--border-default)',
                        border: step.active ? '1px solid #FF7A00' : 'none',
                      }}>
                        {step.done ? (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : step.active ? (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#FF7A00' }} />
                        ) : (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--border-default)' }} />
                        )}
                      </div>
                      <span className="text-sm" style={{
                        color: step.done ? 'var(--text-primary)' : step.active ? '#FF7A00' : 'var(--text-tertiary)',
                      }}>
                        {step.label}
                      </span>
                      {step.active && <span className="text-[10px] font-mono ml-auto" style={{ color: '#FF7A00' }}>now</span>}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-7 py-5 border-t text-center" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="text-xs font-mono tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    ─────────────────────────
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#FF7A00' }}>Website Ready</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>Live in 47s</span>
                  </div>
                  <div className="mt-1 text-xs font-mono tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    ─────────────────────────
                  </div>
                </div>
              </div>

              {/* Right: Feature Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                {[
                  { icon: '🔍', title: 'Research Agent', desc: 'Analyzes top-performing businesses in your industry before building.' },
                  { icon: '✦', title: 'Design Intelligence', desc: 'Learns from successful websites to create premium storefronts.' },
                  { icon: '⚡', title: 'Builder Agent', desc: 'Creates complete full-stack websites without templates.' },
                  { icon: '↻', title: 'Optimization Loop', desc: 'Evaluates and improves every website before deployment.' },
                ].map((card, i) => (
                  <div key={i} className="rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 group" style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                  }}>
                    <span className="text-xl block mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
                    <h4 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{card.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: '10+', sub: 'AI Agents' },
                { label: '<60s', sub: 'Average Build Time' },
                { label: '8', sub: 'Languages Supported' },
                { label: 'Auto', sub: 'Deploy Included' },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl py-6 px-4 text-center" style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}>
                  <div className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{stat.label}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KAROJI VALUE STORY */}
        <section className="px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl sm:text-[2.75rem] font-medium tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              India has always been a land of makers.
            </h2>
            <p className="mt-6 text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              From handcrafted textiles and spices to modern startups and local brands, our strength has never been in what we consume but in what we create. Karoji exists to help Indian businesses step onto the global stage and turn local ambition into worldwide opportunity.
            </p>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="font-serif text-4xl font-bold tracking-tight text-[var(--ink)]">Simple pricing</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Start free, upgrade as your business expands</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 items-stretch">
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`relative rounded-[32px] p-8 transition-all border flex flex-col justify-between ${
                    plan.accent 
                      ? 'border-2 border-[var(--indigo)] bg-white/90 dark:bg-[#0E0F19]/90 backdrop-blur-md shadow-lg scale-[1.03]' 
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-sm shadow-sm'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--indigo)] text-white shadow-sm">
                      {plan.badge}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <plan.icon size={20} className={plan.accent ? 'text-[var(--indigo)]' : 'text-[var(--muted)]'} />
                      <h3 className="text-xl font-bold text-[var(--ink)] font-sora">{plan.name}</h3>
                    </div>
                    <div className="mt-6 border-b pb-5 border-zinc-100 text-left">
                      <span className="font-mono text-4xl font-semibold text-[var(--ink)]">{plan.price}</span>
                      <span className="text-sm text-[var(--muted)] font-mono">/mo</span>
                    </div>
                    <ul className="mt-6 space-y-4 text-left">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                          <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link 
                    href={plan.href} 
                    className={`mt-8 flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-all ${
                      plan.accent 
                        ? 'bg-[var(--indigo)] text-white shadow-sm hover:bg-[#212191] active:scale-[0.97]' 
                        : 'border border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* CONTACT SECTION */}
        <section id="contact" className="px-4 py-24 jali-bg">
          <ContactForm />
        </section>
      </main>

      <footer className="relative">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Column 1 — Brand */}
            <div className="md:col-span-5 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2">
                <img src="https://i.ibb.co/qLLzB0PX/Chat-GPT-Image-Jun-24-2026-10-52-58-PM.png" alt="Karoji" className="h-7 w-7 rounded-[8px] object-cover dark:hidden" />
                <img src="https://i.ibb.co/r2t1yhLF/Chat-GPT-Image-Jun-24-2026-10-53-04-PM.png" alt="Karoji" className="h-7 w-7 rounded-[8px] object-cover hidden dark:block" />
                <span className="text-base font-bold font-sora tracking-tight" style={{ color: 'var(--text-primary)' }}>Karoji</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                AI-powered sovereign e-commerce for Indian small businesses. Designed, engineered, and operated locally.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>Built by</span>
                <a href="https://shubranshu.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold underline underline-offset-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>Shubranshu</a>
              </div>
            </div>

            {/* Column 2 — Company */}
            <div className="md:col-span-3 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><a href="/about" className="transition-colors hover:opacity-70">About Us</a></li>
                <li>
                  <a
                    href="mailto:shubranshu@example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:opacity-70"
                  >
                    Talk to the founder
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 — Legal */}
            <div className="md:col-span-2 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><a href="#" className="transition-colors hover:opacity-70">Privacy Policy</a></li>
                <li><a href="#" className="transition-colors hover:opacity-70">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-default)' }}>
            <span>© {new Date().getFullYear()} karoji.ai. All rights reserved.</span>
            <span className="mt-2 sm:mt-0 flex items-center gap-1">Made with taste in Bengaluru <span style={{ color: '#FF7A00' }}>✦</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
