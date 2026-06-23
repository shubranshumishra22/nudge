'use client'

import Link from 'next/link'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface BuilderHeaderProps {
  storeName: string
  storeSlug: string
  storeStatus: 'draft' | 'live'
  isAiResponding: boolean
  previewVisible: boolean
  onTogglePreview: () => void
  onPublish: () => Promise<void>
}

export default function BuilderHeader({
  storeName,
  storeSlug,
  storeStatus,
  isAiResponding,
  previewVisible,
  onTogglePreview,
  onPublish,
}: BuilderHeaderProps) {
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  async function handlePublish() {
    setPublishing(true)
    try {
      await onPublish()
      setPublished(true)
      setTimeout(() => setPublished(false), 3000)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex h-[52px] items-center border-b px-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>AI Builder</span>
        {isAiResponding && (
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePreview}
          className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            backgroundColor: previewVisible ? 'var(--bg-subtle)' : 'transparent',
            color: 'var(--text-secondary)',
          }}
        >
          Preview
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing || storeStatus === 'live'}
          className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {publishing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : published ? (
            <Check size={14} />
          ) : null}
          {published ? 'Live ✓' : storeStatus === 'live' ? 'Live' : 'Publish'}
        </button>
      </div>
    </header>
  )
}
