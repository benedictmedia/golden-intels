import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign, BarChart2,
  UserPlus, LogOut, Menu, X, Bell, Trash2, Moon, Sun
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
  const [activeMenu, setActiveMenu] = useState('students')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
    gradeLevel: 'Year 1', parentName: '', parentEmail: '', parentPhone: '',
    address: '', studentId: ''
  })
  const [studentPhoto, setStudentPhoto] = useState(null)

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/students`)
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Dark Mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const handleAddStudent = async (e) => {
    e.preventDefault()
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.parentName) {
      alert("First Name, Last Name and Parent Name are required!")
      return
    }

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
      resetForm()
      alert('✅ Student added successfully!')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to add student')
    }
  }

  const resetForm = () => {
    setShowAddStudent(false)
    setNewStudent({
      firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
      gradeLevel: 'Year 1', parentName: '', parentEmail: '', parentPhone: '',
      address: '', studentId: ''
    })
    setStudentPhoto(null)
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return
    try {
      await axios.delete(`${API_URL}/api/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
      alert('✅ Student deleted successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to delete student')
    }
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#4a235a] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-purple-900 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e]">G</div>
              <div>
                <p className="text-xs font-bold">Golden-Intels</p>
                <p className="text-xs text-yellow-300">Admin Portal</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
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
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900 rounded-lg">
            <LogOut size={20} /> {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`px-6 py-4 flex justify-between items-center shadow-sm ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <h1 className="text-2xl font-bold capitalize">{activeMenu}</h1>
        </div>

        <div className={`flex-1 p-6 overflow-auto ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
          {activeMenu === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Students</h2>
                <button 
                  onClick={() => setShowAddStudent(true)} 
                  className="bg-[#4a235a] hover:bg-purple-800 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                >
                  <UserPlus size={20} /> Add New Student
                </button>
              </div>

              <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <table className="w-full">
                  <thead className="bg-[#4a235a] text-white sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left">Photo</th>
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
                        <td className="px-6 py-4">
                          {s.photo ? (
                            <img 
                              src={`${API_URL}${s.photo}`} 
                              alt={`${s.firstName} ${s.lastName}`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" 
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/48?text=No+Photo'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs">📷</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="px-6 py-4">{s.gradeLevel}</td>
                        <td className="px-6 py-4 font-mono">{s.studentId}</td>
                        <td className="px-6 py-4">{s.parentName}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => deleteStudent(s.id)} 
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Placeholder for other menus */}
          {activeMenu !== 'students' && (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold mb-4 text-gray-400">Coming Soon</h2>
              <p className="text-gray-500">This section is under active development.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="p-8 border-b sticky top-0 bg-inherit z-10">
              <h2 className="text-2xl font-bold">Add New Student</h2>
            </div>

            <form onSubmit={handleAddStudent} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} className="px-4 py-3 border rounded-xl" />
                <input required placeholder="Last Name" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} className="px-4 py-3 border rounded-xl" />
              </div>

              <input placeholder="Student ID (optional)" value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />

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

              <input required placeholder="Parent/Guardian Name" value={newStudent.parentName} onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
              <input type="email" placeholder="Parent Email" value={newStudent.parentEmail} onChange={e => setNewStudent({...newStudent, parentEmail: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
              <input type="tel" placeholder="Parent Phone" value={newStudent.parentPhone} onChange={e => setNewStudent({...newStudent, parentPhone: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
              <input placeholder="Address" value={newStudent.address} onChange={e => setNewStudent({...newStudent, address: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />

              <div>
                <label className="block mb-2 text-sm font-medium">Student Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setStudentPhoto(e.target.files[0])} />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={resetForm} className="flex-1 py-4 border rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-[#4a235a] text-white py-4 rounded-xl font-bold">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}