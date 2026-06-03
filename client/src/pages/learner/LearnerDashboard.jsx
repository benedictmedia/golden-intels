import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  User, BookOpen, ClipboardList, LayoutDashboard,
  LogOut, GraduationCap, Calendar, Mail, Hash,
  ChevronRight, Award, Clock, CheckCircle, MonitorPlay, AlertCircle, Lock
} from 'lucide-react'
import LearnerClassroom from '../../components/classroom/LearnerClassroom'
import NotificationBell from '../../components/NotificationBell'
import ChangePasswordModal from '../../components/ChangePasswordModal'

const academicYears = ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030', '2030/2031', '2031/2032', '2032/2033', '2033/2034', '2034/2035', '2035/2036', '2036/2037', '2037/2038', '2038/2039', '2039/2040']
const terms = ['Term 1', 'Term 2', 'Term 3']

const AVATAR_COLORS = [
  '#1a3c6e', '#4a235a', '#0f6e56', '#b45309', '#0369a1',
  '#7c3aed', '#be123c', '#0e7490', '#166534', '#92400e'
]
const getAvatarColor = (name = '') =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]

export default function LearnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025/2026')
  const [selectedTerm, setSelectedTerm] = useState('Term 1')
  const [assignments, setAssignments] = useState([])
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [studentProfile, setStudentProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [submissions, setSubmissions] = useState({ assignments: {}, quizzes: {} })
  const [quizAnswers, setQuizAnswers] = useState({})
  const [assignmentAnswers, setAssignmentAnswers] = useState({})
  const [quizStartTimes, setQuizStartTimes] = useState({})
  const [assignmentStartTimes, setAssignmentStartTimes] = useState({})
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [activeQuizId, setActiveQuizId] = useState(null)
  const [now, setNow] = useState(Date.now())
  const learnerSubmissionKey = `goldenIntelsSubmissions:${user?.email || 'anonymous'}`

  useEffect(() => {
    const saved = window.localStorage.getItem('goldenIntelsLms')
    if (saved) {
      const parsed = JSON.parse(saved)
      setAssignments(parsed.assignments || [])
      setLessons(parsed.lessons || [])
      setQuizzes(parsed.quizzes || [])
    }
    const savedSubmissions = window.localStorage.getItem(learnerSubmissionKey)
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions))

    const fetchStudentProfile = async () => {
      setProfileLoading(true)
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_URL}/api/students/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStudentProfile(res.data)
      } catch (error) {
        console.error('Failed to load learner profile:', error?.response?.data || error.message)
      } finally {
        setProfileLoading(false)
      }
    }
    fetchStudentProfile()
  }, [learnerSubmissionKey])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(learnerSubmissionKey, JSON.stringify(submissions))
  }, [submissions, learnerSubmissionKey])

  const saveTeacherSubmissionRecord = (record) => {
    const existing = JSON.parse(window.localStorage.getItem('goldenIntelsSubmissionRecords') || '[]')
    const updated = [record, ...existing.filter(r => !(r.type === record.type && r.itemId === record.itemId && r.learnerEmail === record.learnerEmail))]
    window.localStorage.setItem('goldenIntelsSubmissionRecords', JSON.stringify(updated))
  }

  const getDeviceInfo = () => {
    if (typeof navigator === 'undefined') return 'Unknown device'
    return navigator.userAgent || navigator.platform || 'Unknown device'
  }

  const handleDownloadLearnerPdf = async (record) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Learner Submission Report', 14, 20)
      doc.setFontSize(11)
      doc.text(`Name: ${record.learnerName || 'Learner'}`, 14, 30)
      doc.text(`Email: ${record.learnerEmail || 'No email'}`, 14, 36)
      doc.text(`Device: ${record.device || 'Unknown device'}`, 14, 42)
      doc.text(`Submitted: ${formatDateTime(record.submittedAt)}`, 14, 48)
      doc.text(`Time used: ${record.timeUsedSeconds != null ? `${Math.round(record.timeUsedSeconds)} sec` : 'N/A'}`, 14, 54)
      doc.text(`Resource: ${record.type} - ${record.title || 'N/A'}`, 14, 60)
      if (record.score != null) {
        doc.text(`Score: ${record.score} / ${record.totalQuestions ?? record.questions?.length ?? 'N/A'}`, 14, 66)
      }
      doc.text('Question Review:', 14, 76)
      let y = 84
      ;(record.questions || []).forEach((question, index) => {
        if (y > 260) { doc.addPage(); y = 20 }
        const selected = question.selected || 'No answer'
        const correct = question.answer || 'N/A'
        const match = question.answer != null && selected.trim().toLowerCase() === correct.trim().toLowerCase()
        doc.setFontSize(12)
        doc.text(`Q${index + 1}. ${question.prompt}`, 14, y); y += 6
        doc.text(`${match ? '✔' : '✖'} Your answer: ${selected}`, 18, y); y += 6
        doc.text(`Correct answer: ${correct}`, 18, y); y += 8
      })
      doc.save(`${record.learnerName || 'Learner'}-${record.type}-submission.pdf`)
    } catch (error) {
      console.error('Failed to generate learner PDF:', error)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    return isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const publishedAssignments = assignments.filter(i => i.published)
  const publishedLessons = lessons.filter(i => i.published)
  const publishedQuizzes = quizzes.filter(i => i.published)

  const learnerGradeLevel = studentProfile?.gradeLevel || user?.gradeLevel || null
  const matchesAcademicContext = (item) =>
    (item.academicYear || selectedAcademicYear) === selectedAcademicYear &&
    (item.term || selectedTerm) === selectedTerm
  const isForLearnerClass = (item) =>
    item.teacherEmail && learnerGradeLevel &&
    item.gradeLevel === learnerGradeLevel && matchesAcademicContext(item)

  const learnerLessons = publishedLessons.filter(isForLearnerClass)
  const learnerAssignments = publishedAssignments.filter(isForLearnerClass)
  const learnerQuizzes = publishedQuizzes.filter(isForLearnerClass)

  const completedAssignmentCount = learnerAssignments.filter(i => submissions.assignments?.[i.id]).length
  const completedQuizCount = learnerQuizzes.filter(i => submissions.quizzes?.[i.id]).length
  const totalLearnerItems = learnerLessons.length + learnerAssignments.length + learnerQuizzes.length
  const completionRate = totalLearnerItems
    ? Math.round(((completedAssignmentCount + completedQuizCount) / totalLearnerItems) * 100)
    : 0
  const latestQuizScore = learnerQuizzes.length === 0
    ? '—'
    : submissions.quizzes?.[learnerQuizzes[0].id]?.score ?? '—'

  const handleStartQuiz = (quizId) => {
    setActiveQuizId(quizId)
    setQuizStartTimes(prev => ({ ...prev, [quizId]: prev[quizId] || new Date().toISOString() }))
  }

  const handleAssignmentAnswerChange = (assignmentId, value) => {
    setAssignmentAnswers(prev => ({ ...prev, [assignmentId]: value }))
    setAssignmentStartTimes(prev => ({ ...prev, [assignmentId]: prev[assignmentId] || new Date().toISOString() }))
  }

  const handleSubmitAssignment = (assignment) => {
    const answer = assignmentAnswers[assignment.id] || ''
    if (!answer.trim()) return
    const submittedAt = new Date().toISOString()
    const startedAt = assignmentStartTimes[assignment.id] || submittedAt
    const timeUsedSeconds = Math.round((new Date(submittedAt) - new Date(startedAt)) / 1000)
    const learnerName = user?.name || 'Learner'
    const learnerEmail = user?.email || ''
    const record = {
      type: 'assignment', itemId: assignment.id, title: assignment.title,
      subject: assignment.subject, gradeLevel: assignment.gradeLevel,
      dueDate: assignment.dueDate, description: assignment.description,
      studentId: studentProfile?.studentId, teacherEmail: assignment.teacherEmail,
      teacherName: assignment.teacherName, academicYear: assignment.academicYear,
      term: assignment.term, learnerName, learnerEmail,
      device: getDeviceInfo(), startedAt, submittedAt, timeUsedSeconds, answer,
      questions: [{ prompt: assignment.description || assignment.title, selected: answer, answer: 'Student response' }]
    }
    saveTeacherSubmissionRecord(record)
    setSubmissions(prev => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [assignment.id]: { answer, submittedAt, learnerName, learnerEmail, device: getDeviceInfo(), startedAt, timeUsedSeconds, studentId: studentProfile?.studentId }
      }
    }))
    setAssignmentAnswers(prev => ({ ...prev, [assignment.id]: '' }))
  }

  const handleQuizAnswer = (quizId, questionIndex, value) => {
    setQuizStartTimes(prev => ({ ...prev, [quizId]: prev[quizId] || new Date().toISOString() }))
    setQuizAnswers(prev => ({ ...prev, [quizId]: { ...prev[quizId], [questionIndex]: value } }))
  }

  const handleSubmitQuiz = (quiz) => {
    const answers = quizAnswers[quiz.id] || {}
    const manualTypes = new Set(['short-answer', 'paragraph'])
    const hasManualQuestions = quiz.questions.some(q => manualTypes.has(q.type))
    const score = quiz.questions.reduce((sum, q, i) => {
      if (manualTypes.has(q.type)) return sum
      return answers[i] === q.answer ? sum + 1 : sum
    }, 0)
    const submittedAt = new Date().toISOString()
    const startedAt = quizStartTimes[quiz.id] || submittedAt
    const timeUsedSeconds = Math.round((new Date(submittedAt) - new Date(startedAt)) / 1000)
    const learnerName = user?.name || 'Learner'
    const learnerEmail = user?.email || ''
    const record = {
      type: 'quiz', itemId: quiz.id, title: quiz.title, subject: quiz.subject,
      gradeLevel: quiz.gradeLevel, dueDate: quiz.dueDate,
      studentId: studentProfile?.studentId, teacherEmail: quiz.teacherEmail,
      teacherName: quiz.teacherName, academicYear: quiz.academicYear, term: quiz.term,
      learnerName, learnerEmail, device: getDeviceInfo(), startedAt, submittedAt,
      timeUsedSeconds, score, totalQuestions: quiz.questions.length,
      marked: !hasManualQuestions, markedAt: hasManualQuestions ? null : submittedAt,
      markedBy: hasManualQuestions ? null : 'Auto-marked',
      requiresManualMark: hasManualQuestions,
      questions: quiz.questions.map((q, idx) => ({
        prompt: q.prompt, selected: answers[idx] || 'No answer', answer: q.answer, type: q.type
      }))
    }
    saveTeacherSubmissionRecord(record)
    setSubmissions(prev => ({
      ...prev,
      quizzes: {
        ...prev.quizzes,
        [quiz.id]: { answers, score, submittedAt, learnerName, learnerEmail, device: getDeviceInfo(), startedAt, timeUsedSeconds, studentId: studentProfile?.studentId, marked: !hasManualQuestions }
      }
    }))
  }

  const handleLogout = () => { logout(); navigate('/') }

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'assessments', label: 'Assessments', icon: ClipboardList },
    { id: 'classroom', label: 'Golden Classroom', icon: MonitorPlay },
  ]

  const displayName = studentProfile
    ? `${studentProfile.firstName} ${studentProfile.lastName}`
    : user?.name || 'Learner'

  const avatarColor = getAvatarColor(displayName)
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1729' }}>

      {/* ── Sidebar ── */}
      <div className="w-64 flex flex-col flex-shrink-0" style={{ background: 'linear-gradient(180deg, #0000ff 0%, #8a2be2 60%, #800080 100%)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              G
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Golden-Intels</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: '#94a3b8' }}>Learner Portal</p>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="px-6 pb-6">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              {studentProfile?.photo ? (
                <img src={studentProfile.photo} alt={displayName}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '2px solid rgba(245,158,11,0.5)' }} />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                  style={{ backgroundColor: avatarColor, border: '2px solid rgba(245,158,11,0.5)' }}>
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{displayName}</p>
                <p className="text-xs truncate" style={{ color: '#f59e0b' }}>
                  {studentProfile?.gradeLevel || learnerGradeLevel || 'Learner'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent'
                }}>
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" style={{ color: '#f59e0b' }} />}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-purple-900">
          <button onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
            <Lock size={20} />
            <span className="text-sm">Change Password</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#ffffff' }}>

        {/* Top bar */}
<div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between" 
     style={{ background: 'rgba(241,245,249,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0' }}>
  <div>
    <h1 className="text-xl font-bold capitalize" style={{ color: '#1e293b' }}>
      {navItems.find(n => n.id === activeTab)?.label}
    </h1>
    <p className="text-sm" style={{ color: '#64748b' }}>
      {selectedAcademicYear} · {selectedTerm}
    </p>
  </div>

  <div className="flex items-center gap-4">
    <NotificationBell onNotificationClick={(notif) => {
      console.log("Learner opened notification:", notif);
      // You can open messages tab here if needed
    }} />

    <select value={selectedAcademicYear} onChange={e => setSelectedAcademicYear(e.target.value)}
      className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
      style={{ borderColor: '#e2e8f0', color: '#374151', background: '#fff' }}>
      {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
    </select>

    <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
      className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
      style={{ borderColor: '#e2e8f0', color: '#374151', background: '#fff' }}>
      {terms.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  </div>
</div>

        <div className="p-8">

          {/* ════════════════ PROFILE TAB ════════════════ */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-6">

              {profileLoading ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse" style={{ background: '#e2e8f0' }} />
                  <p style={{ color: '#94a3b8' }}>Loading your profile...</p>
                </div>
              ) : (
                <>
                  {/* Hero card */}
<div className="rounded-3xl shadow-lg" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
  {/* Banner */}
  <div className="h-28 rounded-t-3xl relative" style={{ background: 'linear-gradient(135deg, #8a2be2 0%, #800080 50%, #0000ff 100%)' }}>
    <div className="absolute inset-0 rounded-t-3xl opacity-20"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />
    <div className="absolute top-3 right-4 text-xs font-bold px-3 py-1 rounded-full"
      style={{ background: 'rgba(255,255,0,0.2)', color: '#ffff00', border: '1px solid rgba(255,255,0,0.5)' }}>
      {studentProfile?.status?.toUpperCase() || 'ACTIVE'}
    </div>
  </div>

  {/* Profile area — avatar sits BELOW banner, not overlapping */}
  <div className="px-8 pt-6 pb-8">
    <div className="flex items-start gap-6 mb-6">
      {studentProfile?.photo ? (
        <img src={studentProfile.photo} alt={displayName}
          className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 shadow-lg"
          style={{ border: '4px solid #8a2be2' }} />
      ) : (
        <div className="w-24 h-24 rounded-2xl flex items-center justify-center font-black text-3xl text-white flex-shrink-0 shadow-lg"
          style={{ backgroundColor: avatarColor, border: '4px solid #8a2be2' }}>
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0 pt-2">
        <h2 className="text-2xl font-black truncate" style={{ color: '#1e293b' }}>{displayName}</h2>
        <p className="text-sm font-bold mt-0.5" style={{ color: '#8a2be2' }}>
          {studentProfile?.gradeLevel || 'Grade not assigned'}
        </p>
      </div>
      {studentProfile?.studentId && (
        <div className="text-right pt-2 flex-shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Student ID</p>
          <p className="text-lg font-black" style={{ color: '#0000ff' }}>{studentProfile.studentId}</p>
        </div>
      )}
    </div>

    {/* Info grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { icon: Hash, label: 'Student ID', value: studentProfile?.studentId || '—', color: '#8a2be2' },
        { icon: GraduationCap, label: 'Grade Level', value: studentProfile?.gradeLevel || learnerGradeLevel || '—', color: '#0000ff' },
        { icon: Calendar, label: 'Date of Birth', value: formatDate(studentProfile?.dateOfBirth), color: '#800080' },
        { icon: Mail, label: 'Email Address', value: user?.email || '—', color: '#0000ff' },
        { icon: User, label: 'Gender', value: studentProfile?.gender || '—', color: '#8a2be2' },
        { icon: Award, label: 'Status', value: studentProfile?.status ? studentProfile.status.charAt(0).toUpperCase() + studentProfile.status.slice(1) : 'Active', color: '#059669' },
        /* { icon: <MonitorPlay size={20} />, label: 'Golden Classroom', id: 'classroom' } */
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{label}</p>
            <p className="font-semibold text-sm truncate mt-0.5" style={{ color: '#1e293b' }}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

                  {/* Parent info card */}
                  {(studentProfile?.parentName || studentProfile?.parentEmail || studentProfile?.parentPhone) && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                      <h3 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Parent / Guardian</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { label: 'Name', value: studentProfile?.parentName },
                          { label: 'Email', value: studentProfile?.parentEmail },
                          { label: 'Phone', value: studentProfile?.parentPhone },
                        ].filter(i => i.value).map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>{label}</p>
                            <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Academic snapshot */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Lessons', value: learnerLessons.length, icon: BookOpen, color: '#2563eb', bg: '#eff6ff' },
                      { label: 'Assignments', value: learnerAssignments.length, icon: ClipboardList, color: '#7c3aed', bg: '#f5f3ff' },
                      { label: 'Completion', value: `${completionRate}%`, icon: CheckCircle, color: '#059669', bg: '#f0fdf4' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="rounded-2xl p-5 text-center shadow-sm" style={{ background: bg, border: `1px solid ${color}20` }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}20` }}>
                          <Icon size={20} style={{ color }} />
                        </div>
                        <p className="text-2xl font-black" style={{ color }}>{value}</p>
                        <p className="text-xs font-bold uppercase tracking-wide mt-1" style={{ color: '#64748b' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════════════ DASHBOARD TAB ════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Lessons', value: learnerLessons.length, color: '#2563eb', bg: '#eff6ff' },
                  { label: 'Assignments', value: learnerAssignments.length, color: '#7c3aed', bg: '#f5f3ff' },
                  { label: 'Quizzes', value: learnerQuizzes.length, color: '#d97706', bg: '#fffbeb' },
                  { label: 'Completion', value: `${completionRate}%`, color: '#059669', bg: '#f0fdf4' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ background: bg, border: `1px solid ${color}20` }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#64748b' }}>{label}</p>
                    <p className="text-3xl font-black" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#1e293b' }}>Latest Lesson</h3>
                  {learnerLessons.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No lessons published yet.</p>
                  ) : (
                    <div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#eff6ff', color: '#2563eb' }}>{learnerLessons[0].gradeLevel}</span>
                      <h4 className="font-bold mt-3 mb-1" style={{ color: '#1e293b' }}>{learnerLessons[0].title}</h4>
                      <p className="text-sm mb-3" style={{ color: '#64748b' }}>{learnerLessons[0].subject}</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{learnerLessons[0].content}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#1e293b' }}>Progress Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Assignments completed', value: `${completedAssignmentCount} / ${learnerAssignments.length}`, color: '#7c3aed' },
                      { label: 'Quizzes completed', value: `${completedQuizCount} / ${learnerQuizzes.length}`, color: '#2563eb' },
                      { label: 'Latest quiz score', value: latestQuizScore, color: '#d97706' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                        <span className="text-sm" style={{ color: '#64748b' }}>{label}</span>
                        <span className="font-bold text-sm" style={{ color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming deadlines */}
              {(learnerAssignments.length > 0 || learnerQuizzes.length > 0) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#1e293b' }}>Upcoming Deadlines</h3>
                  <div className="space-y-3">
                    {[...learnerAssignments.slice(0, 2).map(i => ({ ...i, kind: 'Assignment' })),
                      ...learnerQuizzes.slice(0, 2).map(i => ({ ...i, kind: 'Quiz' }))
                    ].map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.kind === 'Quiz' ? '#d97706' : '#7c3aed' }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: '#1e293b' }}>{item.title}</p>
                          <p className="text-xs" style={{ color: '#94a3b8' }}>{item.kind} · {item.subject}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold" style={{ color: '#64748b' }}>Due</p>
                          <p className="text-xs" style={{ color: '#374151' }}>{formatDateTime(item.dueDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════ RESOURCES TAB ════════════════ */}
          {activeTab === 'resources' && (
            <div>
              <h3 className="text-xl font-bold mb-6" style={{ color: '#1e293b' }}>Learning Resources</h3>
              {learnerLessons.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                  <BookOpen size={36} className="mx-auto mb-3" style={{ color: '#cbd5e1' }} />
                  <p style={{ color: '#94a3b8' }}>No lessons published for your class yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {learnerLessons.map(lesson => (
                    <div key={lesson.id} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#eff6ff', color: '#2563eb' }}>{lesson.gradeLevel}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#f5f3ff', color: '#7c3aed' }}>{lesson.subject}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-1" style={{ color: '#1e293b' }}>{lesson.title}</h4>
                      <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>{lesson.academicYear || selectedAcademicYear} · {lesson.term || selectedTerm}</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{lesson.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ ASSESSMENTS TAB (Subject Folders) ════════════════ */}
  {activeTab === 'assessments' && (
  <div className="space-y-8">
    <h3 className="text-2xl font-bold text-[#1e2937]">Assessments by Subject</h3>

    {/* Fallback SUBJECTS if not defined */}
    {(!SUBJECTS || SUBJECTS.length === 0) && (
      <div className="text-red-600">Error: SUBJECTS not defined. Please define it at the top of the file.</div>
    )}

    {(SUBJECTS || []).map(subject => {
      const subjectAssignments = (learnerAssignments || []).filter(a => a.subject === subject);
      const subjectQuizzes = (learnerQuizzes || []).filter(q => q.subject === subject);

      if (subjectAssignments.length === 0 && subjectQuizzes.length === 0) return null;

      return (
        <div key={subject} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={24} className="text-white" />
              <h4 className="text-xl font-bold text-white">{subject}</h4>
            </div>
            <span className="bg-white/20 text-white text-sm font-semibold px-4 py-1 rounded-full">
              {subjectAssignments.length} Assignment{subjectAssignments.length !== 1 ? 's' : ''} • {subjectQuizzes.length} Quiz{subjectQuizzes.length !== 1 ? 'zes' : ''}
            </span>
          </div>

          <div className="p-6 space-y-8">
            {/* Assignments */}
            {subjectAssignments.length > 0 && (
              <div>
                <p className="uppercase tracking-widest text-xs font-bold text-gray-500 mb-4">ASSIGNMENTS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjectAssignments.map(assignment => {
                    const submission = submissions?.assignments?.[assignment.id];
                    return (
                      <div key={assignment.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h5 className="font-bold text-lg text-[#1e2937]">{assignment.title}</h5>
                            <p className="text-sm text-gray-500">{assignment.gradeLevel} • Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div className={`text-xs px-3 py-1 rounded-full font-medium ${submission ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {submission ? 'Submitted' : 'Pending'}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-5 line-clamp-3">{assignment.description || 'No description provided.'}</p>

                        {!submission ? (
                          <div className="space-y-3">
                            <textarea
                              placeholder="Type your assignment response here..."
                              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-y"
                              value={submissions?.assignments?.[assignment.id]?.content || ''}
                              onChange={(e) => {
                                const newSubs = {...(submissions || {})};
                                if (!newSubs.assignments) newSubs.assignments = {};
                                newSubs.assignments[assignment.id] = {
                                  content: e.target.value,
                                  submittedAt: new Date().toISOString()
                                };
                                setSubmissions(newSubs);
                              }}
                            />
                            <button 
                              onClick={() => handleSubmitAssignment && handleSubmitAssignment(assignment)}
                              className="w-full py-3 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white font-bold rounded-xl hover:brightness-105"
                            >
                              Submit Assignment
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
                            ✓ Submitted on {new Date(submission.submittedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quizzes */}
            {subjectQuizzes.length > 0 && (
              <div>
                <p className="uppercase tracking-widest text-xs font-bold text-gray-500 mb-4">QUIZZES</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjectQuizzes.map(quiz => {
                    const hasSubmitted = submissions?.quizzes?.[quiz.id];
                    return (
                      <div key={quiz.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h5 className="font-bold text-lg mb-2">{quiz.title}</h5>
                        <p className="text-sm text-gray-500 mb-4">{(quiz.questions || []).length} questions</p>

                        {!hasSubmitted ? (
                          <button 
                            onClick={() => {
                              if (setSelectedQuiz) setSelectedQuiz(quiz);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white font-bold rounded-xl"
                          >
                            Start Quiz
                          </button>
                        ) : (
                          <div className="p-4 bg-green-50 rounded-xl text-center text-green-700 font-medium">
                            Quiz Completed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })}

    {(learnerAssignments || []).length === 0 && (learnerQuizzes || []).length === 0 && (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-400">No assessments available at the moment.</p>
      </div>
    )}
  </div>
)}

          {/* ════════════════ GOLDEN CLASSROOM TAB ════════════════ */}
          {activeTab === 'classroom' && (
            <div>
              {learnerGradeLevel ? (
                <LearnerClassroom gradeLevel={learnerGradeLevel} />
              ) : (
                <div className="rounded-2xl p-10 text-center" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#d97706' }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#92400e' }}>No Grade Level Assigned</h3>
                  <p style={{ color: '#b45309' }}>
                    Your profile doesn't have a grade level yet.<br />
                    Please ask your teacher or admin to update it.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    {showChangePassword && (
      <ChangePasswordModal
        onClose={() => setShowChangePassword(false)}
        accentColor="#800080"
      />
    )}
    </div>
  )
}
