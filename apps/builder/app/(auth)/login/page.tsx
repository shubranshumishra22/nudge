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

        <div className="sutra-card rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-xs font-semibold border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-xl px-4 py-3 text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label className="mb-1.5 block text-xs font-bold text-[var(--ink)]">Email</label>
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
              <label className="mb-1.5 block text-xs font-bold text-[var(--ink)]">Password</label>
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
              className="w-full rounded-full py-3.5 text-sm font-semibold transition-all bg-[var(--indigo)] text-white shadow-sm hover:bg-[#212191] active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                  className="font-semibold underline underline-offset-2 text-[var(--indigo)] hover:text-[#212191] transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setMessage('') }}
                  className="font-semibold underline underline-offset-2 text-[var(--indigo)] hover:text-[#212191] transition-colors"
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
