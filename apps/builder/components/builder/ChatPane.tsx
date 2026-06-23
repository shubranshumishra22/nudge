'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import type { Message } from './BuilderShell'

interface ChatPaneProps {
  messages: Message[]
  isAiResponding: boolean
  streamStatus: string | null
  onSend: (content: string) => void
  device: 'desktop' | 'mobile'
  onTogglePreview: () => void
}

export default function ChatPane({ messages, isAiResponding, streamStatus, onSend, device, onTogglePreview }: ChatPaneProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  function handleSubmit() {
    const trimmed = input.trim()
    if (!trimmed || isAiResponding) return
    onSend(trimmed)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isFirstMessage = messages.length === 0

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: 'var(--bg-base)',
        width: device === 'mobile' ? '100%' : '40%',
        borderRight: device === 'desktop' ? '1px solid var(--border-default)' : 'none',
      }}
    >
      <div className="flex-1 overflow-y-auto" style={{ padding: isFirstMessage ? '0' : '20px 0' }}>
        {isFirstMessage ? (
          <div className="flex h-full flex-col items-center justify-center px-8">
            <h2
              className="text-center text-xl font-medium leading-snug"
              style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: 'var(--text-primary)' }}
            >
              Ask me to change anything
            </h2>
            <p
              className="mx-auto mt-2 max-w-[260px] text-center text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Change colors, update text, add sections, or just describe what you want.
            </p>
          </div>
        ) : (
          <>
            {messages.some(m => m.role === 'user') && (
              <div className="mb-4 px-4">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Today</span>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={msg.isStreaming}
                  containsUpdate={msg.containsUpdate}
                />
              ))}
              {isAiResponding && messages[messages.length - 1]?.role === 'user' && (
                streamStatus ? (
                  <div className="flex items-start gap-3 px-4 py-2">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)', animation: 'nudge-pulse-stats 1.5s ease-in-out infinite' }} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{streamStatus}</span>
                      <span className="inline-flex gap-0.5">
                        <span className="h-1 w-1 animate-bounce rounded-full" style={{ backgroundColor: 'var(--text-tertiary)', animationDelay: '0ms' }} />
                        <span className="h-1 w-1 animate-bounce rounded-full" style={{ backgroundColor: 'var(--text-tertiary)', animationDelay: '150ms' }} />
                        <span className="h-1 w-1 animate-bounce rounded-full" style={{ backgroundColor: 'var(--text-tertiary)', animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                ) : <TypingIndicator />
              )}
            </div>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-base)' }}>
        <div
          className="flex flex-col rounded-2xl border p-3 transition-all duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
          onFocusCapture={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return
            e.currentTarget.style.borderColor = 'var(--border-focus)'
          }}
          onBlurCapture={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a change or ask anything..."
            rows={1}
            className="w-full resize-none bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}
          />
          <div className="mt-2 flex items-center justify-between">
            {input.length > 200 && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{input.length}</span>
            )}
            <div className="flex flex-1 justify-end">
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isAiResponding}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: input.trim() && !isAiResponding ? 'var(--bg-inverse)' : 'var(--bg-subtle)',
                  color: input.trim() && !isAiResponding ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                }}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>

        {device === 'mobile' && (
          <button
            onClick={onTogglePreview}
            className="mt-3 w-full rounded-full py-2.5 text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Preview
          </button>
        )}
      </div>
      <style>{`
        @keyframes nudge-pulse-stats {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}
