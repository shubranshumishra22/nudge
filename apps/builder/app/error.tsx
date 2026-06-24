'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#EF4444' }}>
            <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
          </svg>
        </div>
        <h1 className="mt-6 font-serif text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-[10px] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
