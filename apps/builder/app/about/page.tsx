import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex-1 mx-auto max-w-2xl px-4 py-24 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
          ← Back to home
        </Link>
        <h1 className="font-serif text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>About Karoji</h1>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Karoji is an AI-powered website building agency that researches competitors, designs storefronts, writes content, generates code, optimizes UX, and deploys websites automatically — in your language.
        </p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Built by Shubranshu.
        </p>
      </div>
      <footer className="py-8 text-center text-xs font-mono" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-default)' }}>
        © {new Date().getFullYear()} karoji.ai
      </footer>
    </div>
  )
}
