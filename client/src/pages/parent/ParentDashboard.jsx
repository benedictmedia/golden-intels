import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard, Users, ClipboardList, BookOpen,
  FileText, DollarSign, MessageSquare, LogOut, Menu, X, Bell, Send
} from 'lucide-react'
import API_URL from '../../api/config'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={20} />, label: 'My Children', id: 'children' },
  { icon: <ClipboardList size={20} />, label: 'Attendance', id: 'attendance' },
  { icon: <BookOpen size={20} />, label: 'Grades', id: 'grades' },
  { icon: <FileText size={20} />, label: 'Assignments', id: 'assignments' },
  { icon: <DollarSign size={20} />, label: 'Fee Status', id: 'fees' },
  { icon: <MessageSquare size={20} />, label: 'Messages', id: 'messages' },
]

export default function ParentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [students, setStudents] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [messageSent, setMessageSent] = useState(false)
  const [approvedResults, setApprovedResults] = useState([])
  const [feePayments, setFeePayments] = useState([])

  useEffect(() => {
    axios.get('${API_URL}/api/fees/payments')
      .then(res => setFeePayments(res.data))
  }, [])
  const [viewingResult, setViewingResult] = useState(null)

  useEffect(() => {
    axios.get('${API_URL}/api/results')
      .then(res => {
        const approved = res.data.filter(r => r.status === 'approved')
        setApprovedResults(approved)
      })
  }, [])

  const handleParentDownloadPDF = async (result) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const student = result.student
    const scores = result.scores
    const pageWidth = doc.internal.pageSize.getWidth()

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

    doc.setFillColor(26, 60, 110)
    doc.rect(0, 0, pageWidth, 45, 'F')
    doc.setFillColor(212, 160, 23)
    doc.rect(0, 45, pageWidth, 4, 'F')
    doc.addImage(logoData, 'PNG', 12, 5, 32, 32)

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

      if (index % 2 === 0) { doc.setFillColor(245, 248, 255) } else { doc.setFillColor(255, 255, 255) }
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
      const gradeColor = getGradeColor(total)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2])
      doc.text(total > 0 ? getGrade(total) : '-', 188, y + 7)
      y += 10
    })

    doc.setFillColor(212, 160, 23)
    doc.rect(10, y, pageWidth - 20, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(26, 60, 110)
    doc.text('Grand Total', 15, y + 7)
    doc.text(`${grandTotal.toFixed(2)} / 900`, 155, y + 7)
    y += 18

    doc.saveGraphicsState()
    doc.setGState(new doc.GState({ opacity: 0.06 }))
    doc.addImage(logoData, 'PNG', 55, 100, 100, 100)
    doc.restoreGraphicsState()

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

  useEffect(() => {
    axios.get('${API_URL}/api/students')
      .then(res => {
        setStudents(res.data)
        if (res.data.length > 0) setSelectedChild(res.data[0])
      })
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

  const attendance = [
    { date: '2024-01-08', status: 'Present' },
    { date: '2024-01-09', status: 'Present' },
    { date: '2024-01-10', status: 'Absent' },
    { date: '2024-01-11', status: 'Present' },
    { date: '2024-01-12', status: 'Late' },
  ]

  const grades = [
    { subject: 'Mathematics', score: 85, grade: 'A' },
    { subject: 'English', score: 78, grade: 'B' },
    { subject: 'Science', score: 92, grade: 'A+' },
    { subject: 'Computing', score: 88, grade: 'A' },
    { subject: 'Geography', score: 74, grade: 'B' },
    { subject: 'Creative Arts', score: 95, grade: 'A+' },
  ]

  const assignments = [
    { title: 'Math Worksheet', subject: 'Mathematics', dueDate: '2024-01-20', status: 'Pending' },
    { title: 'English Essay', subject: 'English', dueDate: '2024-01-22', status: 'Submitted' },
    { title: 'Science Project', subject: 'Science', dueDate: '2024-01-25', status: 'Pending' },
  ]

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#4a235a] text-white transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-purple-900">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e]">G</div>
              <div>
                <p className="text-xs font-bold">Golden-Intels</p>
                <p className="text-xs text-yellow-300">Parent Portal</p>
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
                activeMenu === item.id ? 'bg-[#d4a017] text-[#1a3c6e] font-bold' : 'hover:bg-purple-900 text-purple-200'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-900">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900 text-purple-200 transition-colors rounded-lg">
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
            <h1 className="text-xl font-bold text-[#4a235a] capitalize">{activeMenu.replace('-', ' ')}</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-[#4a235a]">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4a017] rounded-full text-xs text-[#1a3c6e] font-bold flex items-center justify-center">0</span>
            </button>
            <div className="w-9 h-9 bg-[#4a235a] rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                  { label: 'My Children', value: students.length, color: 'bg-[#4a235a]', textColor: 'text-purple-200' },
                  { label: 'Assignments', value: assignments.length, color: 'bg-[#1a3c6e]', textColor: 'text-blue-200' },
                  { label: 'Avg Grade', value: 'A', color: 'bg-[#0f6e56]', textColor: 'text-green-200' },
                  { label: 'Messages', value: messages.length, color: 'bg-[#d4a017]', textColor: 'text-[#1a3c6e]/80' },
                ].map((stat, index) => (
                  <div key={index} className={`${stat.color} text-white rounded-2xl p-6 shadow-md`}>
                    <p className={`${stat.textColor} text-sm mb-1`}>{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-2">Parent Dashboard</h2>
                <p className="text-gray-600">Welcome to your Parent Portal. Use the sidebar to view your child's progress, attendance, grades, assignments, and fee status.</p>
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
                            <img src={`${student.photo}`} alt={student.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#4a235a] font-bold text-xl">
                              {student.firstName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#4a235a]">{student.firstName} {student.lastName}</h3>
                          <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mt-1">{student.studentId}</span>
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
              <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-6">Attendance Record</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#4a235a] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-gray-600">{record.date}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            record.status === 'Present' ? 'bg-green-100 text-green-700' :
                            record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
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

              {approvedResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                  No approved results available yet. Please check back later.
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedResults.map(result => (
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
                            {['English', 'Maths', 'Science', 'Computing', 'RME', 'History'].map(subject => {
                              const s = result.scores[subject] || {}
                              const classScore = parseFloat(s.classScore) || 0
                              const cat1 = parseFloat(s.cat1) || 0
                              const cat2 = parseFloat(s.cat2) || 0
                              const exam = parseFloat(s.exam) || 0
                              const wExam = (exam / 100) * 50
                              const total = classScore + cat1 + cat2 + wExam
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
                                <div key={subject} className="bg-gray-50 rounded-lg p-2 text-center">
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
                            className="bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold px-6 py-3 rounded-xl transition-colors text-sm"
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

          {/* Assignments */}
          {activeMenu === 'assignments' && (
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-6">Assignments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                      assignment.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {assignment.status}
                    </span>
                    <h3 className="text-lg font-bold text-[#4a235a] mb-1">{assignment.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{assignment.subject}</p>
                    <p className="text-xs text-gray-400">Due: {assignment.dueDate}</p>
                  </div>
                ))}
              </div>
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
                  <p className="text-3xl font-bold">GH₵ {feePayments.reduce((acc, p) => acc + p.amountPaid, 0).toFixed(2)}</p>
                </div>
                <div className="bg-red-500 text-white rounded-2xl p-6 shadow-md">
                  <p className="text-red-100 text-sm mb-1">Total Balance</p>
                  <p className="text-3xl font-bold">GH₵ {feePayments.reduce((acc, p) => acc + p.balance, 0).toFixed(2)}</p>
                </div>
                <div className="bg-[#0f6e56] text-white rounded-2xl p-6 shadow-md">
                  <p className="text-green-200 text-sm mb-1">Months Paid</p>
                  <p className="text-3xl font-bold">{feePayments.filter(p => p.status === 'paid').length}</p>
                </div>
              </div>

              {/* Payments Table */}
              {feePayments.length === 0 ? (
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
                      {feePayments.map((payment, index) => (
                        <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 font-medium text-[#4a235a]">{payment.student?.firstName} {payment.student?.lastName}</td>
                          <td className="px-6 py-4 text-gray-600">{payment.month}</td>
                          <td className="px-6 py-4 text-gray-600">{payment.year}</td>
                          <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountDue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountPaid.toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-600">GH₵ {payment.balance.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                              payment.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
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
          {activeMenu === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#4a235a] mb-6">Messages to Admin</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">

                {/* Message List */}
                <div className="p-6 min-h-[300px] max-h-[400px] overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                      No messages yet. Send a message to the admin below.
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className="flex justify-end">
                        <div className="bg-[#4a235a] text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-md">
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs text-purple-300 mt-1 text-right">{msg.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-100 p-4">
                  {messageSent && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg mb-3 text-sm">
                      Message sent to admin!
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message to admin..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4a235a] text-gray-700 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-[#4a235a] hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    {/* View Full Result Modal */}
      {viewingResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif">Student Academic Report</h2>
                <p className="text-blue-200 text-sm">{viewingResult.academicYear} | {viewingResult.term}</p>
              </div>
              <button onClick={() => setViewingResult(null)} className="hover:text-[#d4a017] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">

              {/* Gold bar */}
              <div className="h-1 bg-[#d4a017] rounded-full mb-6"></div>

              {/* Student Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="font-bold text-[#1a3c6e]">{viewingResult.student?.firstName} {viewingResult.student?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="font-bold text-[#1a3c6e]">{viewingResult.student?.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-bold text-[#1a3c6e]">{viewingResult.gradeLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-bold text-[#1a3c6e]">{viewingResult.student?.gender}</p>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="rounded-xl overflow-hidden border border-gray-100 mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-[#1a3c6e] text-white">
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
                    {['English', 'Maths', 'Science', 'Computing', 'RME', 'History', 'Ewe', 'French', 'UC MAS'].map((subject, index) => {
                      const s = viewingResult.scores[subject] || {}
                      const classScore = parseFloat(s.classScore) || 0
                      const cat1 = parseFloat(s.cat1) || 0
                      const cat2 = parseFloat(s.cat2) || 0
                      const exam = parseFloat(s.exam) || 0
                      const wExam = (exam / 100) * 50
                      const total = classScore + cat1 + cat2 + wExam
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
                        if (t >= 50) return 'text-yellow-600'
                        return 'text-red-600'
                      }
                      return (
                        <tr key={subject} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-bold text-[#1a3c6e]">{subject}</td>
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
                    <tr className="bg-[#d4a017]">
                      <td colSpan="5" className="px-4 py-3 font-bold text-[#1a3c6e]">Grand Total</td>
                      <td className="px-4 py-3 text-center font-bold text-[#1a3c6e]">
                        {['English', 'Maths', 'Science', 'Computing', 'RME', 'History', 'Ewe', 'French', 'UC MAS'].reduce((acc, subject) => {
                          const s = viewingResult.scores[subject] || {}
                          const classScore = parseFloat(s.classScore) || 0
                          const cat1 = parseFloat(s.cat1) || 0
                          const cat2 = parseFloat(s.cat2) || 0
                          const exam = parseFloat(s.exam) || 0
                          const wExam = (exam / 100) * 50
                          return acc + classScore + cat1 + cat2 + wExam
                        }, 0).toFixed(2)} / 900
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-bold text-[#1a3c6e] mb-1">Class Teacher's Remarks</p>
                <p className="text-sm text-gray-600 italic">{viewingResult.remarks || 'No remarks provided.'}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleParentDownloadPDF(viewingResult)}
                  className="flex-1 bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold py-3 rounded-xl transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setViewingResult(null)}
                  className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}