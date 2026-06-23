'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Sun, Moon, ArrowRight } from 'lucide-react'
import { useTheme } from '@/lib/ThemeProvider'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 40)
  })

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        animate={{
          width: scrolled ? 'auto' : 'min(720px, calc(100vw - 32px))',
          paddingLeft: scrolled ? '12px' : '24px',
          paddingRight: scrolled ? '12px' : '24px',
          scale: scrolled ? 0.92 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mx-auto rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/80 backdrop-blur-xl shadow-[var(--shadow-md)] h-12 origin-center"
      >
        <div className="flex items-center gap-2 shrink-0">
          <img
            src="https://i.postimg.cc/fyvVwyF5/Chat-GPT-Image-Jun-22-2026-08-08-03-PM.png"
            alt="Nudge"
            className="h-7 w-7 rounded-[8px] object-cover"
          />
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Nudge</span>
        </div>

        <motion.nav
          animate={{ opacity: scrolled ? 0 : 1, x: scrolled ? 8 : 0 }}
          transition={{ duration: 0.25 }}
          className="hidden md:flex items-center gap-6"
        >
          <Link href="#how-it-works" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            how-it-works
          </Link>
          <Link href="#pricing" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            pricing
          </Link>
          <Link href="/login" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            sign-in
          </Link>
        </motion.nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-8 w-8 rounded-full transition-all"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link
            href="/login"
            className="rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}
          >
            Create store
            <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>
    </motion.header>
  )
}
