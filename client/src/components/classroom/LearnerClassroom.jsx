import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import {
  Video, Calendar, Clock, BookOpen, Users,
  Play, Wifi, WifiOff, AlertCircle, CheckCircle,
  MonitorPlay, LayoutGrid, ChevronRight, X
} from 'lucide-react'
import API_URL from '../../api/config'

if (!gradeLevel) {
  return (
    <div className="p-8 text-center">
      <p className="text-gray-500">Please wait while we load your class information...</p>
    </div>
  );
}

const JITSI_DOMAIN = 'meet.jit.si'

const STATUS_CONFIG = {
  scheduled: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  live: { label: 'LIVE NOW', color: 'bg-red-100 text-red-700', dot: 'bg-red-500 animate-pulse' },
  ended: { label: 'Ended', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' }
}

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
})
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const fmtDateTime = (d) => `${fmtDate(d)} at ${fmtTime(d)}`

// Countdown to scheduled session start
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
    <span className="text-xs font-mono text-[#4a235a] bg-purple-50 px-2 py-0.5 rounded-full">
      Starts in {h > 0 ? `${h}h ` : ''}{m}m {s}s
    </span>
  )
}

// Props: gradeLevel (string) — the child's class
export default function LearnerClassroom({ gradeLevel }) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState(null)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [childName, setChildName] = useState('')
  const jitsiContainerRef = useRef(null)
  const jitsiApiRef = useRef(null)
  const pollRef = useRef(null)

  // ── Load Jitsi script ─────────────────────────────────────────────────────
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) { setJitsiLoaded(true); return }
    const script = document.createElement('script')
    script.src = `https://${JITSI_DOMAIN}/external_api.js`
    script.async = true
    script.onload = () => setJitsiLoaded(true)
    script.onerror = () => console.error('Failed to load Jitsi')
    document.head.appendChild(script)
  }, [])

  // ── Fetch sessions for this grade ─────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    if (!gradeLevel) return
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/video-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { gradeLevel }
      })
      setSessions(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [gradeLevel])

  useEffect(() => {
    fetchSessions()
    // Poll every 15s — picks up when teacher starts a session
    pollRef.current = setInterval(fetchSessions, 15000)
    return () => clearInterval(pollRef.current)
  }, [fetchSessions])

  // ── Launch Jitsi ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeSession || !jitsiLoaded || !jitsiContainerRef.current) return
    if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }

    const displayName = user?.name || 'Student'

    const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
      roomName: activeSession.roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: { displayName, email: user?.email || '' },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        startWithAudioMuted: true,   // learners start muted by default
        startWithVideoMuted: false,
        enableNoisyMicDetection: true
      },
      interfaceConfigOverwrite: {
        APP_NAME: 'Golden Classroom',
        NATIVE_APP_NAME: 'Golden Classroom',
        DEFAULT_REMOTE_DISPLAY_NAME: 'Classmate',
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        // Learners have fewer toolbar options than teachers
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'chat', 'raisehand',
          'tileview', 'fullscreen', 'hangup'
        ]
      }
    })

    api.addEventListener('videoConferenceLeft', () => {
      setActiveSession(null)
    })
    api.addEventListener('readyToClose', () => {
      setActiveSession(null)
    })

    jitsiApiRef.current = api
    return () => {
      if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }
    }
  }, [activeSession, jitsiLoaded])

  const handleJoin = (session) => {
    if (!jitsiLoaded) { alert('Video classroom is loading. Please try again in a moment.'); return }
    setActiveSession(session)
  }

  const handleLeave = () => {
    if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }
    setActiveSession(null)
  }

  const filteredSessions = sessions.filter(s => statusFilter === 'all' || s.status === statusFilter)
  const liveSessions = sessions.filter(s => s.status === 'live')
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled')

  // ── LIVE VIEW ─────────────────────────────────────────────────────────────
  if (activeSession) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <div className="bg-[#4a235a] text-white px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-wide">LIVE</span>
            </div>
            <div>
              <p className="font-bold text-sm">{activeSession.title}</p>
              <p className="text-xs text-purple-200">
                {activeSession.gradeLevel} · {activeSession.subject} · Teacher: {activeSession.createdBy}
              </p>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <X size={12} /> Leave Class
          </button>
        </div>
        {/* Jitsi */}
        <div ref={jitsiContainerRef} className="flex-1" style={{ minHeight: 0 }} />
      </div>
    )
  }

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4a235a] flex items-center justify-center">
            <MonitorPlay size={20} className="text-[#d4a017]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#4a235a]">Golden Classroom</h2>
            <p className="text-sm text-gray-500">
              Live video classes for <strong>{gradeLevel || 'your class'}</strong>
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
          jitsiLoaded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {jitsiLoaded
            ? <><Wifi size={12} /> Ready to Join</>
            : <><WifiOff size={12} /> Loading…</>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Classes', value: sessions.length, icon: <LayoutGrid size={18} />, color: 'text-[#4a235a]', bg: 'bg-purple-50' },
          { label: 'Live Now', value: liveSessions.length, icon: <Wifi size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Upcoming', value: upcomingSessions.length, icon: <Calendar size={18} />, color: 'text-[#0f6e56]', bg: 'bg-green-50' },
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

      {/* Live Session Alert */}
      {liveSessions.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <p className="font-bold text-red-700 text-base">
              🎓 Your class is LIVE right now!
            </p>
          </div>
          {liveSessions.map(s => (
            <div key={s.id} className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-[#4a235a]">{s.title}</p>
                <p className="text-sm text-gray-600">Teacher: {s.createdBy} · {s.subject} · {s.duration} min</p>
              </div>
              <button
                onClick={() => handleJoin(s)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-md text-sm"
              >
                <Play size={14} fill="white" /> Join Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-100">
          {[['all', 'All'], ['scheduled', 'Upcoming'], ['live', 'Live'], ['ended', 'Past']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                statusFilter === val ? 'bg-[#4a235a] text-white' : 'text-gray-500 hover:bg-gray-100'
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
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Loading classes…
          </div>
        ) : !gradeLevel ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <AlertCircle size={36} className="mb-2 opacity-30" />
            <p className="text-sm">Please select a child to view their classes</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Video size={40} className="mb-3 opacity-20" />
            <p className="text-sm font-semibold">No classes scheduled yet</p>
            <p className="text-xs mt-1 text-center px-8">
              Your teacher will schedule live video classes here. Check back soon!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredSessions.map(session => {
              const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.scheduled
              const isLive = session.status === 'live'
              const isEnded = session.status === 'ended'
              return (
                <div
                  key={session.id}
                  className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                    isLive ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm ${isEnded ? 'text-gray-400' : 'text-[#4a235a]'}`}>
                        {session.title}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {session.status === 'scheduled' && (
                        <Countdown scheduledAt={session.scheduledAt} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen size={11} /> {session.subject || 'General'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={11} /> {session.createdBy}
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

                  {/* Join / Status */}
                  <div className="flex-shrink-0">
                    {isLive && (
                      <button
                        onClick={() => handleJoin(session)}
                        className="bg-[#4a235a] hover:bg-purple-900 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Play size={12} fill="white" /> Join Class
                      </button>
                    )}
                    {session.status === 'scheduled' && (
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} /> Scheduled
                      </div>
                    )}
                    {isEnded && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <CheckCircle size={12} /> Completed
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-[#1a3c6e] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-[#1a3c6e]">How Golden Classroom works</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            When your teacher starts a live class, a <strong>Join Now</strong> button will appear automatically.
            Classes are private — only students in <strong>{gradeLevel || 'your class'}</strong> can join.
            Make sure your camera and microphone are allowed in your browser.
          </p>
        </div>
      </div>
    </div>
  )
}