'use client'

import { useRef, useState, useCallback } from 'react'

type Device = 'desktop' | 'tablet' | 'mobile'

interface PreviewFrameProps {
  device: Device
  previewUrl: string
  loading: boolean
  onLoad: () => void
}

const deviceWidths: Record<Device, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
}

export default function PreviewFrame({ device, previewUrl, loading, onLoad }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const handleLoad = useCallback(() => {
    setIframeLoaded(true)
    onLoad()
  }, [onLoad])

  const containerStyle: React.CSSProperties = {
    width: deviceWidths[device],
    height: '100%',
    transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: device === 'mobile' ? '40px' : 'var(--radius-lg)',
    boxShadow: device === 'desktop' ? 'none' : 'var(--shadow-md)',
    overflow: 'hidden',
    position: 'relative' as const,
  }

  return (
    <div className="flex flex-1 items-center justify-center overflow-hidden p-5" style={{ backgroundColor: '#E8E7E4' }}>
      <div style={containerStyle}>
        {loading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: device === 'mobile' ? '40px' : 'var(--radius-lg)',
            }}
          >
            <div className="flex w-full flex-col gap-3 px-8">
              <div className="h-10 w-full rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', animation: 'nudge-pulse 1.5s ease-in-out infinite' }} />
              <div className="h-40 w-full rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', animation: 'nudge-pulse 1.5s ease-in-out infinite 0.2s' }} />
              <div className="flex gap-3">
                <div className="h-24 flex-1 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', animation: 'nudge-pulse 1.5s ease-in-out infinite 0.4s' }} />
                <div className="h-24 flex-1 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', animation: 'nudge-pulse 1.5s ease-in-out infinite 0.6s' }} />
                <div className="h-24 flex-1 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', animation: 'nudge-pulse 1.5s ease-in-out infinite 0.8s' }} />
              </div>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Applying changes...</span>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          onLoad={handleLoad}
          className="h-full w-full border-0"
          style={{
            opacity: loading || !iframeLoaded ? 0 : 1,
            transition: 'opacity 300ms',
            borderRadius: device === 'mobile' ? '40px' : 'var(--radius-lg)',
          }}
          title="Store preview"
        />
      </div>
      <style>{`
        @keyframes nudge-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
