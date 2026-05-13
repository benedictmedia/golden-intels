import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign, BarChart2,
  UserPlus, LogOut, Menu, X, Bell, Eye, Trash2, CheckCircle,
  XCircle, Download, Moon, Sun, Plus
} from 'lucide-react'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={20} />, label: 'Students', id: 'students' },
  { icon: <GraduationCap size={20} />, label: 'Results', id: 'results' },
  { icon: <DollarSign size={20} />, label: 'Fees', id: 'fees' },
  { icon: <BarChart2 size={20} />, label: 'Reports', id: 'reports' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

  // Data States
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [feePayments, setFeePayments] = useState([])
  const [loading, setLoading] = useState(false)

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
    gradeLevel: 'Year 1', parentName: '', parentEmail: '', parentPhone: '',
    address: '', studentId: ''
  })
  const [studentPhoto, setStudentPhoto] = useState(null)

  const [activeResultTab, setActiveResultTab] = useState('pending')

  // Dark Mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // Fetch Data
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [studRes, resRes, feeRes] = await Promise.all([
        axios.get(`${API_URL}/api/students`),
        axios.get(`${API_URL}/api/results`),
        axios.get(`${API_URL}/api/fees/payments`)
      ])
      setStudents(studRes.data)
      setResults(resRes.data)
      setFeePayments(feeRes.data || [])
    } catch (err) {
      console.error("Failed to fetch data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    Object.keys(newStudent).forEach(key => {
      if (newStudent[key]) formData.append(key, newStudent[key])
    })
    if (studentPhoto) formData.append('photo', studentPhoto)

    try {
      const res = await axios.post(`${API_URL}/api/students`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStudents([res.data, ...students])
      resetAddStudentForm()
      alert('✅ Student added successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student')
    }
  }

  const resetAddStudentForm = () => {
    setShowAddStudent(false)
    setNewStudent({
      firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
      gradeLevel: 'Year 1', parentName: '', parentEmail: '', parentPhone: '',
      address: '', studentId: ''
    })
    setStudentPhoto(null)
  }

  // Results
  const approveResult = async (id) => {
    try {
      await axios.put(`${API_URL}/api/results/${id}`, { status: 'approved' })
      setResults(results.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } catch (err) { alert('Failed to approve result') }
  }

  const rejectResult = async (id) => {
    try {
      await axios.put(`${API_URL}/api/results/${id}`, { status: 'rejected' })
      setResults(results.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    } catch (err) { alert('Failed to reject result') }
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student permanently?')) return
    try {
      await axios.delete(`${API_URL}/api/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
    } catch (err) { alert('Failed to delete student') }
  }

  const filteredResults = results.filter(r => {
    if (activeResultTab === 'pending') return r.status === 'pending'
    if (activeResultTab === 'approved') return r.status === 'approved'
    return true
  })

  const totalRevenue = feePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0)

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#4a235a] text-white transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-purple-900">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e]">G</div>
              <div>
                <p className="text-xs font-bold">Golden-Intels</p>
                <p className="text-xs text-yellow-300">Admin Portal</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:text-[#d4a017]">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${activeMenu === item.id ? 'bg-[#d4a017] text-[#1a3c6e] font-bold' : 'hover:bg-purple-900 text-purple-200'}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-900 space-y-2">
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900 rounded-lg">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900 rounded-lg">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`px-6 py-4 flex items-center justify-between shadow-sm ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div>
            <h1 className="text-2xl font-bold capitalize">{activeMenu}</h1>
            <p className="text-sm text-gray-500">Admin Control Center</p>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={22} className="text-gray-500" />
            <div className="w-9 h-9 bg-[#4a235a] rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.[0]}
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100'}`}>

          {/* DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Students', value: students.length, color: 'bg-[#4a235a]' },
                { label: 'Pending Results', value: results.filter(r => r.status === 'pending').length, color: 'bg-orange-600' },
                { label: 'Revenue', value: `GH₵ ${totalRevenue.toFixed(2)}`, color: 'bg-green-600' },
                { label: 'Classes', value: '8', color: 'bg-[#d4a017] text-[#1a3c6e]' },
              ].map((s, i) => (
                <div key={i} className={`${s.color} text-white rounded-2xl p-6 shadow`}>
                  <p className="opacity-80">{s.label}</p>
                  <p className="text-4xl font-bold mt-3">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* STUDENTS */}
          {activeMenu === 'students' && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">All Students</h2>
                <button onClick={() => setShowAddStudent(true)} className="bg-[#4a235a] hover:bg-purple-800 text-white px-6 py-3 rounded-xl flex items-center gap-2">
                  <UserPlus size={20} /> Add Student
                </button>
              </div>

              <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <table className="w-full">
                  <thead className="bg-[#4a235a] text-white sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Class</th>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Parent</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id} className={i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {s.photo && <img src={s.photo} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-500">{s.gender}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{s.gradeLevel}</td>
                        <td className="px-6 py-4"><span className="bg-[#d4a017] text-[#1a3c6e] px-3 py-1 rounded-full text-xs font-bold">{s.studentId}</span></td>
                        <td className="px-6 py-4 text-sm">{s.parentName}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => deleteStudent(s.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {activeMenu === 'results' && (
            <div>
              <div className="flex gap-3 mb-6">
                {['pending', 'approved', 'all'].map(t => (
                  <button key={t} onClick={() => setActiveResultTab(t)}
                    className={`px-6 py-2 rounded-full font-bold ${activeResultTab === t ? 'bg-[#4a235a] text-white' : 'border border-[#4a235a]'}`}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {filteredResults.map(r => (
                <div key={r.id} className={`p-6 rounded-2xl mb-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{r.student?.firstName} {r.student?.lastName}</h3>
                      <p className="text-sm text-gray-500">{r.gradeLevel} • {r.term} {r.academicYear}</p>
                    </div>
                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => approveResult(r.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"><CheckCircle size={16} /> Approve</button>
                          <button onClick={() => rejectResult(r.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"><XCircle size={16} /> Reject</button>
                        </>
                      )}
                      <button className="bg-[#d4a017] text-[#1a3c6e] px-4 py-2 rounded-lg flex items-center gap-1"><Download size={16} /> PDF</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FEES */}
          {activeMenu === 'fees' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Fee Management</h2>
              <div className={`p-8 rounded-2xl mb-8 text-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <p className="text-5xl font-bold text-green-600">GH₵ {totalRevenue.toFixed(2)}</p>
                <p className="text-gray-500 mt-2">Total Revenue Collected</p>
              </div>

              <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <table className="w-full">
                  <thead className="bg-[#4a235a] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Period</th>
                      <th className="px-6 py-4 text-left">Due</th>
                      <th className="px-6 py-4 text-left">Paid</th>
                      <th className="px-6 py-4 text-left">Balance</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feePayments.map((p, i) => (
                      <tr key={i} className={i % 2 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                        <td className="px-6 py-4">{p.student?.firstName} {p.student?.lastName}</td>
                        <td className="px-6 py-4">{p.month} {p.year}</td>
                        <td className="px-6 py-4">GH₵ {p.amountDue}</td>
                        <td className="px-6 py-4 text-green-600">GH₵ {p.amountPaid}</td>
                        <td className="px-6 py-4 text-red-600">GH₵ {p.balance}</td>
                        <td className="px-6 py-4">
                          <span className={`px-4 py-1 rounded-full text-xs font-bold ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeMenu === 'reports' && (
            <div className={`p-12 rounded-3xl text-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <h2 className="text-3xl font-bold mb-4">School Reports</h2>
              <p className="text-gray-600 max-w-md mx-auto">Comprehensive academic, financial, and attendance reports will be available here soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD STUDENT MODAL - FIXED SCROLLING */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="p-8 sticky top-0 bg-inherit border-b z-10">
              <h2 className="text-2xl font-bold">Add New Student</h2>
            </div>

            <form onSubmit={handleAddStudent} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4a235a]" />
                <input required placeholder="Last Name" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4a235a]" />
              </div>

              <input placeholder="Student ID (e.g. GI-2026001)" value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />

              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={newStudent.dateOfBirth} onChange={e => setNewStudent({...newStudent, dateOfBirth: e.target.value})} className="px-4 py-3 border rounded-xl" />
                <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="px-4 py-3 border rounded-xl">
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <select value={newStudent.gradeLevel} onChange={e => setNewStudent({...newStudent, gradeLevel: e.target.value})} className="w-full px-4 py-3 border rounded-xl">
                {['Nursery','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              <input placeholder="Parent/Guardian Full Name" value={newStudent.parentName} onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
              <input type="email" placeholder="Parent Email" value={newStudent.parentEmail} onChange={e => setNewStudent({...newStudent, parentEmail: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
              <input type="tel" placeholder="Parent Phone Number" value={newStudent.parentPhone} onChange={e => setNewStudent({...newStudent, parentPhone: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />

              <div>
                <label className="block text-sm font-medium mb-2">Student Photo</label>
                <input type="file" accept="image/*" onChange={e => setStudentPhoto(e.target.files[0])} className="w-full" />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={resetAddStudentForm} className="flex-1 py-4 border rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-[#4a235a] hover:bg-purple-800 text-white py-4 rounded-xl font-bold">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}