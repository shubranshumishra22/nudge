'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again or contact the store owner.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-[10px] border border-input px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
