'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Mail, 
  Inbox, 
  Calendar, 
  User, 
  Laptop, 
  Save, 
  Check, 
  Reply,
  FolderOpen
} from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  business_type: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  admin_notes: string | null
  ip_address: string | null
  created_at: string
  updated_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  // Admin notes autosave states
  const [notesText, setNotesText] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const notesRef = useRef<string>('')

  async function fetchMessages() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'All') {
        params.set('status', statusFilter)
      }
      const res = await fetch(`/api/admin/messages?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      setMessages(data || [])
      
      // Keep selected message updated if it still exists
      if (selectedMessage) {
        const updated = (data as ContactMessage[]).find(m => m.id === selectedMessage.id)
        if (updated) {
          setSelectedMessage(updated)
          setNotesText(updated.admin_notes || '')
          notesRef.current = updated.admin_notes || ''
        } else {
          setSelectedMessage(null)
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [statusFilter])

  // Select message and mark as read automatically if it's unread
  async function selectMessage(msg: ContactMessage) {
    setSelectedMessage(msg)
    setNotesText(msg.admin_notes || '')
    notesRef.current = msg.admin_notes || ''
    setSaveStatus('idle')

    if (msg.status === 'unread') {
      try {
        const res = await fetch(`/api/admin/messages/${msg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'read' })
        })
        if (res.ok) {
          // Update status in local list
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))
          setSelectedMessage(prev => prev && prev.id === msg.id ? { ...prev, status: 'read' } : prev)
        }
      } catch (err) {
        console.error('Error auto-marking message as read:', err)
      }
    }
  }

  async function updateMessageStatus(id: string, newStatus: 'unread' | 'read' | 'replied' | 'archived') {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (err) {
      console.error('Error updating message status:', err)
      alert('Failed to update status')
    }
  }

  async function saveNotes() {
    if (!selectedMessage) return
    if (notesText === notesRef.current) return // No change

    try {
      setSaveStatus('saving')
      const res = await fetch(`/api/admin/messages/${selectedMessage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notesText })
      })

      if (!res.ok) throw new Error('Failed to save notes')
      
      notesRef.current = notesText
      setSaveStatus('saved')
      
      // Update in main list
      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, admin_notes: notesText } : m))
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (err) {
      console.error('Error saving notes:', err)
      setSaveStatus('idle')
      alert('Failed to autosave notes')
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Are you sure you want to permanently delete this message? This action is irreversible.')) return

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete message')
      
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null)
      }
    } catch (err) {
      console.error('Error deleting message:', err)
      alert('Failed to delete message')
    }
  }

  // Filter messages list in memory by search query
  const filteredMessages = messages.filter(m => {
    const term = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.message.toLowerCase().includes(term) ||
      (m.business_type || '').toLowerCase().includes(term)
    )
  })

  // Format mailto link
  const mailtoSubject = encodeURIComponent('Regarding your Nudge Commerce inquiry')
  const mailtoBody = encodeURIComponent(
    `Hi ${selectedMessage?.name || ''},\n\n` +
    `Thanks for reaching out to Nudge. We saw your query about a ${selectedMessage?.business_type || 'business'} store storefront...\n\n` +
    `Best regards,\nNudge Team`
  )
  const mailtoUrl = selectedMessage 
    ? `mailto:${selectedMessage.email}?subject=${mailtoSubject}&body=${mailtoBody}`
    : '#'

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-[var(--admin-accent)]" size={24} />
            Inbound Messages Inbox
          </h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Communication channel for potential leads, pricing inquiries, and developer contacts.
          </p>
        </div>
      </div>

      {/* Main Double-Pane Layout container */}
      <div className="flex-1 flex gap-6 min-h-0 bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
        {/* LEFT PANE: List View */}
        <div className="w-80 md:w-96 flex flex-col border-r border-white/5 shrink-0 bg-[#1A1A1A]">
          {/* List Search & Filter */}
          <div className="p-4 border-b border-white/5 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B67]" />
              <input
                type="text"
                placeholder="Search inbox..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs bg-[#242424] border border-white/5 rounded-lg text-white placeholder-[#6B6B67] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-lg px-3 py-1.5 w-full">
              <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer flex-1"
              >
                <option value="All" className="bg-[#1A1A1A]">All Messages</option>
                <option value="unread" className="bg-[#1A1A1A]">Unread</option>
                <option value="read" className="bg-[#1A1A1A]">Read</option>
                <option value="replied" className="bg-[#1A1A1A]">Replied</option>
                <option value="archived" className="bg-[#1A1A1A]">Archived</option>
              </select>
            </div>
          </div>

          {/* Messages Scrollable List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 flex flex-col gap-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded bg-white/5" />
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <Inbox size={28} className="text-[#6B6B67]" />
                <span className="text-xs text-[#6B6B67]">No messages found</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredMessages.map((msg) => {
                  let indicatorColor = 'bg-zinc-500'
                  if (msg.status === 'unread') indicatorColor = 'bg-red-500 animate-pulse'
                  if (msg.status === 'read') indicatorColor = 'bg-blue-400'
                  if (msg.status === 'replied') indicatorColor = 'bg-emerald-400'
                  if (msg.status === 'archived') indicatorColor = 'bg-zinc-600'

                  const isSelected = selectedMessage?.id === msg.id

                  return (
                    <button
                      key={msg.id}
                      onClick={() => selectMessage(msg)}
                      className="w-full text-left p-4 border-b border-white/[0.03] transition-all hover:bg-white/[0.02] flex gap-3.5 relative"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--admin-accent)' : '3px solid transparent'
                      }}
                    >
                      {/* Status indicator dot */}
                      <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${indicatorColor}`} />
                      
                      <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-white truncate">{msg.name}</span>
                          <span className="text-[9px] font-mono text-[#6B6B67]">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#A1A1AA] truncate">{msg.email}</span>
                        <p className="text-[11px] text-[#6B6B67] line-clamp-2 mt-0.5 leading-normal">
                          {msg.message}
                        </p>
                        {msg.business_type && (
                          <span className="inline-block self-start text-[9px] font-bold uppercase tracking-wider text-indigo-400 mt-1 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                            {msg.business_type}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Message Detail View */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F0E]/40">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header Info */}
              <div className="p-6 border-b border-white/5 bg-[#1A1A1A]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-serif font-semibold text-white truncate">{selectedMessage.name}</h3>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                      {selectedMessage.business_type || 'General'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#A1A1AA] truncate">{selectedMessage.email}</span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-[#6B6B67] font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </span>
                    {selectedMessage.ip_address && (
                      <span className="flex items-center gap-1">
                        <Laptop size={12} />
                        IP: {selectedMessage.ip_address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#242424] border border-white/5 rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-[9px] font-bold text-[#6B6B67] uppercase tracking-wider">State:</span>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value as any)}
                      className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-semibold"
                    >
                      <option value="unread" className="bg-[#1A1A1A]">Unread</option>
                      <option value="read" className="bg-[#1A1A1A]">Read</option>
                      <option value="replied" className="bg-[#1A1A1A]">Replied</option>
                      <option value="archived" className="bg-[#1A1A1A]">Archived</option>
                    </select>
                  </div>

                  {/* Reply Action */}
                  <a
                    href={mailtoUrl}
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold transition-all"
                  >
                    <Reply size={13} />
                    Reply
                  </a>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/25"
                    title="Hard delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Scrollable message content + Notes section */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {/* Message Body */}
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold tracking-wider text-[#6B6B67] uppercase">Inquiry Description</h4>
                  <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Private Admin Notes */}
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold tracking-wider text-[#6B6B67] uppercase flex items-center gap-1">
                      <FolderOpen size={13} className="text-amber-400" />
                      Private Admin Notes (Autosaving)
                    </h4>
                    
                    {/* Status check indicators */}
                    {saveStatus === 'saving' && (
                      <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Saving...
                      </span>
                    )}
                    {saveStatus === 'saved' && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono">
                        <Check size={11} />
                        Saved
                      </span>
                    )}
                  </div>
                  
                  <textarea
                    rows={4}
                    placeholder="Enter private administrator notes about this message/lead... Updates are saved automatically on focus out (blur)."
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    onBlur={saveNotes}
                    className="w-full p-3 text-xs bg-[#242424] border border-white/5 rounded-lg text-white placeholder-[#6B6B67] focus:outline-none focus:border-white/20 leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2">
              <Mail size={36} className="text-[#6B6B67]" />
              <span className="text-sm font-semibold text-[#FAFAF8]">Select an Inquiry</span>
              <p className="text-xs text-[#6B6B67] max-w-xs">
                Choose a message from the sidebar to view full details, record admin notes, and write replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
