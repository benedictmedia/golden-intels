import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard, Users, ClipboardList, BookOpen,
  FileText, GraduationCap, LogOut, Menu, X, Bell
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import API_URL from '../../api/config'
import { SUBJECTS, calculateGrandTotal, getNormalizedScores, getRemarksText, getSubjectScore, getSubjectTotal, normalizeSubjectName } from '../../utils/subjects'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={20} />, label: 'My Classes', id: 'classes' },
  { icon: <ClipboardList size={20} />, label: 'Attendance', id: 'attendance' },
  { icon: <BookOpen size={20} />, label: 'Gradebook', id: 'gradebook' },
  { icon: <FileText size={20} />, label: 'Assignments', id: 'assignments' },
  { icon: <GraduationCap size={20} />, label: 'LMS', id: 'lms' },
]

export default function TeacherDashboard() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileUser, setProfileUser] = useState(user)
  const [students, setStudents] = useState([])
  const [activeClass, setActiveClass] = useState('Year 1')
  const [attendance, setAttendance] = useState({})
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 10)
  })
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceSaving, setAttendanceSaving] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')
  const [attendanceSaved, setAttendanceSaved] = useState(false)
  const [grades, setGrades] = useState({})
  const [gradesSaved, setGradesSaved] = useState(false)
  const [gradebookClass, setGradebookClass] = useState('Year 1')
  const [gradebookYear, setGradebookYear] = useState('2025/2026')
  const [gradebookTerm, setGradebookTerm] = useState('Term 1')
  const [gradebookStudent, setGradebookStudent] = useState('')
  const [subjectScores, setSubjectScores] = useState({})
  const [teacherRemarks, setTeacherRemarks] = useState('')
  const [gradebookSubmitted, setGradebookSubmitted] = useState(false)
  const [submittedResults, setSubmittedResults] = useState([])
  const [editingResult, setEditingResult] = useState(null)
  const [currentResult, setCurrentResult] = useState(null)
  const [gradebookLoading, setGradebookLoading] = useState(false)
  const [gradebookError, setGradebookError] = useState('')
  const [activeGradebookTab, setActiveGradebookTab] = useState('enter')

  const normalizeSubjectKey = (value) => normalizeSubjectName(value).toLowerCase()
  const classes = ['Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']
  const normalizeClassKey = (value) => String(value ?? '').trim().toLowerCase()
  const canonicalizeClass = (value) => {
    const normalizedValue = normalizeClassKey(value)
    if (!normalizedValue) return ''
    return classes.find(cls => normalizeClassKey(cls) === normalizedValue) || String(value ?? '').trim()
  }
  const matchesClass = (gradeLevel, targetClass) => normalizeClassKey(gradeLevel) === normalizeClassKey(targetClass)
  const effectiveUser = profileUser || user
  const assignedClassOptions = Array.from(
    new Set((effectiveUser?.classes || []).map(canonicalizeClass).filter(Boolean))
  )
  const classTeacherClassOptions = Array.from(
    new Set((effectiveUser?.classTeacherClasses || []).map(canonicalizeClass).filter(Boolean))
  )
  const teacherClassOptions = Array.from(
    new Set([...assignedClassOptions, ...classTeacherClassOptions])
  )
  const classOptions = teacherClassOptions.length ? teacherClassOptions : classes
  const teacherSubjectOptions = effectiveUser?.subjects?.length ? effectiveUser.subjects : SUBJECTS
  const normalizedTeacherSubjectKeys = new Set((teacherSubjectOptions || []).map(normalizeSubjectKey))

  useEffect(() => {
    let mounted = true

    const syncProfile = async () => {
      const refreshedUser = await refreshUser()
      if (mounted) {
        setProfileUser(refreshedUser || user)
      }
    }

    syncProfile()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
  if (activeMenu === 'classes' || activeMenu === 'attendance' || activeMenu === 'gradebook') {
    const token = localStorage.getItem('token')
    axios.get(`${API_URL}/api/students`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStudents(res.data))
      .catch(err => console.error('Failed to fetch students:', err))
  }
}, [activeMenu])

  useEffect(() => {
    if (activeMenu !== 'attendance') return
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    setAttendanceLoading(true)
    setAttendanceError('')
    axios.get(`${API_URL}/api/attendance`, {
      headers,
      params: { date: attendanceDate, gradeLevel: activeClass }
    })
      .then(res => {
        setAttendanceRecords(res.data)
        const nextAttendance = {}
        res.data.forEach(record => {
          nextAttendance[record.studentId] = record.status
        })
        setAttendance(nextAttendance)
      })
      .catch(err => {
        console.error('Failed to fetch attendance:', err)
        setAttendanceError('Unable to load attendance for this date.')
      })
      .finally(() => setAttendanceLoading(false))
  }, [activeMenu, activeClass, attendanceDate])

  useEffect(() => {
    if (activeMenu !== 'gradebook') return

    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    axios.get(`${API_URL}/api/results`, { headers })
      .then(res => setSubmittedResults(res.data))
      .catch(err => console.error('Failed to fetch results:', err))

    axios.get(`${API_URL}/api/students`, { headers })
      .then(res => setStudents(res.data))
      .catch(err => console.error('Failed to fetch students:', err))
  }, [activeMenu])

  useEffect(() => {
    if (activeMenu !== 'gradebook' || !gradebookStudent || editingResult) return

    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    setGradebookLoading(true)
    setGradebookError('')

    axios.get(`${API_URL}/api/results/student/${gradebookStudent}`, { headers })
      .then(res => {
        const match = res.data.find(result =>
          matchesClass(result.gradeLevel, gradebookClass) &&
          result.academicYear === gradebookYear &&
          result.term === gradebookTerm
        )

        setCurrentResult(match || null)
        if (match) {
          setSubjectScores(getNormalizedScores(match.scores || {}))
          setTeacherRemarks(match.remarks || '')
        } else {
          setSubjectScores({})
          setTeacherRemarks('')
        }
      })
      .catch(err => {
        console.error('Failed to load current result:', err)
        setGradebookError('Unable to load the current result. You can still enter a new one.')
      })
      .finally(() => setGradebookLoading(false))
  }, [activeMenu, gradebookStudent, gradebookClass, gradebookYear, gradebookTerm, editingResult])

  const getEditableSubjectScores = () => {
    const editableScores = {}
    Object.entries(subjectScores || {}).forEach(([subject, score]) => {
      if (normalizedTeacherSubjectKeys.has(normalizeSubjectKey(subject))) {
        editableScores[subject] = score
      }
    })
    return editableScores
  }

  const handleGradebookSubmit = async () => {
    if (!gradebookStudent) return

    const payloadScores = getEditableSubjectScores()
    if (!Object.keys(payloadScores).length) {
      alert('You do not have any assigned subjects for this class. Please contact admin to update your assignments.')
      return
    }

    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      if (editingResult) {
        const res = await axios.put(`${API_URL}/api/results/${editingResult.id}`, {
          scores: payloadScores,
          remarks: teacherRemarks,
          status: 'pending'
        }, { headers })
        setSubmittedResults(submittedResults.map(r => r.id === editingResult.id ? res.data : r))
        setEditingResult(null)
      } else {
        const res = await axios.post(`${API_URL}/api/results`, {
          studentId: gradebookStudent,
          gradeLevel: gradebookClass,
          academicYear: gradebookYear,
          term: gradebookTerm,
          scores: payloadScores,
          remarks: teacherRemarks,
          submittedBy: user?.name
        }, { headers })
        setSubmittedResults([res.data, ...submittedResults])
      }

      setGradebookSubmitted(true)
      setCurrentResult(editingResult ? null : currentResult)
      setSubjectScores({})
      setTeacherRemarks('')
      setActiveGradebookTab('submitted')
      setTimeout(() => setGradebookSubmitted(false), 4000)
    } catch (error) {
      console.error('Submit error:', error)
      alert(error?.response?.data?.message || 'Failed to submit results. Please try again.')
    }
  }

  const handleEditResult = (result) => {
    setEditingResult(result)
    setCurrentResult(result)
    setGradebookClass(result.gradeLevel)
    setGradebookYear(result.academicYear)
    setGradebookTerm(result.term)
    setGradebookStudent(result.studentId.toString())
    setSubjectScores(getNormalizedScores(result.scores || {}))
    setTeacherRemarks(result.remarks || '')
    setActiveGradebookTab('enter')
  }

  const handleDeleteResult = async (id) => {
  if (!window.confirm('Are you sure you want to delete this result?')) return
  const token = localStorage.getItem('token')
  try {
    await axios.delete(`${API_URL}/api/results/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setSubmittedResults(submittedResults.filter(r => r.id !== id))
  } catch (error) {
    alert('Failed to delete result.')
  }
}

  const handleDownloadPDF = async (result) => {
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

    // Navy header background
    doc.setFillColor(26, 60, 110)
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Gold accent bar
    doc.setFillColor(212, 160, 23)
    doc.rect(0, 45, pageWidth, 4, 'F')

    // Logo in header - larger
    if (logoData) {
      doc.addImage(logoData, 'PNG', 12, 5, 32, 32)
    }

    // School name in header
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

    // Report title bar
    doc.setFillColor(240, 245, 255)
    doc.rect(0, 49, pageWidth, 12, 'F')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 60, 110)
    doc.text('STUDENT ACADEMIC REPORT', pageWidth / 2, 57, { align: 'center' })

    // Student info section
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

    // Subjects table header
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
    const remarksHeight = 12

    doc.setFillColor(240, 245, 255); doc.rect(10, y, pageWidth - 20, remarksHeight, 'F')
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.4); doc.rect(10, y, pageWidth - 20, remarksHeight)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 60, 110)
    doc.text("Class Teacher's Remarks:", 15, y + 4.5)
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(50, 50, 50)
    doc.text(clampedRemarksLines, 15, y + 9)
    y += remarksHeight + 4

    // Inline footer — follows content directly
    doc.setFillColor(26, 60, 110); doc.rect(0, y, pageWidth, 11, 'F')
    doc.setFillColor(212, 160, 23); doc.rect(0, y, pageWidth, 1.5, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255)
    doc.text('GOLDEN-INTELS INTERNATIONAL SCHOOL', pageWidth / 2, y + 5.5, { align: 'center' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(212, 160, 23)
    doc.text('We Nurture for Nature', pageWidth / 2, y + 9.5, { align: 'center' })
    doc.save(`${student.firstName}_${student.lastName}_${result.term}_${result.academicYear}.pdf`)
  }

  const handleSubjectScore = (subject, field, value) => {
    setSubjectScores(prev => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: value }
    }))
  }

  const isClassTeacherForSelectedClass = classTeacherClassOptions.some(cls => matchesClass(gradebookClass, cls))
  const visibleSubjects = isClassTeacherForSelectedClass
    ? SUBJECTS
    : SUBJECTS.filter(subject => normalizedTeacherSubjectKeys.has(normalizeSubjectKey(subject)))

  const totalAllSubjects = calculateGrandTotal(subjectScores, visibleSubjects)

  const subjectsCompleted = visibleSubjects.filter(subject => {
    const scores = subjectScores[subject] || {}
    return scores.classScore && scores.cat1 && scores.cat2 && scores.exam
  }).length

  const [assignments, setAssignments] = useState([])
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [newAssignment, setNewAssignment] = useState({ title: '', subject: '', dueDate: '', dueTime: '', description: '', gradeLevel: 'Year 1' })
  const [lessons, setLessons] = useState([])
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [newLesson, setNewLesson] = useState({ title: '', subject: '', gradeLevel: 'Year 1', content: '' })
  const [quizzes, setQuizzes] = useState([])
  const [showAddQuiz, setShowAddQuiz] = useState(false)
  const [newQuiz, setNewQuiz] = useState({ title: '', subject: '', gradeLevel: 'Year 1', dueDate: '', dueTime: '', durationMinutes: 30, questions: [{ prompt: '', type: 'multiple-choice', options: ['', '', '', ''], answer: '' }], published: false })
  const [lmsView, setLmsView] = useState('resources')
  const [lmsItemView, setLmsItemView] = useState(null)
  const [editingLmsItem, setEditingLmsItem] = useState(null)
  const [submissionRecords, setSubmissionRecords] = useState([])

  useEffect(() => {
    const saved = window.localStorage.getItem('goldenIntelsLms')
    if (saved) {
      const parsed = JSON.parse(saved)
      setAssignments(parsed.assignments || [])
      setLessons(parsed.lessons || [])
      setQuizzes(parsed.quizzes || [])
    }
    const savedSubmissions = window.localStorage.getItem('goldenIntelsSubmissionRecords')
    if (savedSubmissions) {
      setSubmissionRecords(JSON.parse(savedSubmissions))
    }
  }, [])

  useEffect(() => {
    if (!classOptions.length) return
    if (!classOptions.some(cls => matchesClass(activeClass, cls))) {
      setActiveClass(classOptions[0])
    }
  }, [classOptions, activeClass])

  useEffect(() => {
    if (!classOptions.length) return
    if (!classOptions.some(cls => matchesClass(gradebookClass, cls))) {
      setGradebookClass(classOptions[0])
      setGradebookStudent('')
    }
  }, [classOptions, gradebookClass])

  useEffect(() => {
    window.localStorage.setItem('goldenIntelsLms', JSON.stringify({ assignments, lessons, quizzes }))
  }, [assignments, lessons, quizzes])

  useEffect(() => {
    window.localStorage.setItem('goldenIntelsSubmissionRecords', JSON.stringify(submissionRecords))
  }, [submissionRecords])

  useEffect(() => {
  if (activeMenu === 'classes' || activeMenu === 'attendance' || activeMenu === 'gradebook') {
    const token = localStorage.getItem('token')
    axios.get(`${API_URL}/api/students`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStudents(res.data))
      .catch(err => console.error('Failed to fetch students:', err))
  }
}, [activeMenu])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filteredStudents = students.filter(student => matchesClass(student.gradeLevel, activeClass))
  const attendanceStats = filteredStudents.reduce((stats, student) => {
    const status = attendance[student.id] || 'present'
    return { ...stats, [status]: (stats[status] || 0) + 1 }
  }, { present: 0, absent: 0, late: 0 })
  const attendanceCompletion = filteredStudents.length
    ? Math.round((Object.keys(attendance).filter(id => filteredStudents.some(s => s.id.toString() === id.toString())).length / filteredStudents.length) * 100)
    : 0

  const handleAttendance = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status })
  }

  const saveAttendance = async () => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    const classStudents = students.filter(student => matchesClass(student.gradeLevel, activeClass))
    setAttendanceSaving(true)
    setAttendanceError('')
    try {
      await axios.post(`${API_URL}/api/attendance`, {
        date: attendanceDate,
        gradeLevel: activeClass,
        recordedBy: user?.name || 'Teacher',
        records: classStudents.map(student => ({
          studentId: student.id,
          status: attendance[student.id] || 'present'
        }))
      }, { headers })
      const res = await axios.get(`${API_URL}/api/attendance`, {
        headers,
        params: { date: attendanceDate, gradeLevel: activeClass }
      })
      setAttendanceRecords(res.data)
      const nextAttendance = {}
      res.data.forEach(record => {
        nextAttendance[record.studentId] = record.status
      })
      setAttendance(nextAttendance)
      setAttendanceSaved(true)
      setTimeout(() => setAttendanceSaved(false), 3000)
    } catch (error) {
      console.error('Save attendance error:', error)
      setAttendanceError('Failed to save attendance. Please try again.')
    } finally {
      setAttendanceSaving(false)
    }
  }

  const handleGrade = (studentId, value) => {
    setGrades({ ...grades, [studentId]: value })
  }

  const saveGrades = () => {
    setGradesSaved(true)
    setTimeout(() => setGradesSaved(false), 3000)
  }

  const formatDateTime = (value) => {
    if (!value) return '-'
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-')
      return `${day}/${month}/${year}`
    }
    const date = new Date(value)
    return isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  const combineDateTime = (date, time) => {
    if (!date) return ''
    if (!time) return date
    return `${date}T${time}`
  }

  const resetLmsForm = () => {
    setEditingLmsItem(null)
    setLmsItemView(null)
    setNewAssignment({ title: '', subject: '', dueDate: '', dueTime: '', description: '', gradeLevel: 'Year 1' })
    setNewLesson({ title: '', subject: '', gradeLevel: 'Year 1', content: '' })
    setNewQuiz({ title: '', subject: '', gradeLevel: 'Year 1', dueDate: '', dueTime: '', durationMinutes: 30, questions: [{ prompt: '', type: 'multiple-choice', options: ['', '', '', ''], answer: '' }], published: false })
  }

  const handleViewLmsItem = (item, type) => {
    setShowAddAssignment(false)
    setShowAddLesson(false)
    setShowAddQuiz(false)
    setLmsItemView({ item, type })
  }

  const handleDownloadSubmissionPdf = (record) => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Student Submission Report', 14, 20)
    doc.setFontSize(11)
    doc.text(`Student: ${record.learnerName || 'Unknown'}`, 14, 34)
    doc.text(`Email: ${record.learnerEmail || 'Unknown'}`, 14, 40)
    doc.text(`Device: ${record.device || 'Unknown'}`, 14, 46)
    doc.text(`Submitted: ${formatDateTime(record.submittedAt)}`, 14, 52)
    doc.text(`Time used: ${record.timeUsedSeconds != null ? `${Math.round(record.timeUsedSeconds)} sec` : 'N/A'}`, 14, 58)
    doc.text(`Resource: ${record.type} - ${record.title || record.itemTitle || 'N/A'}`, 14, 64)
    if (record.score != null) {
      doc.text(`Score: ${record.score} / ${record.totalQuestions ?? record.questions?.length ?? 'N/A'}`, 14, 70)
    }
    doc.text('Answers:', 14, 82)
    let y = 88
    ;(record.questions || []).forEach((question, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(`Q${index + 1}: ${question.prompt}`, 14, y)
      y += 6
      doc.text(`Your: ${question.selected || 'N/A'}`, 18, y)
      y += 6
      doc.text(`Correct: ${question.answer || 'N/A'}`, 18, y)
      y += 8
    })
    doc.save(`${record.learnerName || 'student'}-${record.type}-submission.pdf`)
  }

  const handleEditLmsItem = (item, type) => {
    setEditingLmsItem({ item, type })
    setLmsItemView({ item, type })
    if (type === 'assignment') {
      const parsedDate = item.dueDate ? new Date(item.dueDate) : null
      setNewAssignment({
        title: item.title,
        subject: item.subject,
        dueDate: parsedDate ? parsedDate.toISOString().slice(0, 10) : item.dueDate || '',
        dueTime: parsedDate ? parsedDate.toISOString().slice(11, 16) : (item.dueTime || ''),
        description: item.description,
        gradeLevel: item.gradeLevel
      })
      setShowAddAssignment(true)
      setShowAddLesson(false)
      setShowAddQuiz(false)
    }
    if (type === 'lesson') {
      setNewLesson({ title: item.title, subject: item.subject, gradeLevel: item.gradeLevel, content: item.content })
      setShowAddLesson(true)
      setShowAddAssignment(false)
      setShowAddQuiz(false)
    }
    if (type === 'quiz') {
      const parsedDate = item.dueDate ? new Date(item.dueDate) : null
      setNewQuiz({
        title: item.title,
        subject: item.subject,
        gradeLevel: item.gradeLevel,
        dueDate: parsedDate ? parsedDate.toISOString().slice(0, 10) : item.dueDate || '',
        dueTime: parsedDate ? parsedDate.toISOString().slice(11, 16) : (item.dueTime || ''),
        durationMinutes: item.durationMinutes,
        questions: item.questions?.map(q => ({ type: q.type || 'multiple-choice', prompt: q.prompt, options: q.options || ['', '', '', ''], answer: q.answer })) || [{ prompt: '', type: 'multiple-choice', options: ['', '', '', ''], answer: '' }],
        published: item.published
      })
      setShowAddQuiz(true)
      setShowAddAssignment(false)
      setShowAddLesson(false)
    }
  }

  const handleDeleteLmsItem = (itemId, type) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    if (type === 'lesson') {
      setLessons(prev => prev.filter(item => item.id !== itemId))
    }
    if (type === 'assignment') {
      setAssignments(prev => prev.filter(item => item.id !== itemId))
    }
    if (type === 'quiz') {
      setQuizzes(prev => prev.filter(item => item.id !== itemId))
    }
    if (lmsItemView?.item?.id === itemId) setLmsItemView(null)
    if (editingLmsItem?.item?.id === itemId) resetLmsForm()
  }

  const handleAddAssignment = () => {
    if (!newAssignment.title) return
    const assignmentToSave = { ...newAssignment, dueDate: combineDateTime(newAssignment.dueDate, newAssignment.dueTime) }
    if (editingLmsItem?.type === 'assignment') {
      setAssignments(prev => prev.map(item => item.id === editingLmsItem.item.id ? { ...item, ...assignmentToSave, published: editingLmsItem.item.published } : item))
      setEditingLmsItem(null)
    } else {
      setAssignments([{ id: Date.now(), published: false, ...assignmentToSave }, ...assignments])
    }
    resetLmsForm()
    setShowAddAssignment(false)
  }

  const handleAddLesson = () => {
    if (!newLesson.title) return
    if (editingLmsItem?.type === 'lesson') {
      setLessons(prev => prev.map(item => item.id === editingLmsItem.item.id ? { ...item, ...newLesson, published: editingLmsItem.item.published } : item))
      setEditingLmsItem(null)
    } else {
      setLessons([{ id: Date.now(), published: false, ...newLesson }, ...lessons])
    }
    resetLmsForm()
    setShowAddLesson(false)
  }

  const handleAddQuiz = () => {
    if (!newQuiz.title || newQuiz.questions.length === 0) return
    const quizToSave = { ...newQuiz, dueDate: combineDateTime(newQuiz.dueDate, newQuiz.dueTime) }
    if (editingLmsItem?.type === 'quiz') {
      setQuizzes(prev => prev.map(item => item.id === editingLmsItem.item.id ? { ...item, ...quizToSave, published: editingLmsItem.item.published } : item))
      setEditingLmsItem(null)
    } else {
      setQuizzes([{ id: Date.now(), published: false, ...quizToSave }, ...quizzes])
    }
    resetLmsForm()
    setShowAddQuiz(false)
  }

  const handleQuizQuestionChange = (index, field, value) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }))
  }

  const handleQuizOptionChange = (questionIndex, optionIndex, value) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q
        const nextOptions = [...q.options]
        nextOptions[optionIndex] = value
        return { ...q, options: nextOptions }
      })
    }))
  }

  const addQuizQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { prompt: '', type: 'multiple-choice', options: ['', '', '', ''], answer: '' }]
    }))
  }

  const removeQuizQuestion = (index) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const togglePublishItem = (itemId, type) => {
    if (type === 'lesson') {
      setLessons(prev => prev.map(item => item.id === itemId ? { ...item, published: !item.published } : item))
    }
    if (type === 'assignment') {
      setAssignments(prev => prev.map(item => item.id === itemId ? { ...item, published: !item.published } : item))
    }
    if (type === 'quiz') {
      setQuizzes(prev => prev.map(item => item.id === itemId ? { ...item, published: !item.published } : item))
    }
  }

  return (
    <div className="flex h-screen bg-blue-100 overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0f6e56] text-white transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-green-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-cyan-700">G</div>
              <div>
                <p className="text-xs font-bold">Golden-Intels</p>
                <p className="text-xs text-cyan-100">Teacher Portal</p>
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
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeMenu === item.id ? 'bg-blue-500 text-cyan-700 font-bold' : 'hover:bg-green-800 text-green-200'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-green-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-800 text-green-200 transition-colors rounded-lg">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0f6e56] capitalize">{activeMenu.replace('-', ' ')}</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-[#0f6e56]">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-xs text-cyan-700 font-bold flex items-center justify-center">0</span>
            </button>
            <div className="w-9 h-9 bg-[#0f6e56] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Dashboard */}
          {activeMenu === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'My Students', value: students.length, color: 'bg-[#0f6e56]', textColor: 'text-green-200' },
                  { label: 'Assignments', value: assignments.length, color: 'bg-blue-600', textColor: 'text-cyan-100' },
                  { label: 'Lessons', value: lessons.length, color: 'bg-[#4a235a]', textColor: 'text-purple-200' },
                  { label: 'Classes', value: '1', color: 'bg-blue-500', textColor: 'text-cyan-700/80' },
                ].map((stat, index) => (
                  <div key={index} className={`${stat.color} text-white rounded-2xl p-6 shadow-md`}>
                    <p className={`${stat.textColor} text-sm mb-1`}>{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold font-serif text-[#0f6e56] mb-2">Teacher Dashboard</h2>
                <p className="text-gray-600">Welcome to your Teacher Portal. Use the sidebar to manage your classes, attendance, grades, assignments and lessons.</p>
              </div>
            </div>
          )}

          {/* My Classes */}
          {activeMenu === 'classes' && (
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#0f6e56] mb-6">My Classes</h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {teacherClassOptions.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setActiveClass(cls)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      activeClass === cls ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56] hover:bg-[#0f6e56] hover:text-white'
                    }`}
                  >
                    {cls}
                    <span className="ml-2 bg-blue-500 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {students.filter(s => s.gradeLevel === cls).length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f6e56] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Photo</th>
                      <th className="px-6 py-4 text-left">Student ID</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Gender</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No students in this class.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-[#0f6e56]">
                              {student.photo ? (
                                <img src={`${student.photo}`} alt={student.firstName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#0f6e56] font-bold text-sm">
                                  {student.firstName?.charAt(0)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full">{student.studentId}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-[#0f6e56]">{student.firstName} {student.lastName}</td>
                          <td className="px-6 py-4 text-gray-600">{student.gender}</td>
                          <td className="px-6 py-4">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{student.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Attendance */}
          {activeMenu === 'attendance' && (
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#0f6e56] mb-1">Attendance Register</h2>
                  <p className="text-gray-500 text-sm">Record daily class attendance by date. Saved records update parent dashboards immediately.</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                  <label className="block text-xs font-bold text-[#0f6e56] mb-1">Attendance Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={e => setAttendanceDate(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  ['Present', attendanceStats.present, 'bg-[#0f6e56]', 'text-green-100'],
                  ['Absent', attendanceStats.absent, 'bg-red-500', 'text-red-100'],
                  ['Late', attendanceStats.late, 'bg-blue-500', 'text-cyan-700/80'],
                  ['Marked', `${attendanceCompletion}%`, 'bg-blue-600', 'text-blue-100'],
                ].map(([label, value, color, textColor]) => (
                  <div key={label} className={`${color} text-white rounded-2xl p-5 shadow-sm`}>
                    <p className={`${textColor} text-xs font-bold uppercase tracking-wide`}>{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {classTeacherClassOptions.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setActiveClass(cls)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      activeClass === cls ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56] hover:bg-[#0f6e56] hover:text-white'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
              {classTeacherClassOptions.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  You are not assigned as class teacher for any class yet. Contact admin to add a class-teacher assignment.
                </div>
              )}
              {attendanceSaved && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  Attendance saved for {activeClass} on {new Date(attendanceDate).toLocaleDateString()}.
                </div>
              )}
              {attendanceError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {attendanceError}
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f6e56] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLoading ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400">Loading attendance records...</td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No students in this class.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#0f6e56]">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-400">{student.studentId}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex bg-blue-100 rounded-xl p-1">
                              {[
                                ['present', 'Present', 'bg-[#0f6e56] text-white'],
                                ['absent', 'Absent', 'bg-red-500 text-white'],
                                ['late', 'Late', 'bg-blue-500 text-cyan-700'],
                              ].map(([status, label, activeClassName]) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleAttendance(student.id, status)}
                                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                    (attendance[student.id] || 'present') === status ? activeClassName : 'text-gray-500 hover:text-[#0f6e56]'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {attendanceRecords.some(record => record.studentId === student.id) ? 'Saved' : 'Pending'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <button
                onClick={saveAttendance}
                disabled={attendanceSaving || filteredStudents.length === 0}
                className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {attendanceSaving ? 'Saving Attendance...' : 'Save Attendance'}
              </button>
            </div>
          )}

          {/* Gradebook */}
          {activeMenu === 'gradebook' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#0f6e56] mb-1">Gradebook</h2>
                <p className="text-gray-500 text-sm">Enter and manage student performance data.</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setActiveGradebookTab('enter')}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
                    activeGradebookTab === 'enter' ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56]'
                  }`}
                >
                  Enter Performance
                </button>
                <button
                  onClick={() => setActiveGradebookTab('submitted')}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
                    activeGradebookTab === 'submitted' ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56]'
                  }`}
                >
                  Submitted Results
                  <span className="ml-2 bg-blue-500 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {submittedResults.length}
                  </span>
                </button>
              </div>

              {gradebookSubmitted && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {editingResult ? 'Result updated successfully!' : 'Performance data submitted successfully for admin review!'}
                </div>
              )}

              {activeGradebookTab === 'submitted' && (
                <div>
                  {submittedResults.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                      No results submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submittedResults.map(result => (
                        <div key={result.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <h3 className="font-bold text-[#0f6e56] text-lg">{result.student?.firstName} {result.student?.lastName}</h3>
                              <p className="text-sm text-gray-500">{result.gradeLevel} | {result.academicYear} | {result.term}</p>
                              <p className="text-sm text-gray-400">Submitted by: {result.submittedBy} on {new Date(result.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                result.status === 'approved' ? 'bg-green-100 text-green-700' :
                                result.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-cyan-700'
                              }`}>
                                {result.status}
                              </span>
                              <button
                                onClick={() => handleEditResult(result)}
                                className="bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(result)}
                                className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
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

              {activeGradebookTab === 'enter' && (

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#0f6e56] mb-6">Enter Performance Data</h3>

                {/* Top Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-[#0f6e56] mb-2">Class <span className="text-red-500">*</span></label>
                    <select
                      value={gradebookClass}
                      onChange={e => { setGradebookClass(e.target.value); setGradebookStudent('') }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                    >
                      {teacherClassOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0f6e56] mb-2">Academic Year <span className="text-red-500">*</span></label>
                    <select
                      value={gradebookYear}
                      onChange={e => setGradebookYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                    >
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0f6e56] mb-2">Term <span className="text-red-500">*</span></label>
                    <select
                      value={gradebookTerm}
                      onChange={e => setGradebookTerm(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0f6e56] mb-2">Select Student <span className="text-red-500">*</span></label>
                    <select
                      value={gradebookStudent}
                      onChange={e => setGradebookStudent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                    >
                      <option value="">Choose a student...</option>
                      {students.filter(student => matchesClass(student.gradeLevel, gradebookClass)).map(student => (
                        <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject Scores */}
                <h4 className="text-md font-bold text-[#0f6e56] mb-4">Subject Scores</h4>
                {gradebookLoading && (
                  <p className="text-sm text-gray-500 mb-4">Loading the current result for this student...</p>
                )}
                {gradebookError && (
                  <p className="text-sm text-amber-600 mb-4">{gradebookError}</p>
                )}
                <div className="space-y-6 mb-8">
                  {visibleSubjects.map(subject => {
                    const scores = subjectScores[subject] || { classScore: '', cat1: '', cat2: '', exam: '' }
                    const editable = normalizedTeacherSubjectKeys.has(normalizeSubjectKey(subject))
                    const classScore = parseFloat(scores.classScore) || 0
                    const cat1 = parseFloat(scores.cat1) || 0
                    const cat2 = parseFloat(scores.cat2) || 0
                    const exam = parseFloat(scores.exam) || 0
                    const wExam = (exam / 100) * 50
                    const subjectTotal = classScore + cat1 + cat2 + wExam
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
                      <div key={subject} className="bg-blue-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <h5 className="text-md font-bold text-[#0f6e56]">{subject}</h5>
                          {!editable && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-700">Read-only</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Class Score (10%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.classScore}
                              onChange={e => handleSubjectScore(subject, 'classScore', e.target.value)}
                              readOnly={!editable}
                              className={`w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm ${!editable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            <p className="text-xs text-gray-400 mt-1">Max: 10</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">CAT 1 (20%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.cat1}
                              onChange={e => handleSubjectScore(subject, 'cat1', e.target.value)}
                              readOnly={!editable}
                              className={`w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm ${!editable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            <p className="text-xs text-gray-400 mt-1">Max: 20</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">CAT 2 (20%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.cat2}
                              onChange={e => handleSubjectScore(subject, 'cat2', e.target.value)}
                              readOnly={!editable}
                              className={`w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm ${!editable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            <p className="text-xs text-gray-400 mt-1">Max: 20</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Exam Score (50%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.exam}
                              onChange={e => handleSubjectScore(subject, 'exam', e.target.value)}
                              readOnly={!editable}
                              className={`w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm ${!editable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            <p className="text-xs text-gray-400 mt-1">Weighted: {wExam.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="bg-[#0f6e56] text-white rounded-xl px-4 py-2 text-sm font-bold">
                            Total: {subjectTotal.toFixed(2)}/100
                          </div>
                          <div className="bg-blue-500 text-cyan-700 rounded-xl px-4 py-2 text-sm font-bold">
                            Grade: {subjectTotal > 0 ? getGrade(subjectTotal) : '-'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Teacher Remarks */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-[#0f6e56] mb-2">Class Teacher's Remarks</label>
                  <p className="text-xs text-gray-400 mb-2">
                    {isClassTeacherForSelectedClass
                      ? 'Provide constructive feedback on the student\'s overall performance across all subjects.'
                      : 'Only class teachers can edit remarks for this class.'}
                  </p>
                  <textarea
                    value={teacherRemarks}
                    onChange={e => setTeacherRemarks(e.target.value)}
                    rows={4}
                    placeholder={isClassTeacherForSelectedClass ? 'Enter remarks here...' : 'Remarks are read-only for non-class teachers.'}
                    readOnly={!isClassTeacherForSelectedClass}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 ${!isClassTeacherForSelectedClass ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                {/* Summary */}
                <div className="bg-blue-50 rounded-2xl p-6 mb-6 flex flex-wrap gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Total Score (All Subjects)</p>
                    <p className="text-2xl font-bold text-[#0f6e56]">{totalAllSubjects.toFixed(2)}/1100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subjects Completed</p>
                    <p className="text-2xl font-bold text-[#0f6e56]">{subjectsCompleted}/{visibleSubjects.length}</p>
                  </div>
                </div>

                {/* Submit Button */}
                {gradebookSubmitted && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
                    Performance data submitted successfully for admin review!
                  </div>
                )}
                
             <button
                  onClick={handleGradebookSubmit}
                  disabled={!gradebookStudent}
                  className="w-full bg-[#0f6e56] hover:bg-[#085041] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg"
                >
                  {editingResult ? 'Update Result' : 'Preview and Submit Entry'}
                </button>
              </div>
              )}
            </div>
          )}
          {/* Assignments */}
          {activeMenu === 'assignments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#0f6e56]">Assignments</h2>
                <button
                  onClick={() => setShowAddAssignment(true)}
                  className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                >
                  + New Assignment
                </button>
              </div>

              {showAddAssignment && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-bold text-[#0f6e56] mb-6">Create Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Title</label>
                      <input type="text" value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Subject</label>
                      {teacherSubjectOptions.length > 0 ? (
                        <select value={newAssignment.subject} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                          <option value="">Choose subject</option>
                          {teacherSubjectOptions.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                        </select>
                      ) : (
                        <input type="text" value={newAssignment.subject} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Grade Level</label>
                      <select value={newAssignment.gradeLevel} onChange={e => setNewAssignment({ ...newAssignment, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                        {teacherClassOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Due Date</label>
                      <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Due Time</label>
                      <input type="time" value={newAssignment.dueTime} onChange={e => setNewAssignment({ ...newAssignment, dueTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Description</label>
                      <textarea value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={handleAddAssignment} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Assignment</button>
                    <button onClick={() => setShowAddAssignment(false)} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.length === 0 ? (
                  <div className="col-span-3 bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                    No assignments yet. Click "New Assignment" to create one.
                  </div>
                ) : (
                  assignments.map(assignment => (
                    <div key={assignment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full mb-3">{assignment.gradeLevel}</span>
                      <h3 className="text-lg font-bold text-[#0f6e56] mb-1">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{assignment.subject}</p>
                      <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                      <p className="text-xs text-gray-400">Due: {assignment.dueDate}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* LMS */}
          {activeMenu === 'lms' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#0f6e56]">Learning Management System</h2>
                  <p className="text-gray-500">Create lessons, publish assignments, and send quizzes learners can answer online.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setLmsView('resources')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${lmsView === 'resources' ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56]'}`}>Resources</button>
                  <button onClick={() => setLmsView('assignments')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${lmsView === 'assignments' ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56]'}`}>Assignments</button>
                  <button onClick={() => setLmsView('quizzes')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${lmsView === 'quizzes' ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56]'}`}>Quizzes</button>
                  <button onClick={() => setLmsView('submissions')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${lmsView === 'submissions' ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56]'}`}>Submissions</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Published Lessons</p>
                  <p className="text-3xl font-bold text-[#0f6e56]">{lessons.filter(item => item.published).length}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Published Assignments</p>
                  <p className="text-3xl font-bold text-[#0f6e56]">{assignments.filter(item => item.published).length}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Published Quizzes</p>
                  <p className="text-3xl font-bold text-[#0f6e56]">{quizzes.filter(item => item.published).length}</p>
                </div>
              </div>

              {lmsItemView && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Preview {lmsItemView.type}</p>
                      <h3 className="text-xl font-bold text-[#0f6e56] mb-2">{lmsItemView.item.title}</h3>
                      <p className="text-sm text-gray-500">{lmsItemView.item.subject} · {lmsItemView.item.gradeLevel}</p>
                    </div>
                    <button onClick={() => setLmsItemView(null)} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-full">Close</button>
                  </div>
                  {lmsItemView.type === 'lesson' && (
                    <div className="space-y-3">
                      <p className="text-gray-600">{lmsItemView.item.content}</p>
                      <p className="text-xs text-gray-400">Status: {lmsItemView.item.published ? 'Published' : 'Draft'}</p>
                    </div>
                  )}
                  {lmsItemView.type === 'assignment' && (
                    <div className="space-y-3">
                      <p className="text-gray-600">{lmsItemView.item.description}</p>
                      <p className="text-sm text-gray-500">Due: {formatDateTime(lmsItemView.item.dueDate)}</p>
                      <p className="text-xs text-gray-400">Status: {lmsItemView.item.published ? 'Published' : 'Draft'}</p>
                    </div>
                  )}
                  {lmsItemView.type === 'quiz' && (
                    <div className="space-y-3">
                      <p className="text-gray-600">Due: {formatDateTime(lmsItemView.item.dueDate)} · Duration: {lmsItemView.item.durationMinutes} mins</p>
                      <div className="space-y-4">
                        {lmsItemView.item.questions.map((question, index) => (
                          <div key={index} className="bg-slate-50 rounded-2xl p-4">
                            <p className="font-bold text-[#0f6e56] mb-2">Q{index + 1}. {question.prompt}</p>
                            <div className="grid gap-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="text-sm text-gray-700">{option}</div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Answer: {question.answer || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">Status: {lmsItemView.item.published ? 'Published' : 'Draft'}</p>
                    </div>
                  )}
                </div>
              )}

              {lmsView === 'resources' && (
                <div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={() => setShowAddLesson(true)} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ New Lesson</button>
                  </div>

                  {showAddLesson && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                      <h3 className="text-xl font-bold text-[#0f6e56] mb-6">{editingLmsItem?.type === 'lesson' ? 'Edit Lesson' : 'Create Lesson'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Lesson Title</label>
                          <input type="text" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Subject</label>
                          {teacherSubjectOptions.length > 0 ? (
                          <select value={newLesson.subject} onChange={e => setNewLesson({ ...newLesson, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                            <option value="">Choose subject</option>
                            {teacherSubjectOptions.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={newLesson.subject} onChange={e => setNewLesson({ ...newLesson, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Grade Level</label>
                          <select value={newLesson.gradeLevel} onChange={e => setNewLesson({ ...newLesson, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                            {teacherClassOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Lesson Content</label>
                          <textarea value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} rows={5} placeholder="Write your lesson content here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={handleAddLesson} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Lesson</button>
                        <button onClick={() => setShowAddLesson(false)} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.length === 0 ? (
                      <div className="col-span-3 bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No lessons yet. Click "+ New Lesson" to publish learning resources.</div>
                    ) : (
                      lessons.map(lesson => (
                        <div key={lesson.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full">{lesson.gradeLevel}</span>
                            <button onClick={() => togglePublishItem(lesson.id, 'lesson')} className={`text-xs font-bold px-3 py-1 rounded-full ${lesson.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {lesson.published ? 'Published' : 'Draft'}
                            </button>
                          </div>
                          <h3 className="text-lg font-bold text-[#0f6e56] mb-2">{lesson.title}</h3>
                          <p className="text-sm text-gray-500 mb-3">{lesson.subject}</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{lesson.content}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button onClick={() => handleViewLmsItem(lesson, 'lesson')} className="bg-[#0f6e56] hover:bg-[#085041] text-white text-xs font-bold px-3 py-2 rounded-full">View</button>
                            <button onClick={() => handleEditLmsItem(lesson, 'lesson')} className="bg-white border border-[#0f6e56] text-[#0f6e56] text-xs font-bold px-3 py-2 rounded-full">Edit</button>
                            <button onClick={() => handleDeleteLmsItem(lesson.id, 'lesson')} className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-full">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {lmsView === 'assignments' && (
                <div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={() => setShowAddAssignment(true)} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ New Assignment</button>
                  </div>

                  {showAddAssignment && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                      <h3 className="text-xl font-bold text-[#0f6e56] mb-6">{editingLmsItem?.type === 'assignment' ? 'Edit Assignment' : 'Create Assignment'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Title</label>
                          <input type="text" value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Subject</label>
                          <input type="text" value={newAssignment.subject} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Grade Level</label>
                          <select value={newAssignment.gradeLevel} onChange={e => setNewAssignment({ ...newAssignment, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                            {teacherClassOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Due Date</label>
                          <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Due Time</label>
                          <input type="time" value={newAssignment.dueTime} onChange={e => setNewAssignment({ ...newAssignment, dueTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Description</label>
                          <textarea value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={handleAddAssignment} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Assignment</button>
                        <button onClick={() => setShowAddAssignment(false)} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignments.length === 0 ? (
                      <div className="col-span-2 bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No assignments available. Publish assignments to make them visible to learners.</div>
                    ) : (
                      assignments.map(assignment => (
                        <div key={assignment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full">{assignment.gradeLevel}</span>
                            <button onClick={() => togglePublishItem(assignment.id, 'assignment')} className={`text-xs font-bold px-3 py-1 rounded-full ${assignment.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {assignment.published ? 'Published' : 'Draft'}
                            </button>
                          </div>
                          <h3 className="text-lg font-bold text-[#0f6e56] mb-2">{assignment.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{assignment.subject}</p>
                          <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                          <p className="text-xs text-gray-400 mb-4">Due: {formatDateTime(assignment.dueDate)}</p>
                          <div className="bg-blue-50 rounded-2xl p-4 text-sm text-gray-600">
                            {assignment.published ? 'Learners can now access this assignment.' : 'Draft: publish to send it to learners.'}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button onClick={() => handleViewLmsItem(assignment, 'assignment')} className="bg-[#0f6e56] hover:bg-[#085041] text-white text-xs font-bold px-3 py-2 rounded-full">View</button>
                            <button onClick={() => handleEditLmsItem(assignment, 'assignment')} className="bg-white border border-[#0f6e56] text-[#0f6e56] text-xs font-bold px-3 py-2 rounded-full">Edit</button>
                            <button onClick={() => handleDeleteLmsItem(assignment.id, 'assignment')} className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-full">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {lmsView === 'quizzes' && (
                <div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={() => setShowAddQuiz(true)} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ New Quiz</button>
                  </div>

                  {showAddQuiz && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                      <h3 className="text-xl font-bold text-[#0f6e56] mb-6">{editingLmsItem?.type === 'quiz' ? 'Edit Quiz' : 'Create Quiz'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Quiz Title</label>
                          <input type="text" value={newQuiz.title} onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Subject</label>
                          {teacherSubjectOptions.length > 0 ? (
                            <select value={newQuiz.subject} onChange={e => setNewQuiz({ ...newQuiz, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                              <option value="">Choose subject</option>
                              {teacherSubjectOptions.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                            </select>
                          ) : (
                            <input type="text" value={newQuiz.subject} onChange={e => setNewQuiz({ ...newQuiz, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Grade Level</label>
                          <select value={newQuiz.gradeLevel} onChange={e => setNewQuiz({ ...newQuiz, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                            {teacherClassOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Due Date</label>
                          <input type="date" value={newQuiz.dueDate} onChange={e => setNewQuiz({ ...newQuiz, dueDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Due Time</label>
                          <input type="time" value={newQuiz.dueTime} onChange={e => setNewQuiz({ ...newQuiz, dueTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0f6e56] mb-2">Duration (minutes)</label>
                          <input type="number" min="5" value={newQuiz.durationMinutes} onChange={e => setNewQuiz({ ...newQuiz, durationMinutes: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        {newQuiz.questions.map((question, index) => (
                          <div key={index} className="bg-blue-50 rounded-2xl p-5 border border-gray-200">
                            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                              <h4 className="font-bold text-[#0f6e56]">Question {index + 1}</h4>
                              <div className="flex items-center gap-3">
                                <label className="text-sm font-semibold text-[#0f6e56]">Type</label>
                                <select value={question.type || 'multiple-choice'} onChange={e => handleQuizQuestionChange(index, 'type', e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                                  <option value="multiple-choice">Multiple choice</option>
                                  <option value="fill-in">Fill in the blank</option>
                                </select>
                              </div>
                              <button type="button" onClick={() => removeQuizQuestion(index)} className="text-red-600 text-sm">Remove</button>
                            </div>
                            <label className="block text-sm font-bold text-[#0f6e56] mb-2">Prompt</label>
                            <input type="text" value={question.prompt} onChange={e => handleQuizQuestionChange(index, 'prompt', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 mb-4" />
                            {question.type === 'multiple-choice' ? (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex}>
                                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Option {optionIndex + 1}</label>
                                      <input type="text" value={option} onChange={e => handleQuizOptionChange(index, optionIndex, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                                    </div>
                                  ))}
                                </div>
                                <label className="block text-sm font-bold text-[#0f6e56] mb-2">Correct Answer</label>
                                <select value={question.answer} onChange={e => handleQuizQuestionChange(index, 'answer', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                                  <option value="">Select correct option</option>
                                  {question.options.map((option, optionIndex) => <option key={optionIndex} value={option}>{option || `Option ${optionIndex + 1}`}</option>)}
                                </select>
                              </>
                            ) : (
                              <>
                                <label className="block text-sm font-bold text-[#0f6e56] mb-2">Correct Answer</label>
                                <input type="text" value={question.answer} onChange={e => handleQuizQuestionChange(index, 'answer', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                                <p className="text-xs text-gray-500 mt-2">Learners will type the answer directly.</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addQuizQuestion} className="bg-white border border-[#0f6e56] text-[#0f6e56] font-bold px-6 py-3 rounded-xl">Add Question</button>
                      <div className="flex gap-4 mt-6">
                        <button onClick={handleAddQuiz} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Quiz</button>
                        <button onClick={() => setShowAddQuiz(false)} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.length === 0 ? (
                      <div className="col-span-2 bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No quizzes created yet. Publish quizzes to give learners online practice.</div>
                    ) : (
                      quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full">{quiz.gradeLevel}</span>
                            <button onClick={() => togglePublishItem(quiz.id, 'quiz')} className={`text-xs font-bold px-3 py-1 rounded-full ${quiz.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {quiz.published ? 'Published' : 'Draft'}
                            </button>
                          </div>
                          <h3 className="text-lg font-bold text-[#0f6e56] mb-2">{quiz.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{quiz.subject}</p>
                          <p className="text-sm text-gray-600 mb-3">Due {formatDateTime(quiz.dueDate)} · {quiz.durationMinutes} minutes</p>
                          <div className="bg-blue-50 rounded-2xl p-4 text-sm text-gray-600">
                            {quiz.published ? 'Learners can now see and take this quiz.' : 'Draft: publish to send it to learners.'}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button onClick={() => handleViewLmsItem(quiz, 'quiz')} className="bg-[#0f6e56] hover:bg-[#085041] text-white text-xs font-bold px-3 py-2 rounded-full">View</button>
                            <button onClick={() => handleEditLmsItem(quiz, 'quiz')} className="bg-white border border-[#0f6e56] text-[#0f6e56] text-xs font-bold px-3 py-2 rounded-full">Edit</button>
                            <button onClick={() => handleDeleteLmsItem(quiz.id, 'quiz')} className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-full">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {lmsView === 'submissions' && (
                <div>
                  <h3 className="text-2xl font-bold text-[#0f6e56] mb-4">Student Submissions</h3>
                  {submissionRecords.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">No submission records are available yet.</div>
                  ) : (
                    <div className="space-y-6">
                      {submissionRecords.map((record, index) => (
                        <div key={`${record.type}-${record.itemId}-${record.learnerEmail}-${index}`} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">{record.type} Submission</p>
                              <h4 className="text-xl font-bold text-[#0f6e56] mt-2">{record.title}</h4>
                              <p className="text-sm text-gray-500">Student: {record.learnerName || 'Unknown'} · {record.learnerEmail || 'No email'}</p>
                            </div>
                            <div className="text-sm text-gray-500 text-right">
                              <p>Submitted: {formatDateTime(record.submittedAt)}</p>
                              <p>Device: {record.device || 'Unknown'}</p>
                              <p>Time used: {record.timeUsedSeconds != null ? `${Math.round(record.timeUsedSeconds)} sec` : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                            <p className="text-sm text-gray-700">Answered Questions:</p>
                            <div className="space-y-3 mt-3">
                              {(record.questions || []).map((question, idx) => (
                                <div key={idx} className="rounded-2xl p-3 bg-white border border-gray-200">
                                  <p className="font-bold text-[#0f6e56]">Q{idx + 1}. {question.prompt}</p>
                                  <p className="text-sm text-gray-700 mt-1">Your answer: {question.selected || 'No answer'}</p>
                                  <p className="text-sm text-gray-500">Correct answer: {question.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button onClick={() => handleDownloadSubmissionPdf(record)} className="bg-[#0f6e56] hover:bg-[#085041] text-white text-xs font-bold px-4 py-2 rounded-full">Download PDF</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
