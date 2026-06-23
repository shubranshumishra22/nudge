'use client'

import { Monitor, Tablet, Smartphone, RotateCcw, ExternalLink } from 'lucide-react'
import { useState } from 'react'

type Device = 'desktop' | 'tablet' | 'mobile'

interface PreviewControlsProps {
  device: Device
  onDeviceChange: (device: Device) => void
  onRefresh: () => void
  storeUrl: string
}

const devices: { key: Device; icon: typeof Monitor }[] = [
  { key: 'desktop', icon: Monitor },
  { key: 'tablet', icon: Tablet },
  { key: 'mobile', icon: Smartphone },
]

export default function PreviewControls({ device, onDeviceChange, onRefresh, storeUrl }: PreviewControlsProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div
      className="flex h-12 items-center justify-between border-b px-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div
        className="flex items-center gap-0.5 rounded-md p-0.5"
        style={{ backgroundColor: 'var(--bg-subtle)' }}
      >
        {devices.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onDeviceChange(key)}
            className="rounded px-2 py-1.5 transition-all"
            style={{
              backgroundColor: device === key ? 'var(--bg-inverse)' : 'transparent',
              color: device === key ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="rounded p-1.5 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <RotateCcw size={16} />
        </button>
        <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-default)' }} />
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded p-1.5 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <ExternalLink size={16} />
        </a>
        <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-default)' }} />
        <button
          onClick={handleCopyUrl}
          className="max-w-[160px] truncate rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            color: copied ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          {copied ? 'Copied!' : storeUrl.replace(/^https?:\/\//, '')}
        </button>
      </div>
    </div>
  )
}
