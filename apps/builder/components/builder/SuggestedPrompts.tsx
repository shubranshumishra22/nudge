'use client'

const prompts = [
  'Make it more minimal',
  'Change colors to dark mode',
  'Add a testimonials section',
  'Make the hero more bold',
  'Write better product descriptions',
  'Add a FAQ section',
]

export default function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-4">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="cursor-pointer rounded-full px-3.5 py-1.5 text-left text-xs transition-all duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)'
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
