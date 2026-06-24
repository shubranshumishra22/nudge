'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/ThemeProvider'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 30)
  })

  const compact = scrolled && !hovered

  return (
    <motion.header
      initial={{ x: "-50%", y: -80, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed top-5 left-1/2 z-50 w-full px-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          paddingLeft: compact ? '20px' : '28px',
          paddingRight: compact ? '20px' : '28px',
          paddingTop: compact ? '8px' : '10px',
          paddingBottom: compact ? '8px' : '10px',
          scale: compact ? 0.94 : 1,
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mx-auto rounded-full border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl hover:shadow-md transition-shadow duration-300 w-full max-w-6xl"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(12, 13, 22, 0.85)' : 'rgba(255, 255, 255, 0.92)',
          boxShadow: theme === 'dark' ? '0 10px 40px -15px rgba(0,0,0,0.8)' : '0 8px 30px -12px rgba(51, 51, 204, 0.06)',
          transformOrigin: 'center center',
        }}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://i.ibb.co/qLLzB0PX/Chat-GPT-Image-Jun-24-2026-10-52-58-PM.png"
            alt="Karoji"
            className="h-6 w-6 rounded-lg object-cover dark:hidden"
          />
          <img
            src="https://i.ibb.co/r2t1yhLF/Chat-GPT-Image-Jun-24-2026-10-53-04-PM.png"
            alt="Karoji"
            className="h-6 w-6 rounded-lg object-cover hidden dark:block"
          />
          <span className="text-xl font-bold font-sora tracking-tight text-zinc-900 dark:text-white leading-none">karoji.ai</span>
        </Link>

        {/* Center Nav Links */}
        <motion.nav
          animate={{
            opacity: compact ? 0.6 : 1,
          }}
          transition={{ duration: 0.35 }}
          className="hidden md:flex items-center gap-8"
        >
          <Link href="#products" className="text-[10px] font-bold tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors uppercase">
            Platform
          </Link>
          <Link href="#developers" className="text-[10px] font-bold tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors uppercase">
            Developers
          </Link>
          <Link href="#pricing" className="text-[10px] font-bold tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors uppercase">
            Pricing
          </Link>
          <Link href="#contact" className="text-[10px] font-bold tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors uppercase">
            Company
          </Link>
        </motion.nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          
          <Link
            href="/login"
            className="rounded-full px-5 py-2.5 text-xs font-semibold bg-[#1E2245] text-white hover:bg-[#151833] dark:bg-white dark:text-[#1E2245] dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Go to Dashboard
          </Link>
          <Link
            href="#contact"
            className="hidden sm:inline-block rounded-full px-5 py-2.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </motion.div>
    </motion.header>
  )
}


