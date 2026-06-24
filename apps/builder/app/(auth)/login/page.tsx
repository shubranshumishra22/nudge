'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@nudge/db'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboard`,
        },
      })
      if (error) {
        setError(error.message)
      } else if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists.')
      } else {
        setMessage('Check your email for a confirmation link.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/onboard')
      }
    }

    setLoading(false)
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden jali-bg"
    >
      {/* Floating Indian Tricolor Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="sutra-blob-saffron -top-[10%] -left-[10%] opacity-85" />
        <div className="sutra-blob-white top-[20%] left-[15%] opacity-95" />
        <div className="sutra-blob-green -bottom-[10%] -right-[10%] opacity-85" />
      </div>

      <div className="relative w-full max-w-[400px] z-10">
        <div className="mb-8 text-center flex flex-col items-center gap-3">
          <img src="https://i.ibb.co/qLLzB0PX/Chat-GPT-Image-Jun-24-2026-10-52-58-PM.png" alt="Karoji" className="h-10 w-10 rounded-xl object-cover shadow-sm dark:hidden" />
          <img src="https://i.ibb.co/r2t1yhLF/Chat-GPT-Image-Jun-24-2026-10-53-04-PM.png" alt="Karoji" className="h-10 w-10 rounded-xl object-cover shadow-sm hidden dark:block" />
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--ink)]">Karoji</h1>
          <p className="text-sm text-[var(--muted)]">Create your AI-powered storefront</p>
        </div>

        <div className="sutra-card rounded-[32px] p-8 shadow-lg" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-xs font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-primary)' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-xl px-4 py-3 text-xs font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--text-primary)' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 text-sm"
                required
              />
            </div>
            <div className="text-left">
              <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full px-4 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                  className="font-semibold underline underline-offset-2 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setMessage('') }}
                  className="font-semibold underline underline-offset-2 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
