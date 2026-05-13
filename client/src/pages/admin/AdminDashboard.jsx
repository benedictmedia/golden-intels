import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign,
  BarChart2, UserPlus, LogOut, Menu, X, Bell, Eye, Trash2,
  CheckCircle, XCircle, Edit, Download
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

  // Data states
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [feePayments, setFeePayments] = useState([])
  const [loading, setLoading] = useState(false)

  // UI states
  const [activeResultTab, setActiveResultTab] = useState('pending')
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [studentsRes, resultsRes, feesRes] = await Promise.all([
        axios.get(`${API_URL}/api/students`),
        axios.get(`${API_URL}/api/results`),
        axios.get(`${API_URL}/api/fees/payments`)
      ])
      setStudents(studentsRes.data)
      setResults(resultsRes.data)
      setFeePayments(feesRes.data || [])
    } catch (err) {
      console.error(err)
      alert("Failed to load some data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const approveResult = async (id) => {
    try {
      await axios.put(`${API_URL}/api/results/${id}`, { status: 'approved' })
      setResults(results.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } catch (err) {
      alert('Failed to approve result')
    }
  }

  const rejectResult = async (id) => {
    try {
      await axios.put(`${API_URL}/api/results/${id}`, { status: 'rejected' })
      setResults(results.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    } catch (err) {
      alert('Failed to reject result')
    }
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return
    try {
      await axios.delete(`${API_URL}/api/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
    } catch (err) {
      alert('Failed to delete student')
    }
  }

  const filteredResults = results.filter(r => 
    activeResultTab === 'pending' ? r.status === 'pending' : 
    activeResultTab === 'approved' ? r.status === 'approved' : true
  )

  const totalStudents = students.length
  const pendingResults = results.filter(r => r.status === 'pending').length
  const totalRevenue = feePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0)

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
            <h1 className="text-xl font-bold text-[#4a235a] capitalize">{activeMenu}</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-[#4a235a]">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>
            <div className="w-9 h-9 bg-[#4a235a] rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dashboard */}
          {activeMenu === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Students', value: totalStudents, color: 'bg-[#4a235a]' },
                  { label: 'Pending Results', value: pendingResults, color: 'bg-orange-600' },
                  { label: 'Total Revenue', value: `GH₵ ${totalRevenue.toFixed(2)}`, color: 'bg-green-600' },
                  { label: 'Classes', value: '8', color: 'bg-[#d4a017] text-[#1a3c6e]' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} text-white rounded-2xl p-6 shadow-md`}>
                    <p className="text-sm opacity-80">{stat.label}</p>
                    <p className="text-4xl font-bold mt-2">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-[#4a235a]">Admin Overview</h2>
                <p className="text-gray-600 mt-2">Manage the entire school system from one place.</p>
              </div>
            </div>
          )}

          {/* Students Management */}
          {activeMenu === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#4a235a]">Students Management</h2>
                <button className="bg-[#4a235a] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-purple-900">
                  <UserPlus size={20} /> Add New Student
                </button>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-[#4a235a] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Class</th>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => (
                      <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {student.photo && <img src={student.photo} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-500">{student.gender}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#4a235a]">{student.gradeLevel}</td>
                        <td className="px-6 py-4">
                          <span className="bg-[#d4a017] text-[#1a3c6e] text-xs px-3 py-1 rounded-full font-bold">{student.studentId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{student.status}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setSelectedStudent(student)} className="text-blue-600 hover:text-blue-800 mr-3">
                            <Eye size={18} />
                          </button>
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

          {/* Results Management */}
          {activeMenu === 'results' && (
            <div>
              <div className="flex gap-3 mb-6">
                {['pending', 'approved', 'all'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveResultTab(tab)}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeResultTab === tab ? 'bg-[#4a235a] text-white' : 'bg-white border border-[#4a235a] text-[#4a235a]'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredResults.map(result => (
                  <div key={result.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-[#4a235a]">
                          {result.student?.firstName} {result.student?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{result.gradeLevel} • {result.term} {result.academicYear}</p>
                      </div>
                      <div className="flex gap-2">
                        {result.status === 'pending' && (
                          <>
                            <button onClick={() => approveResult(result.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm">
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button onClick={() => rejectResult(result.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm">
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                        <button className="bg-[#d4a017] text-[#1a3c6e] px-4 py-2 rounded-lg flex items-center gap-1 text-sm">
                          <Download size={16} /> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fees */}
          {activeMenu === 'fees' && (
            <div>
              <h2 className="text-2xl font-bold text-[#4a235a] mb-6">Fee Management</h2>
              <div className="bg-white rounded-2xl p-6">
                <p className="text-gray-600">Fee management interface coming soon with full payment tracking.</p>
                <p className="text-sm text-gray-500 mt-2">Current total collected: GH₵ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Reports */}
          {activeMenu === 'reports' && (
            <div className="bg-white rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-[#4a235a]">School Reports</h2>
              <p className="text-gray-600 mt-4">Academic performance, attendance, and financial reports will be available here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}