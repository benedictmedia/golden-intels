import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Send, CheckCheck, MessageCircle, Wifi, WifiOff, Search } from 'lucide-react'
import API_URL from '../../api/config'

const WA_BG = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b5a995' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const AVATAR_COLORS = [
  '#1a3c6e', '#0f6e56', '#4a235a', '#b45309', '#0369a1',
  '#065f46', '#7c3aed', '#be123c', '#0e7490', '#166534'
]
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

export default function AdminMessages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState('')
  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const activeConvRef = useRef(null) // stable ref to avoid stale closures

  // Keep ref in sync
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    const token = localStorage.getItem('token')
    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    })
    socketRef.current.on('connect', () => setConnected(true))
    socketRef.current.on('disconnect', () => setConnected(false))
    socketRef.current.on('connect_error', () => setConnected(false))

    socketRef.current.on('receive_message', (msg) => {
      const current = activeConvRef.current

      // Update conversations sidebar
      setConversations(prev => {
        const exists = prev.find(c => c.conversationUserId === msg.conversationUserId)
        if (exists) {
          return prev
            .map(c => c.conversationUserId === msg.conversationUserId
              ? {
                  ...c,
                  content: msg.content,
                  createdAt: msg.createdAt,
                  senderRole: msg.senderRole,
                  unreadCount: current?.conversationUserId === msg.conversationUserId
                    ? 0
                    : (c.unreadCount || 0) + 1
                }
              : c
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        } else {
          // Brand-new conversation
          return [{ ...msg, parentName: msg.senderName, unreadCount: 1 }, ...prev]
        }
      })

      // If this conversation is currently open, append message
      if (current?.conversationUserId === msg.conversationUserId) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        // Mark as read
        const tok = localStorage.getItem('token')
        axios.put(`${API_URL}/api/messages/read/${msg.conversationUserId}`, {}, {
          headers: { Authorization: `Bearer ${tok}` }
        }).catch(() => {})
      }
    })

    return () => { socketRef.current?.disconnect() }
  }, [user?.id])

  // ── Load conversations ────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(res.data)
    } catch (err) { console.error(err) }
    finally { setLoadingConvs(false) }
  }, [])

  useEffect(() => { fetchConversations() }, [])

  // ── Open conversation ─────────────────────────────────────────────────────
  const openConversation = async (conv) => {
    setActiveConv(conv)
    setInput('')
    setLoadingMsgs(true)
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/messages/${conv.conversationUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
      await axios.put(`${API_URL}/api/messages/read/${conv.conversationUserId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(prev =>
        prev.map(c => c.conversationUserId === conv.conversationUserId ? { ...c, unreadCount: 0 } : c)
      )
    } catch (err) { console.error(err) }
    finally { setLoadingMsgs(false) }
  }

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeConv || sending) return
    setSending(true)
    const token = localStorage.getItem('token')
    const optimistic = {
      id: `temp_${Date.now()}`,
      content: input.trim(),
      senderRole: 'admin',
      senderName: user?.name,
      conversationUserId: activeConv.conversationUserId,
      createdAt: new Date().toISOString(),
      read: false
    }
    setMessages(prev => [...prev, optimistic])
    const sent = input.trim()
    setInput('')
    try {
      const res = await axios.post(`${API_URL}/api/messages`, {
        content: sent,
        conversationUserId: activeConv.conversationUserId
      }, { headers: { Authorization: `Bearer ${token}` } })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.data : m))
      fetchConversations()
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(sent)
      alert('Failed to send. Please try again.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }, [input, sending, activeConv, user?.name, fetchConversations])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const formatDay = (d) => {
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  const formatPreviewTime = (d) => {
    const date = new Date(d)
    const today = new Date()
    if (date.toDateString() === today.toDateString())
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const groupedMessages = messages.reduce((acc, msg) => {
    const day = formatDay(msg.createdAt)
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {})

  const filteredConvs = conversations.filter(c =>
    c.parentName?.toLowerCase().includes(search.toLowerCase()) ||
    c.parentEmail?.toLowerCase().includes(search.toLowerCase())
  )
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex rounded-2xl overflow-hidden shadow-xl border border-gray-200"
      style={{ height: 'calc(100dvh - 130px)', minHeight: '400px' }}>

      {/* ════════════════════════════════ LEFT PANEL ════════════════════════ */}
      <div className="w-80 flex flex-col bg-white border-r border-gray-200 flex-shrink-0">

        {/* Header */}
        <div className="bg-[#1a3c6e] text-white px-4 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d4a017] flex items-center justify-center font-bold text-[#1a3c6e] text-sm select-none">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Messages</p>
              {totalUnread > 0 && (
                <p className="text-[10px] text-blue-200">{totalUnread} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {connected
              ? <><Wifi size={12} className="text-green-400" /><span className="text-green-300">Live</span></>
              : <><WifiOff size={12} className="text-gray-400" /><span className="text-gray-400">Offline</span></>}
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-[#f0f2f5] flex-shrink-0">
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search parents…"
              className="flex-1 text-xs text-gray-600 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">Loading…</div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6 text-center">
              <MessageCircle size={36} className="mb-2 opacity-20" />
              <p className="text-xs">
                {conversations.length === 0
                  ? 'No messages yet. Parents will appear here when they contact you.'
                  : 'No results for your search.'}
              </p>
            </div>
          ) : (
            filteredConvs.map(conv => {
              const isActive = activeConv?.conversationUserId === conv.conversationUserId
              const color = avatarColor(conv.parentName)
              const preview = (conv.senderRole === 'admin' ? '✓ ' : '') + (conv.content || '…')
              return (
                <button
                  key={conv.conversationUserId}
                  onClick={() => openConversation(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left transition-colors ${
                    isActive ? 'bg-[#e8f0fe]' : 'hover:bg-[#f5f5f5]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 select-none"
                    style={{ backgroundColor: color }}>
                    {getInitials(conv.parentName)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-sm text-gray-800 truncate">{conv.parentName}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{formatPreviewTime(conv.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-xs text-gray-500 truncate">{preview}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#1a3c6e] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[18px] text-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ════════════════════════════════ RIGHT PANEL ═══════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConv ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]">
            <div className="w-20 h-20 rounded-full bg-[#1a3c6e]/10 flex items-center justify-center mb-4">
              <MessageCircle size={36} className="text-[#1a3c6e]/30" />
            </div>
            <p className="text-lg font-semibold text-gray-500">Golden-Intels Messages</p>
            <p className="text-sm text-gray-400 mt-1">Select a conversation to start chatting</p>
            {totalUnread > 0 && (
              <p className="text-xs text-[#1a3c6e] mt-2 font-semibold">{totalUnread} unread message{totalUnread > 1 ? 's' : ''}</p>
            )}
          </div>
        ) : (
          <>
            {/* ── Chat header ── */}
            <div className="bg-[#1a3c6e] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-md">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm select-none flex-shrink-0"
                style={{ backgroundColor: avatarColor(activeConv.parentName) }}>
                {getInitials(activeConv.parentName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight truncate">{activeConv.parentName}</p>
                <p className="text-xs text-blue-200 truncate">{activeConv.parentEmail || 'Parent'}</p>
              </div>
            </div>

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-3 py-3"
              style={{ backgroundColor: '#eae6df', backgroundImage: WA_BG }}>

              {loadingMsgs ? (
                <div className="flex justify-center mt-10">
                  <div className="bg-white/80 rounded-xl px-6 py-4 text-sm text-gray-400 shadow-sm">
                    Loading messages…
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center mt-10">
                  <div className="bg-white/90 rounded-2xl px-6 py-5 text-center shadow-sm max-w-xs">
                    <p className="text-sm font-semibold text-gray-600">Start the conversation</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You are chatting with <strong>{activeConv.parentName}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([day, dayMsgs]) => (
                  <div key={day}>
                    {/* Day divider */}
                    <div className="flex justify-center my-3">
                      <span className="bg-[#e1f3fb] text-[#1a3c6e] text-xs font-semibold px-3 py-1 rounded-full shadow-sm select-none">
                        {day}
                      </span>
                    </div>

                    {dayMsgs.map((msg) => {
                      const isMine = msg.senderRole === 'admin'
                      return (
                        <div key={msg.id} className={`flex mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`relative max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${
                            isMine
                                ? 'bg-[#dce8ff] text-gray-800 rounded-tr-none'
                                : 'bg-white text-gray-800 rounded-tl-none'
                            }`} style={{ wordBreak: 'break-word' }}>
                            {/* Show parent name on their messages */}
                            {!isMine && (
                              <p className="text-[11px] font-bold mb-0.5 leading-tight"
                                style={{ color: avatarColor(activeConv.parentName) }}>
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed" style={{ paddingRight: '54px' }}>
                              {msg.content}
                            </p>
                            <span className="absolute bottom-1.5 right-2.5 flex items-center gap-0.5">
                              <span className="text-[10px] text-gray-400 leading-none">{formatTime(msg.createdAt)}</span>
                              {isMine && (
                                <CheckCheck size={13}
                                    className={msg.read ? 'text-[#1a3c6e]' : 'text-gray-400'}
                                    strokeWidth={2.5}
                                />
                        )}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input bar ── */}
            <div className="bg-[#f0f0f0] px-3 py-2 flex items-end gap-2 flex-shrink-0">
              <div className="flex-1 bg-white rounded-3xl px-4 py-2.5 shadow-sm min-h-[42px] flex items-center">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                  }}
                  placeholder={`Message ${activeConv.parentName}…`}
                  rows={1}
                  className="w-full text-sm text-gray-700 resize-none focus:outline-none bg-transparent leading-relaxed"
                  style={{ maxHeight: '100px', overflowY: 'auto' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="w-11 h-11 rounded-full bg-[#1a3c6e] hover:bg-[#2a5298] active:scale-95 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 flex-shrink-0"
              >
                <Send size={17} strokeWidth={2.5} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
