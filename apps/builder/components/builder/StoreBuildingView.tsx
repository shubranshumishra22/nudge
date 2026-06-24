'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Code, Layout, Palette, FileText } from 'lucide-react'
import { createBrowserSupabaseClient } from '@nudge/db'

interface StoreBuildingViewProps {
  storeId: string
  onComplete: () => void
}

const STEPS = [
  { id: 'research', label: 'Analyzing business & industry trends', icon: FileText, duration: 8000 },
  { id: 'design', label: 'Crafting custom styles & typography', icon: Palette, duration: 8000 },
  { id: 'content', label: 'Writing engaging, copy-tuned content', icon: Layout, duration: 8000 },
  { id: 'compile', label: 'Assembling layout & building storefront', icon: Code, duration: 8000 },
]

export default function StoreBuildingView({ storeId, onComplete }: StoreBuildingViewProps) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  // 1. Simulated progress & step transitions (goes up to 95% while waiting)
  useEffect(() => {
    if (error) return

    const totalDuration = 32000 // 32 seconds
    const intervalTime = 100
    const increment = 95 / (totalDuration / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer)
          return 95
        }
        const nextVal = prev + increment
        
        // Calculate which step is active based on progress percentage
        const stepIndex = Math.min(Math.floor((nextVal / 95) * STEPS.length), STEPS.length - 1)
        setActiveStepIdx(stepIndex)

        // Mark previous steps as completed
        const completedIds = STEPS.slice(0, stepIndex).map(s => s.id)
        setCompletedSteps(completedIds)

        return nextVal
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [error])

  // 2. Poll Supabase to check if background process completed
  useEffect(() => {
    if (error) return

    const supabase = createBrowserSupabaseClient()
    let checkCount = 0

    const interval = setInterval(async () => {
      checkCount++
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('ai_config')
        .eq('id', storeId)
        .single() as any

      if (fetchError) {
        console.error('Error polling store:', fetchError)
        return
      }

      if (data?.ai_config) {
        clearInterval(interval)
        
        // Check if generation returned an error
        const config = data.ai_config as any
        if (config.error || config.success === false) {
          setError(config.error || 'Generation failed. Please try again.')
        } else {
          // Complete progress and trigger success callback
          setCompletedSteps(STEPS.map(s => s.id))
          setProgress(100)
          setTimeout(() => {
            onComplete()
          }, 1000)
        }
      }

      // Safeguard: if it takes more than 5 minutes (100 checks), fail gracefully
      if (checkCount > 100) {
        clearInterval(interval)
        setError('Generation timed out. The pipeline is taking longer than expected.')
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [storeId, onComplete, error])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const supabase = createBrowserSupabaseClient()
      
      // Delete failed store
      await supabase.from('stores').delete().eq('id', storeId)
      
      // Reset onboarding_completed status on user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase.from('profiles') as any).update({ onboarding_completed: false }).eq('id', user.id)
      }

      setRetrying(false)
      router.push('/onboard')
    } catch (err) {
      console.error('Failed to reset onboarding:', err)
      setRetrying(false)
      setError('Failed to restart onboarding. Please refresh the page.')
    }
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-2xl border p-8 shadow-2xl backdrop-blur-md" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-6 font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Store Generation Failed
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Something went wrong while compiling your custom storefront code. You can restart onboarding to try again.
          </p>
          <div className="mt-4 rounded-xl p-4 w-full text-left text-xs font-mono overflow-auto max-h-36" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            Error: {error}
          </div>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}
          >
            {retrying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Restart Onboarding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border p-8 shadow-2xl backdrop-blur-md transition-all duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <div className="flex flex-col items-center">
        {/* Animated AI sparkles header */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 animate-pulse">
          <Sparkles className="h-8 w-8 animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-0 rounded-2xl border border-indigo-500/30 animate-ping opacity-75" />
        </div>

        <h2 className="mt-6 font-serif text-2xl font-bold tracking-tight text-center" style={{ color: 'var(--text-primary)' }}>
          Building your AI storefront...
        </h2>
        <p className="mt-2 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Our specialist design agents are assembling your unique e-commerce experience.
        </p>

        {/* Premium glowing progress bar */}
        <div className="mt-8 w-full">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span style={{ color: 'var(--text-primary)' }}>{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step-by-step sequential list */}
        <div className="mt-8 w-full space-y-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(step.id)
            const isActive = idx === activeStepIdx && !isCompleted

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 ${
                  isActive
                    ? 'border-indigo-500/30 bg-indigo-500/[0.02] shadow-[0_0_15px_-3px_rgba(99,102,241,0.05)]'
                    : isCompleted
                      ? 'border-transparent opacity-80'
                      : 'border-transparent opacity-40'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : isActive ? (
                    <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate transition-colors duration-300 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''
                    }`}
                    style={{ color: isActive ? undefined : 'var(--text-primary)' }}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {isCompleted ? 'Completed' : isActive ? 'Processing...' : 'Queued'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
