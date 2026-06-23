import Link from 'next/link'

export default function StoreNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight">Not found</h1>
        <p className="mt-3 text-muted-foreground">
          This store doesn&apos;t exist or has been unpublished.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium underline underline-offset-2"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
