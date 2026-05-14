import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign, BarChart2,
  UserPlus, LogOut, Menu, X, Bell, Trash2, Edit, Plus, Moon, Sun
} from 'lucide-react'

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={20} />, label: 'Students', id: 'students' },
  { icon: <GraduationCap size={20} />, label: 'Results', id: 'results' },
  { icon: <DollarSign size={20} />, label: 'Fees', id: 'fees' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('students')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [feePayments, setFeePayments] = useState([])
  const [loading, setLoading] = useState(false)

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
    gradeLevel: 'Year 1', parentName: '', parentEmail: '', parentPhone: '',
    address: '', studentId: ''
  })
  const [studentPhoto, setStudentPhoto] = useState(null)

  // Dark Mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [sRes, rRes, fRes] = await Promise.all([
        axios.get(`${API_URL}/api/students`),
        axios.get(`${API_URL}/api/results`),
        axios.get(`${API_URL}/api/fees/payments`)
      ])
      setStudents(sRes.data)
      setResults(rRes.data)
      setFeePayments(fRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

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
      alert('Failed to add student')
      console.error(err)
    }
  }

  const resetAddStudentForm = () => {
    setShowAddStudent(false)
    setNewStudent({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', gradeLevel: 'Year 1', parentName: '', parentEmail: '', parentPhone: '', address: '', studentId: '' })
    setStudentPhoto(null)
  }

  // Edit Student (basic)
  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setShowEditStudent(true)
  }

  // Record Payment
  const handleRecordPayment = (student) => {
    setSelectedStudent(student)
    setShowAddPayment(true)
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#4a235a] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-purple-900 flex justify-between items-center">
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
            <LogOut size={20} /> {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`px-6 py-4 flex justify-between items-center shadow-sm ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <h1 className="text-2xl font-bold capitalize">{activeMenu}</h1>
          <div className="flex items-center gap-4">
            <Bell size={22} className="text-gray-500" />
            <div className="w-9 h-9 bg-[#4a235a] rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.[0]}
            </div>
          </div>
        </div>

        <div className={`flex-1 p-6 overflow-auto ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100'}`}>
          {activeMenu === 'students' && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Students Management</h2>
                <button onClick={() => setShowAddStudent(true)} className="bg-[#4a235a] hover:bg-purple-800 text-white px-6 py-3 rounded-xl flex items-center gap-2">
                  <UserPlus size={20} /> Add New Student
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
                          {s.photo && <img src={s.photo} alt="" className="w-10 h-10 rounded-full object-cover" />}
                          <div>
                            <p className="font-medium">{s.firstName} {s.lastName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{s.gradeLevel}</td>
                        <td className="px-6 py-4">{s.studentId}</td>
                        <td className="px-6 py-4">{s.parentName}</td>
                        <td className="px-6 py-4 text-center flex gap-3 justify-center">
                          <button onClick={() => handleEditStudent(s)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                          <button onClick={() => handleRecordPayment(s)} className="text-green-600 hover:text-green-800"><Plus size={18} /></button>
                          <button onClick={() => {/* delete */}} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other menus placeholder */}
          {activeMenu !== 'students' && (
            <div className="text-center py-20 text-gray-500">
              <h2 className="text-3xl font-bold mb-4">This section is under development</h2>
              <p>More features coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="p-8 border-b">
              <h2 className="text-2xl font-bold">Add New Student</h2>
            </div>
            <form onSubmit={handleAddStudent} className="p-8 space-y-5">
              {/* Form fields same as before */}
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} className="px-4 py-3 border rounded-xl" />
                <input required placeholder="Last Name" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} className="px-4 py-3 border rounded-xl" />
              </div>
              {/* ... other fields ... */}
              <div>
                <label className="block mb-2">Student Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setStudentPhoto(e.target.files[0])} />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={resetAddStudentForm} className="flex-1 py-4 border rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-[#4a235a] text-white py-4 rounded-xl font-bold">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}