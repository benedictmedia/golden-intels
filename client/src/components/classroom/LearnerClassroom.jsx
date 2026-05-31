import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import {
  Video, Calendar, Clock, BookOpen, Users,
  Play, AlertCircle, MonitorPlay, CheckCircle
} from 'lucide-react'
import API_URL from '../../api/config'

export default function LearnerClassroom({ gradeLevel }) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState(null)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const [error, setError] = useState(null)

  const jitsiContainerRef = useRef(null)
  const jitsiApiRef = useRef(null)

  // Debug log
  console.log("LearnerClassroom mounted with gradeLevel:", gradeLevel)

  // Load Jitsi
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setJitsiLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://meet.jit.si/external_api.js'
    script.async = true
    script.onload = () => setJitsiLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!gradeLevel) {
      setError("No grade level assigned")
      setLoading(false)
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/video-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { gradeLevel }
      })
      console.log("Sessions received:", res.data)
      setSessions(res.data || [])
    } catch (err) {
      console.error("Failed to fetch sessions:", err.response?.data || err.message)
      setError("Failed to load classes")
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [gradeLevel])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Join session
  const handleJoin = (session) => {
    if (!jitsiLoaded) {
      alert("Video system is still loading. Please wait a moment.")
      return
    }
    setActiveSession(session)
  }

  if (loading) {
    return <div className="p-12 text-center">Loading your classes...</div>
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border">
        <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
        <p className="text-lg font-medium text-gray-700">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Please contact your teacher</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border">
        <MonitorPlay size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-bold text-gray-700">No Live Classes Yet</h3>
        <p className="text-gray-500 mt-2">Your teacher hasn't scheduled any live sessions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4a235a]">Golden Classroom</h2>
        <span className="text-sm text-gray-500">Grade {gradeLevel}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(session => (
          <div key={session.id} className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">LIVE</span>
                <h3 className="font-bold text-lg mt-2">{session.title}</h3>
                <p className="text-sm text-gray-600">{session.subject} • {session.gradeLevel}</p>
              </div>
              <Video size={28} className="text-green-600" />
            </div>

            <div className="text-sm text-gray-500 space-y-1 mb-6">
              <p>📅 {new Date(session.scheduledAt).toLocaleDateString()}</p>
              <p>⏱ {session.duration} minutes</p>
            </div>

            <button
              onClick={() => handleJoin(session)}
              className="w-full bg-[#4a235a] hover:bg-[#3a1f4a] text-white font-bold py-3 rounded-xl transition-colors"
            >
              Join Live Class
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}