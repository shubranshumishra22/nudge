'use client'

import { useEffect } from 'react'

export function useSectionHighlight(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  highlightedSection: string | null,
) {
  useEffect(() => {
    if (!highlightedSection || !iframeRef.current?.contentWindow) return

    iframeRef.current.contentWindow.postMessage(
      { type: 'highlight', section: highlightedSection },
      '*',
    )

    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'highlight', section: '' },
          '*',
        )
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [highlightedSection, iframeRef])
}
