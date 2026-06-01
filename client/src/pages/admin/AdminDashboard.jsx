import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign,
  BarChart2, UserPlus, LogOut, Menu, X, Bell, Eye, Trash2, Key, Copy, CheckCircle, Image as ImageIcon, Newspaper, UserCircle, MessageCircle, Inbox
} from 'lucide-react'
import { SUBJECTS, calculateGrandTotal, getNormalizedScores, getRemarksText, getSubjectScore, getSubjectTotal } from '../../utils/subjects'
import AdminMessages from '../../components/messages/AdminMessages'
import NotificationBell from '../../components/NotificationBell'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <GraduationCap size={20} />, label: 'Admissions', id: 'admissions' },
  { icon: <DollarSign size={20} />, label: 'Finance', id: 'finance' },
  { icon: <BarChart2 size={20} />, label: 'Performance Review', id: 'performance' },
  { icon: <Users size={20} />, label: 'Learners', id: 'learners' },
  { icon: <UserPlus size={20} />, label: 'Create Account', id: 'create-account' },
  { icon: <Users size={20} />, label: 'Accounts', id: 'accounts' },
  { icon: <Key size={20} />, label: 'Admission Tokens', id: 'admission-tokens' },
  { icon: <ImageIcon size={20} />, label: 'Gallery', id: 'gallery' },
  { icon: <Newspaper size={20} />, label: 'News & Events', id: 'news' },
  { icon: <UserCircle size={20} />, label: 'Our Staff', id: 'staff' },
  { icon: <MessageCircle size={20} />, label: 'Messages', id: 'messages' },
  { icon: <Inbox size={20} />, label: 'Contact Messages', id: 'contact-messages' },
]

const stats = [
  { label: 'Total Learners', value: '0', color: 'bg-[#0000ff]', textColor: 'text-blue-100' },
  { label: 'Admissions', value: '0', color: 'bg-[#800080]', textColor: 'text-purple-200' },
  { label: 'Total Revenue', value: 'GH₵ 0', color: 'bg-[#0000ff]', textColor: 'text-blue-100' },
  { label: 'Staff Members', value: '0', color: 'bg-[#800080]', textColor: 'text-purple-200' },
]

const classes = ['All', 'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [contactMessages, setContactMessages] = useState([])
  const [contactLoading, setContactLoading] = useState(false)
  const [viewingContact, setViewingContact] = useState(null)

  // Create account state
  const initialNewUserState = {
    name: '', email: '', password: '', role: 'teacher',
    classes: [], subjects: [], classTeacherClasses: [], teacherSubject: '', teacherDepartment: 'Teaching',
    learnerFirstName: '', learnerLastName: '', learnerDateOfBirth: '', learnerGender: '', learnerGradeLevel: '', learnerParentEmail: '', learnerParentName: '', learnerParentPhone: ''
  }
  const [newUser, setNewUser] = useState(initialNewUserState)
  const [createLoading, setCreateLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState('')

  // Learners state
  const [students, setStudents] = useState([])
  const [activeClass, setActiveClass] = useState('All')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    gradeLevel: '', parentName: '', parentEmail: '', parentPhone: '', address: '',
    learnerEmail: '', learnerPassword: ''
  })

  // Results state
  const [results, setResults] = useState([])
  const [resultFilter, setResultFilter] = useState('All')
  const [adminEditResult, setAdminEditResult] = useState(null)
  const [adminEditScores, setAdminEditScores] = useState({})
  const [adminEditRemarks, setAdminEditRemarks] = useState('')

  // Admissions state
  const [applications, setApplications] = useState([])
  const [admissionFilter, setAdmissionFilter] = useState('All')
  const [viewingApplication, setViewingApplication] = useState(null)

  // Tokens state
  const [tokens, setTokens] = useState([])
  const [newToken, setNewToken] = useState(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  // Gallery state
  const [galleryItems, setGalleryItems] = useState([])
  const [showAddGallery, setShowAddGallery] = useState(false)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'Events' })
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [viewingGallery, setViewingGallery] = useState(null)
  const [activeGalleryImage, setActiveGalleryImage] = useState(0)
  const [editingGallery, setEditingGallery] = useState(null)

  // News state
  const [newsItems, setNewsItems] = useState([])
  const [showAddNews, setShowAddNews] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsFilter, setNewsFilter] = useState('All')
  const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' })
  const [newsImages, setNewsImages] = useState([])
  const [newsPreviews, setNewsPreviews] = useState([])

  // Staff state
  const [staffList, setStaffList] = useState([])
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffPhoto, setStaffPhoto] = useState(null)
  const [staffPhotoPreview, setStaffPhotoPreview] = useState(null)
  const [staffForm, setStaffForm] = useState({ name: '', role: '', department: '', subject: '', subjects: [], classes: [], classTeacherClasses: [], bio: '', email: '', phone: '', category: 'teaching' })

  // Finance state
  const [financeTab, setFinanceTab] = useState('fee-structure')
  const [feeStructures, setFeeStructures] = useState({})
  const [feePayments, setFeePayments] = useState([])
  const [feeSaved, setFeeSaved] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [feeClassFilter, setFeeClassFilter] = useState('All')
  const [paymentForm, setPaymentForm] = useState({ studentId: '', month: '', year: '', amountDue: '', amountPaid: '', notes: '' })

  const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

  // Accounts state
  const [users, setUsers] = useState([])
  const [parentAccounts, setParentAccounts] = useState([])
  const [accountTab, setAccountTab] = useState('parents')
  const [accountLoading, setAccountLoading] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [accountQuery, setAccountQuery] = useState('')
  const [accountPage, setAccountPage] = useState(1)
  const [accountLimit, setAccountLimit] = useState(10)
  const [accountTotal, setAccountTotal] = useState(0)
  const [audits, setAudits] = useState([])
  const [showAuditsModal, setShowAuditsModal] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [auditLimit, setAuditLimit] = useState(20)
  const [editPhotoFile, setEditPhotoFile] = useState(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState('')

  const filteredResults = resultFilter === 'All' ? results : results.filter(r => r.status === resultFilter)
  const filteredApplications = admissionFilter === 'All' ? applications : applications.filter(a => a.status === admissionFilter)
  const filteredStudents = activeClass === 'All' ? students : students.filter(s => s.gradeLevel === activeClass)
  const filteredFeePayments = feeClassFilter === 'All' ? feePayments : feePayments.filter(p => p.student?.gradeLevel === feeClassFilter)
  const filteredNews = newsFilter === 'All' ? newsItems : newsItems.filter(n => n.type === newsFilter)

  useEffect(() => {
    if (activeMenu === 'learners' || activeMenu === 'create-account') {
      axios.get(`${API_URL}/api/students`).then(res => setStudents(res.data))
      axios.get(`${API_URL}/api/users`, { headers: getAuthHeaders(), params: { role: 'parent' } }).then(res => setParentAccounts(res.data.users || []))
    }
    if (activeMenu === 'performance') {
      axios.get(`${API_URL}/api/results`).then(res => setResults(res.data))
    }
    if (activeMenu === 'admissions') {
      axios.get(`${API_URL}/api/admissions`, { headers: getAuthHeaders() }).then(res => setApplications(res.data))
    }
    if (activeMenu === 'admission-tokens') {
      axios.get(`${API_URL}/api/admission-tokens`, { headers: getAuthHeaders() }).then(res => setTokens(res.data))
    }
    if (activeMenu === 'gallery') {
      axios.get(`${API_URL}/api/gallery`).then(res => setGalleryItems(res.data))
    }
    if (activeMenu === 'news') {
      axios.get(`${API_URL}/api/news`).then(res => setNewsItems(res.data))
    }
    if (activeMenu === 'staff') {
      axios.get(`${API_URL}/api/staff`).then(res => setStaffList(res.data))
    }
    if (activeMenu === 'finance') {
      axios.get(`${API_URL}/api/fees/structures`).then(res => {
        const structured = {}
        res.data.forEach(f => { structured[f.gradeLevel] = f.monthlyFee })
        setFeeStructures(structured)
      })
      axios.get(`${API_URL}/api/fees/payments`).then(res => setFeePayments(res.data))
      axios.get(`${API_URL}/api/students`).then(res => setStudents(res.data))
    }
    if (activeMenu === 'contact-messages') {
      setContactLoading(true)
      axios.get(`${API_URL}/api/contact`, { headers: getAuthHeaders() })
        .then(res => setContactMessages(res.data))
        .catch(console.error)
        .finally(() => setContactLoading(false))
    }
  }, [activeMenu])

  useEffect(() => {
    if (activeMenu === 'accounts') fetchAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, accountTab, accountPage, accountLimit])

  const handleLogout = () => { logout(); navigate('/') }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)) }
  }

  const handleAddStudent = async () => {
    try {
      const learnerEmail = newStudent.learnerEmail?.trim()
      const learnerPassword = newStudent.learnerPassword?.trim()

      if ((learnerEmail || learnerPassword) && (!learnerEmail || !learnerPassword)) {
        alert('Please enter both a learner email and password to create a dashboard account.')
        return
      }

      const formData = new FormData()
      Object.entries(newStudent).forEach(([key, value]) => {
        if (key === 'learnerEmail' || key === 'learnerPassword') return
        formData.append(key, value)
      })

      if (learnerEmail) {
        formData.append('email', learnerEmail)
        formData.append('password', learnerPassword)
      }

      if (photoFile) formData.append('photo', photoFile)

      const res = await axios.post(`${API_URL}/api/students`, formData, { headers: getAuthHeaders() })
      setStudents([res.data, ...students])
      setShowAddStudent(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      setNewStudent({
        firstName: '', lastName: '', dateOfBirth: '', gender: '',
        gradeLevel: '', parentName: '', parentEmail: '', parentPhone: '', address: '',
        learnerEmail: '', learnerPassword: ''
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add learner. Please fill all fields.')
    }
  }

  const handleDeleteStudent = async (id) => {
  if (!window.confirm('Are you sure you want to remove this learner?')) return

  try {
    await axios.delete(
      `${API_URL}/api/students/${id}`,
      { headers: getAuthHeaders() }
    )

    setStudents(prev => prev.filter(s => s.id !== id))

    if (selectedStudent?.id === id) {
      setSelectedStudent(null)
    }

    alert('Learner deleted successfully.')
  } catch (err) {
    console.error(err.response?.data || err)

    alert(
      err.response?.data?.message ||
      'Failed to delete learner.'
    )
  }
}

  const handleEditStudent = async () => {
  try {
    const res = await axios.put(
      `${API_URL}/api/students/${editStudent.id}`,
      editStudent,
      { headers: getAuthHeaders() }  
    )
      setStudents(students.map(s => s.id === editStudent.id ? res.data : s))
      setSelectedStudent(res.data)
      setEditMode(false)
    } catch (err) { alert('Failed to update learner details.') }
  }

  const toggleSelection = (field, value) => {
    setNewUser(prev => {
      const list = prev[field] || []
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter(item => item !== value) : [...list, value]
      }
    })
  }

  const toggleEditSelection = (field, value) => {
    setEditingUser(prev => {
      if (!prev) return prev
      const list = prev[field] || []
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter(item => item !== value) : [...list, value]
      }
    })
  }

  const openEditUser = (userRecord) => {
    const staffInfo = userRecord.teacherInfo || null
    setEditPhotoFile(null)
    setEditPhotoPreview(staffInfo?.photo || '')
    setEditingUser({
      ...userRecord,
      teacherDepartment: staffInfo?.department || 'Teaching',
      teacherSubject: staffInfo?.subject || '',
      subjects: staffInfo?.subjects || [],
      classes: staffInfo?.classes || [],
      classTeacherClasses: staffInfo?.classTeacherClasses || [],
      bio: staffInfo?.bio || '',
      phone: staffInfo?.phone || '',
      photo: staffInfo?.photo || ''
    })
  }

  const handleCreateAccount = async () => {
    setCreateError(''); setCreateSuccess(false); setCreateLoading(true)
    try {
      const userName = newUser.name || `${newUser.learnerFirstName} ${newUser.learnerLastName}`.trim() || newUser.email
      const payload = {
        name: userName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      }

      if (newUser.role === 'teacher') {
        payload.department = newUser.teacherDepartment
        payload.subjects = newUser.subjects
        payload.classes = newUser.classes
        payload.classTeacherClasses = newUser.classTeacherClasses
        if (newUser.teacherSubject) payload.subject = newUser.teacherSubject
      }

      if (newUser.role === 'learner') {
        payload.firstName = newUser.learnerFirstName || newUser.name.split(' ')[0] || ''
        payload.lastName = newUser.learnerLastName || newUser.name.split(' ').slice(1).join(' ') || ''
        payload.dateOfBirth = newUser.learnerDateOfBirth
        payload.gender = newUser.learnerGender
        payload.gradeLevel = newUser.learnerGradeLevel
        payload.parentEmail = newUser.learnerParentEmail
        payload.parentName = newUser.learnerParentName
        payload.parentPhone = newUser.learnerParentPhone
      }

      await axios.post(`${API_URL}/api/auth/register`, payload)
      setCreateSuccess(true)
      setNewUser(initialNewUserState)
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create account.')
    } finally {
      setCreateLoading(false)
    }
  }

  // Accounts actions
  const fetchAccounts = async () => {
    setAccountLoading(true)
    try {
      const params = { q: accountQuery, page: accountPage, limit: accountLimit }
      if (accountTab === 'parents') params.role = 'parent'
      if (accountTab === 'teachers') params.role = 'teacher'
      const res = await axios.get(`${API_URL}/api/users`, { headers: getAuthHeaders(), params })
      setUsers(res.data.users || [])
      setAccountTotal(res.data.total || 0)
      const [studentsRes, staffRes] = await Promise.all([
        axios.get(`${API_URL}/api/students`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/api/staff`, { headers: getAuthHeaders() })
      ])
      setStudents(studentsRes.data)
      setStaffList(staffRes.data)
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally { setAccountLoading(false) }
  }

  const handleDeactivateUser = async (email) => {
    if (!window.confirm(`Deactivate ${email}?`)) return
    try {
      await axios.post(`${API_URL}/api/users/deactivate`, { email }, { headers: getAuthHeaders() })
      fetchAccounts()
    } catch (err) { alert('Failed to deactivate user') }
  }

  const handleReactivateUser = async (email) => {
    try {
      await axios.post(`${API_URL}/api/users/reactivate`, { email }, { headers: getAuthHeaders() })
      fetchAccounts()
    } catch (err) { alert('Failed to reactivate user') }
  }

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Delete deactivated account ${email}? This will remove related data.`)) return
    try {
      await axios.delete(`${API_URL}/api/users/${id}`, { headers: getAuthHeaders() })
      fetchAccounts()
    } catch (err) { alert('Failed to delete user account.') }
  }

  const handleParentAccountSelect = (email) => {
    const parent = parentAccounts.find(p => p.email === email)
    setNewStudent(prev => ({
      ...prev,
      parentEmail: email,
      parentName: parent ? parent.name : prev.parentName
    }))
  }

  const handleUpdateUser = async (id, payload) => {
    try {
      const requestPayload = {
        name: payload.name,
        email: payload.email,
        role: payload.role
      }

      if (payload.role === 'teacher') {
        requestPayload.department = payload.teacherDepartment || 'Teaching'
        requestPayload.subject = payload.teacherSubject || ''
        requestPayload.subjects = payload.subjects || []
        requestPayload.classes = payload.classes || []
        requestPayload.classTeacherClasses = payload.classTeacherClasses || []
        requestPayload.bio = payload.bio || ''
        requestPayload.phone = payload.phone || ''
      }

      if (payload.role === 'teacher' && editPhotoFile) {
        const formData = new FormData()
        Object.entries(requestPayload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else if (value !== undefined && value !== null) {
            formData.append(key, value)
          }
        })
        formData.append('photo', editPhotoFile)
        await axios.put(`${API_URL}/api/users/${id}`, formData, { headers: getAuthHeaders() })
      } else {
        await axios.put(`${API_URL}/api/users/${id}`, requestPayload, { headers: getAuthHeaders() })
      }

      setEditPhotoFile(null)
      setEditPhotoPreview('')
      setEditingUser(null)
      fetchAccounts()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user')
    }
  }

  const fetchAudits = async (userId = null) => {
    try {
      const params = { page: auditPage, limit: auditLimit }
      if (userId) params.userId = userId
      const res = await axios.get(`${API_URL}/api/users/audits`, { headers: getAuthHeaders(), params })
      setAudits(res.data.audits || [])
      setShowAuditsModal(true)
    } catch (err) { console.error('Failed to fetch audits', err) }
  }

  const handleApproveResult = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/results/${id}`, { status: 'approved' }, { headers: getAuthHeaders() })
      setResults(results.map(r => r.id === id ? res.data : r))
    } catch (err) { alert('Failed to approve result.') }
  }

  const handleAdminEditResult = (result) => { setAdminEditResult(result); setAdminEditScores(getNormalizedScores(result.scores || {})); setAdminEditRemarks(result.remarks || '') }

  const handleAdminSaveEdit = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/results/${adminEditResult.id}`, { scores: adminEditScores, remarks: adminEditRemarks, status: adminEditResult.status }, { headers: getAuthHeaders() })
      setResults(results.map(r => r.id === adminEditResult.id ? res.data : r))
      setAdminEditResult(null)
    } catch (err) { alert('Failed to save changes.') }
  }

  const handleAdminDeleteResult = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return
    try {
      await axios.delete(`${API_URL}/api/results/${id}`)
      setResults(results.filter(r => r.id !== id))
    } catch (err) { alert('Failed to delete result.') }
  }

  const handleAdminDownloadPDF = async (result) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const student = result.student || {}
      const scores = getNormalizedScores(result.scores || {})
      const pageWidth = doc.internal.pageSize.getWidth()

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
      doc.text(`${student.firstName || ''} ${student.lastName || ''}`, 50, 73)
      doc.text(`${student.studentId || ''}`, 50, 82)
      doc.text(`${result.gradeLevel || ''}`, 50, 91)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 60, 110)
      doc.text('Gender:', 120, 73)
      doc.text('Date of Birth:', 120, 82)
      doc.text('Status:', 120, 91)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      doc.text(`${student.gender || ''}`, 150, 73)
      doc.text(`${student.dateOfBirth || ''}`, 150, 82)
      doc.text(`${student.status || ''}`, 150, 91)

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
    const _attHeaders = getAuthHeaders()
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
    const sigHeight = 22
    doc.setFillColor(255, 255, 255); doc.rect(10, y, pageWidth - 20, sigHeight, 'F')
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.4); doc.rect(10, y, pageWidth - 20, sigHeight)

    // Left: Headmaster signature line
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 60, 110)
    doc.text("Headmaster's Signature:", 15, y + 6)
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.3)
    doc.line(15, y + 17, 90, y + 17)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(100, 100, 100)
    doc.text('Signature & Stamp', 15, y + 21)

    // Right: Date
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(26, 60, 110)
    doc.text('Date:', pageWidth - 80, y + 6)
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.3)
    doc.line(pageWidth - 80, y + 17, pageWidth - 15, y + 17)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(100, 100, 100)
    doc.text('______ / ______ / __________', pageWidth - 80, y + 21)

    y += sigHeight + 4

    // ── Footer — tight, no gap ──
    const footerHeight = 14
    doc.setFillColor(26, 60, 110); doc.rect(0, y, pageWidth, footerHeight, 'F')
    doc.setFillColor(212, 160, 23); doc.rect(0, y, pageWidth, 1.5, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255)
    doc.text('GOLDEN-INTELS INTERNATIONAL SCHOOL', pageWidth / 2, y + 6.5, { align: 'center' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(212, 160, 23)
    doc.text('We Nurture for Nature', pageWidth / 2, y + 11.5, { align: 'center' })
      doc.save(`${student.firstName || 'student'}_${student.lastName || ''}_${result.term || ''}_${result.academicYear || ''}.pdf`)
    } catch (error) {
      console.error('Admin PDF download failed:', error)
      alert('Failed to generate the PDF. Please try again.')
    }
  }

  const handleApproveApplication = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/admissions/${id}/approve`, {}, { headers: getAuthHeaders() })
      setApplications(applications.map(a => a.id === id ? res.data.application : a))
      setStudents(prev => [...prev, res.data.student])
      alert(`Application approved! Student ID: ${res.data.student.studentId} has been added to learners.`)
    } catch (err) { alert(err.response?.data?.message || 'Failed to approve application.') }
  }

  const handleRejectApplication = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/admissions/${id}/reject`, {}, { headers: getAuthHeaders() })
      setApplications(applications.map(a => a.id === id ? res.data : a))
    } catch (err) { alert(err.response?.data?.message || 'Failed to reject application.') }
  }

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return
    try {
      await axios.delete(`${API_URL}/api/admissions/${id}`, { headers: getAuthHeaders() })
      setApplications(applications.filter(a => a.id !== id))
    } catch (err) { alert('Failed to delete application.') }
  }

  const handleGenerateToken = async () => {
    setTokenLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/admission-tokens`, {}, { headers: getAuthHeaders() })
      setNewToken(res.data); setTokens([res.data, ...tokens])
    } catch (err) { alert('Failed to generate token.') }
    finally { setTokenLoading(false) }
  }

  const handleDeleteToken = async (id) => {
    if (!window.confirm('Are you sure you want to delete this token?')) return
    try {
      await axios.delete(`${API_URL}/api/admission-tokens/${id}`, { headers: getAuthHeaders() })
      setTokens(tokens.filter(t => t.id !== id))
    } catch (err) { alert('Failed to delete token.') }
  }

  const handleCopy = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000) }

  const handleGalleryImageChange = (e) => { const files = Array.from(e.target.files); setGalleryImages(files); setGalleryPreviews(files.map(f => URL.createObjectURL(f))) }

  const handleAddGalleryItem = async () => {
    if (!galleryForm.title || galleryImages.length === 0) { alert('Please add a title and at least one image.'); return }
    setGalleryLoading(true)
    try {
      const data = new FormData()
      data.append('title', galleryForm.title); data.append('description', galleryForm.description)
      data.append('category', galleryForm.category); data.append('uploadedBy', user?.name)
      galleryImages.forEach(img => data.append('images', img))
      const res = await axios.post(`${API_URL}/api/gallery`, data, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } })
      setGalleryItems([res.data, ...galleryItems]); setShowAddGallery(false)
      setGalleryForm({ title: '', description: '', category: 'Events' }); setGalleryImages([]); setGalleryPreviews([])
    } catch (err) { alert('Failed to upload gallery item.') }
    finally { setGalleryLoading(false) }
  }

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return
    try {
      await axios.delete(`${API_URL}/api/gallery/${id}`, { headers: getAuthHeaders() })
      setGalleryItems(galleryItems.filter(g => g.id !== id))
    } catch (err) { alert('Failed to delete gallery item.') }
  }

  const handleEditGalleryItem = async () => {
    try {
      const data = new FormData()
      data.append('title', galleryForm.title); data.append('description', galleryForm.description)
      data.append('category', galleryForm.category); data.append('uploadedBy', user?.name)
      if (galleryImages.length > 0) galleryImages.forEach(img => data.append('images', img))
      const res = await axios.put(`${API_URL}/api/gallery/${editingGallery.id}`, data, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } })
      setGalleryItems(galleryItems.map(g => g.id === editingGallery.id ? res.data : g))
      setEditingGallery(null); setGalleryForm({ title: '', description: '', category: 'Events' }); setGalleryImages([]); setGalleryPreviews([])
    } catch (err) { alert('Failed to update gallery item.') }
  }

  const handleNewsImageChange = (e) => { const files = Array.from(e.target.files); setNewsImages(files); setNewsPreviews(files.map(f => URL.createObjectURL(f))) }

  const handleAddNews = async () => {
    if (!newsForm.title || !newsForm.content) { alert('Please add a title and content.'); return }
    setNewsLoading(true)
    try {
      const data = new FormData()
      Object.entries(newsForm).forEach(([key, value]) => data.append(key, value))
      data.append('uploadedBy', user?.name)
      newsImages.forEach(img => data.append('images', img))
      const res = await axios.post(`${API_URL}/api/news`, data, { headers: getAuthHeaders() })
      setNewsItems([res.data, ...newsItems]); setShowAddNews(false)
      setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' })
      setNewsImages([]); setNewsPreviews([])
    } catch (err) {
      console.error('Failed to add news item:', err)
      alert(err.response?.data?.message || 'Failed to add news item.')
    }
    finally { setNewsLoading(false) }
  }

  const handleEditNews = async () => {
    try {
      const data = new FormData()
      Object.entries(newsForm).forEach(([key, value]) => data.append(key, value))
      newsImages.forEach(img => data.append('images', img))
      const res = await axios.put(`${API_URL}/api/news/${editingNews.id}`, data, { headers: getAuthHeaders() })
      setNewsItems(newsItems.map(n => n.id === editingNews.id ? res.data : n))
      setEditingNews(null)
      setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' })
      setNewsImages([]); setNewsPreviews([])
    } catch (err) {
      console.error('Failed to update news item:', err)
      alert(err.response?.data?.message || 'Failed to update news item.')
    }
  }

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await axios.delete(`${API_URL}/api/news/${id}`, { headers: getAuthHeaders() })
      setNewsItems(newsItems.filter(n => n.id !== id))
    } catch (err) { alert('Failed to delete news item.') }
  }

  const handleStaffPhotoChange = (e) => { const file = e.target.files[0]; if (file) { setStaffPhoto(file); setStaffPhotoPreview(URL.createObjectURL(file)) } }

  const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.role) { alert('Please fill in name and role.'); return }
    const isTeacher = staffForm.role.toLowerCase() === 'teacher'
    if (isTeacher && (!staffForm.classes.length && !staffForm.subjects.length && !staffForm.classTeacherClasses.length)) {
      alert('Teachers must be assigned at least one class, one subject, or one class-teacher class.')
      return
    }
    setStaffLoading(true)
    try {
      const data = new FormData()
      Object.entries(staffForm).forEach(([key, value]) => {
        if (Array.isArray(value)) data.append(key, JSON.stringify(value))
        else data.append(key, value)
      })
      if (staffPhoto) data.append('photo', staffPhoto)
      const res = await axios.post(`${API_URL}/api/staff`, data, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } })
      setStaffList([res.data, ...staffList]); setShowAddStaff(false)
      setStaffForm({ name: '', role: '', department: '', subject: '', subjects: [], classes: [], classTeacherClasses: [], bio: '', email: '', phone: '', category: 'teaching' })
      setStaffPhoto(null); setStaffPhotoPreview(null)
    } catch (err) { alert('Failed to add staff member.') }
    finally { setStaffLoading(false) }
  }

  const handleEditStaff = async () => {
    try {
      const isTeacher = staffForm.role.toLowerCase() === 'teacher'
      if (isTeacher && (!staffForm.classes.length && !staffForm.subjects.length && !staffForm.classTeacherClasses.length)) {
        alert('Teachers must be assigned at least one class, one subject, or one class-teacher class.')
        return
      }
      const data = new FormData()
      Object.entries(staffForm).forEach(([key, value]) => {
        if (Array.isArray(value)) data.append(key, JSON.stringify(value))
        else data.append(key, value)
      })
      if (staffPhoto) data.append('photo', staffPhoto)
      const res = await axios.put(`${API_URL}/api/staff/${editingStaff.id}`, data, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } })
      setStaffList(staffList.map(s => s.id === editingStaff.id ? res.data : s))
      setEditingStaff(null)
      setStaffForm({ name: '', role: '', department: '', subject: '', subjects: [], classes: [], classTeacherClasses: [], bio: '', email: '', phone: '', category: 'teaching' })
      setStaffPhoto(null); setStaffPhotoPreview(null)
    } catch (err) { alert('Failed to update staff member.') }
  }

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return
    try {
      await axios.delete(`${API_URL}/api/staff/${id}`, { headers: getAuthHeaders() })
      setStaffList(staffList.filter(s => s.id !== id))
    } catch (err) { alert('Failed to delete staff member.') }
  }

  const handleSaveFeeStructures = async () => {
    try {
      await Promise.all(Object.entries(feeStructures).map(([gradeLevel, monthlyFee]) =>
        axios.post(`${API_URL}/api/fees/structures`, { gradeLevel, monthlyFee })
      ))
      setFeeSaved(true); setTimeout(() => setFeeSaved(false), 3000)
    } catch (err) { alert('Failed to save fee structure.') }
  }

  const handleAddPayment = async () => {
    if (!paymentForm.studentId || !paymentForm.month || !paymentForm.year || !paymentForm.amountDue) { alert('Please fill all required fields.'); return }
    try {
      const res = await axios.post(`${API_URL}/api/fees/payments`, paymentForm)
      setFeePayments([res.data, ...feePayments]); setShowAddPayment(false)
      setPaymentForm({ studentId: '', month: '', year: '', amountDue: '', amountPaid: '', notes: '' })
    } catch (err) { alert('Failed to record payment.') }
  }

  const handleUpdatePayment = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/fees/payments/${editingPayment.id}`, paymentForm)
      setFeePayments(feePayments.map(p => p.id === editingPayment.id ? res.data : p))
      setEditingPayment(null)
      setPaymentForm({ studentId: '', month: '', year: '', amountDue: '', amountPaid: '', notes: '' })
    } catch (err) { alert('Failed to update payment.') }
  }

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return
    try {
      await axios.delete(`${API_URL}/api/fees/payments/${id}`)
      setFeePayments(feePayments.filter(p => p.id !== id))
    } catch (err) { alert('Failed to delete payment.') }
  }

  return (
   <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
     <div className={`${sidebarOpen ? 'w-64' : 'w-20'} text-white transition-all duration-300 flex flex-col h-screen overflow-y-auto`} style={{ background: '#800080' }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: '#ffff00', color: '#800080' }}>G</div>
              <div><p className="text-xs font-bold">Golden-Intels</p><p className="text-xs text-cyan-100">Admin Portal</p></div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-cyan-600">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
              style={{
                background: activeMenu === item.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: activeMenu === item.id ? '#ffff00' : 'rgba(255,255,255,0.85)',
                borderLeft: activeMenu === item.id ? '3px solid #ffff00' : '3px solid transparent',
                fontWeight: activeMenu === item.id ? '700' : '400'
              }}>
              {item.icon}{sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
            <LogOut size={20} />{sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
<div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between bg-white border-b">
  <div className="flex items-center gap-4">
    <h1 className="text-2xl font-bold text-cyan-700">
      {menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}
    </h1>
  </div>

  <div className="flex items-center gap-4">
    <NotificationBell onNotificationClick={(notif) => {
      console.log("Admin opened notification:", notif);
    }} />

    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
      {new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
    </button>
  </div>
</div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Dashboard */}
          {activeMenu === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className={`${stat.color} text-white rounded-2xl p-6 shadow-md`}>
                    <p className={`${stat.textColor} text-sm mb-1`}>{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-2">Admin Dashboard</h2>
                <p className="text-gray-600">Welcome to the Golden-Intels Admin Portal. Use the sidebar to navigate between sections.</p>
              </div>
            </div>
          )}

          {/* Admissions */}
          {activeMenu === 'admissions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Admissions</h2>
                <p className="text-gray-500 text-sm">Review and manage admission applications.</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {['All', 'pending', 'approved', 'rejected'].map(status => (
                  <button key={status} onClick={() => setAdmissionFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors capitalize ${admissionFilter === status ? 'bg-blue-600 text-white' : 'bg-white text-cyan-700 border border-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                    {status}
                    <span className="ml-2 bg-blue-500 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {status === 'All' ? applications.length : applications.filter(a => a.status === status).length}
                    </span>
                  </button>
                ))}
              </div>
              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No applications found.</div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map(app => (
                    <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-600">
                            {app.photo ? <img src={app.photo} alt={app.firstName} className="w-full h-full object-cover" loading="lazy" decoding="async" /> :
                              <div className="w-full h-full flex items-center justify-center text-cyan-700 font-bold text-xl">{app.firstName?.charAt(0)}</div>}
                          </div>
                          <div>
                            <h3 className="font-bold text-cyan-700 text-lg">{app.firstName} {app.lastName}</h3>
                            <p className="text-sm text-gray-500">Grade: {app.gradeLevel} | Gender: {app.gender}</p>
                            <p className="text-sm text-gray-400">Parent: {app.parentName} | {app.parentPhone}</p>
                            <p className="text-xs text-gray-400">Applied: {new Date(app.createdAt).toLocaleDateString()} | Serial: {app.serialNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-cyan-700'}`}>{app.status}</span>
                          <button onClick={() => setViewingApplication(app)} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"><Eye size={14} /> View</button>
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => handleApproveApplication(app.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Approve</button>
                              <button onClick={() => handleRejectApplication(app.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Reject</button>
                            </>
                          )}
                          <button onClick={() => handleDeleteApplication(app.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewingApplication && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Admission Application</h2>
                      <button onClick={() => setViewingApplication(null)} className="hover:text-cyan-600"><X size={24} /></button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 border-4 border-blue-600">
                          {viewingApplication.photo ? <img src={viewingApplication.photo} alt={viewingApplication.firstName} className="w-full h-full object-cover" loading="lazy" decoding="async" /> :
                            <div className="w-full h-full flex items-center justify-center text-cyan-700 font-bold text-2xl">{viewingApplication.firstName?.charAt(0)}</div>}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-cyan-700">{viewingApplication.firstName} {viewingApplication.lastName}</h3>
                          <p className="text-gray-500">{viewingApplication.gradeLevel} | {viewingApplication.gender}</p>
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${viewingApplication.status === 'approved' ? 'bg-green-100 text-green-700' : viewingApplication.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-cyan-700'}`}>{viewingApplication.status}</span>
                        </div>
                      </div>
                      {[
                        { title: "Learner's Data", fields: [['Date of Birth', viewingApplication.dateOfBirth], ['Gender', viewingApplication.gender], ['Grade Level', viewingApplication.gradeLevel], ['Previous School', viewingApplication.previousSchool]] },
                        { title: 'Family Data', fields: [['Parent Name', viewingApplication.parentName], ['Parent Email', viewingApplication.parentEmail], ['Parent Phone', viewingApplication.parentPhone]] },
                        { title: 'Emergency Contact', fields: [['Name', viewingApplication.emergencyName], ['Relationship', viewingApplication.emergencyRelationship], ['Phone', viewingApplication.emergencyPhone]] },
                      ].map((section, si) => (
                        <div key={si} className="mb-6">
                          <h4 className="font-bold text-white bg-blue-600 px-4 py-2 rounded-lg mb-3">{section.title}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {section.fields.map(([label, value], fi) => (
                              <div key={fi} className="bg-blue-50 rounded-lg px-3 py-2">
                                <p className="text-xs font-bold text-cyan-700">{label}</p>
                                <p className="text-sm text-gray-600">{value || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="mb-6">
                        <h4 className="font-bold text-white bg-blue-600 px-4 py-2 rounded-lg mb-3">Uploaded Documents</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[['NHIS Card - Front', viewingApplication.nhisFront], ['NHIS Card - Back', viewingApplication.nhisBack], ['Ghana Card - Front', viewingApplication.ghanaFront], ['Ghana Card - Back', viewingApplication.ghanaBack]].map((doc, di) => (
                            <div key={di} className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-bold text-cyan-700 mb-2">{doc[0]}</p>
                              {doc[1] ? <img src={doc[1]} alt={doc[0]} className="w-full h-28 object-cover rounded-lg" loading="lazy" decoding="async" /> : <p className="text-xs text-gray-400 italic">Not uploaded</p>}
                            </div>
                          ))}
                        </div>
                        {viewingApplication.signedBooklet && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-4">
                            <p className="text-sm font-bold text-cyan-700 mb-2">Signed Admission Booklet</p>
                            <button onClick={() => window.open(viewingApplication.signedBooklet, '_blank')} className="inline-block bg-blue-600 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Download Signed Booklet</button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {viewingApplication.status === 'pending' && (
                          <>
                            <button onClick={() => { handleApproveApplication(viewingApplication.id); setViewingApplication(null) }} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors">Approve & Add to Learners</button>
                            <button onClick={() => { handleRejectApplication(viewingApplication.id); setViewingApplication(null) }} className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">Reject Application</button>
                          </>
                        )}
                        <button onClick={() => setViewingApplication(null)} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finance */}
          {activeMenu === 'finance' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Finance</h2>
                <p className="text-gray-500 text-sm">Manage school fees and payments.</p>
              </div>
              <div className="flex gap-3 mb-6">
                {['fee-structure', 'payments'].map(tab => (
                  <button key={tab} onClick={() => setFinanceTab(tab)} className={`px-6 py-2 rounded-full text-sm font-bold transition-colors capitalize ${financeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-cyan-700 border border-blue-600'}`}>
                    {tab === 'fee-structure' ? 'Fee Structure' : 'Fee Payments'}
                  </button>
                ))}
              </div>
              {financeTab === 'fee-structure' && (
                <div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-cyan-700 mb-4">Set Monthly Fees by Class</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'].map(grade => (
                        <div key={grade} className="bg-blue-50 rounded-xl p-4">
                          <label className="block text-sm font-bold text-cyan-700 mb-2">{grade}</label>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm font-bold">GH₵</span>
                            <input type="number" value={feeStructures[grade] || ''} onChange={e => setFeeStructures({ ...feeStructures, [grade]: e.target.value })} placeholder="0.00" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleSaveFeeStructures} className="mt-6 bg-blue-600 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Fee Structure</button>
                    {feeSaved && <span className="ml-4 text-green-600 text-sm font-bold">✓ Saved successfully!</span>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-md"><p className="text-cyan-100 text-sm mb-1">Total Students</p><p className="text-3xl font-bold">{students.length}</p></div>
                    <div className="bg-[#0f6e56] text-white rounded-2xl p-6 shadow-md"><p className="text-green-200 text-sm mb-1">Total Collected</p><p className="text-3xl font-bold">GH₵ {feePayments.reduce((acc, p) => acc + p.amountPaid, 0).toFixed(2)}</p></div>
                    <div className="bg-blue-500 text-cyan-700 rounded-2xl p-6 shadow-md"><p className="text-cyan-700/70 text-sm mb-1">Total Outstanding</p><p className="text-3xl font-bold">GH₵ {feePayments.reduce((acc, p) => acc + p.balance, 0).toFixed(2)}</p></div>
                  </div>
                </div>
              )}
              {financeTab === 'payments' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-cyan-700">Fee Payments</h3>
                    <button onClick={() => setShowAddPayment(true)} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Record Payment</button>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {['All', 'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'].map(cls => (
                      <button key={cls} onClick={() => setFeeClassFilter(cls)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${feeClassFilter === cls ? 'bg-blue-600 text-white' : 'bg-white text-cyan-700 border border-blue-600 hover:bg-blue-600 hover:text-white'}`}>{cls}</button>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left">Student</th>
                          <th className="px-6 py-4 text-left">Class</th>
                          <th className="px-6 py-4 text-left">Month/Year</th>
                          <th className="px-6 py-4 text-left">Amount Due</th>
                          <th className="px-6 py-4 text-left">Amount Paid</th>
                          <th className="px-6 py-4 text-left">Balance</th>
                          <th className="px-6 py-4 text-left">Status</th>
                          <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeePayments.length === 0 ? (
                          <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">No payments recorded yet.</td></tr>
                        ) : (
                          filteredFeePayments.map((payment, index) => (
                            <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                              <td className="px-6 py-4 font-medium text-cyan-700">{payment.student?.firstName} {payment.student?.lastName}</td>
                              <td className="px-6 py-4 text-gray-600">{payment.student?.gradeLevel}</td>
                              <td className="px-6 py-4 text-gray-600">{payment.month} {payment.year}</td>
                              <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountDue.toFixed(2)}</td>
                              <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountPaid.toFixed(2)}</td>
                              <td className="px-6 py-4 text-gray-600">GH₵ {payment.balance.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : payment.status === 'partial' ? 'bg-blue-100 text-cyan-700' : 'bg-red-100 text-red-700'}`}>{payment.status}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button onClick={() => { setEditingPayment(payment); setPaymentForm({ amountPaid: payment.amountPaid, notes: payment.notes || '' }) }} className="bg-blue-500 hover:bg-blue-300 text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-lg">Edit</button>
                                  <button onClick={() => handleDeletePayment(payment.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {showAddPayment && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                    <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Record Fee Payment</h2>
                      <button onClick={() => setShowAddPayment(false)} className="hover:text-cyan-600"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Student</label>
                        <select value={paymentForm.studentId} onChange={e => { const s = students.find(s => s.id === parseInt(e.target.value)); setPaymentForm(prev => ({ ...prev, studentId: e.target.value, amountDue: s ? feeStructures[s.gradeLevel] || '' : '' })) }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                          <option value="">Select student...</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.gradeLevel}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Month</label>
                          <select value={paymentForm.month} onChange={e => setPaymentForm({ ...paymentForm, month: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                            <option value="">Select month</option>
                            {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Year</label>
                          <input type="text" value={paymentForm.year} onChange={e => setPaymentForm({ ...paymentForm, year: e.target.value })} placeholder="e.g. 2026" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Amount Due (GH₵)</label>
                          <input type="number" value={paymentForm.amountDue} onChange={e => setPaymentForm({ ...paymentForm, amountDue: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Amount Paid (GH₵)</label>
                          <input type="number" value={paymentForm.amountPaid} onChange={e => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Notes (optional)</label>
                        <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="e.g. Paid via mobile money" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleAddPayment} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors">Record Payment</button>
                        <button onClick={() => setShowAddPayment(false)} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {editingPayment && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                    <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Update Payment</h2>
                      <button onClick={() => setEditingPayment(null)} className="hover:text-cyan-600"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm font-bold text-cyan-700">{editingPayment.student?.firstName} {editingPayment.student?.lastName}</p>
                        <p className="text-xs text-gray-500">{editingPayment.month} {editingPayment.year} | Due: GH₵ {editingPayment.amountDue.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Amount Paid (GH₵)</label>
                        <input type="number" value={paymentForm.amountPaid} onChange={e => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Notes</label>
                        <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleUpdatePayment} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors">Update Payment</button>
                        <button onClick={() => setEditingPayment(null)} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance */}
          {activeMenu === 'performance' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Performance Review</h2>
                <p className="text-gray-500 text-sm">Review and approve submitted student results.</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {['All', 'pending', 'approved', 'rejected'].map(status => (
                  <button key={status} onClick={() => setResultFilter(status)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors capitalize ${resultFilter === status ? 'bg-blue-600 text-white' : 'bg-white text-cyan-700 border border-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                    {status}
                    <span className="ml-2 bg-blue-500 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-full">{status === 'All' ? results.length : results.filter(r => r.status === status).length}</span>
                  </button>
                ))}
              </div>
              {filteredResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No results found.</div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map(result => (
                    <div key={result.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-600">
                            {result.student?.photo ? <img src={result.student.photo} alt={result.student.firstName} className="w-full h-full object-cover" loading="lazy" decoding="async" /> :
                              <div className="w-full h-full flex items-center justify-center text-cyan-700 font-bold">{result.student?.firstName?.charAt(0)}</div>}
                          </div>
                          <div>
                            <h3 className="font-bold text-cyan-700 text-lg">{result.student?.firstName} {result.student?.lastName}</h3>
                            <p className="text-sm text-gray-500">{result.student?.studentId} | {result.gradeLevel}</p>
                            <p className="text-sm text-gray-400">{result.academicYear} | {result.term}</p>
                            <p className="text-xs text-gray-400">Submitted by: {result.submittedBy} on {new Date(result.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${result.status === 'approved' ? 'bg-green-100 text-green-700' : result.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-cyan-700'}`}>{result.status}</span>
                          {result.status !== 'approved' && <button onClick={() => handleApproveResult(result.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Approve</button>}
                          <button onClick={() => handleAdminEditResult(result)} className="bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors">Edit</button>
                          <button onClick={() => handleAdminDownloadPDF(result)} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Download PDF</button>
                          <button onClick={() => handleAdminDeleteResult(result.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {adminEditResult && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Edit Result</h2>
                      <button onClick={() => setAdminEditResult(null)} className="hover:text-cyan-600"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-500">Editing result for <span className="font-bold text-cyan-700">{adminEditResult.student?.firstName} {adminEditResult.student?.lastName}</span></p>
                      {SUBJECTS.map(subject => {
                        const s = adminEditScores[subject] || {}
                        return (
                          <div key={subject} className="bg-blue-50 rounded-xl p-4">
                            <h4 className="font-bold text-cyan-700 mb-3 text-sm">{subject}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {[{ key: 'classScore', label: 'Class(10)' }, { key: 'cat1', label: 'CAT1(20)' }, { key: 'cat2', label: 'CAT2(20)' }, { key: 'exam', label: 'Exam(100)' }].map(field => (
                                <div key={field.key}>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{field.label}</label>
                                  <input type="number" min="0" max="100" value={s[field.key] || ''} onChange={e => setAdminEditScores(prev => ({ ...prev, [subject]: { ...prev[subject], [field.key]: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Teacher's Remarks</label>
                        <textarea value={adminEditRemarks} onChange={e => setAdminEditRemarks(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleAdminSaveEdit} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors">Save Changes</button>
                        <button onClick={() => setAdminEditResult(null)} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Learners */}
          {activeMenu === 'learners' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-cyan-700">Learners</h2>
                <button onClick={() => setShowAddStudent(true)} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add Learner</button>
              </div>
              {showAddStudent && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-bold text-cyan-700 mb-6">Add New Learner</h3>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-blue-100 overflow-hidden border-4 border-blue-600 flex items-center justify-center">
                      {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <span className="text-gray-400 text-xs text-center px-2">No Photo</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Passport Photo</label>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-gray-600" />
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP. Max 5MB.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">First Name</label>
                      <input type="text" value={newStudent.firstName} onChange={e => setNewStudent({ ...newStudent, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Last Name</label>
                      <input type="text" value={newStudent.lastName} onChange={e => setNewStudent({ ...newStudent, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Learner Email</label>
                      <input type="email" value={newStudent.learnerEmail} onChange={e => setNewStudent({ ...newStudent, learnerEmail: e.target.value })} placeholder="Create learner dashboard email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      <p className="text-xs text-gray-400 mt-1">Optional, but recommended if the learner should access their dashboard.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Learner Password</label>
                      <input type="password" value={newStudent.learnerPassword} onChange={e => setNewStudent({ ...newStudent, learnerPassword: e.target.value })} placeholder="Create learner dashboard password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Date of Birth</label>
                      <input type="date" value={newStudent.dateOfBirth} onChange={e => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Existing Parent Account</label>
                      <select value={newStudent.parentEmail} onChange={e => handleParentAccountSelect(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                        <option value="">Select existing parent or leave blank</option>
                        {parentAccounts.map(parent => (
                          <option key={parent.id} value={parent.email}>{parent.name} — {parent.email}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Link the learner to an existing parent user account for better reporting.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Parent Name</label>
                      <input type="text" value={newStudent.parentName} onChange={e => setNewStudent({ ...newStudent, parentName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Parent Email</label>
                      <input type="email" value={newStudent.parentEmail} onChange={e => setNewStudent({ ...newStudent, parentEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Parent Phone</label>
                      <input type="text" value={newStudent.parentPhone} onChange={e => setNewStudent({ ...newStudent, parentPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Address</label>
                      <input type="text" value={newStudent.address} onChange={e => setNewStudent({ ...newStudent, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Gender</label>
                      <select value={newStudent.gender} onChange={e => setNewStudent({ ...newStudent, gender: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Grade Level</label>
                      <select value={newStudent.gradeLevel} onChange={e => setNewStudent({ ...newStudent, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                        <option value="">Select grade</option>
                        {['Nursery','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={handleAddStudent} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Learner</button>
                    <button onClick={() => { setShowAddStudent(false); setPhotoFile(null); setPhotoPreview(null) }} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mb-6">
                {classes.map(cls => (
                  <button key={cls} onClick={() => setActiveClass(cls)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeClass === cls ? 'bg-blue-600 text-white' : 'bg-white text-cyan-700 border border-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                    {cls}
                    <span className="ml-2 bg-blue-500 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-full">{cls === 'All' ? students.length : students.filter(s => s.gradeLevel === cls).length}</span>
                  </button>
                ))}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-cyan-700">{activeClass === 'All' ? 'All Learners' : `${activeClass} Class`}<span className="ml-2 text-gray-400 text-sm font-normal">({filteredStudents.length} learners)</span></h3>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Photo</th>
                      <th className="px-6 py-4 text-left">Student ID</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Grade</th>
                      <th className="px-6 py-4 text-left">Gender</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No learners in this class yet.</td></tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-600">
                              {student.photo ? <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" loading="lazy" decoding="async" /> :
                                <div className="w-full h-full flex items-center justify-center text-cyan-700 font-bold text-sm">{student.firstName?.charAt(0)}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full">{student.studentId}</span></td>
                          <td className="px-6 py-4 font-medium text-cyan-700">{student.firstName} {student.lastName}</td>
                          <td className="px-6 py-4"><span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">{student.gradeLevel}</span></td>
                          <td className="px-6 py-4 text-gray-600">{student.gender}</td>
                          <td className="px-6 py-4"><span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{student.status}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSelectedStudent(student)} className="bg-blue-600 hover:bg-blue-400 text-white p-2 rounded-lg transition-colors"><Eye size={16} /></button>
                              <button onClick={() => handleDeleteStudent(student.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create Account */}
          {activeMenu === 'create-account' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl">
              <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-2">Create Account</h2>
              <p className="text-gray-500 mb-8">Create accounts for teachers and parents to access their respective portals.</p>
              {createSuccess && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">Account created successfully!</div>}
              {createError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{createError}</div>}
              <div className="space-y-5">
                {[['Full Name','name','text','Enter full name'],['Email Address','email','email','Enter email address'],['Password','password','password','Enter password']].map(([label, key, type, placeholder]) => (
                  <div key={key}>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">{label}</label>
                    <input type={type} value={newUser[key]} onChange={e => setNewUser({ ...newUser, [key]: e.target.value })} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-bold text-cyan-700 mb-2">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...initialNewUserState, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {newUser.role === 'teacher' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Assign Classes</label>
                      <div className="grid grid-cols-2 gap-2">
                        {classes.filter(c => c !== 'All').map(className => (
                          <button key={className} type="button" onClick={() => toggleSelection('classes', className)} className={`text-left px-3 py-2 rounded-xl border ${newUser.classes.includes(className) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
                            {className}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Class Teacher For (optional)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {classes.filter(c => c !== 'All').map(className => (
                          <button key={className} type="button" onClick={() => toggleSelection('classTeacherClasses', className)} className={`text-left px-3 py-2 rounded-xl border ${newUser.classTeacherClasses.includes(className) ? 'bg-[#0f6e56] text-white border-[#0f6e56]' : 'bg-white text-gray-700 border-gray-200'}`}>
                            {className}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Select classes that should unlock class-teacher attendance and remarks access for this teacher.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Primary Subject</label>
                      <select value={newUser.teacherSubject} onChange={e => setNewUser({ ...newUser, teacherSubject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                        <option value="">Select primary subject</option>
                        {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Additional Subjects</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SUBJECTS.map(subject => (
                          <button key={subject} type="button" onClick={() => toggleSelection('subjects', subject)} className={`text-left px-3 py-2 rounded-xl border ${newUser.subjects.includes(subject) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {newUser.role === 'learner' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Learner First Name</label>
                        <input type="text" value={newUser.learnerFirstName} onChange={e => setNewUser({ ...newUser, learnerFirstName: e.target.value })} placeholder="Enter first name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Learner Last Name</label>
                        <input type="text" value={newUser.learnerLastName} onChange={e => setNewUser({ ...newUser, learnerLastName: e.target.value })} placeholder="Enter last name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Date of Birth</label>
                        <input type="date" value={newUser.learnerDateOfBirth} onChange={e => setNewUser({ ...newUser, learnerDateOfBirth: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Grade Level</label>
                        <select value={newUser.learnerGradeLevel} onChange={e => setNewUser({ ...newUser, learnerGradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                          <option value="">Select grade</option>
                          {['Nursery','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Gender</label>
                        <select value={newUser.learnerGender} onChange={e => setNewUser({ ...newUser, learnerGender: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Existing Parent Account</label>
                      <select value={newUser.learnerParentEmail} onChange={e => {
                        const email = e.target.value
                        const parent = parentAccounts.find(p => p.email === email)
                        setNewUser(prev => ({ ...prev, learnerParentEmail: email, learnerParentName: parent ? parent.name : prev.learnerParentName }))
                      }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                        <option value="">Select existing parent or leave blank</option>
                        {parentAccounts.map(parent => (
                          <option key={parent.id} value={parent.email}>{parent.name} — {parent.email}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Parent Name</label>
                        <input type="text" value={newUser.learnerParentName} onChange={e => setNewUser({ ...newUser, learnerParentName: e.target.value })} placeholder="Enter parent name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Parent Phone</label>
                        <input type="text" value={newUser.learnerParentPhone} onChange={e => setNewUser({ ...newUser, learnerParentPhone: e.target.value })} placeholder="Enter parent phone" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">If provided, learner details will be used to create a linked student profile for the learner portal.</p>
                  </div>
                )}

                <button onClick={handleCreateAccount} disabled={createLoading} className="w-full bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">{createLoading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </div>
          )}

          {/* Accounts */}
          {activeMenu === 'accounts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Accounts</h2>
                  <p className="text-gray-500 text-sm">Manage parent, learner and teacher accounts. You can view, edit or deactivate accounts.</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => { setAccountTab('parents'); setAccountPage(1) }} className={`px-4 py-2 rounded-lg ${accountTab==='parents'?'bg-blue-600 text-white':'bg-white border'}`}>Parents</button>
                  <button onClick={() => { setAccountTab('learners'); setAccountPage(1) }} className={`px-4 py-2 rounded-lg ${accountTab==='learners'?'bg-blue-600 text-white':'bg-white border'}`}>Learners</button>
                  <button onClick={() => { setAccountTab('teachers'); setAccountPage(1) }} className={`px-4 py-2 rounded-lg ${accountTab==='teachers'?'bg-blue-600 text-white':'bg-white border'}`}>Teachers</button>
                  <button onClick={fetchAccounts} className="px-4 py-2 rounded-lg bg-green-50 border">Refresh</button>
                  <button onClick={() => fetchAudits()} className="px-4 py-2 rounded-lg bg-gray-50 border">View Audits</button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <input value={accountQuery} onChange={e => setAccountQuery(e.target.value)} placeholder="Search accounts by name or email" className="flex-1 border px-3 py-2 rounded" />
                <select value={accountLimit} onChange={e => { setAccountLimit(parseInt(e.target.value)); setAccountPage(1) }} className="border px-3 py-2 rounded">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <button onClick={() => { setAccountPage(1); fetchAccounts() }} className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
              </div>

              {accountLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : (
                <div>
                  {accountTab === 'parents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {users.map(u => (
                        <div key={u.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-[#4a235a]">{u.name}</h3>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {u.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditUser(u)} className="px-3 py-2 bg-blue-600 text-white rounded">Edit</button>
                              {u.active === false ? (
                                <>
                                  <button onClick={() => handleReactivateUser(u.email)} className="px-3 py-2 bg-green-600 text-white rounded">Reactivate</button>
                                  <button onClick={() => handleDeleteUser(u.id, u.email)} className="px-3 py-2 bg-gray-700 text-white rounded">Delete</button>
                                </>
                              ) : (
                                <button onClick={() => handleDeactivateUser(u.email)} className="px-3 py-2 bg-red-500 text-white rounded">Deactivate</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* pagination */}
                      <div className="col-span-full flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">Showing {(accountPage-1)*accountLimit + 1} - {Math.min(accountPage*accountLimit, accountTotal)} of {accountTotal}</div>
                        <div className="flex items-center gap-2">
                          <button disabled={accountPage <= 1} onClick={() => { setAccountPage(p => Math.max(1, p-1)); fetchAccounts() }} className="px-3 py-1 border rounded">Prev</button>
                          <div className="px-3 py-1 border rounded">{accountPage}</div>
                          <button disabled={accountPage*accountLimit >= accountTotal} onClick={() => { setAccountPage(p => p+1); fetchAccounts() }} className="px-3 py-1 border rounded">Next</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {accountTab === 'learners' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {students.map(s => (
                        <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-[#4a235a]">{s.firstName} {s.lastName}</h3>
                              <p className="text-sm text-gray-500">{s.studentId} | {s.gradeLevel}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSelectedStudent(s)} className="px-3 py-2 bg-blue-600 text-white rounded">View</button>
                              <button onClick={() => { setEditStudent(s); setEditMode(true) }} className="px-3 py-2 bg-yellow-400 text-white rounded">Edit</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {accountTab === 'teachers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {users.map(u => {
                        const staffInfo = u.teacherInfo
                        return (
                          <div key={u.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-[#4a235a]">{u.name}</h3>
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {u.active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{u.email} | {u.role}</p>
                                {staffInfo ? (
                                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                                    {staffInfo.classes?.length > 0 && <p>Classes: {staffInfo.classes.join(', ')}</p>}
                                    {staffInfo.subjects?.length > 0 && <p>Subjects: {staffInfo.subjects.join(', ')}</p>}
                                  </div>
                                ) : (
                                  <p className="mt-3 text-xs text-orange-600">No staff assignment found for this teacher.</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEditUser(u)} className="px-3 py-2 bg-blue-600 text-white rounded">Edit</button>
                                {u.active === false ? (
                                  <>
                                    <button onClick={() => handleReactivateUser(u.email)} className="px-3 py-2 bg-green-600 text-white rounded">Reactivate</button>
                                    <button onClick={() => handleDeleteUser(u.id, u.email)} className="px-3 py-2 bg-gray-700 text-white rounded">Delete</button>
                                  </>
                                ) : (
                                  <button onClick={() => handleDeactivateUser(u.email)} className="px-3 py-2 bg-red-500 text-white rounded">Deactivate</button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Edit user modal */}
              {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <h3 className="font-bold text-cyan-700 text-xl">Edit Account</h3>
                        <p className="text-sm text-gray-500">Update the account details and teacher profile information for this user.</p>
                      </div>
                      <button onClick={() => { setEditingUser(null); setEditPhotoFile(null); setEditPhotoPreview('') }} className="text-gray-500">✕</button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Full Name</label>
                        <input className="w-full border px-3 py-2 rounded-lg" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Email</label>
                        <input className="w-full border px-3 py-2 rounded-lg" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Role</label>
                        <select className="w-full border px-3 py-2 rounded-lg" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                          <option value="parent">Parent</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {editingUser.role === 'teacher' && (
                        <div className="space-y-4 border border-gray-100 rounded-2xl p-4 bg-gray-50">
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Department</label>
                            <input className="w-full border px-3 py-2 rounded-lg" value={editingUser.teacherDepartment || ''} onChange={e => setEditingUser({ ...editingUser, teacherDepartment: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Primary Subject</label>
                            <select className="w-full border px-3 py-2 rounded-lg" value={editingUser.teacherSubject || ''} onChange={e => setEditingUser({ ...editingUser, teacherSubject: e.target.value })}>
                              <option value="">Select primary subject</option>
                              {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Phone</label>
                            <input className="w-full border px-3 py-2 rounded-lg" value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Profile Photo</label>
                            <div className="space-y-3">
                              {editPhotoPreview || editingUser.photo ? (
                                <img src={editPhotoPreview || editingUser.photo} alt="Teacher preview" className="h-24 w-24 rounded-full object-cover border" />
                              ) : (
                                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">No photo</div>
                              )}
                              <input type="file" accept="image/*" onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setEditPhotoFile(file)
                                  setEditPhotoPreview(URL.createObjectURL(file))
                                }
                              }} className="block w-full text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Assigned Classes</label>
                            <div className="grid grid-cols-2 gap-2">
                              {classes.filter(c => c !== 'All').map(className => (
                                <button key={className} type="button" onClick={() => toggleEditSelection('classes', className)} className={`text-left px-3 py-2 rounded-xl border ${editingUser.classes.includes(className) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
                                  {className}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Class Teacher For</label>
                            <div className="grid grid-cols-2 gap-2">
                              {classes.filter(c => c !== 'All').map(className => (
                                <button key={className} type="button" onClick={() => toggleEditSelection('classTeacherClasses', className)} className={`text-left px-3 py-2 rounded-xl border ${editingUser.classTeacherClasses.includes(className) ? 'bg-[#0f6e56] text-white border-[#0f6e56]' : 'bg-white text-gray-700 border-gray-200'}`}>
                                  {className}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Additional Subjects</label>
                            <div className="grid grid-cols-2 gap-2">
                              {SUBJECTS.map(subject => (
                                <button key={subject} type="button" onClick={() => toggleEditSelection('subjects', subject)} className={`text-left px-3 py-2 rounded-xl border ${editingUser.subjects.includes(subject) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
                                  {subject}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">Bio</label>
                            <textarea className="w-full border px-3 py-2 rounded-lg" rows={4} value={editingUser.bio || ''} onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })} />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => { setEditingUser(null); setEditPhotoFile(null); setEditPhotoPreview('') }} className="px-4 py-2 rounded-lg border">Cancel</button>
                        <button onClick={() => handleUpdateUser(editingUser.id, editingUser)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audits modal */}
              {showAuditsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Account Audits</h3>
                      <button onClick={() => setShowAuditsModal(false)} className="px-3 py-1 border rounded">Close</button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-auto">
                      {audits.length === 0 && <div className="text-sm text-gray-500">No recent audits</div>}
                      {audits.map(a => (
                        <div key={a.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between text-sm text-gray-700">
                            <div>{a.action} — {a.performedBy}</div>
                            <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</div>
                          </div>
                          {a.details && <pre className="text-xs text-gray-500 mt-2">{JSON.stringify(a.details)}</pre>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admission Tokens */}
          {activeMenu === 'admission-tokens' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Admission Tokens</h2>
                  <p className="text-gray-500 text-sm">Generate serial numbers and PINs for parents who have paid the admission fee.</p>
                </div>
                <button onClick={handleGenerateToken} disabled={tokenLoading} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">{tokenLoading ? 'Generating...' : '+ Generate Token'}</button>
              </div>
              {newToken && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4"><CheckCircle size={20} className="text-green-600" /><h3 className="font-bold text-green-700">New Token Generated!</h3></div>
                  <p className="text-sm text-green-600 mb-4">Share these details with the parent. The PIN will not be shown again.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-cyan-700 text-lg">{newToken.serialNumber}</p>
                        <button onClick={() => handleCopy(newToken.serialNumber, 'serial')} className="text-gray-400 hover:text-cyan-700">{copiedId === 'serial' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}</button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">PIN (shown once)</p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-cyan-700 text-lg tracking-widest">{newToken.pin}</p>
                        <button onClick={() => handleCopy(newToken.pin, 'pin')} className="text-gray-400 hover:text-cyan-700">{copiedId === 'pin' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}</button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setNewToken(null)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">Dismiss</button>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Serial Number</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Created On</th>
                      <th className="px-6 py-4 text-left">Used On</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No tokens generated yet.</td></tr>
                    ) : (
                      tokens.map((token, index) => (
                        <tr key={token.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-6 py-4 font-bold text-cyan-700">{token.serialNumber}</td>
                          <td className="px-6 py-4"><span className={`text-xs font-bold px-3 py-1 rounded-full ${token.used ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{token.used ? 'Used' : 'Available'}</span></td>
                          <td className="px-6 py-4 text-gray-600">{new Date(token.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-gray-600">{token.usedAt ? new Date(token.usedAt).toLocaleDateString() : '—'}</td>
                          <td className="px-6 py-4"><button onClick={() => handleDeleteToken(token.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"><Trash2 size={16} /></button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gallery */}
          {activeMenu === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Gallery</h2>
                  <p className="text-gray-500 text-sm">Upload and manage school photos and events.</p>
                </div>
                <button onClick={() => setShowAddGallery(true)} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add Gallery Item</button>
              </div>
              {showAddGallery && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-bold text-cyan-700 mb-6">Add New Gallery Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Title</label>
                      <input type="text" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} placeholder="e.g. Sports Day 2026" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Category</label>
                      <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                        {['Events','Extra-curricular','Academic','Physical Education','Culture','Arts','Community'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Description</label>
                      <textarea value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-cyan-700 mb-2">Upload Images (up to 20)</label>
                      <input type="file" accept="image/*" multiple onChange={handleGalleryImageChange} className="text-sm text-gray-600 mb-3" />
                      {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 mt-3">
                          {galleryPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-xl" loading="lazy" decoding="async" />
                              <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{index + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleAddGalleryItem} disabled={galleryLoading} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50">{galleryLoading ? 'Uploading...' : 'Upload Gallery Item'}</button>
                    <button onClick={() => { setShowAddGallery(false); setGalleryPreviews([]); setGalleryImages([]) }} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}
              {galleryItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No gallery items yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="relative cursor-pointer" onClick={() => { setViewingGallery(item); setActiveGalleryImage(0) }}>
                        <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover" loading="lazy" decoding="async" />
                        {item.images.length > 1 && <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">+{item.images.length - 1} more</span>}
                        <span className="absolute top-2 left-2 bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full">{item.category}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-cyan-700 mb-1">{item.title}</h3>
                        {item.description && <p className="text-sm text-gray-500 mb-2">{item.description}</p>}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setEditingGallery(item); setGalleryForm({ title: item.title, description: item.description || '', category: item.category }) }} className="bg-blue-500 hover:bg-blue-300 text-cyan-700 p-1.5 rounded-lg transition-colors text-xs font-bold px-3">Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteGalleryItem(item.id) }} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {editingGallery && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Edit Gallery Item</h2>
                      <button onClick={() => setEditingGallery(null)} className="hover:text-cyan-600"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div><label className="block text-sm font-bold text-cyan-700 mb-2">Title</label><input type="text" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" /></div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Category</label>
                        <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                          {['Events','Extra-curricular','Academic','Physical Education','Culture','Arts','Community'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div><label className="block text-sm font-bold text-cyan-700 mb-2">Description</label><textarea value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" /></div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-2">Replace Images (optional)</label>
                        <input type="file" accept="image/*" multiple onChange={handleGalleryImageChange} className="text-sm text-gray-600" />
                        {galleryPreviews.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2 mt-3">{galleryPreviews.map((preview, index) => <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full h-16 object-cover rounded-lg" loading="lazy" decoding="async" />)}</div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2 mt-3">{editingGallery.images.map((img, index) => <img key={index} src={img} alt={`Current ${index + 1}`} className="w-full h-16 object-cover rounded-lg opacity-60" loading="lazy" decoding="async" />)}</div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleEditGalleryItem} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors">Save Changes</button>
                        <button onClick={() => { setEditingGallery(null); setGalleryPreviews([]); setGalleryImages([]) }} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {viewingGallery && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                  <div className="max-w-4xl w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div><h3 className="text-white font-bold text-xl">{viewingGallery.title}</h3><p className="text-gray-400 text-sm">{viewingGallery.category} | {new Date(viewingGallery.createdAt).toLocaleDateString()}</p></div>
                      <button onClick={() => setViewingGallery(null)} className="text-white hover:text-cyan-600 transition-colors"><X size={28} /></button>
                    </div>
                    <div className="relative mb-4">
                      <img src={viewingGallery.images[activeGalleryImage]} alt={viewingGallery.title} className="w-full max-h-[60vh] object-contain rounded-xl" loading="lazy" decoding="async" />
                      {viewingGallery.images.length > 1 && (
                        <>
                          <button onClick={() => setActiveGalleryImage(prev => prev === 0 ? viewingGallery.images.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">‹</button>
                          <button onClick={() => setActiveGalleryImage(prev => prev === viewingGallery.images.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">›</button>
                        </>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{activeGalleryImage + 1} / {viewingGallery.images.length}</span>
                    </div>
                    {viewingGallery.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {viewingGallery.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${index + 1}`}
                            onClick={() => setActiveGalleryImage(index)}
                            className={`w-16 h-16 object-cover rounded-lg cursor-pointer shrink-0 transition-all ${activeGalleryImage === index ? 'ring-2 ring-cyan-500' : 'opacity-60 hover:opacity-100'}`}
                            loading="lazy"
                            decoding="async"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* News & Events */}
          {activeMenu === 'news' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">News & Events</h2>
                  <p className="text-gray-500 text-sm">Manage school news and upcoming events.</p>
                </div>
                <button onClick={() => setShowAddNews(true)} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add News / Event</button>
              </div>
              <div className="flex gap-3 mb-6">
                {['All', 'news', 'event'].map(f => (
                  <button key={f} onClick={() => setNewsFilter(f)} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors capitalize ${newsFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-cyan-700 border border-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                    {f === 'All' ? 'All' : f === 'news' ? 'News' : 'Events'}
                    <span className="ml-2 bg-blue-500 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-full">{f === 'All' ? newsItems.length : newsItems.filter(n => n.type === f).length}</span>
                  </button>
                ))}
              </div>
              {(showAddNews || editingNews) && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">{editingNews ? 'Edit Item' : 'Add News / Event'}</h2>
                      <button onClick={() => { setShowAddNews(false); setEditingNews(null); setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' }); setNewsImages([]); setNewsPreviews([]) }} className="hover:text-cyan-600"><X size={24} /></button>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="block text-sm font-bold text-cyan-700 mb-2">Title</label><input type="text" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} placeholder="Enter title..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" /></div>
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Type</label>
                          <select value={newsForm.type} onChange={e => setNewsForm({ ...newsForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                            <option value="news">News</option>
                            <option value="event">Event</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Category</label>
                          <select value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                            {['General','Academic','Sports','Cultural','Community','Achievement'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        {newsForm.type === 'event' && (
                          <>
                            <div><label className="block text-sm font-bold text-cyan-700 mb-2">Event Date</label><input type="date" value={newsForm.eventDate} onChange={e => setNewsForm({ ...newsForm, eventDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-bold text-cyan-700 mb-2">Venue</label><input type="text" value={newsForm.venue} onChange={e => setNewsForm({ ...newsForm, venue: e.target.value })} placeholder="Event venue..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" /></div>
                          </>
                        )}
                        <div className="md:col-span-2"><label className="block text-sm font-bold text-cyan-700 mb-2">Content</label><textarea value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} rows={5} placeholder="Write the news or event details here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" /></div>
                        <div><label className="block text-sm font-bold text-cyan-700 mb-2">Video URL (optional)</label><input type="text" value={newsForm.videoUrl} onChange={e => setNewsForm({ ...newsForm, videoUrl: e.target.value })} placeholder="YouTube or video link..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" /></div>
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Images (up to 5)</label>
                          <input type="file" accept="image/*" multiple onChange={handleNewsImageChange} className="text-sm text-gray-600" />
                          {newsPreviews.length > 0 && <div className="grid grid-cols-4 gap-2 mt-3">{newsPreviews.map((preview, index) => <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full h-16 object-cover rounded-lg" loading="lazy" decoding="async" />)}</div>}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={editingNews ? handleEditNews : handleAddNews} disabled={newsLoading} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50">{newsLoading ? 'Saving...' : editingNews ? 'Save Changes' : 'Publish'}</button>
                        <button onClick={() => { setShowAddNews(false); setEditingNews(null); setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' }); setNewsImages([]); setNewsPreviews([]) }} className="bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {filteredNews.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No news or events yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNews.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      {item.images && item.images.length > 0 && <img src={item.images[0]} alt={item.title} className="w-full h-44 object-cover" loading="lazy" decoding="async" />}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.type === 'event' ? 'bg-blue-500 text-cyan-700' : 'bg-blue-600 text-white'}`}>{item.type === 'event' ? 'Event' : 'News'}</span>
                          <span className="text-xs text-gray-400">{item.category}</span>
                        </div>
                        <h3 className="font-bold text-cyan-700 mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.content}</p>
                        {item.type === 'event' && item.eventDate && (
                          <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
                            <p className="text-xs font-bold text-cyan-700">📅 {new Date(item.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            {item.venue && <p className="text-xs text-gray-500">📍 {item.venue}</p>}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingNews(item); setNewsForm({ title: item.title, content: item.content, category: item.category, type: item.type, videoUrl: item.videoUrl || '', eventDate: item.eventDate || '', venue: item.venue || '' }); setNewsPreviews([]); setNewsImages([]) }} className="bg-blue-500 hover:bg-blue-300 text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                            <button onClick={() => handleDeleteNews(item.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Our Staff */}
          {activeMenu === 'staff' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Our Staff</h2>
                  <p className="text-gray-500 text-sm">Manage school staff members.</p>
                </div>
                <button onClick={() => setShowAddStaff(true)} className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add Staff Member</button>
              </div>
              {(showAddStaff || editingStaff) && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
                      <button onClick={() => { setShowAddStaff(false); setEditingStaff(null); setStaffPhotoPreview(null); setStaffPhoto(null) }} className="hover:text-cyan-600"><X size={24} /></button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-600">
                          {staffPhotoPreview ? <img src={staffPhotoPreview} alt="Preview" className="w-full h-full object-cover" loading="lazy" decoding="async" /> :
                            editingStaff?.photo ? <img src={editingStaff.photo} alt="Current" className="w-full h-full object-cover" loading="lazy" decoding="async" /> :
                            <div className="w-full h-full flex items-center justify-center text-cyan-700 font-bold text-2xl">{staffForm.name?.charAt(0) || '?'}</div>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Staff Photo</label>
                          <input type="file" accept="image/*" onChange={handleStaffPhotoChange} className="text-sm text-gray-600" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[['Full Name *','name','text'],['Role *','role','text'],['Department','department','text'],['Email','email','email'],['Phone','phone','text']].map(([label, key, type]) => (
                          <div key={key}>
                            <label className="block text-sm font-bold text-cyan-700 mb-2">{label}</label>
                            <input type={type} value={staffForm[key]} onChange={e => setStaffForm({ ...staffForm, [key]: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                          </div>
                        ))}
                        <div className="md:col-span-2 rounded-3xl border border-cyan-200 bg-cyan-50 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-cyan-700">Teacher Assignment</h3>
                              <p className="text-sm text-gray-500">These assignments only apply when the staff role is set to <span className="font-semibold">Teacher</span>.</p>
                            </div>
                            {staffForm.role.toLowerCase() === 'teacher' && (
                              <span className="text-xs font-bold uppercase tracking-wide text-red-600">Required for teachers</span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-bold text-cyan-700 mb-2">Assigned Classes</label>
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-white">
                                {classes.slice(1).map(cls => (
                                  <label key={cls} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={staffForm.classes.includes(cls)} onChange={() => {
                                      const next = staffForm.classes.includes(cls)
                                        ? staffForm.classes.filter(c => c !== cls)
                                        : [...staffForm.classes, cls]
                                      setStaffForm({ ...staffForm, classes: next })
                                    }} className="rounded text-cyan-600" />
                                    {cls}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-cyan-700 mb-2">Assigned Subjects</label>
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-white">
                                {SUBJECTS.map(subj => (
                                  <label key={subj} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={staffForm.subjects.includes(subj)} onChange={() => {
                                      const next = staffForm.subjects.includes(subj)
                                        ? staffForm.subjects.filter(s => s !== subj)
                                        : [...staffForm.subjects, subj]
                                      setStaffForm({ ...staffForm, subjects: next })
                                    }} className="rounded text-cyan-600" />
                                    {subj}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Category</label>
                          <select value={staffForm.category} onChange={e => setStaffForm({ ...staffForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700">
                            <option value="leadership">Leadership & Management</option>
                            <option value="teaching">Teaching Staff</option>
                            <option value="support">Support Staff</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-cyan-700 mb-2">Bio</label>
                          <textarea value={staffForm.bio} onChange={e => setStaffForm({ ...staffForm, bio: e.target.value })} rows={3} placeholder="Short bio..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700" />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={editingStaff ? handleEditStaff : handleAddStaff} disabled={staffLoading} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">{staffLoading ? 'Saving...' : editingStaff ? 'Save Changes' : 'Add Staff Member'}</button>
                        <button onClick={() => { setShowAddStaff(false); setEditingStaff(null); setStaffPhotoPreview(null); setStaffPhoto(null) }} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {staffList.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No staff members added yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffList.map(member => (
                    <div key={member.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <div className="relative">
                        {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-48 object-cover" loading="lazy" decoding="async" /> :
                          <div className="w-full h-48 bg-blue-600 flex items-center justify-center"><span className="text-cyan-600 text-4xl font-bold">{member.name?.charAt(0)}</span></div>}
                        <span className={`absolute top-2 left-2 text-xs font-bold px-3 py-1 rounded-full ${member.category === 'leadership' ? 'bg-blue-500 text-cyan-700' : member.category === 'teaching' ? 'bg-blue-600 text-white' : 'bg-[#0f6e56] text-white'}`}>
                          {member.category === 'leadership' ? 'Leadership' : member.category === 'teaching' ? 'Teaching' : 'Support'}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-cyan-700 mb-1">{member.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">{member.role}</p>
                        {member.classes?.length > 0 && <p className="text-xs text-gray-500 mb-1">Assigned Classes: {member.classes.join(', ')}</p>}
                        {member.classTeacherClasses?.length > 0 && <p className="text-xs text-[#0f6e56] font-bold mb-1">Class Teacher For: {member.classTeacherClasses.join(', ')}</p>}
                        {member.subjects?.length > 0 && <p className="text-xs text-cyan-600 font-bold mb-2">Subjects: {member.subjects.join(', ')}</p>}
                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{member.bio}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingStaff(member); setStaffForm({ name: member.name, role: member.role, department: member.department || '', subject: member.subject || '', subjects: member.subjects || [], classes: member.classes || [], classTeacherClasses: member.classTeacherClasses || [], bio: member.bio || '', email: member.email || '', phone: member.phone || '', category: member.category }); setStaffPhotoPreview(null); setStaffPhoto(null) }} className="flex-1 bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold py-2 rounded-lg text-sm transition-colors">Edit</button>
                          <button onClick={() => handleDeleteStaff(member.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Contact Messages */}
{activeMenu === 'contact-messages' && (
  <div>
    <div className="mb-6">
      <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-1">Contact Messages</h2>
      <p className="text-gray-500 text-sm">Messages sent by visitors from the public contact page.</p>
    </div>
    {contactLoading ? (
      <div className="text-gray-400 text-center py-12">Loading...</div>
    ) : contactMessages.length === 0 ? (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">No contact messages yet.</div>
    ) : (
      <div className="space-y-4">
        {contactMessages.map(msg => (
          <div key={msg.id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${msg.read ? 'border-gray-100' : 'border-blue-400 shadow-blue-100'}`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {!msg.read && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />}
                  <h3 className="font-bold text-cyan-700 text-lg">{msg.name}</h3>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                  <span>✉️ <a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline">{msg.email}</a></span>
                  {msg.phone && <span>📞 <a href={`tel:${msg.phone}`} className="text-blue-600 hover:underline">{msg.phone}</a></span>}
                  {msg.subject && <span>📌 {msg.subject}</span>}
                </div>
                <p className="text-gray-700 text-sm line-clamp-2">{msg.message}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setViewingContact(msg)
                    if (!msg.read) {
                      axios.put(`${API_URL}/api/contact/${msg.id}/read`, {}, { headers: getAuthHeaders() })
                        .then(() => setContactMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m)))
                        .catch(() => {})
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Delete this message?')) return
                    await axios.delete(`${API_URL}/api/contact/${msg.id}`, { headers: getAuthHeaders() })
                    setContactMessages(prev => prev.filter(m => m.id !== msg.id))
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* View Contact Modal */}
    {viewingContact && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
          <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif">Contact Message</h2>
            <button onClick={() => setViewingContact(null)} className="hover:text-cyan-600"><X size={24} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[['Name', viewingContact.name], ['Email', viewingContact.email], ['Phone', viewingContact.phone || '—'], ['Subject', viewingContact.subject || '—'], ['Received', new Date(viewingContact.createdAt).toLocaleString()]].map(([label, value]) => (
                <div key={label} className="bg-blue-50 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-cyan-700">{label}</p>
                  <p className="text-sm text-gray-700">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-cyan-700 mb-1">Message</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingContact.message}</p>
            </div>
            <div className="flex gap-3">
              <a href={`mailto:${viewingContact.email}`} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors text-center text-sm">
                Reply via Email
              </a>
              <button onClick={() => setViewingContact(null)} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

      {/* Messages */}
      {activeMenu === 'messages' && <AdminMessages />}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif">Learner Profile</h2>
              <button onClick={() => { setSelectedStudent(null); setEditMode(false) }} className="hover:text-cyan-600 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-600">
                  {selectedStudent.photo ? <img src={selectedStudent.photo} alt={selectedStudent.firstName} className="w-full h-full object-cover" loading="lazy" decoding="async" /> :
                    <div className="w-full h-full flex items-center justify-center text-cyan-700 font-bold text-2xl">{selectedStudent.firstName?.charAt(0)}</div>}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cyan-700">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full mt-1">{selectedStudent.studentId}</span>
                  <p className="text-gray-500 text-sm mt-1">{selectedStudent.gradeLevel}</p>
                </div>
              </div>
              {!editMode ? (
                <div>
                  <div className="space-y-3 mb-6">
                    {[['Date of Birth', selectedStudent.dateOfBirth], ['Gender', selectedStudent.gender], ['Grade Level', selectedStudent.gradeLevel], ['Parent Name', selectedStudent.parentName], ['Parent Email', selectedStudent.parentEmail], ['Parent Account', selectedStudent.parent ? `${selectedStudent.parent.name} (${selectedStudent.parent.email})` : 'Not linked'], ['Parent Phone', selectedStudent.parentPhone], ['Address', selectedStudent.address], ['Status', selectedStudent.status], ['Enrolled On', new Date(selectedStudent.createdAt).toLocaleDateString()]].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 bg-blue-50 rounded-xl px-4 py-3">
                        <span className="text-sm font-bold text-cyan-700 w-32 shrink-0">{item[0]}</span>
                        <span className="text-sm text-gray-600">{item[1] || '—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditMode(true); setEditStudent({ ...selectedStudent }) }} className="flex-1 bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold py-3 rounded-xl transition-colors">Edit Details</button>
                    <button onClick={() => { setSelectedStudent(null); setEditMode(false) }} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors">Close</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-cyan-700 mb-1">First Name</label><input type="text" value={editStudent.firstName} onChange={e => setEditStudent({ ...editStudent, firstName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" /></div>
                      <div><label className="block text-sm font-bold text-cyan-700 mb-1">Last Name</label><input type="text" value={editStudent.lastName} onChange={e => setEditStudent({ ...editStudent, lastName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-cyan-700 mb-1">Date of Birth</label><input type="date" value={editStudent.dateOfBirth} onChange={e => setEditStudent({ ...editStudent, dateOfBirth: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" /></div>
                      <div>
                        <label className="block text-sm font-bold text-cyan-700 mb-1">Gender</label>
                        <select value={editStudent.gender} onChange={e => setEditStudent({ ...editStudent, gender: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm">
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-1">Grade Level</label>
                      <select value={editStudent.gradeLevel} onChange={e => setEditStudent({ ...editStudent, gradeLevel: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm">
                        {['Nursery','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-1">Existing Parent Account</label>
                      <select value={editStudent.parentEmail || ''} onChange={e => {
                        const parent = parentAccounts.find(p => p.email === e.target.value)
                        setEditStudent(prev => ({
                          ...prev,
                          parentEmail: e.target.value,
                          parentName: parent ? parent.name : prev.parentName
                        }))
                      }} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm">
                        <option value="">Select existing parent or use manual info</option>
                        {parentAccounts.map(parent => (
                          <option key={parent.id} value={parent.email}>{parent.name} — {parent.email}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Linking an existing parent account improves reporting and access.</p>
                    </div>
                    <div><label className="block text-sm font-bold text-cyan-700 mb-1">Parent Name</label><input type="text" value={editStudent.parentName} onChange={e => setEditStudent({ ...editStudent, parentName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" /></div>
                    <div><label className="block text-sm font-bold text-cyan-700 mb-1">Parent Email</label><input type="email" value={editStudent.parentEmail} onChange={e => setEditStudent({ ...editStudent, parentEmail: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" /></div>
                    <div><label className="block text-sm font-bold text-cyan-700 mb-1">Parent Phone</label><input type="text" value={editStudent.parentPhone} onChange={e => setEditStudent({ ...editStudent, parentPhone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" /></div>
                    <div><label className="block text-sm font-bold text-cyan-700 mb-1">Address</label><input type="text" value={editStudent.address} onChange={e => setEditStudent({ ...editStudent, address: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm" /></div>
                    <div>
                      <label className="block text-sm font-bold text-cyan-700 mb-1">Status</label>
                      <select value={editStudent.status} onChange={e => setEditStudent({ ...editStudent, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-sm">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                        <option value="transferred">Transferred</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleEditStudent} className="flex-1 bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors">Save Changes</button>
                    <button onClick={() => setEditMode(false)} className="flex-1 bg-blue-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
