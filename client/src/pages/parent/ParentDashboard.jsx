import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard, Users, ClipboardList, BookOpen,
  FileText, DollarSign, MessageSquare, LogOut, Menu, X, Bell, Send, Lock, FolderOpen
} from 'lucide-react'
import API_URL from '../../api/config'
import { SUBJECTS, calculateGrandTotal, getNormalizedScores, getRemarksText, getSubjectScore, getSubjectTotal } from '../../utils/subjects'
import ParentMessages from '../../components/messages/ParentMessages'
import NotificationBell from '../../components/NotificationBell'
import ChangePasswordModal from '../../components/ChangePasswordModal'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={20} />, label: 'My Children', id: 'children' },
  { icon: <ClipboardList size={20} />, label: 'Attendance', id: 'attendance' },
  { icon: <BookOpen size={20} />, label: 'Grades', id: 'grades' },
  { icon: <FileText size={20} />, label: 'Assessments', id: 'assessments' },
  { icon: <DollarSign size={20} />, label: 'Fee Status', id: 'fees' },
  { icon: <MessageSquare size={20} />, label: 'Messages', id: 'messages' },
]

const academicYears = ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030', '2030/2031', '2031/2032', '2032/2033', '2033/2034', '2034/2035', '2035/2036', '2036/2037', '2037/2038', '2038/2039', '2039/2040']
const terms = ['Term 1', 'Term 2', 'Term 3']

const getSubjectName = (item) => item?.subject || 'General'
const buildSubjectFolders = (items) => Object.values(items.reduce((folders, item) => {
  const subject = getSubjectName(item)
  if (!folders[subject]) folders[subject] = { subject, assignments: 0, quizzes: 0, total: 0 }
  if (item.type === 'quiz') folders[subject].quizzes += 1
  if (item.type === 'assignment') folders[subject].assignments += 1
  folders[subject].total += 1
  return folders
}, {})).sort((a, b) => a.subject.localeCompare(b.subject))

export default function ParentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025/2026')
  const [selectedTerm, setSelectedTerm] = useState('Term 1')
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  const [students, setStudents] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [messageSent, setMessageSent] = useState(false)
  const [approvedResults, setApprovedResults] = useState([])
  const [feePayments, setFeePayments] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')
  const [assignmentRecords, setAssignmentRecords] = useState([])
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [activeAssessmentSubject, setActiveAssessmentSubject] = useState('')

  useEffect(() => {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  axios.get(`${API_URL}/api/students`, { headers })
    .then(res => {
      setStudents(res.data)
      if (res.data.length > 0) setSelectedChild(res.data[0])
    })

  axios.get(`${API_URL}/api/results`, { headers })
    .then(res => {
      const approved = res.data.filter(r => r.status === 'approved')
      setApprovedResults(approved)
    })

  axios.get(`${API_URL}/api/fees/payments`, { headers })
    .then(res => setFeePayments(res.data))
}, [])
  const [viewingResult, setViewingResult] = useState(null)

  useEffect(() => {
    if (activeMenu !== 'attendance' || !selectedChild?.id) return
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    setAttendanceLoading(true)
    setAttendanceError('')
    axios.get(`${API_URL}/api/attendance/student/${selectedChild.id}`, { headers })
      .then(res => setAttendanceRecords(res.data))
      .catch(err => {
        console.error('Failed to fetch attendance:', err)
        setAttendanceError('Unable to load attendance records.')
      })
      .finally(() => setAttendanceLoading(false))
  }, [activeMenu, selectedChild])

  const handleParentDownloadPDF = async (result) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const student = result.student
    const scores = getNormalizedScores(result.scores || {})
    const pageWidth = doc.internal.pageSize.getWidth()

    // Load logo as base64
    const getLogoBase64 = () => new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
      img.src = new URL('../../assets/logo.png', import.meta.url).href
    })
    const logoData = await getLogoBase64()

    doc.setFillColor(26, 60, 110)
    doc.rect(0, 0, pageWidth, 45, 'F')
    doc.setFillColor(212, 160, 23)
    doc.rect(0, 45, pageWidth, 4, 'F')
    if (logoData) {
      doc.addImage(logoData, 'PNG', 12, 5, 32, 32)
    }

    doc.setFontSize(20)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('Golden-Intels International School', pageWidth / 2 + 10, 18, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(212, 160, 23)
    doc.text('Oxford Accredited School', pageWidth / 2 + 10, 27, { align: 'center' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255)
    doc.text(`Academic Year: ${result.academicYear}   |   Term: ${result.term}`, pageWidth / 2 + 10, 36, { align: 'center' })

    doc.setFillColor(240, 245, 255)
    doc.rect(0, 49, pageWidth, 12, 'F')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 60, 110)
    doc.text('STUDENT ACADEMIC REPORT', pageWidth / 2, 57, { align: 'center' })

    doc.setFillColor(255, 255, 255)
    doc.rect(10, 64, pageWidth - 20, 28, 'F')
    doc.setDrawColor(212, 160, 23)
    doc.setLineWidth(0.5)
    doc.rect(10, 64, pageWidth - 20, 28)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 60, 110)
    doc.text('Student Name:', 15, 73)
    doc.text('Student ID:', 15, 82)
    doc.text('Class:', 15, 91)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    doc.text(`${student.firstName} ${student.lastName}`, 50, 73)
    doc.text(`${student.studentId}`, 50, 82)
    doc.text(`${result.gradeLevel}`, 50, 91)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 60, 110)
    doc.text('Gender:', 120, 73)
    doc.text('Date of Birth:', 120, 82)
    doc.text('Status:', 120, 91)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    doc.text(`${student.gender}`, 150, 73)
    doc.text(`${student.dateOfBirth}`, 150, 82)
    doc.text(`${student.status}`, 150, 91)

    let y = 100

    // Subjects table header — compact 8mm rows
    doc.setFillColor(26, 60, 110); doc.rect(10, y, pageWidth - 20, 8, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Subject', 15, y + 5.5); doc.text('Class(10)', 65, y + 5.5)
    doc.text('CAT1(20)', 92, y + 5.5); doc.text('CAT2(20)', 119, y + 5.5)
    doc.text('Exam(50)', 146, y + 5.5); doc.text('Total', 170, y + 5.5); doc.text('Grade', 186, y + 5.5)
    y += 8

    let grandTotal = 0
    const getGrade = (t) => { if (t >= 90) return 'A+'; if (t >= 80) return 'A'; if (t >= 70) return 'B+'; if (t >= 60) return 'B'; if (t >= 50) return 'C'; if (t >= 40) return 'D'; return 'F' }
    const getGradeColor = (t) => { if (t >= 80) return [15, 110, 86]; if (t >= 60) return [26, 60, 110]; if (t >= 50) return [212, 160, 23]; return [220, 50, 50] }

    SUBJECTS.forEach((subject, index) => {
      const s = getSubjectScore(scores, subject)
      const classScore = parseFloat(s.classScore) || 0
      const cat1 = parseFloat(s.cat1) || 0
      const cat2 = parseFloat(s.cat2) || 0
      const exam = parseFloat(s.exam) || 0
      const wExam = (exam / 100) * 50
      const total = getSubjectTotal(s)
      grandTotal += total

      if (index % 2 === 0) { doc.setFillColor(245, 248, 255) } else { doc.setFillColor(255, 255, 255) }
      doc.rect(10, y, pageWidth - 20, 8, 'F')
      doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.2); doc.rect(10, y, pageWidth - 20, 8)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(26, 60, 110); doc.text(subject, 15, y + 5.5)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
      doc.text(classScore.toString(), 72, y + 5.5); doc.text(cat1.toString(), 99, y + 5.5)
      doc.text(cat2.toString(), 126, y + 5.5); doc.text(wExam.toFixed(2), 150, y + 5.5); doc.text(total.toFixed(2), 170, y + 5.5)
      const gradeColor = getGradeColor(total); doc.setFont('helvetica', 'bold'); doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2])
      doc.text(total > 0 ? getGrade(total) : '-', 188, y + 5.5)
      y += 8
    })

    // Grand total row
    doc.setFillColor(212, 160, 23); doc.rect(10, y, pageWidth - 20, 8, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(26, 60, 110)
    doc.text('Grand Total', 15, y + 5.5); doc.text(`${grandTotal.toFixed(2)} / 1100`, 155, y + 5.5)
    y += 10

    // Attendance summary — compact single line
    const _attToken = localStorage.getItem('token')
    const _attHeaders = { Authorization: `Bearer ${_attToken}` }
    let attendanceSummary = null
    try {
      const attendanceRes = await axios.get(`${API_URL}/api/attendance/summary/${result.studentId}`, { headers: _attHeaders })
      attendanceSummary = attendanceRes.data
    } catch {}

    if (attendanceSummary) {
      doc.setFillColor(245, 248, 255); doc.rect(10, y, pageWidth - 20, 10, 'F')
      doc.setDrawColor(212, 160, 23); doc.setLineWidth(0.3); doc.rect(10, y, pageWidth - 20, 10)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 60, 110)
      doc.text('Attendance:', 15, y + 4.5)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
      doc.text(`Total: ${attendanceSummary.total}  Present: ${attendanceSummary.present}  Absent: ${attendanceSummary.absent}  Late: ${attendanceSummary.late}  Rate: ${attendanceSummary.percentage}%`, 48, y + 4.5)
      y += 12
    }

    // Watermark
    if (logoData) {
      doc.saveGraphicsState(); doc.setGState(new doc.GState({ opacity: 0.06 }))
      doc.addImage(logoData, 'PNG', 55, 100, 100, 100); doc.restoreGraphicsState()
    }

    // Compact remarks — max 2 lines
    const remarksText = getRemarksText(result.remarks)
    const allRemarksLines = doc.splitTextToSize(remarksText, 172)
    const clampedRemarksLines = allRemarksLines.slice(0, 2)
    const remarksHeight = 14

    // ── Class Teacher's Remarks ──
    doc.setFillColor(240, 245, 255); doc.rect(10, y, pageWidth - 20, remarksHeight, 'F')
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.4); doc.rect(10, y, pageWidth - 20, remarksHeight)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 60, 110)
    doc.text("Class Teacher's Remarks:", 15, y + 4.5)
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(50, 50, 50)
    doc.text(clampedRemarksLines, 15, y + 10)
    y += remarksHeight + 6

    // ── Headmaster's Signature ──
    const sigHeight = 28
    doc.setFillColor(255, 255, 255); doc.rect(10, y, pageWidth - 20, sigHeight, 'F')
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.4); doc.rect(10, y, pageWidth - 20, sigHeight)

    // Label
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 60, 110)
    doc.text("Headmaster's Signature:", 15, y + 6)

    // Try to embed actual signature image
    const sigImageUrl = result.headmasterSignature
    if (sigImageUrl) {
      try {
        const sigImg = await new Promise((resolve, reject) => {
          const img = new Image(); img.crossOrigin = 'anonymous'
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width; canvas.height = img.height
            canvas.getContext('2d').drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          }
          img.onerror = reject
          img.src = sigImageUrl
        })
        doc.addImage(sigImg, 'PNG', 15, y + 8, 50, 14)
      } catch {
        // Fallback to blank line if image fails
        doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.3)
        doc.line(15, y + 20, 90, y + 20)
      }
    } else {
      doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.3)
      doc.line(15, y + 20, 90, y + 20)
    }

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(100, 100, 100)
    doc.text('Headmaster / Principal', 15, y + 26)

    // Right: Approval date
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 60, 110)
    doc.text('Date Approved:', pageWidth - 80, y + 6)
    const approvalDate = result.approvedAt
      ? new Date(result.approvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '___________________'
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(50, 50, 50)
    doc.text(approvalDate, pageWidth - 80, y + 14)
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.3)
    doc.line(pageWidth - 80, y + 20, pageWidth - 15, y + 20)

    y += sigHeight + 4

    // ── Footer — tight, no gap ──
    const footerHeight = 14
    doc.setFillColor(26, 60, 110); doc.rect(0, y, pageWidth, footerHeight, 'F')
    doc.setFillColor(212, 160, 23); doc.rect(0, y, pageWidth, 1.5, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255)
    doc.text('GOLDEN-INTELS INTERNATIONAL SCHOOL', pageWidth / 2, y + 6.5, { align: 'center' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(212, 160, 23)
    doc.text('We Nurture for Nature', pageWidth / 2, y + 11.5, { align: 'center' })
    doc.save(`${student.firstName}_${student.lastName}_${result.term}_${result.academicYear}.pdf`)
  }

  useEffect(() => {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  axios.get(`${API_URL}/api/students`, { headers })
    .then(res => {
      setStudents(res.data)
      if (res.data.length > 0) setSelectedChild(res.data[0])
    })

  axios.get(`${API_URL}/api/results`, { headers })
    .then(res => {
      const approved = res.data.filter(r => r.status === 'approved')
      setApprovedResults(approved)
    })

  axios.get(`${API_URL}/api/fees/payments`, { headers })
    .then(res => setFeePayments(res.data))
}, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSendMessage = () => {
    if (!message.trim()) return
    setMessages([...messages, {
      id: Date.now(),
      text: message,
      sender: user?.name,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    }])
    setMessage('')
    setMessageSent(true)
    setTimeout(() => setMessageSent(false), 3000)
  }

  const fees = [
    { term: 'Term 1 - 2024', amount: 'GH₵ 0', status: 'Pending', due: '2024-01-15' },
    { term: 'Term 2 - 2024', amount: 'GH₵ 0', status: 'Pending', due: '2024-05-15' },
    { term: 'Term 3 - 2024', amount: 'GH₵ 0', status: 'Pending', due: '2024-09-15' },
  ]

  const attendanceSummary = attendanceRecords.reduce((summary, record) => ({
    ...summary,
    [record.status]: (summary[record.status] || 0) + 1
  }), { present: 0, absent: 0, late: 0 })
  const attendancePercentage = attendanceRecords.length
    ? Math.round((attendanceSummary.present / attendanceRecords.length) * 100)
    : 0
  const formatAttendanceStatus = (status) => status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'
  const getAcademicYearFromDate = (value) => {
    const date = new Date(value)
    if (isNaN(date.getTime())) return selectedAcademicYear
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`
  }
  const getTermFromDate = (value) => {
    const date = new Date(value)
    if (isNaN(date.getTime())) return selectedTerm
    const month = date.getMonth() + 1
    if (month >= 9 || month <= 12) return 'Term 1'
    if (month >= 1 && month <= 4) return 'Term 2'
    return 'Term 3'
  }
  const matchesAcademicContext = (item) => {
    const academicYear = item.academicYear || item.year || getAcademicYearFromDate(item.date || item.submittedAt || item.createdAt)
    const term = item.term || getTermFromDate(item.date || item.submittedAt || item.createdAt)
    return academicYear === selectedAcademicYear && term === selectedTerm
  }
  const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    return isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  const getStudentFullName = (student) => `${student?.firstName || ''} ${student?.lastName || ''}`.trim().toLowerCase()
  const matchesParentChild = (record, student) => {
    if (!student) return false
    if (record.studentId && student.studentId && record.studentId === student.studentId) return true
    return getStudentFullName(student) && String(record.learnerName || '').trim().toLowerCase() === getStudentFullName(student)
  }

  const markedAssessmentRecords = assignmentRecords.filter(record =>
    ['assignment', 'quiz'].includes(record.type) &&
    (record.marked || (record.type === 'quiz' && record.score != null && !record.requiresManualMark && record.marked !== false)) &&
    matchesAcademicContext(record) &&
    students.some(student => matchesParentChild(record, student))
  )
  const parentAssessmentFolders = buildSubjectFolders(markedAssessmentRecords)
  const selectedAssessmentSubject = parentAssessmentFolders.some(folder => folder.subject === activeAssessmentSubject)
    ? activeAssessmentSubject
    : parentAssessmentFolders[0]?.subject || ''
  const visibleMarkedAssessmentRecords = selectedAssessmentSubject
    ? markedAssessmentRecords.filter(record => getSubjectName(record) === selectedAssessmentSubject)
    : markedAssessmentRecords
  const contextualApprovedResults = approvedResults.filter(matchesAcademicContext)
  const contextualAttendanceRecords = attendanceRecords.filter(matchesAcademicContext)
  const contextualFeePayments = feePayments.filter(payment => {
    const monthValue = payment.month ? `${payment.month} 1, ${payment.year || new Date().getFullYear()}` : payment.createdAt
    const paymentAcademicYear = payment.academicYear || (payment.year && String(payment.year).includes('/') ? payment.year : getAcademicYearFromDate(monthValue))
    const paymentTerm = payment.term || getTermFromDate(monthValue)
    return paymentAcademicYear === selectedAcademicYear && paymentTerm === selectedTerm
  })
  const contextualAttendanceSummary = contextualAttendanceRecords.reduce((summary, record) => ({
    ...summary,
    [record.status]: (summary[record.status] || 0) + 1
  }), { present: 0, absent: 0, late: 0 })
  const contextualAttendancePercentage = contextualAttendanceRecords.length
    ? Math.round((contextualAttendanceSummary.present / contextualAttendanceRecords.length) * 100)
    : 0

  useEffect(() => {
    const loadAssignmentRecords = () => {
      try {
        const saved = window.localStorage.getItem('goldenIntelsSubmissionRecords')
        setAssignmentRecords(saved ? JSON.parse(saved) : [])
      } catch {
        setAssignmentRecords([])
      }
    }
    loadAssignmentRecords()
    window.addEventListener('storage', loadAssignmentRecords)
    return () => window.removeEventListener('storage', loadAssignmentRecords)
  }, [])

  return (
    <div className="portal-shell flex bg-gray-100">

      {/* Sidebar */}
      <div className={`portal-sidebar ${sidebarOpen ? 'is-open w-64' : 'w-20'} text-white transition-all duration-300 flex flex-col`} style={{ background: '#800080' }}>
        <div className="flex items-center justify-between p-4 border-b border-purple-900">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: '#ffff00', color: '#800080' }}>G</div>
              <div>
                <p className="text-xs font-bold">Golden-Intels</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Parent Portal</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-cyan-600">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveMenu(item.id); if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
              style={{
                background: activeMenu === item.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: activeMenu === item.id ? '#ffff00' : 'rgba(255,255,255,0.85)',
                borderLeft: activeMenu === item.id ? '3px solid #ffff00' : '3px solid transparent',
                fontWeight: activeMenu === item.id ? '700' : '400'
        }}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-900">
          <button onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
            <Lock size={20} />
            {sidebarOpen && <span className="text-sm">Change Password</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="portal-main flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
<div className="portal-topbar px-6 py-4 flex items-center justify-between" style={{ background: '#0000ff' }}>
  <div className="flex items-center gap-3">
    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg bg-white/15 text-white">
      <Menu size={20} />
    </button>
    <div>
    <h1 className="text-xl font-bold text-white capitalize">{activeMenu.replace('-', ' ')}</h1>
    <p className="text-sm text-gray-200">Welcome, {user?.name}</p>
    </div>
  </div>

  <div className="flex items-center gap-4">
    <NotificationBell onNotificationClick={(notif) => {
      console.log("Parent opened notification:", notif);
    }} />

    <div className="flex items-center gap-3">
      <select value={selectedAcademicYear} onChange={e => setSelectedAcademicYear(e.target.value)}
        className="px-4 py-2 rounded-xl text-sm border focus:outline-none bg-white">
        {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
      </select>
      <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
        className="px-4 py-2 rounded-xl text-sm border focus:outline-none bg-white">
        {terms.map(term => <option key={term} value={term}>{term}</option>)}
      </select>
    </div>
  </div>
</div>

        {/* Page Content */}
        <div className="portal-content flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Academic Context</p>
              <p className="text-lg font-bold text-[#800080]">{selectedAcademicYear} | {selectedTerm}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={selectedAcademicYear} onChange={e => setSelectedAcademicYear(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4a235a] text-gray-700 bg-white">
                {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4a235a] text-gray-700 bg-white">
                {terms.map(term => <option key={term} value={term}>{term}</option>)}
              </select>
            </div>
          </div>

          {/* Dashboard */}
          {activeMenu === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
{ label: 'My Children', value: students.length, color: 'bg-[#800080]', textColor: 'text-purple-200' },
{ label: 'Marked Assessments', value: markedAssessmentRecords.length, color: 'bg-[#0000ff]', textColor: 'text-blue-100' },
{ label: 'Avg Grade', value: 'A', color: 'bg-[#800080]', textColor: 'text-purple-200' },
{ label: 'Messages', value: messages.length, color: 'bg-[#0000ff]', textColor: 'text-blue-100' },
                ].map((stat, index) => (
                  <div key={index} className={`${stat.color} text-white rounded-2xl p-6 shadow-md`}>
                    <p className={`${stat.textColor} text-sm mb-1`}>{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-2">Parent Dashboard</h2>
                <p className="text-gray-600">Welcome to your Parent Portal. Use the sidebar to view your child's progress, attendance, grades, assessments, and fee status.</p>
              </div>
            </div>
          )}

          {/* My Children */}
          {activeMenu === 'children' && (
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-6">My Children</h2>
              {students.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                  No children enrolled yet. Please contact the school admin.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map(student => (
                    <div key={student.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-4 border-[#4a235a]">
                          {student.photo ? (
                            <img src={`${student.photo}`} alt={student.firstName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#4a235a] font-bold text-xl">
                              {student.firstName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#4a235a]">{student.firstName} {student.lastName}</h3>
                          <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full mt-1">{student.studentId}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Grade</span>
                          <span className="font-bold text-[#4a235a]">{student.gradeLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gender</span>
                          <span className="font-bold text-[#4a235a]">{student.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{student.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendance */}
          {activeMenu === 'attendance' && (
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-1">Attendance Record</h2>
                  <p className="text-gray-500 text-sm">Daily attendance updates recorded by teachers.</p>
                </div>
                {students.length > 0 && (
                  <select
                    value={selectedChild?.id || ''}
                    onChange={e => setSelectedChild(students.find(student => student.id.toString() === e.target.value))}
                    className="bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4a235a] text-gray-700"
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  ['Attendance', `${contextualAttendancePercentage}%`, 'bg-[#4a235a]', 'text-purple-100'],
                  ['Present', contextualAttendanceSummary.present, 'bg-[#0f6e56]', 'text-green-100'],
                  ['Absent', contextualAttendanceSummary.absent, 'bg-red-500', 'text-red-100'],
                  ['Late', contextualAttendanceSummary.late, 'bg-blue-500', 'text-cyan-700/80'],
                ].map(([label, value, color, textColor]) => (
                  <div key={label} className={`${color} text-white rounded-2xl p-5 shadow-sm`}>
                    <p className={`${textColor} text-xs font-bold uppercase tracking-wide`}>{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {attendanceError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {attendanceError}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#4a235a] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Class</th>
                      <th className="px-6 py-4 text-left">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading attendance records...</td>
                      </tr>
                    ) : contextualAttendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No attendance records available yet.</td>
                      </tr>
                    ) : contextualAttendanceRecords.map((record, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="px-6 py-4 font-medium text-[#4a235a]">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            record.status === 'present' ? 'bg-green-100 text-green-700' :
                            record.status === 'absent' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-cyan-700'
                          }`}>
                            {formatAttendanceStatus(record.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{record.gradeLevel}</td>
                        <td className="px-6 py-4 text-gray-500">{record.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grades */}
          {activeMenu === 'grades' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-1">Grades & Results</h2>
                <p className="text-gray-500 text-sm">View and download your child's approved academic results.</p>
              </div>

              {contextualApprovedResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                  No approved results available yet. Please check back later.
                </div>
              ) : (
                <div className="space-y-4">
                  {contextualApprovedResults.map(result => (
                    <div key={result.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between flex-wrap gap-4">

                        {/* Info */}
                        <div>
                          <h3 className="font-bold text-[#4a235a] text-lg">{result.student?.firstName} {result.student?.lastName}</h3>
                          <p className="text-sm text-gray-500">{result.student?.studentId} | {result.gradeLevel}</p>
                          <p className="text-sm text-gray-400">{result.academicYear} | {result.term}</p>
                          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mt-2">
                            Approved
                          </span>
                        </div>

                        {/* Subject Summary */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="grid grid-cols-3 gap-2">
                            {SUBJECTS.map(subject => {
                              const s = getSubjectScore(result.scores || {}, subject)
                              const total = getSubjectTotal(s)
                              const getGrade = (t) => {
                                if (t >= 90) return 'A+'
                                if (t >= 80) return 'A'
                                if (t >= 70) return 'B+'
                                if (t >= 60) return 'B'
                                if (t >= 50) return 'C'
                                if (t >= 40) return 'D'
                                return 'F'
                              }
                              return (
                                <div key={subject} className="bg-blue-50 rounded-lg p-2 text-center">
                                  <p className="text-xs font-bold text-[#4a235a]">{subject}</p>
                                  <p className="text-sm font-bold text-gray-700">{total.toFixed(1)}</p>
                                  <p className="text-xs text-purple-600 font-bold">{getGrade(total)}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setViewingResult(result)}
                            className="bg-[#4a235a] hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                          >
                            View Full Result
                          </button>
                          <button
                            onClick={() => handleParentDownloadPDF(result)}
                            className="bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                          >
                            Download PDF
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assessments */}
          {activeMenu === 'assessments' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-1">Marked Assessments</h2>
                <p className="text-gray-500 text-sm">Only answered assignments and quizzes that have been marked are shown here.</p>
              </div>
              {markedAssessmentRecords.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                  No marked assessment submissions are available yet.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {parentAssessmentFolders.map(folder => {
                      const selected = folder.subject === selectedAssessmentSubject
                      return (
                        <button
                          key={folder.subject}
                          type="button"
                          onClick={() => setActiveAssessmentSubject(folder.subject)}
                          className="text-left bg-white rounded-2xl p-5 shadow-sm transition-all border"
                          style={{
                            borderColor: selected ? '#800080' : '#e5e7eb',
                            boxShadow: selected ? '0 12px 24px rgba(128,0,128,0.12)' : undefined
                          }}
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selected ? '#faf5ff' : '#eff6ff', color: selected ? '#800080' : '#2563eb' }}>
                              <FolderOpen size={26} />
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-50 text-gray-500">
                              {folder.total} marked
                            </span>
                          </div>
                          <p className="font-bold text-base mb-2 text-[#4a235a]">{folder.subject}</p>
                          <p className="text-xs text-gray-500">
                            {folder.assignments} assignment{folder.assignments === 1 ? '' : 's'} | {folder.quizzes} quiz{folder.quizzes === 1 ? '' : 'zes'}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#4a235a] mb-4">{selectedAssessmentSubject} Folder</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {visibleMarkedAssessmentRecords.map((assignment, index) => (
                        <div key={`${assignment.itemId}-${assignment.learnerEmail || assignment.learnerName}-${index}`} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 bg-green-100 text-green-700">
                                {assignment.type === 'quiz' ? 'Quiz marked' : 'Assignment marked'}
                              </span>
                              <h3 className="text-lg font-bold text-[#4a235a] mb-1">{assignment.title}</h3>
                              <p className="text-sm text-gray-500">{assignment.subject || 'Assignment'} {assignment.gradeLevel ? `| ${assignment.gradeLevel}` : ''}</p>
                              <p className="text-xs font-bold text-gray-400 mt-1">{assignment.academicYear || selectedAcademicYear} | {assignment.term || selectedTerm}</p>
                            </div>
                            <div className="text-right text-xs text-gray-400">
                              <p>Submitted: {formatDateTime(assignment.submittedAt)}</p>
                              <p>Marked: {formatDateTime(assignment.markedAt)}</p>
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-4 mb-4">
                            <p className="text-xs font-bold text-[#4a235a] mb-1">Child</p>
                            <p className="text-sm text-gray-700">{assignment.learnerName || 'Learner'}</p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-4 mb-4">
                            <p className="text-xs font-bold text-[#4a235a] mb-3">Questions & Answers</p>
                            <div className="space-y-3">
                              {(assignment.questions?.length ? assignment.questions : [{ prompt: assignment.description || assignment.title, selected: assignment.answer }]).map((question, questionIndex) => (
                                <div key={questionIndex} className="bg-white rounded-lg border border-gray-100 p-3">
                                  <p className="text-sm font-bold text-[#4a235a]">Q{questionIndex + 1}. {question.prompt || 'Question'}</p>
                                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">Answer: {question.selected || 'No answer recorded.'}</p>
                                  {question.answer && !['short-answer', 'paragraph'].includes(question.type) && (
                                    <p className="text-xs text-gray-500 mt-1">Expected answer: {question.answer}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-green-700 mb-1">Teacher Mark</p>
                            <p className="text-sm text-gray-700">Score: {assignment.score || 'Marked'}{assignment.totalQuestions ? ` / ${assignment.totalQuestions}` : ''}</p>
                            {assignment.feedback && <p className="text-sm text-gray-700 mt-1">Feedback: {assignment.feedback}</p>}
                            <p className="text-xs text-gray-500 mt-2">Marked by {assignment.markedBy || 'Teacher'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fee Status */}
          {activeMenu === 'fees' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-1">Fee Status</h2>
                <p className="text-gray-500 text-sm">View your child's fee payment records.</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#4a235a] text-white rounded-2xl p-6 shadow-md">
                  <p className="text-purple-200 text-sm mb-1">Total Paid</p>
                  <p className="text-3xl font-bold">GH₵ {contextualFeePayments.reduce((acc, p) => acc + p.amountPaid, 0).toFixed(2)}</p>
                </div>
                <div className="bg-red-500 text-white rounded-2xl p-6 shadow-md">
                  <p className="text-red-100 text-sm mb-1">Total Balance</p>
                  <p className="text-3xl font-bold">GH₵ {contextualFeePayments.reduce((acc, p) => acc + p.balance, 0).toFixed(2)}</p>
                </div>
                <div className="bg-[#0f6e56] text-white rounded-2xl p-6 shadow-md">
                  <p className="text-green-200 text-sm mb-1">Months Paid</p>
                  <p className="text-3xl font-bold">{contextualFeePayments.filter(p => p.status === 'paid').length}</p>
                </div>
              </div>

              {/* Payments Table */}
              {contextualFeePayments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                  No fee records found for your child.
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#4a235a] text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">Student</th>
                        <th className="px-6 py-4 text-left">Month</th>
                        <th className="px-6 py-4 text-left">Year</th>
                        <th className="px-6 py-4 text-left">Amount Due</th>
                        <th className="px-6 py-4 text-left">Amount Paid</th>
                        <th className="px-6 py-4 text-left">Balance</th>
                        <th className="px-6 py-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contextualFeePayments.map((payment, index) => (
                        <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-6 py-4 font-medium text-[#4a235a]">{payment.student?.firstName} {payment.student?.lastName}</td>
                          <td className="px-6 py-4 text-gray-600">{payment.month}</td>
                          <td className="px-6 py-4 text-gray-600">{payment.year}</td>
                          <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountDue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountPaid.toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-600">GH₵ {payment.balance.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                              payment.status === 'partial' ? 'bg-blue-100 text-cyan-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {activeMenu === 'messages' && <ParentMessages />}
        </div>
      </div>
    {/* View Full Result Modal */}
      {viewingResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif">Student Academic Report</h2>
                <p className="text-cyan-100 text-sm">{viewingResult.academicYear} | {viewingResult.term}</p>
              </div>
              <button onClick={() => setViewingResult(null)} className="hover:text-cyan-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">

              {/* Gold bar */}
              <div className="h-1 bg-blue-500 rounded-full mb-6"></div>

              {/* Student Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="font-bold text-cyan-700">{viewingResult.student?.firstName} {viewingResult.student?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="font-bold text-cyan-700">{viewingResult.student?.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-bold text-cyan-700">{viewingResult.gradeLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-bold text-cyan-700">{viewingResult.student?.gender}</p>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="rounded-xl overflow-hidden border border-gray-100 mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-center">Class(10)</th>
                      <th className="px-4 py-3 text-center">CAT1(20)</th>
                      <th className="px-4 py-3 text-center">CAT2(20)</th>
                      <th className="px-4 py-3 text-center">Exam(50)</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBJECTS.map((subject, index) => {
                      const s = getSubjectScore(viewingResult.scores || {}, subject)
                      const classScore = parseFloat(s.classScore) || 0
                      const cat1 = parseFloat(s.cat1) || 0
                      const cat2 = parseFloat(s.cat2) || 0
                      const exam = parseFloat(s.exam) || 0
                      const wExam = (exam / 100) * 50
                      const total = getSubjectTotal(s)
                      const getGrade = (t) => {
                        if (t >= 90) return 'A+'
                        if (t >= 80) return 'A'
                        if (t >= 70) return 'B+'
                        if (t >= 60) return 'B'
                        if (t >= 50) return 'C'
                        if (t >= 40) return 'D'
                        return 'F'
                      }
                      const getGradeColor = (t) => {
                        if (t >= 80) return 'text-green-600'
                        if (t >= 60) return 'text-blue-600'
                        if (t >= 50) return 'text-[#c0008f]'
                        return 'text-red-600'
                      }
                      return (
                        <tr key={subject} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-4 py-3 font-bold text-cyan-700">{subject}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{classScore}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{cat1}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{cat2}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{wExam.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-700">{total.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-center font-bold ${getGradeColor(total)}`}>{getGrade(total)}</td>
                        </tr>
                      )
                    })}
                    {/* Grand Total Row */}
                    <tr className="bg-blue-500">
                      <td colSpan="5" className="px-4 py-3 font-bold text-cyan-700">Grand Total</td>
                      <td className="px-4 py-3 text-center font-bold text-cyan-700">
                        {calculateGrandTotal(viewingResult.scores || {}).toFixed(2)} / 1100
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-bold text-cyan-700 mb-1">Class Teacher's Remarks</p>
                <p className="text-sm text-gray-600 italic">{viewingResult.remarks || 'No remarks provided.'}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleParentDownloadPDF(viewingResult)}
                  className="flex-1 bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold py-3 rounded-xl transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setViewingResult(null)}
                  className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    {showChangePassword && (
      <ChangePasswordModal
        onClose={() => setShowChangePassword(false)}
        accentColor="#800080"
      />
    )}
    </div>
  )
}
