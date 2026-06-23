'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
      <div className="flex items-center gap-1.5 py-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--text-tertiary)',
              animation: 'nudge-dot-bounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes nudge-dot-bounce {
          0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
          40% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
