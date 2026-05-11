import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, ClipboardList, BookOpen,
  FileText, GraduationCap, LogOut, Menu, X, Bell
} from 'lucide-react'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={20} />, label: 'My Classes', id: 'classes' },
  { icon: <ClipboardList size={20} />, label: 'Attendance', id: 'attendance' },
  { icon: <BookOpen size={20} />, label: 'Gradebook', id: 'gradebook' },
  { icon: <FileText size={20} />, label: 'Assignments', id: 'assignments' },
  { icon: <GraduationCap size={20} />, label: 'LMS', id: 'lms' },
]

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [students, setStudents] = useState([])
  const [activeClass, setActiveClass] = useState('Year 1')
  const [attendance, setAttendance] = useState({})
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
  const [activeGradebookTab, setActiveGradebookTab] = useState('enter')

  useEffect(() => {
    if (activeMenu === 'gradebook') {
      axios.get('${API_URL}/api/results').then(res => setSubmittedResults(res.data))
      axios.get('${API_URL}/api/students').then(res => setStudents(res.data))
    }
  }, [activeMenu])

  const handleGradebookSubmit = async () => {
    if (!gradebookStudent) return
    try {
      if (editingResult) {
        const res = await axios.put(`/api/results/${editingResult.id}`, {
          scores: subjectScores,
          remarks: teacherRemarks,
          status: 'pending'
        })
        setSubmittedResults(submittedResults.map(r => r.id === editingResult.id ? res.data : r))
        setEditingResult(null)
      } else {
        const res = await axios.post('${API_URL}/api/results', {
          studentId: gradebookStudent,
          gradeLevel: gradebookClass,
          academicYear: gradebookYear,
          term: gradebookTerm,
          scores: subjectScores,
          remarks: teacherRemarks,
          submittedBy: user?.name
        })
        setSubmittedResults([res.data, ...submittedResults])
      }
      setGradebookSubmitted(true)
      setSubjectScores({})
      setTeacherRemarks('')
      setGradebookStudent('')
      setActiveGradebookTab('submitted')
      setTimeout(() => setGradebookSubmitted(false), 4000)
    } catch (error) {
      alert('Failed to submit results. Please try again.')
    }
  }

  const handleEditResult = (result) => {
    setEditingResult(result)
    setGradebookClass(result.gradeLevel)
    setGradebookYear(result.academicYear)
    setGradebookTerm(result.term)
    setGradebookStudent(result.studentId.toString())
    setSubjectScores(result.scores)
    setTeacherRemarks(result.remarks || '')
    setActiveGradebookTab('enter')
  }

  const handleDeleteResult = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return
    try {
      await axios.delete(`/api/results/${id}`)
      setSubmittedResults(submittedResults.filter(r => r.id !== id))
    } catch (error) {
      alert('Failed to delete result.')
    }
  }

  const handleDownloadPDF = async (result) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const student = result.student
    const scores = result.scores
    const pageWidth = doc.internal.pageSize.getWidth()

    // Load logo
    const logoUrl = '/src/assets/logo.png'
    const loadImage = (url) => new Promise((resolve) => {
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
      img.src = url
    })
    const logoData = await loadImage(logoUrl)

    // Navy header background
    doc.setFillColor(26, 60, 110)
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Gold accent bar
    doc.setFillColor(212, 160, 23)
    doc.rect(0, 45, pageWidth, 4, 'F')

    // Logo in header - larger
    doc.addImage(logoData, 'PNG', 12, 5, 32, 32)

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
    doc.setFillColor(26, 60, 110)
    doc.rect(10, y, pageWidth - 20, 10, 'F')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('Subject', 15, y + 7)
    doc.text('Class(10)', 65, y + 7)
    doc.text('CAT1(20)', 92, y + 7)
    doc.text('CAT2(20)', 119, y + 7)
    doc.text('Exam(50)', 146, y + 7)
    doc.text('Total', 170, y + 7)
    doc.text('Grade', 186, y + 7)

    y += 10

    const subjectsList = ['English', 'Maths', 'Science', 'Computing', 'RME', 'History', 'Ewe', 'French', 'UC MAS']
    let grandTotal = 0

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
      if (t >= 80) return [15, 110, 86]
      if (t >= 60) return [26, 60, 110]
      if (t >= 50) return [212, 160, 23]
      return [220, 50, 50]
    }

    subjectsList.forEach((subject, index) => {
      const s = scores[subject] || {}
      const classScore = parseFloat(s.classScore) || 0
      const cat1 = parseFloat(s.cat1) || 0
      const cat2 = parseFloat(s.cat2) || 0
      const exam = parseFloat(s.exam) || 0
      const wExam = (exam / 100) * 50
      const total = classScore + cat1 + cat2 + wExam
      grandTotal += total

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 248, 255)
      } else {
        doc.setFillColor(255, 255, 255)
      }
      doc.rect(10, y, pageWidth - 20, 10, 'F')

      doc.setDrawColor(220, 225, 235)
      doc.setLineWidth(0.2)
      doc.rect(10, y, pageWidth - 20, 10)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(26, 60, 110)
      doc.text(subject, 15, y + 7)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      doc.text(classScore.toString(), 72, y + 7)
      doc.text(cat1.toString(), 99, y + 7)
      doc.text(cat2.toString(), 126, y + 7)
      doc.text(wExam.toFixed(2), 150, y + 7)
      doc.text(total.toFixed(2), 170, y + 7)

      // Colored grade
      const gradeColor = getGradeColor(total)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2])
      doc.text(total > 0 ? getGrade(total) : '-', 188, y + 7)

      y += 10
    })

    // Grand total row
    doc.setFillColor(212, 160, 23)
    doc.rect(10, y, pageWidth - 20, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(26, 60, 110)
    doc.text('Grand Total', 15, y + 7)
    doc.text(`${grandTotal.toFixed(2)} / 900`, 155, y + 7)

    y += 18

    // Watermark
    doc.saveGraphicsState()
    doc.setGState(new doc.GState({ opacity: 0.06 }))
    doc.addImage(logoData, 'PNG', 55, 100, 100, 100)
    doc.restoreGraphicsState()

    // Remarks box
    doc.setFillColor(240, 245, 255)
    doc.rect(10, y, pageWidth - 20, 22, 'F')
    doc.setDrawColor(26, 60, 110)
    doc.setLineWidth(0.5)
    doc.rect(10, y, pageWidth - 20, 22)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(26, 60, 110)
    doc.text("Class Teacher's Remarks:", 15, y + 8)

    doc.setFont('helvetica', 'italic')
    doc.setTextColor(50, 50, 50)
    const remarksLines = doc.splitTextToSize(result.remarks || 'No remarks provided.', 170)
    doc.text(remarksLines, 15, y + 16)

    y += 30

    // Signature section
    doc.setDrawColor(26, 60, 110)
    doc.setLineWidth(0.3)
    doc.line(15, y + 10, 70, y + 10)
    doc.line(85, y + 10, 140, y + 10)
    doc.line(155, y + 10, 200, y + 10)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("Class Teacher's Signature", 15, y + 15)
    doc.text("Head Teacher's Signature", 85, y + 15)
    doc.text("Parent's Signature", 155, y + 15)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(26, 60, 110)
    doc.text(`Submitted by: ${result.submittedBy}`, 15, y + 25)
    doc.text(`Date: ${new Date(result.createdAt).toLocaleDateString()}`, 140, y + 25)

    // Footer
    doc.setFillColor(26, 60, 110)
    doc.rect(0, 280, pageWidth, 17, 'F')
    doc.setFillColor(212, 160, 23)
    doc.rect(0, 278, pageWidth, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.text('GOLDEN-INTELS INTERNATIONAL SCHOOL', pageWidth / 2, 287, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(212, 160, 23)
    doc.text('We Nurture for Nature', pageWidth / 2, 293, { align: 'center' })

    doc.save(`${student.firstName}_${student.lastName}_${result.term}_${result.academicYear}.pdf`)
  }

  const subjects = ['English', 'Maths', 'Science', 'Computing', 'RME', 'History', 'Ewe', 'French', 'UC MAS']

  const handleSubjectScore = (subject, field, value) => {
    setSubjectScores(prev => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: value }
    }))
  }

  const totalAllSubjects = subjects.reduce((total, subject) => {
    const scores = subjectScores[subject] || {}
    const classScore = parseFloat(scores.classScore) || 0
    const cat1 = parseFloat(scores.cat1) || 0
    const cat2 = parseFloat(scores.cat2) || 0
    const exam = parseFloat(scores.exam) || 0
    const wExam = (exam / 100) * 50
    return total + classScore + cat1 + cat2 + wExam
  }, 0)

  const subjectsCompleted = subjects.filter(subject => {
    const scores = subjectScores[subject] || {}
    return scores.classScore && scores.cat1 && scores.cat2 && scores.exam
  }).length

  const [assignments, setAssignments] = useState([])
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [newAssignment, setNewAssignment] = useState({ title: '', subject: '', dueDate: '', description: '', gradeLevel: 'Year 1' })
  const [lessons, setLessons] = useState([])
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [newLesson, setNewLesson] = useState({ title: '', subject: '', gradeLevel: 'Year 1', content: '' })

  const classes = ['Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']

  useEffect(() => {
    if (activeMenu === 'classes' || activeMenu === 'attendance') {
      axios.get('${API_URL}/api/students').then(res => setStudents(res.data))
    }
  }, [activeMenu])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filteredStudents = students.filter(s => s.gradeLevel === activeClass)

  const handleAttendance = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status })
  }

  const saveAttendance = () => {
    setAttendanceSaved(true)
    setTimeout(() => setAttendanceSaved(false), 3000)
  }

  const handleGrade = (studentId, value) => {
    setGrades({ ...grades, [studentId]: value })
  }

  const saveGrades = () => {
    setGradesSaved(true)
    setTimeout(() => setGradesSaved(false), 3000)
  }

  const handleAddAssignment = () => {
    if (!newAssignment.title) return
    setAssignments([{ id: Date.now(), ...newAssignment }, ...assignments])
    setNewAssignment({ title: '', subject: '', dueDate: '', description: '', gradeLevel: 'Year 1' })
    setShowAddAssignment(false)
  }

  const handleAddLesson = () => {
    if (!newLesson.title) return
    setLessons([{ id: Date.now(), ...newLesson }, ...lessons])
    setNewLesson({ title: '', subject: '', gradeLevel: 'Year 1', content: '' })
    setShowAddLesson(false)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0f6e56] text-white transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-green-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e]">G</div>
              <div>
                <p className="text-xs font-bold">Golden-Intels</p>
                <p className="text-xs text-yellow-300">Teacher Portal</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-[#d4a017]">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeMenu === item.id ? 'bg-[#d4a017] text-[#1a3c6e] font-bold' : 'hover:bg-green-800 text-green-200'
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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4a017] rounded-full text-xs text-[#1a3c6e] font-bold flex items-center justify-center">0</span>
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
                  { label: 'Assignments', value: assignments.length, color: 'bg-[#1a3c6e]', textColor: 'text-blue-200' },
                  { label: 'Lessons', value: lessons.length, color: 'bg-[#4a235a]', textColor: 'text-purple-200' },
                  { label: 'Classes', value: '1', color: 'bg-[#d4a017]', textColor: 'text-[#1a3c6e]/80' },
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
                {classes.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setActiveClass(cls)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      activeClass === cls ? 'bg-[#0f6e56] text-white' : 'bg-white text-[#0f6e56] border border-[#0f6e56] hover:bg-[#0f6e56] hover:text-white'
                    }`}
                  >
                    {cls}
                    <span className="ml-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-2 py-0.5 rounded-full">
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
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-[#0f6e56]">
                              {student.photo ? (
                                <img src={`${student.photo}`} alt={student.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#0f6e56] font-bold text-sm">
                                  {student.firstName?.charAt(0)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full">{student.studentId}</span>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#0f6e56]">Attendance</h2>
                <span className="text-sm text-gray-500">{new Date().toDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {classes.map(cls => (
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
              {attendanceSaved && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  Attendance saved successfully!
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f6e56] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Present</th>
                      <th className="px-6 py-4 text-left">Absent</th>
                      <th className="px-6 py-4 text-left">Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No students in this class.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 font-medium text-[#0f6e56]">{student.firstName} {student.lastName}</td>
                          {['present', 'absent', 'late'].map(status => (
                            <td key={status} className="px-6 py-4">
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={attendance[student.id] === status}
                                onChange={() => handleAttendance(student.id, status)}
                                className="w-4 h-4 accent-[#0f6e56]"
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <button onClick={saveAttendance} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors">
                Save Attendance
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
                  <span className="ml-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-2 py-0.5 rounded-full">
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
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {result.status}
                              </span>
                              <button
                                onClick={() => handleEditResult(result)}
                                className="bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(result)}
                                className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Download PDF
                              </button>
                              <button
                                onClick={() => handleDeleteResult(result.id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Delete
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
                      {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
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
                      {students.filter(s => s.gradeLevel === gradebookClass).map(s => (
                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject Scores */}
                <h4 className="text-md font-bold text-[#0f6e56] mb-4">Subject Scores</h4>
                <div className="space-y-6 mb-8">
                  {subjects.map(subject => {
                    const scores = subjectScores[subject] || { classScore: '', cat1: '', cat2: '', exam: '' }
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
                      <div key={subject} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h5 className="text-md font-bold text-[#0f6e56] mb-4">{subject}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Class Score (10%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.classScore}
                              onChange={e => handleSubjectScore(subject, 'classScore', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Max: 10</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">CAT 1 (20%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.cat1}
                              onChange={e => handleSubjectScore(subject, 'cat1', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Max: 20</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">CAT 2 (20%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.cat2}
                              onChange={e => handleSubjectScore(subject, 'cat2', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Max: 20</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Exam Score (50%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={scores.exam}
                              onChange={e => handleSubjectScore(subject, 'exam', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Weighted: {wExam.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="bg-[#0f6e56] text-white rounded-xl px-4 py-2 text-sm font-bold">
                            Total: {subjectTotal.toFixed(2)}/100
                          </div>
                          <div className="bg-[#d4a017] text-[#1a3c6e] rounded-xl px-4 py-2 text-sm font-bold">
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
                  <p className="text-xs text-gray-400 mb-2">Provide constructive feedback on the student's overall performance across all subjects</p>
                  <textarea
                    value={teacherRemarks}
                    onChange={e => setTeacherRemarks(e.target.value)}
                    rows={4}
                    placeholder="Enter remarks here..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 flex flex-wrap gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Total Score (All Subjects)</p>
                    <p className="text-2xl font-bold text-[#0f6e56]">{totalAllSubjects.toFixed(2)}/900</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subjects Completed</p>
                    <p className="text-2xl font-bold text-[#0f6e56]">{subjectsCompleted}/{subjects.length}</p>
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
                      <input type="text" value={newAssignment.subject} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Grade Level</label>
                      <select value={newAssignment.gradeLevel} onChange={e => setNewAssignment({ ...newAssignment, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                        {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Due Date</label>
                      <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Description</label>
                      <textarea value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={handleAddAssignment} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Assignment</button>
                    <button onClick={() => setShowAddAssignment(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
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
                      <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mb-3">{assignment.gradeLevel}</span>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#0f6e56]">Learning Management System</h2>
                <button
                  onClick={() => setShowAddLesson(true)}
                  className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                >
                  + New Lesson
                </button>
              </div>

              {showAddLesson && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-bold text-[#0f6e56] mb-6">Create Lesson</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Lesson Title</label>
                      <input type="text" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Subject</label>
                      <input type="text" value={newLesson.subject} onChange={e => setNewLesson({ ...newLesson, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Grade Level</label>
                      <select value={newLesson.gradeLevel} onChange={e => setNewLesson({ ...newLesson, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700">
                        {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#0f6e56] mb-2">Lesson Content</label>
                      <textarea value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} rows={5} placeholder="Write your lesson content here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700" />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={handleAddLesson} className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Lesson</button>
                    <button onClick={() => setShowAddLesson(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.length === 0 ? (
                  <div className="col-span-3 bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                    No lessons yet. Click "New Lesson" to create one.
                  </div>
                ) : (
                  lessons.map(lesson => (
                    <div key={lesson.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mb-3">{lesson.gradeLevel}</span>
                      <h3 className="text-lg font-bold text-[#0f6e56] mb-1">{lesson.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{lesson.subject}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{lesson.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}