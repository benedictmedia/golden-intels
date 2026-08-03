import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import {
  Video, VideoOff, Plus, Calendar, Clock, Users, BookOpen,
  Trash2, Play, Square, Edit3, X, ChevronRight, Wifi, AlertCircle,
  Monitor, CheckCircle, LayoutGrid
} from 'lucide-react'
import API_URL from '../../api/config'

const CLASSES = ['Creche (Babies)', 'Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Reception 1', 'Reception 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const SUBJECTS = ['English', 'Maths', 'Science', 'Computing', 'RME', 'History', 'Ewe', 'French', 'UC MAS', 'General']
const JITSI_DOMAIN = 'meet.jit.si'

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  live: { label: 'LIVE', color: 'bg-red-100 text-red-700', dot: 'bg-red-500 animate-pulse' },
  ended: { label: 'Ended', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' }
}

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const fmtDateTime = (d) => `${fmtDate(d)} at ${fmtTime(d)}`

function Countdown({ scheduledAt }) {
  const [diff, setDiff] = useState(null)
  useEffect(() => {
    const calc = () => {
      const ms = new Date(scheduledAt) - new Date()
      setDiff(ms > 0 ? ms : 0)
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [scheduledAt])
  if (diff === null || diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return (
    <span className="text-xs font-mono text-[#1d4ed8] bg-blue-50 px-2 py-0.5 rounded-full">
      {h > 0 ? `${h}h ` : ''}{m}m {s}s
    </span>
  )
}

export default function TeacherClassroom() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const jitsiContainerRef = useRef(null)
  const jitsiApiRef = useRef(null)
  const pollRef = useRef(null)

  const [form, setForm] = useState({
    title: '', description: '', gradeLevel: 'Grade 1', subject: 'General',
    date: '', time: '', duration: 60
  })

  // ── Load Jitsi script ─────────────────────────────────────────────────────
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) { setJitsiLoaded(true); return }
    const script = document.createElement('script')
    script.src = `https://${JITSI_DOMAIN}/external_api.js`
    script.async = true
    script.onload = () => setJitsiLoaded(true)
    script.onerror = () => console.error('Failed to load Jitsi')
    document.head.appendChild(script)
    return () => {}
  }, [])

  // ── Fetch sessions ────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/video-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchSessions()
    // Poll every 20s to stay in sync
    pollRef.current = setInterval(fetchSessions, 20000)
    return () => clearInterval(pollRef.current)
  }, [fetchSessions])

  // ── Launch Jitsi ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeSession || !jitsiLoaded || !jitsiContainerRef.current) return

    // Destroy previous instance
    if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }

    const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
      roomName: activeSession.roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: { displayName: `${user?.name} (Teacher)`, email: user?.email || '' },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableNoisyMicDetection: true,
        enableNoAudioDetection: true
      },
      interfaceConfigOverwrite: {
        APP_NAME: 'Golden Classroom',
        NATIVE_APP_NAME: 'Golden Classroom',
        DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'chat', 'raisehand',
          'tileview', 'participants-pane', 'fullscreen',
          'select-background', 'stats', 'hangup'
        ]
      }
    })

    api.addEventListener('videoConferenceLeft', () => {
      handleEndSession(activeSession.id, false)
      setActiveSession(null)
    })

    api.addEventListener('readyToClose', () => {
      handleEndSession(activeSession.id, false)
      setActiveSession(null)
    })

    jitsiApiRef.current = api

    return () => {
      if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }
    }
  }, [activeSession, jitsiLoaded])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetForm = () => setForm({
    title: '', description: '', gradeLevel: 'Grade 1', subject: 'General',
    date: '', time: '', duration: 60
  })

  const openCreate = () => { resetForm(); setEditingSession(null); setShowForm(true) }

  const openEdit = (s) => {
    const dt = new Date(s.scheduledAt)
    const pad = n => String(n).padStart(2, '0')
    setForm({
      title: s.title, description: s.description || '', gradeLevel: s.gradeLevel,
      subject: s.subject || 'General',
      date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
      time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
      duration: s.duration
    })
    setEditingSession(s)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time || !form.gradeLevel) {
      alert('Please fill in all required fields.'); return
    }
    setSaving(true)
    const token = localStorage.getItem('token')
    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString()
    try {
      if (editingSession) {
        const res = await axios.put(`${API_URL}/api/video-sessions/${editingSession.id}`, {
          title: form.title, description: form.description, gradeLevel: form.gradeLevel,
          subject: form.subject, scheduledAt, duration: parseInt(form.duration)
        }, { headers: { Authorization: `Bearer ${token}` } })
        setSessions(prev => prev.map(s => s.id === editingSession.id ? res.data : s))
      } else {
        const res = await axios.post(`${API_URL}/api/video-sessions`, {
          title: form.title, description: form.description, gradeLevel: form.gradeLevel,
          subject: form.subject, scheduledAt, duration: parseInt(form.duration)
        }, { headers: { Authorization: `Bearer ${token}` } })
        setSessions(prev => [res.data, ...prev])
      }
      setShowForm(false); resetForm(); setEditingSession(null)
    } catch (e) { alert(e.response?.data?.message || 'Failed to save session.') }
    finally { setSaving(false) }
  }

  const handleStartSession = async (session) => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(`${API_URL}/api/video-sessions/${session.id}`,
        { status: 'live' }, { headers: { Authorization: `Bearer ${token}` } })
      setSessions(prev => prev.map(s => s.id === session.id ? res.data : s))
      setActiveSession(res.data)
    } catch (e) { alert('Failed to start session.') }
  }

  const handleEndSession = async (id, updateState = true) => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(`${API_URL}/api/video-sessions/${id}`,
        { status: 'ended' }, { headers: { Authorization: `Bearer ${token}` } })
      if (updateState) {
        setSessions(prev => prev.map(s => s.id === id ? res.data : s))
        setActiveSession(null)
        if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }
      }
    } catch (e) { console.error(e) }
  }

  const handleLeaveWithoutEnding = () => {
    if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }
    setActiveSession(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session? Learners will no longer be able to join.')) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`${API_URL}/api/video-sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch (e) { alert('Failed to delete session.') }
  }

  const filteredSessions = sessions.filter(s => statusFilter === 'all' || s.status === statusFilter)
  const liveSessions = sessions.filter(s => s.status === 'live')
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled')

  // ── LIVE VIEW ─────────────────────────────────────────────────────────────
  if (activeSession) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
        {/* Live Header */}
        <div className="bg-[#1d4ed8] text-white px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-wide">LIVE</span>
            </div>
            <div>
              <p className="font-bold text-sm">{activeSession.title}</p>
              <p className="text-xs text-blue-200">{activeSession.gradeLevel} · {activeSession.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLeaveWithoutEnding}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => handleEndSession(activeSession.id)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Square size={12} fill="white" /> End Class
            </button>
          </div>
        </div>
        {/* Jitsi container */}
        <div ref={jitsiContainerRef} className="flex-1" style={{ minHeight: 0 }} />
      </div>
    )
  }

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#1d4ed8] flex items-center justify-center">
              <Video size={20} className="text-[#128038]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#1d4ed8]">Golden Classroom</h2>
              <p className="text-sm text-gray-500">Schedule and host live video classes for your learners</p>
            </div>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={16} /> Schedule Class
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: sessions.length, icon: <LayoutGrid size={18} />, color: 'text-[#1d4ed8]', bg: 'bg-blue-50' },
          { label: 'Live Now', value: liveSessions.length, icon: <Wifi size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Upcoming', value: upcomingSessions.length, icon: <Calendar size={18} />, color: 'text-[#128038]', bg: 'bg-green-50' },
          { label: 'Completed', value: sessions.filter(s => s.status === 'ended').length, icon: <CheckCircle size={18} />, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live Sessions Banner */}
      {liveSessions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          <p className="text-sm font-bold text-red-700">
            You have {liveSessions.length} active live class{liveSessions.length > 1 ? 'es' : ''} right now!
          </p>
          <button
            onClick={() => setActiveSession(liveSessions[0])}
            className="ml-auto bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg"
          >
            Rejoin →
          </button>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-100">
          {[['all', 'All Sessions'], ['scheduled', 'Upcoming'], ['live', 'Live'], ['ended', 'Ended']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                statusFilter === val ? 'bg-[#1d4ed8] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {label}
              <span className="ml-1.5 opacity-70">
                {val === 'all' ? sessions.length : sessions.filter(s => s.status === val).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading sessions…</div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Video size={40} className="mb-3 opacity-20" />
            <p className="text-sm font-semibold">No sessions found</p>
            <p className="text-xs mt-1">Click "Schedule Class" to create your first session</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredSessions.map(session => {
              const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.scheduled
              const canStart = session.status === 'scheduled'
              const isLive = session.status === 'live'
              return (
                <div key={session.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${isLive ? 'bg-red-50/40' : ''}`}>
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />

                  {/* Session info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#1d4ed8] text-sm">{session.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      {canStart && <Countdown scheduledAt={session.scheduledAt} />}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={11} /> {session.gradeLevel}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen size={11} /> {session.subject || 'General'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={11} /> {fmtDateTime(session.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={11} /> {session.duration} min
                      </span>
                    </div>
                    {session.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{session.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canStart && (
                      <>
                        <button
                          onClick={() => openEdit(session)}
                          className="text-gray-400 hover:text-[#1d4ed8] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleStartSession(session)}
                          className="bg-[#128038] hover:bg-[#15803d] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Play size={12} fill="white" /> Start Class
                        </button>
                      </>
                    )}
                    {isLive && (
                      <>
                        <button
                          onClick={() => setActiveSession(session)}
                          className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Monitor size={12} /> Rejoin
                        </button>
                        <button
                          onClick={() => handleEndSession(session.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Square size={12} fill="white" /> End
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-[#1d4ed8] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video size={20} className="text-[#128038]" />
                <h2 className="text-xl font-bold font-serif">
                  {editingSession ? 'Edit Session' : 'Schedule a Class'}
                </h2>
              </div>
              <button onClick={() => { setShowForm(false); setEditingSession(null); resetForm() }} className="hover:text-[#128038] transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-[#1d4ed8] mb-1.5">Session Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Fractions and Decimals"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-gray-700" />
              </div>
              {/* Class & Subject */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1d4ed8] mb-1.5">Class <span className="text-red-500">*</span></label>
                  <select value={form.gradeLevel}
                    onChange={e => setForm(f => ({ ...f, gradeLevel: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-gray-700">
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1d4ed8] mb-1.5">Subject</label>
                  <select value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-gray-700">
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1d4ed8] mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1d4ed8] mb-1.5">Time <span className="text-red-500">*</span></label>
                  <input type="time" value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-gray-700" />
                </div>
              </div>
              {/* Duration */}
              <div>
                <label className="block text-sm font-bold text-[#1d4ed8] mb-1.5">Duration (minutes)</label>
                <select value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-gray-700">
                  {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
                </select>
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-[#1d4ed8] mb-1.5">Description (optional)</label>
                <textarea value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="What will you cover in this class?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-gray-700 resize-none" />
              </div>

              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-[#1d4ed8] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#1d4ed8]">
                  A private room link will be generated automatically. Only learners in <strong>{form.gradeLevel}</strong> will be able to see and join this session.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingSession ? 'Save Changes' : 'Schedule Class'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingSession(null); resetForm() }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}