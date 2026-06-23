'use client'

function renderMarkdown(text: string): string {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-subtle);padding:1px 6px;border-radius:4px;font-size:13px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br/>')

  const lines = html.split('<br/>')
  const result: string[] = []
  let inList = false
  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (!inList) { result.push('<ul style="margin:6px 0;padding-left:20px">'); inList = true }
      result.push(`<li style="margin:2px 0">${line.slice(2)}</li>`)
    } else {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(line)
    }
  }
  if (inList) result.push('</ul>')
  return result.join('')
}

export default function MessageBubble({
  role,
  content,
  isStreaming,
  containsUpdate,
}: {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  containsUpdate?: boolean
}) {
  if (role === 'user') {
    return (
      <div className="flex justify-end px-4">
        <div
          className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-inverse)',
            color: 'var(--text-inverse)',
            borderRadius: '16px 16px 4px 16px',
          }}
        >
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 px-4">
      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
      <div className="min-w-0 flex-1">
        <div
          className="text-[15px] leading-relaxed"
          style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) + (isStreaming ? '<span class="nudge-typing-dots"><span></span><span></span><span></span></span>' : '') }}
        />
        {!isStreaming && containsUpdate && (
          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span>Changes applied</span>
            <button
              className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-subtle)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Copy
            </button>
          </div>
        )}
      </div>
      <style>{`
        .nudge-typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin-left: 6px;
          vertical-align: middle;
        }
        .nudge-typing-dots span {
          width: 5px;
          height: 5px;
          background-color: var(--text-primary);
          border-radius: 50%;
          opacity: 0.4;
          animation: nudge-bounce 1.4s infinite both;
        }
        .nudge-typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .nudge-typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes nudge-bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
