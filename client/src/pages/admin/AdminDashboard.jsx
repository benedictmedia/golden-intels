import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign,
  BarChart2, UserPlus, LogOut, Menu, X, Bell, Eye, Trash2,
  CheckCircle, XCircle, Edit, Download, Moon, Sun
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

  // Data
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [feePayments, setFeePayments] = useState([])
  const [feeStructures, setFeeStructures] = useState([])

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [studentsRes, resultsRes, feesRes, structuresRes] = await Promise.all([
        axios.get(`${API_URL}/api/students`),
        axios.get(`${API_URL}/api/results`),
        axios.get(`${API_URL}/api/fees/payments`),
        axios.get(`${API_URL}/api/fees/structures`)
      ])
      setStudents(studentsRes.data)
      setResults(resultsRes.data)
      setFeePayments(feesRes.data || [])
      setFeeStructures(structuresRes.data || [])
    } catch (err) {
      console.error(err)
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
    Object.keys(newStudent).forEach(key => formData.append(key, newStudent[key]))
    if (studentPhoto) formData.append('photo', studentPhoto)

    try {
      const res = await axios.post(`${API_URL}/api/students`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStudents([res.data, ...students])
      setShowAddStudent(false)
      setNewStudent({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', gradeLevel: 'Year 1', parentName: '', parentEmail: '', parentPhone: '', address: '', studentId: '' })
      setStudentPhoto(null)
      alert('Student added successfully!')
    } catch (err) {
      alert('Failed to add student')
    }
  }

  // Results Actions
  const approveResult = async (id) => {
    try {
      await axios.put(`${API_URL}/api/results/${id}`, { status: 'approved' })
      setResults(results.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } catch (err) { alert('Failed to approve') }
  }

  const rejectResult = async (id) => {
    try {
      await axios.put(`${API_URL}/api/results/${id}`, { status: 'rejected' })
      setResults(results.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    } catch (err) { alert('Failed to reject') }
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student and all related data?')) return
    try {
      await axios.delete(`${API_URL}/api/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
    } catch (err) { alert('Failed to delete') }
  }

  const filteredResults = results.filter(r => 
    activeResultTab === 'pending' ? r.status === 'pending' : 
    activeResultTab === 'approved' ? r.status === 'approved' : true
  )

  const totalStudents = students.length
  const pendingResults = results.filter(r => r.status === 'pending').length
  const totalRevenue = feePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0)

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-gray-950' : 'bg-gray-100'}`}>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#4a235a] text-white transition-all duration-300 flex flex-col`}>
        {/* ... (same sidebar as before) ... */}
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

        <div className="p-4 border-t border-purple-900 space-y-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900 text-purple-200 transition-colors rounded-lg"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900 text-purple-200 transition-colors rounded-lg">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className={`shadow-sm px-6 py-4 flex items-center justify-between ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
          <div>
            <h1 className="text-xl font-bold capitalize">{activeMenu}</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-[#4a235a]">
              <Bell size={22} />
            </button>
            <div className="w-9 h-9 bg-[#4a235a] rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100'}`}>

          {/* Dashboard */}
          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Students', value: totalStudents, color: 'bg-[#4a235a]' },
                { label: 'Pending Results', value: pendingResults, color: 'bg-orange-600' },
                { label: 'Total Revenue', value: `GH₵ ${totalRevenue.toFixed(2)}`, color: 'bg-green-600' },
                { label: 'Active Classes', value: '8', color: 'bg-[#d4a017] text-[#1a3c6e]' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.color} text-white rounded-2xl p-6 shadow-md`}>
                  <p className="text-sm opacity-80">{stat.label}</p>
                  <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Students */}
          {activeMenu === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Students Management</h2>
                <button 
                  onClick={() => setShowAddStudent(true)}
                  className="bg-[#4a235a] hover:bg-purple-900 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                >
                  <UserPlus size={20} /> Add New Student
                </button>
              </div>

              {/* Students Table */}
              <div className={`rounded-2xl overflow-hidden shadow-sm ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <table className="w-full">
                  <thead className="bg-[#4a235a] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Class</th>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Parent</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => (
                      <tr key={student.id} className={idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {student.photo && <img src={student.photo} alt="" className="object-cover w-full h-full" />}
                          </div>
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-500">{student.gender}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{student.gradeLevel}</td>
                        <td className="px-6 py-4">
                          <span className="bg-[#d4a017] text-[#1a3c6e] text-xs px-3 py-1 rounded-full font-bold">{student.studentId}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">{student.parentName}</td>
                        <td className="px-6 py-4 text-center flex justify-center gap-3">
                          <button className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                          <button onClick={() => deleteStudent(student.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Management - Same as before but improved */}
          {activeMenu === 'results' && (
            <div>
              <div className="flex gap-3 mb-6">
                {['pending', 'approved', 'all'].map(tab => (
                  <button key={tab} onClick={() => setActiveResultTab(tab)}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeResultTab === tab ? 'bg-[#4a235a] text-white' : 'border border-[#4a235a] text-[#4a235a]'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredResults.map(result => (
                  <div key={result.id} className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{result.student?.firstName} {result.student?.lastName}</h3>
                        <p className="text-sm text-gray-500">{result.gradeLevel} • {result.term} {result.academicYear}</p>
                      </div>
                      <div className="flex gap-2">
                        {result.status === 'pending' && (
                          <>
                            <button onClick={() => approveResult(result.id)} className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-1 text-sm">
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button onClick={() => rejectResult(result.id)} className="bg-red-600 text-white px-5 py-2 rounded-lg flex items-center gap-1 text-sm">
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                        <button className="bg-[#d4a017] text-[#1a3c6e] px-5 py-2 rounded-lg flex items-center gap-1 text-sm">
                          <Download size={16} /> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fees Management */}
          {activeMenu === 'fees' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Fee Management</h2>
              <div className={`rounded-2xl p-6 mb-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <p className="text-3xl font-bold">GH₵ {totalRevenue.toFixed(2)}</p>
                <p className="text-gray-500">Total Revenue Collected</p>
              </div>

              <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <table className="w-full">
                  <thead className="bg-[#4a235a] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Month/Year</th>
                      <th className="px-6 py-4 text-left">Due</th>
                      <th className="px-6 py-4 text-left">Paid</th>
                      <th className="px-6 py-4 text-left">Balance</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feePayments.map((payment, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="px-6 py-4">{payment.student?.firstName} {payment.student?.lastName}</td>
                        <td className="px-6 py-4">{payment.month} {payment.year}</td>
                        <td className="px-6 py-4">GH₵ {payment.amountDue}</td>
                        <td className="px-6 py-4 text-green-600">GH₵ {payment.amountPaid}</td>
                        <td className="px-6 py-4 text-red-600">GH₵ {payment.balance}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-2xl p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" required value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} className="px-4 py-3 border rounded-xl" />
                <input type="text" placeholder="Last Name" required value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} className="px-4 py-3 border rounded-xl" />
              </div>

              <input type="text" placeholder="Student ID (e.g. GI-2026001)" value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />

              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={newStudent.dateOfBirth} onChange={e => setNewStudent({...newStudent, dateOfBirth: e.target.value})} className="px-4 py-3 border rounded-xl" />
                <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="px-4 py-3 border rounded-xl">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <select value={newStudent.gradeLevel} onChange={e => setNewStudent({...newStudent, gradeLevel: e.target.value})} className="w-full px-4 py-3 border rounded-xl">
                {['Nursery','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <input type="text" placeholder="Parent/Guardian Name" value={newStudent.parentName} onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
              <input type="email" placeholder="Parent Email" value={newStudent.parentEmail} onChange={e => setNewStudent({...newStudent, parentEmail: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
              <input type="tel" placeholder="Parent Phone" value={newStudent.parentPhone} onChange={e => setNewStudent({...newStudent, parentPhone: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />

              <input type="file" accept="image/*" onChange={e => setStudentPhoto(e.target.files[0])} className="w-full" />

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#4a235a] text-white py-4 rounded-xl font-bold">Add Student</button>
                <button type="button" onClick={() => setShowAddStudent(false)} className="flex-1 border py-4 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}