'use client'

import { useRef, useState } from 'react'
import PreviewControls from './PreviewControls'
import PreviewFrame from './PreviewFrame'
import { useSectionHighlight } from './SectionHighlight'

type Device = 'desktop' | 'tablet' | 'mobile'

interface PreviewPaneProps {
  device: Device
  onDeviceChange: (device: Device) => void
  previewUrl: string
  loading: boolean
  onRefresh: () => void
  storeUrl: string
  highlightedSection: string | null
}

export default function PreviewPane({
  device,
  onDeviceChange,
  previewUrl,
  loading,
  onRefresh,
  storeUrl,
  highlightedSection,
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useSectionHighlight(iframeRef, highlightedSection)

  return (
    <div className="flex h-full flex-1 flex-col" style={{ backgroundColor: '#E8E7E4' }}>
      <PreviewControls
        device={device}
        onDeviceChange={onDeviceChange}
        onRefresh={onRefresh}
        storeUrl={storeUrl}
      />
      <PreviewFrame
        device={device}
        previewUrl={previewUrl}
        loading={loading}
        onLoad={() => {}}
      />
    </div>
  )
}
