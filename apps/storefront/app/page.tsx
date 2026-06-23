import Link from 'next/link'

export default function StorefrontLanding() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: '#FAFAF8' }}>
      <h1 className="font-serif text-4xl font-bold tracking-tight">Nudge Commerce</h1>
      <p className="mt-4 text-muted-foreground">AI-powered e-commerce for Indian small businesses</p>
      <p className="mt-8 text-sm text-muted-foreground/60">
        Visit a store at <code className="rounded bg-muted px-2 py-0.5 text-xs">{'{slug}'}.nudge.store</code> or use the direct link
      </p>
    </div>
  )
}
