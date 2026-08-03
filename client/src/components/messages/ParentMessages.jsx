import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Send, CheckCheck, Wifi, WifiOff } from 'lucide-react'
import API_URL from '../../api/config'

const WA_BG = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b5a995' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"

export default function ParentMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const conversationUserId = user?.id

  // ── Socket connection ─────────────────────────────────────────────────────
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
      if (msg.conversationUserId === user.id) {
        setMessages(prev => {
          // Deduplicate by id
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        // Mark admin's incoming message as read immediately
        const tok = localStorage.getItem('token')
        axios.put(`${API_URL}/api/messages/read/${user.id}`, {}, {
          headers: { Authorization: `Bearer ${tok}` }
        }).catch(() => {})
      }
    })

    return () => { socketRef.current?.disconnect() }
  }, [user?.id])

  // ── Load conversation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    const token = localStorage.getItem('token')
    setLoading(true)
    axios.get(`${API_URL}/api/messages/${conversationUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))

    // Mark admin messages as read
    axios.put(`${API_URL}/api/messages/read/${conversationUserId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {})
  }, [user?.id])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const token = localStorage.getItem('token')
    const optimistic = {
      id: `temp_${Date.now()}`,
      content: input.trim(),
      senderRole: 'parent',
      senderName: user?.name,
      conversationUserId,
      createdAt: new Date().toISOString(),
      read: false
    }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    try {
      const res = await axios.post(`${API_URL}/api/messages`, {
        content: optimistic.content,
        conversationUserId
      }, { headers: { Authorization: `Bearer ${token}` } })
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.data : m))
    } catch {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(optimistic.content)
      alert('Failed to send. Please try again.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }, [input, sending, conversationUserId, user?.name])

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

  const groupedMessages = messages.reduce((acc, msg) => {
    const day = formatDay(msg.createdAt)
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {})

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden shadow-lg border border-gray-200"
      style={{ height: 'calc(100vh - 130px)' }}>

      {/* ── Header ── */}
      <div className="bg-[#1d4ed8] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-[#128038] flex items-center justify-center font-bold text-[#1d4ed8] text-lg select-none">A</div>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1d4ed8] ${connected ? 'bg-green-400' : 'bg-gray-400'}`} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm leading-tight">School Admin</p>
          <p className="text-xs text-blue-200 flex items-center gap-1 mt-0.5">
            {connected
              ? <><Wifi size={10} className="text-green-400" /> Online</>
              : <><WifiOff size={10} className="text-gray-400" /> Connecting…</>}
          </p>
        </div>
        <div className="bg-[#128038]/20 text-[#128038] text-xs font-bold px-3 py-1 rounded-full">
          Golden-Intels
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3"
        style={{ backgroundColor: '#eae6df', backgroundImage: WA_BG }}>

        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="bg-white/80 rounded-xl px-6 py-4 text-sm text-gray-500 shadow-sm">Loading messages…</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center mt-10">
            <div className="bg-white/90 rounded-2xl px-6 py-5 text-center shadow-sm max-w-xs">
              <p className="text-2xl mb-2">👋</p>
              <p className="text-sm font-semibold text-gray-700">Welcome, {user?.name}!</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Send a message to the school admin. We usually reply within a few hours.
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([day, dayMsgs]) => (
            <div key={day}>
              {/* Day divider */}
              <div className="flex justify-center my-3">
                <span className="bg-[#e1f3fb] text-[#1d4ed8] text-xs font-semibold px-3 py-1 rounded-full shadow-sm select-none">
                  {day}
                </span>
              </div>

              {dayMsgs.map((msg) => {
                const isMine = msg.senderRole === 'parent'
                return (
                  <div key={msg.id} className={`flex mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                        isMine
                            ? 'bg-[#dce8ff] text-gray-800 rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none'
                        }`} style={{ wordBreak: 'break-word' }}>
                      {!isMine && (
                        <p className="text-[11px] font-bold text-[#1d4ed8] mb-0.5 leading-tight">
                          School Admin
                        </p>
                      )}
                      <p className="text-sm leading-relaxed" style={{ paddingRight: '52px' }}>
                        {msg.content}
                      </p>
                      {/* Timestamp + ticks absolutely positioned */}
                      <span className="absolute bottom-1.5 right-2.5 flex items-center gap-0.5">
                        <span className="text-[10px] text-gray-400 leading-none">{formatTime(msg.createdAt)}</span>
                        {isMine && (
                          <CheckCheck size={13}
                            className={msg.read ? 'text-[#1d4ed8]' : 'text-gray-400'}
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

      {/* ── Input Bar ── */}
      <div className="bg-[#f0f0f0] px-3 py-2 flex items-end gap-2 flex-shrink-0">
        <div className="flex-1 bg-white rounded-3xl px-4 py-2.5 shadow-sm min-h-[42px] flex items-center">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              // Auto-grow
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
            }}
            placeholder="Type a message"
            rows={1}
            className="w-full text-sm text-gray-700 resize-none focus:outline-none bg-transparent leading-relaxed"
            style={{ maxHeight: '100px', overflowY: 'auto' }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-full bg-[#1d4ed8] hover:bg-[#2563eb] active:scale-95 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 flex-shrink-0"
        >
          <Send size={17} strokeWidth={2.5} className={sending ? 'opacity-50' : ''} />
        </button>
      </div>
    </div>
  )
}
