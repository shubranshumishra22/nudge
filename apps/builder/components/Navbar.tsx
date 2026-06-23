'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Sun, Moon, ArrowRight } from 'lucide-react'
import { useTheme } from '@/lib/ThemeProvider'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 40)
  })

  const compact = scrolled && !hovered

  return (
    <motion.header
      initial={{ x: "-50%", y: -80, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="fixed top-5 left-1/2 z-50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          paddingLeft: compact ? '16px' : '24px',
          paddingRight: compact ? '16px' : '24px',
          paddingTop: compact ? '6px' : '8px',
          paddingBottom: compact ? '6px' : '8px',
          scale: compact ? 0.92 : 1,
          gap: compact ? '16px' : '32px',
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mx-auto rounded-full border backdrop-blur-xl"
        style={{
          width: 'max-content',
          maxWidth: 'min(720px, calc(100vw - 32px))',
          borderColor: 'var(--border-default)',
          backgroundColor: 'var(--bg-surface-glass)',
          boxShadow: 'var(--shadow-md)',
          transformOrigin: 'center center',
        }}
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
          animate={{
            opacity: compact ? 0.5 : 1,
            scale: compact ? 0.92 : 1,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex items-center gap-6"
        >
          <Link href="#how-it-works" className="text-xs font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>how-it-works</Link>
          <Link href="#pricing" className="text-xs font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>pricing</Link>
          <Link href="/login" className="text-xs font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>sign-in</Link>
        </motion.nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-8 w-8 rounded-full transition-all hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link
            href="/login"
            className="rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-85"
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
