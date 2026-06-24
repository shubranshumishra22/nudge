import type { Metadata } from 'next'
import { Inter, Sora, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-sora' })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-mono' })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'Nudge',
  description: 'Manage your store',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sora.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

