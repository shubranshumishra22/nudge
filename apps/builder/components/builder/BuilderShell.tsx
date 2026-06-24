'use client'

import { useReducer, useState, useCallback, useRef } from 'react'

import ChatPane from './ChatPane'
import PreviewPane from './PreviewPane'
import StoreBuildingView from './StoreBuildingView'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  containsUpdate?: boolean
  updatedSection?: string
}

interface BuilderState {
  messages: Message[]
  isAiResponding: boolean
  previewDevice: 'desktop' | 'tablet' | 'mobile'
  previewLoading: boolean
  highlightedSection: string | null
  streamStatus: string | null
}

type Action =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_STREAMING_MESSAGE'; token: string }
  | { type: 'FINISH_STREAMING'; containsUpdate?: boolean; updatedSection?: string }
  | { type: 'SET_PREVIEW_DEVICE'; device: BuilderState['previewDevice'] }
  | { type: 'SET_PREVIEW_LOADING'; loading: boolean }
  | { type: 'SET_HIGHLIGHTED_SECTION'; section: string | null }
  | { type: 'START_AI_RESPONSE' }
  | { type: 'SET_STREAM_STATUS'; status: string | null }

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] }
    case 'UPDATE_STREAMING_MESSAGE': {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.isStreaming) {
        msgs[msgs.length - 1] = { ...last, content: last.content + action.token }
      }
      return { ...state, messages: msgs }
    }
    case 'FINISH_STREAMING': {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.isStreaming) {
        msgs[msgs.length - 1] = { ...last, isStreaming: false, containsUpdate: action.containsUpdate, updatedSection: action.updatedSection }
      }
      return { ...state, messages: msgs, isAiResponding: false, streamStatus: null }
    }
    case 'SET_PREVIEW_DEVICE':
      return { ...state, previewDevice: action.device }
    case 'SET_PREVIEW_LOADING':
      return { ...state, previewLoading: action.loading }
    case 'SET_HIGHLIGHTED_SECTION':
      return { ...state, highlightedSection: action.section }
    case 'START_AI_RESPONSE':
      return { ...state, isAiResponding: true }
    case 'SET_STREAM_STATUS':
      return { ...state, streamStatus: action.status }
    default:
      return state
  }
}

interface BuilderShellProps {
  storeId: string
  isBuildingInitial?: boolean
}

export default function BuilderShell({ storeId, isBuildingInitial = false }: BuilderShellProps) {
  const [isBuilding, setIsBuilding] = useState(isBuildingInitial)
  const [state, dispatch] = useReducer(reducer, {
    messages: [],
    isAiResponding: false,
    previewDevice: 'desktop',
    previewLoading: false,
    highlightedSection: null,
    streamStatus: null,
  })
  const [previewVisible, setPreviewVisible] = useState(true)
  const [previewTs, setPreviewTs] = useState(Date.now())
  const messagesRef = useRef(state.messages)
  messagesRef.current = state.messages

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    dispatch({ type: 'ADD_MESSAGE', message: userMsg })

    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    dispatch({ type: 'ADD_MESSAGE', message: assistantMsg })
    dispatch({ type: 'START_AI_RESPONSE' })

    const abortController = new AbortController()
    const cleanup = () => abortController.abort()
    window.addEventListener('beforeunload', cleanup)

    try {
      const currentMessages = messagesRef.current
      const history = currentMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/builder/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          message: content,
          history,
        }),
        signal: abortController.signal,
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.status) {
              dispatch({ type: 'SET_STREAM_STATUS', status: data.label || data.status })
            } else if (data.token) {
              dispatch({ type: 'UPDATE_STREAMING_MESSAGE', token: data.token })
              dispatch({ type: 'SET_STREAM_STATUS', status: null })
            }
            if (data.done) {
              dispatch({
                type: 'FINISH_STREAMING',
                containsUpdate: data.preview_reload,
                updatedSection: data.updated_section,
              })
              if (data.preview_reload) {
                setTimeout(() => {
                  dispatch({ type: 'SET_PREVIEW_LOADING', loading: true })
                  dispatch({ type: 'SET_HIGHLIGHTED_SECTION', section: data.updated_section || null })
                  setPreviewTs(Date.now())
                  setTimeout(() => {
                    dispatch({ type: 'SET_PREVIEW_LOADING', loading: false })
                    dispatch({ type: 'SET_HIGHLIGHTED_SECTION', section: null })
                  }, 3000)
                }, 800)
              }
            }
          } catch {}
        }
      }
    } catch (err) {
      if (abortController.signal.aborted) return
      console.error('Chat error:', err)
      dispatch({ type: 'FINISH_STREAMING' })
    } finally {
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [storeId])

  const reloadPreview = useCallback(() => {
    dispatch({ type: 'SET_PREVIEW_LOADING', loading: true })
    setPreviewTs(Date.now())
    setTimeout(() => {
      dispatch({ type: 'SET_PREVIEW_LOADING', loading: false })
    }, 1000)
  }, [])

  const previewUrl = `/api/builder/preview?store_id=${storeId}&t=${previewTs}`

  if (isBuilding) {
    return (
      <div className="flex h-screen items-center justify-center p-8 bg-[var(--bg-base)]">
        <StoreBuildingView storeId={storeId} onComplete={() => setIsBuilding(false)} />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex flex-1 overflow-hidden">
        <div style={{ display: 'flex', width: '100%' }}>
          <ChatPane
            messages={state.messages}
            isAiResponding={state.isAiResponding}
            streamStatus={state.streamStatus}
            onSend={sendMessage}
            device={previewVisible ? 'desktop' : 'mobile'}
            onTogglePreview={() => setPreviewVisible(true)}
          />
          {previewVisible && (
            <PreviewPane
              device={state.previewDevice}
              onDeviceChange={(d) => dispatch({ type: 'SET_PREVIEW_DEVICE', device: d })}
              previewUrl={previewUrl}
              loading={state.previewLoading}
              onRefresh={reloadPreview}
              storeUrl={`/api/builder/preview?store_id=${storeId}`}
              highlightedSection={state.highlightedSection}
            />
          )}
        </div>
      </div>
    </div>
  )
}
