import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign,
  BarChart2, UserPlus, LogOut, Menu, X, Bell, Eye, Trash2, Key, Copy, CheckCircle, Image, Newspaper, UserCircle
} from 'lucide-react'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <GraduationCap size={20} />, label: 'Admissions', id: 'admissions' },
  { icon: <DollarSign size={20} />, label: 'Finance', id: 'finance' },
  { icon: <BarChart2 size={20} />, label: 'Performance Review', id: 'performance' },
  { icon: <Users size={20} />, label: 'Learners', id: 'learners' },
  { icon: <UserPlus size={20} />, label: 'Create Account', id: 'create-account' },
  { icon: <Key size={20} />, label: 'Admission Tokens', id: 'admission-tokens' },
  { icon: <Image size={20} />, label: 'Gallery', id: 'gallery' },
  { icon: <Newspaper size={20} />, label: 'News & Events', id: 'news' },
  { icon: <UserCircle size={20} />, label: 'Our Staff', id: 'staff' },
]

const stats = [
  { label: 'Total Learners', value: '0', color: 'bg-[#1a3c6e]', textColor: 'text-blue-200' },
  { label: 'Admissions', value: '0', color: 'bg-[#0f6e56]', textColor: 'text-green-200' },
  { label: 'Total Revenue', value: 'GH₵ 0', color: 'bg-[#4a235a]', textColor: 'text-purple-200' },
  { label: 'Staff Members', value: '0', color: 'bg-[#d4a017]', textColor: 'text-[#1a3c6e]/80' },
]

const classes = ['All', 'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Create account state
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'teacher' })
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
    gradeLevel: '', parentName: '', parentEmail: '', parentPhone: '', address: ''
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
  const [staffForm, setStaffForm] = useState({ name: '', role: '', department: '', subject: '', bio: '', email: '', phone: '', category: 'teaching' })

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

  const filteredResults = resultFilter === 'All' ? results : results.filter(r => r.status === resultFilter)
  const filteredApplications = admissionFilter === 'All' ? applications : applications.filter(a => a.status === admissionFilter)
  const filteredStudents = activeClass === 'All' ? students : students.filter(s => s.gradeLevel === activeClass)
  const filteredFeePayments = feeClassFilter === 'All' ? feePayments : feePayments.filter(p => p.student?.gradeLevel === feeClassFilter)
  const filteredNews = newsFilter === 'All' ? newsItems : newsItems.filter(n => n.type === newsFilter)

  useEffect(() => {
    if (activeMenu === 'learners') {
      axios.get(`${API_URL}/api/students`).then(res => setStudents(res.data))
    }
    if (activeMenu === 'performance') {
      axios.get(`${API_URL}/api/results`).then(res => setResults(res.data))
    }
    if (activeMenu === 'admissions') {
      axios.get(`${API_URL}/api/admissions`).then(res => setApplications(res.data))
    }
    if (activeMenu === 'admission-tokens') {
      axios.get(`${API_URL}/api/admission-tokens`).then(res => setTokens(res.data))
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
  }, [activeMenu])

  const handleLogout = () => { logout(); navigate('/') }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)) }
  }

  const handleAddStudent = async () => {
    try {
      const formData = new FormData()
      Object.entries(newStudent).forEach(([key, value]) => formData.append(key, value))
      if (photoFile) formData.append('photo', photoFile)
      const res = await axios.post(`${API_URL}/api/students`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStudents([res.data, ...students])
      setShowAddStudent(false)
      setPhotoFile(null); setPhotoPreview(null)
      setNewStudent({ firstName: '', lastName: '', dateOfBirth: '', gender: '', gradeLevel: '', parentName: '', parentEmail: '', parentPhone: '', address: '' })
    } catch (err) { alert('Failed to add learner. Please fill all fields.') }
  }

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this learner?')) return
    try {
      await axios.delete(`${API_URL}/api/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
      if (selectedStudent?.id === id) setSelectedStudent(null)
    } catch (err) { alert('Failed to delete learner.') }
  }

  const handleEditStudent = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/students/${editStudent.id}`, editStudent)
      setStudents(students.map(s => s.id === editStudent.id ? res.data : s))
      setSelectedStudent(res.data)
      setEditMode(false)
    } catch (err) { alert('Failed to update learner details.') }
  }

  const handleCreateAccount = async () => {
    setCreateError(''); setCreateSuccess(false); setCreateLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/register`, newUser)
      setCreateSuccess(true)
      setNewUser({ name: '', email: '', password: '', role: 'teacher' })
    } catch (err) { setCreateError(err.response?.data?.message || 'Failed to create account.') }
    finally { setCreateLoading(false) }
  }

  const handleApproveResult = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/results/${id}`, { status: 'approved' })
      setResults(results.map(r => r.id === id ? res.data : r))
    } catch (err) { alert('Failed to approve result.') }
  }

  const handleAdminEditResult = (result) => { setAdminEditResult(result); setAdminEditScores(result.scores); setAdminEditRemarks(result.remarks || '') }

  const handleAdminSaveEdit = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/results/${adminEditResult.id}`, { scores: adminEditScores, remarks: adminEditRemarks, status: adminEditResult.status })
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
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const student = result.student
    const scores = result.scores
    const pageWidth = doc.internal.pageSize.getWidth()
    const logoData = await new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width; canvas.height = img.height
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
      img.src = new URL('../../assets/logo.png', import.meta.url).href
    })
    doc.setFillColor(26, 60, 110); doc.rect(0, 0, pageWidth, 45, 'F')
    doc.setFillColor(212, 160, 23); doc.rect(0, 45, pageWidth, 4, 'F')
    if (logoData) {
      doc.addImage(logoData, 'PNG', 12, 5, 32, 32)
    }
    doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold')
    doc.text('Golden-Intels International School', pageWidth / 2 + 10, 18, { align: 'center' })
    doc.setFontSize(10); doc.setFont('helvetica', 'italic'); doc.setTextColor(212, 160, 23)
    doc.text('Oxford Accredited School', pageWidth / 2 + 10, 27, { align: 'center' })
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255)
    doc.text(`Academic Year: ${result.academicYear}   |   Term: ${result.term}`, pageWidth / 2 + 10, 36, { align: 'center' })
    doc.setFillColor(240, 245, 255); doc.rect(0, 49, pageWidth, 12, 'F')
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 60, 110)
    doc.text('STUDENT ACADEMIC REPORT', pageWidth / 2, 57, { align: 'center' })
    doc.setFillColor(255, 255, 255); doc.rect(10, 64, pageWidth - 20, 28, 'F')
    doc.setDrawColor(212, 160, 23); doc.setLineWidth(0.5); doc.rect(10, 64, pageWidth - 20, 28)
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 60, 110)
    doc.text('Student Name:', 15, 73); doc.text('Student ID:', 15, 82); doc.text('Class:', 15, 91)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
    doc.text(`${student.firstName} ${student.lastName}`, 50, 73)
    doc.text(`${student.studentId}`, 50, 82); doc.text(`${result.gradeLevel}`, 50, 91)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 60, 110)
    doc.text('Gender:', 120, 73); doc.text('Date of Birth:', 120, 82); doc.text('Status:', 120, 91)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
    doc.text(`${student.gender}`, 150, 73); doc.text(`${student.dateOfBirth}`, 150, 82); doc.text(`${student.status}`, 150, 91)
    let y = 100
    doc.setFillColor(26, 60, 110); doc.rect(10, y, pageWidth - 20, 10, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Subject', 15, y + 7); doc.text('Class(10)', 65, y + 7); doc.text('CAT1(20)', 92, y + 7)
    doc.text('CAT2(20)', 119, y + 7); doc.text('Exam(50)', 146, y + 7); doc.text('Total', 170, y + 7); doc.text('Grade', 186, y + 7)
    y += 10
    const subjectsList = ['English', 'Maths', 'Science', 'Computing', 'RME', 'History', 'Ewe', 'French', 'UC MAS']
    let grandTotal = 0
    const getGrade = (t) => { if (t >= 90) return 'A+'; if (t >= 80) return 'A'; if (t >= 70) return 'B+'; if (t >= 60) return 'B'; if (t >= 50) return 'C'; if (t >= 40) return 'D'; return 'F' }
    const getGradeColor = (t) => { if (t >= 80) return [15, 110, 86]; if (t >= 60) return [26, 60, 110]; if (t >= 50) return [212, 160, 23]; return [220, 50, 50] }
    subjectsList.forEach((subject, index) => {
      const s = scores[subject] || {}
      const classScore = parseFloat(s.classScore) || 0; const cat1 = parseFloat(s.cat1) || 0
      const cat2 = parseFloat(s.cat2) || 0; const exam = parseFloat(s.exam) || 0
      const wExam = (exam / 100) * 50; const total = classScore + cat1 + cat2 + wExam
      grandTotal += total
      if (index % 2 === 0) { doc.setFillColor(245, 248, 255) } else { doc.setFillColor(255, 255, 255) }
      doc.rect(10, y, pageWidth - 20, 10, 'F')
      doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.2); doc.rect(10, y, pageWidth - 20, 10)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(26, 60, 110); doc.text(subject, 15, y + 7)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
      doc.text(classScore.toString(), 72, y + 7); doc.text(cat1.toString(), 99, y + 7)
      doc.text(cat2.toString(), 126, y + 7); doc.text(wExam.toFixed(2), 150, y + 7); doc.text(total.toFixed(2), 170, y + 7)
      const gradeColor = getGradeColor(total); doc.setFont('helvetica', 'bold'); doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2])
      doc.text(total > 0 ? getGrade(total) : '-', 188, y + 7); y += 10
    })
    doc.setFillColor(212, 160, 23); doc.rect(10, y, pageWidth - 20, 10, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(26, 60, 110)
    doc.text('Grand Total', 15, y + 7); doc.text(`${grandTotal.toFixed(2)} / 900`, 155, y + 7)
    y += 18
    if (logoData) {
      doc.saveGraphicsState()
      doc.setGState(new doc.GState({ opacity: 0.06 }))
      doc.addImage(logoData, 'PNG', 55, 100, 100, 100)
      doc.restoreGraphicsState()
    }
    doc.setFillColor(240, 245, 255); doc.rect(10, y, pageWidth - 20, 22, 'F')
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.5); doc.rect(10, y, pageWidth - 20, 22)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(26, 60, 110)
    doc.text("Class Teacher's Remarks:", 15, y + 8)
    doc.setFont('helvetica', 'italic'); doc.setTextColor(50, 50, 50)
    const remarksLines = doc.splitTextToSize(result.remarks || 'No remarks provided.', 170)
    doc.text(remarksLines, 15, y + 16); y += 30
    doc.setDrawColor(26, 60, 110); doc.setLineWidth(0.3)
    doc.line(15, y + 10, 70, y + 10); doc.line(85, y + 10, 140, y + 10); doc.line(155, y + 10, 200, y + 10)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 100, 100)
    doc.text("Class Teacher's Signature", 15, y + 15); doc.text("Head Teacher's Signature", 85, y + 15); doc.text("Parent's Signature", 155, y + 15)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(26, 60, 110)
    doc.text(`Submitted by: ${result.submittedBy}`, 15, y + 25); doc.text(`Date: ${new Date(result.createdAt).toLocaleDateString()}`, 140, y + 25)
    doc.setFillColor(26, 60, 110); doc.rect(0, 280, pageWidth, 17, 'F')
    doc.setFillColor(212, 160, 23); doc.rect(0, 278, pageWidth, 2, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255)
    doc.text('GOLDEN-INTELS INTERNATIONAL SCHOOL', pageWidth / 2, 287, { align: 'center' })
    doc.setFont('helvetica', 'normal'); doc.setTextColor(212, 160, 23)
    doc.text('Oxford Accredited | Excellence in Education', pageWidth / 2, 293, { align: 'center' })
    doc.save(`${student.firstName}_${student.lastName}_${result.term}_${result.academicYear}.pdf`)
  }

  const handleApproveApplication = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/admissions/${id}/approve`)
      setApplications(applications.map(a => a.id === id ? res.data.application : a))
      setStudents(prev => [...prev, res.data.student])
      alert(`Application approved! Student ID: ${res.data.student.studentId} has been added to learners.`)
    } catch (err) { alert('Failed to approve application.') }
  }

  const handleRejectApplication = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/admissions/${id}/reject`)
      setApplications(applications.map(a => a.id === id ? res.data : a))
    } catch (err) { alert('Failed to reject application.') }
  }

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return
    try {
      await axios.delete(`${API_URL}/api/admissions/${id}`)
      setApplications(applications.filter(a => a.id !== id))
    } catch (err) { alert('Failed to delete application.') }
  }

  const handleGenerateToken = async () => {
    setTokenLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/admission-tokens`)
      setNewToken(res.data); setTokens([res.data, ...tokens])
    } catch (err) { alert('Failed to generate token.') }
    finally { setTokenLoading(false) }
  }

  const handleDeleteToken = async (id) => {
    if (!window.confirm('Are you sure you want to delete this token?')) return
    try {
      await axios.delete(`${API_URL}/api/admission-tokens/${id}`)
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
      const res = await axios.post(`${API_URL}/api/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setGalleryItems([res.data, ...galleryItems]); setShowAddGallery(false)
      setGalleryForm({ title: '', description: '', category: 'Events' }); setGalleryImages([]); setGalleryPreviews([])
    } catch (err) { alert('Failed to upload gallery item.') }
    finally { setGalleryLoading(false) }
  }

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return
    try {
      await axios.delete(`${API_URL}/api/gallery/${id}`)
      setGalleryItems(galleryItems.filter(g => g.id !== id))
    } catch (err) { alert('Failed to delete gallery item.') }
  }

  const handleEditGalleryItem = async () => {
    try {
      const data = new FormData()
      data.append('title', galleryForm.title); data.append('description', galleryForm.description)
      data.append('category', galleryForm.category); data.append('uploadedBy', user?.name)
      if (galleryImages.length > 0) galleryImages.forEach(img => data.append('images', img))
      await axios.delete(`${API_URL}/api/gallery/${editingGallery.id}`)
      const res = await axios.post(`${API_URL}/api/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
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
      const res = await axios.post(`${API_URL}/api/news`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setNewsItems([res.data, ...newsItems]); setShowAddNews(false)
      setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' })
      setNewsImages([]); setNewsPreviews([])
    } catch (err) { alert('Failed to add news item.') }
    finally { setNewsLoading(false) }
  }

  const handleEditNews = async () => {
    try {
      const data = new FormData()
      Object.entries(newsForm).forEach(([key, value]) => data.append(key, value))
      newsImages.forEach(img => data.append('images', img))
      const res = await axios.put(`${API_URL}/api/news/${editingNews.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setNewsItems(newsItems.map(n => n.id === editingNews.id ? res.data : n))
      setEditingNews(null)
      setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' })
      setNewsImages([]); setNewsPreviews([])
    } catch (err) { alert('Failed to update news item.') }
  }

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await axios.delete(`${API_URL}/api/news/${id}`)
      setNewsItems(newsItems.filter(n => n.id !== id))
    } catch (err) { alert('Failed to delete news item.') }
  }

  const handleStaffPhotoChange = (e) => { const file = e.target.files[0]; if (file) { setStaffPhoto(file); setStaffPhotoPreview(URL.createObjectURL(file)) } }

  const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.role) { alert('Please fill in name and role.'); return }
    setStaffLoading(true)
    try {
      const data = new FormData()
      Object.entries(staffForm).forEach(([key, value]) => data.append(key, value))
      if (staffPhoto) data.append('photo', staffPhoto)
      const res = await axios.post(`${API_URL}/api/staff`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStaffList([res.data, ...staffList]); setShowAddStaff(false)
      setStaffForm({ name: '', role: '', department: '', subject: '', bio: '', email: '', phone: '', category: 'teaching' })
      setStaffPhoto(null); setStaffPhotoPreview(null)
    } catch (err) { alert('Failed to add staff member.') }
    finally { setStaffLoading(false) }
  }

  const handleEditStaff = async () => {
    try {
      const data = new FormData()
      Object.entries(staffForm).forEach(([key, value]) => data.append(key, value))
      if (staffPhoto) data.append('photo', staffPhoto)
      const res = await axios.put(`${API_URL}/api/staff/${editingStaff.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStaffList(staffList.map(s => s.id === editingStaff.id ? res.data : s))
      setEditingStaff(null)
      setStaffForm({ name: '', role: '', department: '', subject: '', bio: '', email: '', phone: '', category: 'teaching' })
      setStaffPhoto(null); setStaffPhotoPreview(null)
    } catch (err) { alert('Failed to update staff member.') }
  }

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return
    try {
      await axios.delete(`${API_URL}/api/staff/${id}`)
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a3c6e] text-white transition-all duration-300 flex flex-col h-screen overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e]">G</div>
              <div><p className="text-xs font-bold">Golden-Intels</p><p className="text-xs text-yellow-300">Admin Portal</p></div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-[#d4a017]">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${activeMenu === item.id ? 'bg-[#d4a017] text-[#1a3c6e] font-bold' : 'hover:bg-blue-800 text-blue-200'}`}>
              {item.icon}{sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-800 text-blue-200 transition-colors rounded-lg">
            <LogOut size={20} />{sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a3c6e] capitalize">{activeMenu.replace(/-/g, ' ')}</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-[#1a3c6e]">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4a017] rounded-full text-xs text-[#1a3c6e] font-bold flex items-center justify-center">0</span>
            </button>
            <div className="w-9 h-9 bg-[#1a3c6e] rounded-full flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)}</div>
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
                <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-2">Admin Dashboard</h2>
                <p className="text-gray-600">Welcome to the Golden-Intels Admin Portal. Use the sidebar to navigate between sections.</p>
              </div>
            </div>
          )}

          {/* Admissions */}
          {activeMenu === 'admissions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-1">Admissions</h2>
                <p className="text-gray-500 text-sm">Review and manage admission applications.</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {['All', 'pending', 'approved', 'rejected'].map(status => (
                  <button key={status} onClick={() => setAdmissionFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors capitalize ${admissionFilter === status ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'}`}>
                    {status}
                    <span className="ml-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-2 py-0.5 rounded-full">
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
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-[#1a3c6e]">
                            {app.photo ? <img src={app.photo} alt={app.firstName} className="w-full h-full object-cover" /> :
                              <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-xl">{app.firstName?.charAt(0)}</div>}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#1a3c6e] text-lg">{app.firstName} {app.lastName}</h3>
                            <p className="text-sm text-gray-500">Grade: {app.gradeLevel} | Gender: {app.gender}</p>
                            <p className="text-sm text-gray-400">Parent: {app.parentName} | {app.parentPhone}</p>
                            <p className="text-xs text-gray-400">Applied: {new Date(app.createdAt).toLocaleDateString()} | Serial: {app.serialNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{app.status}</span>
                          <button onClick={() => setViewingApplication(app)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"><Eye size={14} /> View</button>
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => handleApproveApplication(app.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Approve</button>
                              <button onClick={() => handleRejectApplication(app.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Reject</button>
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
                    <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Admission Application</h2>
                      <button onClick={() => setViewingApplication(null)} className="hover:text-[#d4a017]"><X size={24} /></button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 border-4 border-[#1a3c6e]">
                          {viewingApplication.photo ? <img src={viewingApplication.photo} alt={viewingApplication.firstName} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-2xl">{viewingApplication.firstName?.charAt(0)}</div>}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#1a3c6e]">{viewingApplication.firstName} {viewingApplication.lastName}</h3>
                          <p className="text-gray-500">{viewingApplication.gradeLevel} | {viewingApplication.gender}</p>
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${viewingApplication.status === 'approved' ? 'bg-green-100 text-green-700' : viewingApplication.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{viewingApplication.status}</span>
                        </div>
                      </div>
                      {[
                        { title: "Learner's Data", fields: [['Date of Birth', viewingApplication.dateOfBirth], ['Gender', viewingApplication.gender], ['Grade Level', viewingApplication.gradeLevel], ['Previous School', viewingApplication.previousSchool]] },
                        { title: 'Family Data', fields: [['Parent Name', viewingApplication.parentName], ['Parent Email', viewingApplication.parentEmail], ['Parent Phone', viewingApplication.parentPhone]] },
                        { title: 'Emergency Contact', fields: [['Name', viewingApplication.emergencyName], ['Relationship', viewingApplication.emergencyRelationship], ['Phone', viewingApplication.emergencyPhone]] },
                      ].map((section, si) => (
                        <div key={si} className="mb-6">
                          <h4 className="font-bold text-white bg-[#1a3c6e] px-4 py-2 rounded-lg mb-3">{section.title}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {section.fields.map(([label, value], fi) => (
                              <div key={fi} className="bg-gray-50 rounded-lg px-3 py-2">
                                <p className="text-xs font-bold text-[#1a3c6e]">{label}</p>
                                <p className="text-sm text-gray-600">{value || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="mb-6">
                        <h4 className="font-bold text-white bg-[#1a3c6e] px-4 py-2 rounded-lg mb-3">Uploaded Documents</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[['NHIS Card - Front', viewingApplication.nhisFront], ['NHIS Card - Back', viewingApplication.nhisBack], ['Ghana Card - Front', viewingApplication.ghanaFront], ['Ghana Card - Back', viewingApplication.ghanaBack]].map((doc, di) => (
                            <div key={di} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-bold text-[#1a3c6e] mb-2">{doc[0]}</p>
                              {doc[1] ? <img src={doc[1]} alt={doc[0]} className="w-full h-28 object-cover rounded-lg" /> : <p className="text-xs text-gray-400 italic">Not uploaded</p>}
                            </div>
                          ))}
                        </div>
                        {viewingApplication.signedBooklet && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-4">
                            <p className="text-sm font-bold text-[#1a3c6e] mb-2">Signed Admission Booklet</p>
                            <button onClick={() => window.open(viewingApplication.signedBooklet, '_blank')} className="inline-block bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Download Signed Booklet</button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {viewingApplication.status === 'pending' && (
                          <>
                            <button onClick={() => { handleApproveApplication(viewingApplication.id); setViewingApplication(null) }} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors">Approve & Add to Learners</button>
                            <button onClick={() => { handleRejectApplication(viewingApplication.id); setViewingApplication(null) }} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors">Reject Application</button>
                          </>
                        )}
                        <button onClick={() => setViewingApplication(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Close</button>
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
                <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-1">Finance</h2>
                <p className="text-gray-500 text-sm">Manage school fees and payments.</p>
              </div>
              <div className="flex gap-3 mb-6">
                {['fee-structure', 'payments'].map(tab => (
                  <button key={tab} onClick={() => setFinanceTab(tab)} className={`px-6 py-2 rounded-full text-sm font-bold transition-colors capitalize ${financeTab === tab ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e]'}`}>
                    {tab === 'fee-structure' ? 'Fee Structure' : 'Fee Payments'}
                  </button>
                ))}
              </div>
              {financeTab === 'fee-structure' && (
                <div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-[#1a3c6e] mb-4">Set Monthly Fees by Class</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'].map(grade => (
                        <div key={grade} className="bg-gray-50 rounded-xl p-4">
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">{grade}</label>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm font-bold">GH₵</span>
                            <input type="number" value={feeStructures[grade] || ''} onChange={e => setFeeStructures({ ...feeStructures, [grade]: e.target.value })} placeholder="0.00" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleSaveFeeStructures} className="mt-6 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Fee Structure</button>
                    {feeSaved && <span className="ml-4 text-green-600 text-sm font-bold">✓ Saved successfully!</span>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#1a3c6e] text-white rounded-2xl p-6 shadow-md"><p className="text-blue-200 text-sm mb-1">Total Students</p><p className="text-3xl font-bold">{students.length}</p></div>
                    <div className="bg-[#0f6e56] text-white rounded-2xl p-6 shadow-md"><p className="text-green-200 text-sm mb-1">Total Collected</p><p className="text-3xl font-bold">GH₵ {feePayments.reduce((acc, p) => acc + p.amountPaid, 0).toFixed(2)}</p></div>
                    <div className="bg-[#d4a017] text-[#1a3c6e] rounded-2xl p-6 shadow-md"><p className="text-[#1a3c6e]/70 text-sm mb-1">Total Outstanding</p><p className="text-3xl font-bold">GH₵ {feePayments.reduce((acc, p) => acc + p.balance, 0).toFixed(2)}</p></div>
                  </div>
                </div>
              )}
              {financeTab === 'payments' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1a3c6e]">Fee Payments</h3>
                    <button onClick={() => setShowAddPayment(true)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Record Payment</button>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {['All', 'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'].map(cls => (
                      <button key={cls} onClick={() => setFeeClassFilter(cls)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${feeClassFilter === cls ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'}`}>{cls}</button>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#1a3c6e] text-white">
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
                            <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 font-medium text-[#1a3c6e]">{payment.student?.firstName} {payment.student?.lastName}</td>
                              <td className="px-6 py-4 text-gray-600">{payment.student?.gradeLevel}</td>
                              <td className="px-6 py-4 text-gray-600">{payment.month} {payment.year}</td>
                              <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountDue.toFixed(2)}</td>
                              <td className="px-6 py-4 text-gray-600">GH₵ {payment.amountPaid.toFixed(2)}</td>
                              <td className="px-6 py-4 text-gray-600">GH₵ {payment.balance.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : payment.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{payment.status}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button onClick={() => { setEditingPayment(payment); setPaymentForm({ amountPaid: payment.amountPaid, notes: payment.notes || '' }) }} className="bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] text-xs font-bold px-3 py-1.5 rounded-lg">Edit</button>
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
                    <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Record Fee Payment</h2>
                      <button onClick={() => setShowAddPayment(false)} className="hover:text-[#d4a017]"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Student</label>
                        <select value={paymentForm.studentId} onChange={e => { const s = students.find(s => s.id === parseInt(e.target.value)); setPaymentForm(prev => ({ ...prev, studentId: e.target.value, amountDue: s ? feeStructures[s.gradeLevel] || '' : '' })) }} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                          <option value="">Select student...</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.gradeLevel}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Month</label>
                          <select value={paymentForm.month} onChange={e => setPaymentForm({ ...paymentForm, month: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                            <option value="">Select month</option>
                            {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Year</label>
                          <input type="text" value={paymentForm.year} onChange={e => setPaymentForm({ ...paymentForm, year: e.target.value })} placeholder="e.g. 2026" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Amount Due (GH₵)</label>
                          <input type="number" value={paymentForm.amountDue} onChange={e => setPaymentForm({ ...paymentForm, amountDue: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Amount Paid (GH₵)</label>
                          <input type="number" value={paymentForm.amountPaid} onChange={e => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Notes (optional)</label>
                        <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="e.g. Paid via mobile money" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleAddPayment} className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors">Record Payment</button>
                        <button onClick={() => setShowAddPayment(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {editingPayment && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                    <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Update Payment</h2>
                      <button onClick={() => setEditingPayment(null)} className="hover:text-[#d4a017]"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-bold text-[#1a3c6e]">{editingPayment.student?.firstName} {editingPayment.student?.lastName}</p>
                        <p className="text-xs text-gray-500">{editingPayment.month} {editingPayment.year} | Due: GH₵ {editingPayment.amountDue.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Amount Paid (GH₵)</label>
                        <input type="number" value={paymentForm.amountPaid} onChange={e => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Notes</label>
                        <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleUpdatePayment} className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors">Update Payment</button>
                        <button onClick={() => setEditingPayment(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
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
                <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-1">Performance Review</h2>
                <p className="text-gray-500 text-sm">Review and approve submitted student results.</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {['All', 'pending', 'approved', 'rejected'].map(status => (
                  <button key={status} onClick={() => setResultFilter(status)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors capitalize ${resultFilter === status ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'}`}>
                    {status}
                    <span className="ml-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-2 py-0.5 rounded-full">{status === 'All' ? results.length : results.filter(r => r.status === status).length}</span>
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
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-[#1a3c6e]">
                            {result.student?.photo ? <img src={result.student.photo} alt={result.student.firstName} className="w-full h-full object-cover" /> :
                              <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold">{result.student?.firstName?.charAt(0)}</div>}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#1a3c6e] text-lg">{result.student?.firstName} {result.student?.lastName}</h3>
                            <p className="text-sm text-gray-500">{result.student?.studentId} | {result.gradeLevel}</p>
                            <p className="text-sm text-gray-400">{result.academicYear} | {result.term}</p>
                            <p className="text-xs text-gray-400">Submitted by: {result.submittedBy} on {new Date(result.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${result.status === 'approved' ? 'bg-green-100 text-green-700' : result.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{result.status}</span>
                          {result.status !== 'approved' && <button onClick={() => handleApproveResult(result.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Approve</button>}
                          <button onClick={() => handleAdminEditResult(result)} className="bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold px-4 py-2 rounded-lg text-sm transition-colors">Edit</button>
                          <button onClick={() => handleAdminDownloadPDF(result)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Download PDF</button>
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
                    <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Edit Result</h2>
                      <button onClick={() => setAdminEditResult(null)} className="hover:text-[#d4a017]"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-500">Editing result for <span className="font-bold text-[#1a3c6e]">{adminEditResult.student?.firstName} {adminEditResult.student?.lastName}</span></p>
                      {['English', 'Maths', 'Science', 'Computing', 'RME', 'History', 'Ewe', 'French', 'UC MAS'].map(subject => {
                        const s = adminEditScores[subject] || {}
                        return (
                          <div key={subject} className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-bold text-[#1a3c6e] mb-3 text-sm">{subject}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {[{ key: 'classScore', label: 'Class(10)' }, { key: 'cat1', label: 'CAT1(20)' }, { key: 'cat2', label: 'CAT2(20)' }, { key: 'exam', label: 'Exam(100)' }].map(field => (
                                <div key={field.key}>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{field.label}</label>
                                  <input type="number" min="0" max="100" value={s[field.key] || ''} onChange={e => setAdminEditScores(prev => ({ ...prev, [subject]: { ...prev[subject], [field.key]: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Teacher's Remarks</label>
                        <textarea value={adminEditRemarks} onChange={e => setAdminEditRemarks(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleAdminSaveEdit} className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors">Save Changes</button>
                        <button onClick={() => setAdminEditResult(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
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
                <h2 className="text-2xl font-bold font-serif text-[#1a3c6e]">Learners</h2>
                <button onClick={() => setShowAddStudent(true)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add Learner</button>
              </div>
              {showAddStudent && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-bold text-[#1a3c6e] mb-6">Add New Learner</h3>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-[#1a3c6e] flex items-center justify-center">
                      {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs text-center px-2">No Photo</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Passport Photo</label>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-gray-600" />
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP. Max 5MB.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[['First Name','firstName','text'],['Last Name','lastName','text'],['Date of Birth','dateOfBirth','date'],['Parent Name','parentName','text'],['Parent Email','parentEmail','email'],['Parent Phone','parentPhone','text'],['Address','address','text']].map(([label, key, type]) => (
                      <div key={key}>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">{label}</label>
                        <input type={type} value={newStudent[key]} onChange={e => setNewStudent({ ...newStudent, [key]: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Gender</label>
                      <select value={newStudent.gender} onChange={e => setNewStudent({ ...newStudent, gender: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Grade Level</label>
                      <select value={newStudent.gradeLevel} onChange={e => setNewStudent({ ...newStudent, gradeLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                        <option value="">Select grade</option>
                        {['Nursery','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={handleAddStudent} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Learner</button>
                    <button onClick={() => { setShowAddStudent(false); setPhotoFile(null); setPhotoPreview(null) }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mb-6">
                {classes.map(cls => (
                  <button key={cls} onClick={() => setActiveClass(cls)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeClass === cls ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'}`}>
                    {cls}
                    <span className="ml-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-2 py-0.5 rounded-full">{cls === 'All' ? students.length : students.filter(s => s.gradeLevel === cls).length}</span>
                  </button>
                ))}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#1a3c6e]">{activeClass === 'All' ? 'All Learners' : `${activeClass} Class`}<span className="ml-2 text-gray-400 text-sm font-normal">({filteredStudents.length} learners)</span></h3>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#1a3c6e] text-white">
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
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-[#1a3c6e]">
                              {student.photo ? <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" /> :
                                <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-sm">{student.firstName?.charAt(0)}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full">{student.studentId}</span></td>
                          <td className="px-6 py-4 font-medium text-[#1a3c6e]">{student.firstName} {student.lastName}</td>
                          <td className="px-6 py-4"><span className="bg-[#1a3c6e] text-white text-xs font-bold px-3 py-1 rounded-full">{student.gradeLevel}</span></td>
                          <td className="px-6 py-4 text-gray-600">{student.gender}</td>
                          <td className="px-6 py-4"><span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{student.status}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSelectedStudent(student)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white p-2 rounded-lg transition-colors"><Eye size={16} /></button>
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
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-2">Create Account</h2>
              <p className="text-gray-500 mb-8">Create accounts for teachers and parents.</p>
              {createSuccess && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">Account created successfully!</div>}
              {createError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{createError}</div>}
              <div className="space-y-5">
                {[['Full Name','name','text','Enter full name'],['Email Address','email','email','Enter email address'],['Password','password','password','Enter password']].map(([label, key, type, placeholder]) => (
                  <div key={key}>
                    <label className="block text-sm font-bold text-[#1a3c6e] mb-2">{label}</label>
                    <input type={type} value={newUser[key]} onChange={e => setNewUser({ ...newUser, [key]: e.target.value })} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button onClick={handleCreateAccount} disabled={createLoading} className="w-full bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">{createLoading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </div>
          )}

          {/* Admission Tokens */}
          {activeMenu === 'admission-tokens' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-1">Admission Tokens</h2>
                  <p className="text-gray-500 text-sm">Generate serial numbers and PINs for parents who have paid the admission fee.</p>
                </div>
                <button onClick={handleGenerateToken} disabled={tokenLoading} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">{tokenLoading ? 'Generating...' : '+ Generate Token'}</button>
              </div>
              {newToken && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4"><CheckCircle size={20} className="text-green-600" /><h3 className="font-bold text-green-700">New Token Generated!</h3></div>
                  <p className="text-sm text-green-600 mb-4">Share these details with the parent. The PIN will not be shown again.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#1a3c6e] text-lg">{newToken.serialNumber}</p>
                        <button onClick={() => handleCopy(newToken.serialNumber, 'serial')} className="text-gray-400 hover:text-[#1a3c6e]">{copiedId === 'serial' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}</button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">PIN (shown once)</p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#1a3c6e] text-lg tracking-widest">{newToken.pin}</p>
                        <button onClick={() => handleCopy(newToken.pin, 'pin')} className="text-gray-400 hover:text-[#1a3c6e]">{copiedId === 'pin' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}</button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setNewToken(null)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">Dismiss</button>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#1a3c6e] text-white">
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
                        <tr key={token.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 font-bold text-[#1a3c6e]">{token.serialNumber}</td>
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
                  <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-1">Gallery</h2>
                  <p className="text-gray-500 text-sm">Upload and manage school photos and events.</p>
                </div>
                <button onClick={() => setShowAddGallery(true)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add Gallery Item</button>
              </div>
              {showAddGallery && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-bold text-[#1a3c6e] mb-6">Add New Gallery Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Title</label>
                      <input type="text" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} placeholder="e.g. Sports Day 2026" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Category</label>
                      <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                        {['Events','Extra-curricular','Academic','Physical Education','Culture','Arts','Community'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Description</label>
                      <textarea value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Upload Images (up to 20)</label>
                      <input type="file" accept="image/*" multiple onChange={handleGalleryImageChange} className="text-sm text-gray-600 mb-3" />
                      {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 mt-3">
                          {galleryPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-xl" />
                              <span className="absolute top-1 right-1 bg-[#1a3c6e] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{index + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleAddGalleryItem} disabled={galleryLoading} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50">{galleryLoading ? 'Uploading...' : 'Upload Gallery Item'}</button>
                    <button onClick={() => { setShowAddGallery(false); setGalleryPreviews([]); setGalleryImages([]) }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
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
                        <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover" />
                        {item.images.length > 1 && <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">+{item.images.length - 1} more</span>}
                        <span className="absolute top-2 left-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full">{item.category}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-[#1a3c6e] mb-1">{item.title}</h3>
                        {item.description && <p className="text-sm text-gray-500 mb-2">{item.description}</p>}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setEditingGallery(item); setGalleryForm({ title: item.title, description: item.description || '', category: item.category }) }} className="bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] p-1.5 rounded-lg transition-colors text-xs font-bold px-3">Edit</button>
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
                    <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">Edit Gallery Item</h2>
                      <button onClick={() => setEditingGallery(null)} className="hover:text-[#d4a017]"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div><label className="block text-sm font-bold text-[#1a3c6e] mb-2">Title</label><input type="text" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" /></div>
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Category</label>
                        <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                          {['Events','Extra-curricular','Academic','Physical Education','Culture','Arts','Community'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div><label className="block text-sm font-bold text-[#1a3c6e] mb-2">Description</label><textarea value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" /></div>
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Replace Images (optional)</label>
                        <input type="file" accept="image/*" multiple onChange={handleGalleryImageChange} className="text-sm text-gray-600" />
                        {galleryPreviews.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2 mt-3">{galleryPreviews.map((preview, index) => <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full h-16 object-cover rounded-lg" />)}</div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2 mt-3">{editingGallery.images.map((img, index) => <img key={index} src={img} alt={`Current ${index + 1}`} className="w-full h-16 object-cover rounded-lg opacity-60" />)}</div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleEditGalleryItem} className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors">Save Changes</button>
                        <button onClick={() => { setEditingGallery(null); setGalleryPreviews([]); setGalleryImages([]) }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
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
                      <button onClick={() => setViewingGallery(null)} className="text-white hover:text-[#d4a017] transition-colors"><X size={28} /></button>
                    </div>
                    <div className="relative mb-4">
                      <img src={viewingGallery.images[activeGalleryImage]} alt={viewingGallery.title} className="w-full max-h-[60vh] object-contain rounded-xl" />
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
                        {viewingGallery.images.map((img, index) => <img key={index} src={img} alt={`${index + 1}`} onClick={() => setActiveGalleryImage(index)} className={`w-16 h-16 object-cover rounded-lg cursor-pointer shrink-0 transition-all ${activeGalleryImage === index ? 'ring-2 ring-[#d4a017]' : 'opacity-60 hover:opacity-100'}`} />)}
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
                  <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-1">News & Events</h2>
                  <p className="text-gray-500 text-sm">Manage school news and upcoming events.</p>
                </div>
                <button onClick={() => setShowAddNews(true)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add News / Event</button>
              </div>
              <div className="flex gap-3 mb-6">
                {['All', 'news', 'event'].map(f => (
                  <button key={f} onClick={() => setNewsFilter(f)} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors capitalize ${newsFilter === f ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'}`}>
                    {f === 'All' ? 'All' : f === 'news' ? 'News' : 'Events'}
                    <span className="ml-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-2 py-0.5 rounded-full">{f === 'All' ? newsItems.length : newsItems.filter(n => n.type === f).length}</span>
                  </button>
                ))}
              </div>
              {(showAddNews || editingNews) && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">{editingNews ? 'Edit Item' : 'Add News / Event'}</h2>
                      <button onClick={() => { setShowAddNews(false); setEditingNews(null); setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' }); setNewsImages([]); setNewsPreviews([]) }} className="hover:text-[#d4a017]"><X size={24} /></button>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="block text-sm font-bold text-[#1a3c6e] mb-2">Title</label><input type="text" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} placeholder="Enter title..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" /></div>
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Type</label>
                          <select value={newsForm.type} onChange={e => setNewsForm({ ...newsForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                            <option value="news">News</option>
                            <option value="event">Event</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Category</label>
                          <select value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                            {['General','Academic','Sports','Cultural','Community','Achievement'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        {newsForm.type === 'event' && (
                          <>
                            <div><label className="block text-sm font-bold text-[#1a3c6e] mb-2">Event Date</label><input type="date" value={newsForm.eventDate} onChange={e => setNewsForm({ ...newsForm, eventDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-bold text-[#1a3c6e] mb-2">Venue</label><input type="text" value={newsForm.venue} onChange={e => setNewsForm({ ...newsForm, venue: e.target.value })} placeholder="Event venue..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" /></div>
                          </>
                        )}
                        <div className="md:col-span-2"><label className="block text-sm font-bold text-[#1a3c6e] mb-2">Content</label><textarea value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} rows={5} placeholder="Write the news or event details here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" /></div>
                        <div><label className="block text-sm font-bold text-[#1a3c6e] mb-2">Video URL (optional)</label><input type="text" value={newsForm.videoUrl} onChange={e => setNewsForm({ ...newsForm, videoUrl: e.target.value })} placeholder="YouTube or video link..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" /></div>
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Images (up to 5)</label>
                          <input type="file" accept="image/*" multiple onChange={handleNewsImageChange} className="text-sm text-gray-600" />
                          {newsPreviews.length > 0 && <div className="grid grid-cols-4 gap-2 mt-3">{newsPreviews.map((preview, index) => <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full h-16 object-cover rounded-lg" />)}</div>}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={editingNews ? handleEditNews : handleAddNews} disabled={newsLoading} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50">{newsLoading ? 'Saving...' : editingNews ? 'Save Changes' : 'Publish'}</button>
                        <button onClick={() => { setShowAddNews(false); setEditingNews(null); setNewsForm({ title: '', content: '', category: 'General', type: 'news', videoUrl: '', eventDate: '', venue: '' }); setNewsImages([]); setNewsPreviews([]) }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
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
                      {item.images && item.images.length > 0 && <img src={item.images[0]} alt={item.title} className="w-full h-44 object-cover" />}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.type === 'event' ? 'bg-[#d4a017] text-[#1a3c6e]' : 'bg-[#1a3c6e] text-white'}`}>{item.type === 'event' ? 'Event' : 'News'}</span>
                          <span className="text-xs text-gray-400">{item.category}</span>
                        </div>
                        <h3 className="font-bold text-[#1a3c6e] mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.content}</p>
                        {item.type === 'event' && item.eventDate && (
                          <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
                            <p className="text-xs font-bold text-[#1a3c6e]">📅 {new Date(item.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            {item.venue && <p className="text-xs text-gray-500">📍 {item.venue}</p>}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingNews(item); setNewsForm({ title: item.title, content: item.content, category: item.category, type: item.type, videoUrl: item.videoUrl || '', eventDate: item.eventDate || '', venue: item.venue || '' }); setNewsPreviews([]); setNewsImages([]) }} className="bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Edit</button>
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
                  <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-1">Our Staff</h2>
                  <p className="text-gray-500 text-sm">Manage school staff members.</p>
                </div>
                <button onClick={() => setShowAddStaff(true)} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">+ Add Staff Member</button>
              </div>
              {(showAddStaff || editingStaff) && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
                      <h2 className="text-xl font-bold font-serif">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
                      <button onClick={() => { setShowAddStaff(false); setEditingStaff(null); setStaffPhotoPreview(null); setStaffPhoto(null) }} className="hover:text-[#d4a017]"><X size={24} /></button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-[#1a3c6e]">
                          {staffPhotoPreview ? <img src={staffPhotoPreview} alt="Preview" className="w-full h-full object-cover" /> :
                            editingStaff?.photo ? <img src={editingStaff.photo} alt="Current" className="w-full h-full object-cover" /> :
                            <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-2xl">{staffForm.name?.charAt(0) || '?'}</div>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Staff Photo</label>
                          <input type="file" accept="image/*" onChange={handleStaffPhotoChange} className="text-sm text-gray-600" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[['Full Name *','name','text'],['Role *','role','text'],['Department','department','text'],['Subject','subject','text'],['Email','email','email'],['Phone','phone','text']].map(([label, key, type]) => (
                          <div key={key}>
                            <label className="block text-sm font-bold text-[#1a3c6e] mb-2">{label}</label>
                            <input type={type} value={staffForm[key]} onChange={e => setStaffForm({ ...staffForm, [key]: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                          </div>
                        ))}
                        <div>
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Category</label>
                          <select value={staffForm.category} onChange={e => setStaffForm({ ...staffForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                            <option value="leadership">Leadership & Management</option>
                            <option value="teaching">Teaching Staff</option>
                            <option value="support">Support Staff</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Bio</label>
                          <textarea value={staffForm.bio} onChange={e => setStaffForm({ ...staffForm, bio: e.target.value })} rows={3} placeholder="Short bio..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={editingStaff ? handleEditStaff : handleAddStaff} disabled={staffLoading} className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">{staffLoading ? 'Saving...' : editingStaff ? 'Save Changes' : 'Add Staff Member'}</button>
                        <button onClick={() => { setShowAddStaff(false); setEditingStaff(null); setStaffPhotoPreview(null); setStaffPhoto(null) }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
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
                        {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-48 object-cover" /> :
                          <div className="w-full h-48 bg-[#1a3c6e] flex items-center justify-center"><span className="text-[#d4a017] text-4xl font-bold">{member.name?.charAt(0)}</span></div>}
                        <span className={`absolute top-2 left-2 text-xs font-bold px-3 py-1 rounded-full ${member.category === 'leadership' ? 'bg-[#d4a017] text-[#1a3c6e]' : member.category === 'teaching' ? 'bg-[#1a3c6e] text-white' : 'bg-[#0f6e56] text-white'}`}>
                          {member.category === 'leadership' ? 'Leadership' : member.category === 'teaching' ? 'Teaching' : 'Support'}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-[#1a3c6e] mb-1">{member.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">{member.role}</p>
                        {member.subject && <p className="text-xs text-[#d4a017] font-bold mb-2">{member.subject}</p>}
                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{member.bio}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingStaff(member); setStaffForm({ name: member.name, role: member.role, department: member.department || '', subject: member.subject || '', bio: member.bio || '', email: member.email || '', phone: member.phone || '', category: member.category }); setStaffPhotoPreview(null); setStaffPhoto(null) }} className="flex-1 bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold py-2 rounded-lg text-sm transition-colors">Edit</button>
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif">Learner Profile</h2>
              <button onClick={() => { setSelectedStudent(null); setEditMode(false) }} className="hover:text-[#d4a017] transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-[#1a3c6e]">
                  {selectedStudent.photo ? <img src={selectedStudent.photo} alt={selectedStudent.firstName} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-2xl">{selectedStudent.firstName?.charAt(0)}</div>}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a3c6e]">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mt-1">{selectedStudent.studentId}</span>
                  <p className="text-gray-500 text-sm mt-1">{selectedStudent.gradeLevel}</p>
                </div>
              </div>
              {!editMode ? (
                <div>
                  <div className="space-y-3 mb-6">
                    {[['Date of Birth', selectedStudent.dateOfBirth], ['Gender', selectedStudent.gender], ['Grade Level', selectedStudent.gradeLevel], ['Parent Name', selectedStudent.parentName], ['Parent Email', selectedStudent.parentEmail], ['Parent Phone', selectedStudent.parentPhone], ['Address', selectedStudent.address], ['Status', selectedStudent.status], ['Enrolled On', new Date(selectedStudent.createdAt).toLocaleDateString()]].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 bg-gray-50 rounded-xl px-4 py-3">
                        <span className="text-sm font-bold text-[#1a3c6e] w-32 shrink-0">{item[0]}</span>
                        <span className="text-sm text-gray-600">{item[1] || '—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditMode(true); setEditStudent({ ...selectedStudent }) }} className="flex-1 bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold py-3 rounded-xl transition-colors">Edit Details</button>
                    <button onClick={() => { setSelectedStudent(null); setEditMode(false) }} className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors">Close</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-[#1a3c6e] mb-1">First Name</label><input type="text" value={editStudent.firstName} onChange={e => setEditStudent({ ...editStudent, firstName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" /></div>
                      <div><label className="block text-sm font-bold text-[#1a3c6e] mb-1">Last Name</label><input type="text" value={editStudent.lastName} onChange={e => setEditStudent({ ...editStudent, lastName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-[#1a3c6e] mb-1">Date of Birth</label><input type="date" value={editStudent.dateOfBirth} onChange={e => setEditStudent({ ...editStudent, dateOfBirth: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" /></div>
                      <div>
                        <label className="block text-sm font-bold text-[#1a3c6e] mb-1">Gender</label>
                        <select value={editStudent.gender} onChange={e => setEditStudent({ ...editStudent, gender: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm">
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-1">Grade Level</label>
                      <select value={editStudent.gradeLevel} onChange={e => setEditStudent({ ...editStudent, gradeLevel: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm">
                        {['Nursery','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-bold text-[#1a3c6e] mb-1">Parent Name</label><input type="text" value={editStudent.parentName} onChange={e => setEditStudent({ ...editStudent, parentName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" /></div>
                    <div><label className="block text-sm font-bold text-[#1a3c6e] mb-1">Parent Email</label><input type="email" value={editStudent.parentEmail} onChange={e => setEditStudent({ ...editStudent, parentEmail: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" /></div>
                    <div><label className="block text-sm font-bold text-[#1a3c6e] mb-1">Parent Phone</label><input type="text" value={editStudent.parentPhone} onChange={e => setEditStudent({ ...editStudent, parentPhone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" /></div>
                    <div><label className="block text-sm font-bold text-[#1a3c6e] mb-1">Address</label><input type="text" value={editStudent.address} onChange={e => setEditStudent({ ...editStudent, address: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm" /></div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-1">Status</label>
                      <select value={editStudent.status} onChange={e => setEditStudent({ ...editStudent, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-sm">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                        <option value="transferred">Transferred</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleEditStudent} className="flex-1 bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors">Save Changes</button>
                    <button onClick={() => setEditMode(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
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
