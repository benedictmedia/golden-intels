import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign,
  BarChart2, UserPlus, LogOut, Menu, X, Bell, Eye, Trash2, Key, Copy, CheckCircle, Image, Newspaper, UserCircle
} from 'lucide-react'

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
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    gradeLevel: '', parentName: '', parentEmail: '', parentPhone: '', address: ''
  })

  useEffect(() => {
    if (activeMenu === 'learners') {
      axios.get('http://localhost:5000/api/students').then(res => setStudents(res.data))
    }
  }, [activeMenu])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleAddStudent = async () => {
    try {
      const formData = new FormData()
      Object.entries(newStudent).forEach(([key, value]) => formData.append(key, value))
      if (photoFile) formData.append('photo', photoFile)

      const res = await axios.post('http://localhost:5000/api/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStudents([res.data, ...students])
      setShowAddStudent(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      setNewStudent({
        firstName: '', lastName: '', dateOfBirth: '', gender: '',
        gradeLevel: '', parentName: '', parentEmail: '', parentPhone: '', address: ''
      })
    } catch (err) {
      alert('Failed to add learner. Please fill all fields.')
    }
  }

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this learner?')) return
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
      if (selectedStudent?.id === id) setSelectedStudent(null)
    } catch (err) {
      alert('Failed to delete learner.')
    }
  }

  const handleCreateAccount = async () => {
    setCreateError('')
    setCreateSuccess(false)
    setCreateLoading(true)
    try {
      await axios.post('http://localhost:5000/api/auth/register', newUser)
      setCreateSuccess(true)
      setNewUser({ name: '', email: '', password: '', role: 'teacher' })
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create account.')
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredStudents = activeClass === 'All' ? students : students.filter(s => s.gradeLevel === activeClass)

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a3c6e] text-white transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
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
                activeMenu === item.id ? 'bg-[#d4a017] text-[#1a3c6e] font-bold' : 'hover:bg-blue-800 text-blue-200'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-800 text-blue-200 transition-colors rounded-lg">
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
            <h1 className="text-xl font-bold text-[#1a3c6e] capitalize">{activeMenu.replace('-', ' ')}</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-[#1a3c6e]">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4a017] rounded-full text-xs text-[#1a3c6e] font-bold flex items-center justify-center">0</span>
            </button>
            <div className="w-9 h-9 bg-[#1a3c6e] rounded-full flex items-center justify-center text-white font-bold text-sm">
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-4">Admissions</h2>
              <p className="text-gray-500">Admissions management coming soon.</p>
            </div>
          )}

          {/* Finance */}
          {activeMenu === 'finance' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-4">Finance</h2>
              <p className="text-gray-500">Finance management coming soon.</p>
            </div>
          )}

          {/* Performance */}
          {activeMenu === 'performance' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-4">Performance Review</h2>
              <p className="text-gray-500">Performance review coming soon.</p>
            </div>
          )}

          {/* Learners */}
          {activeMenu === 'learners' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#1a3c6e]">Learners</h2>
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                >
                  + Add Learner
                </button>
              </div>

              {/* Add Student Form */}
              {showAddStudent && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-bold text-[#1a3c6e] mb-6">Add New Learner</h3>

                  {/* Photo Upload */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-[#1a3c6e] flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs text-center px-2">No Photo</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Passport Photo</label>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-gray-600" />
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">First Name</label>
                      <input type="text" value={newStudent.firstName} onChange={e => setNewStudent({ ...newStudent, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Last Name</label>
                      <input type="text" value={newStudent.lastName} onChange={e => setNewStudent({ ...newStudent, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Date of Birth</label>
                      <input type="date" value={newStudent.dateOfBirth} onChange={e => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
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
                        <option value="Nursery">Nursery</option>
                        <option value="Reception">Reception</option>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                        <option value="Year 5">Year 5</option>
                        <option value="Year 6">Year 6</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Parent Name</label>
                      <input type="text" value={newStudent.parentName} onChange={e => setNewStudent({ ...newStudent, parentName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Parent Email</label>
                      <input type="email" value={newStudent.parentEmail} onChange={e => setNewStudent({ ...newStudent, parentEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Parent Phone</label>
                      <input type="text" value={newStudent.parentPhone} onChange={e => setNewStudent({ ...newStudent, parentPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Address</label>
                      <input type="text" value={newStudent.address} onChange={e => setNewStudent({ ...newStudent, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={handleAddStudent} className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-8 py-3 rounded-xl transition-colors">Save Learner</button>
                    <button onClick={() => { setShowAddStudent(false); setPhotoFile(null); setPhotoPreview(null) }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {/* Class Filter Tabs */}
              <div className="flex flex-wrap gap-3 mb-6">
                {classes.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setActiveClass(cls)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      activeClass === cls ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'
                    }`}
                  >
                    {cls}
                    <span className="ml-2 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-2 py-0.5 rounded-full">
                      {cls === 'All' ? students.length : students.filter(s => s.gradeLevel === cls).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Class Heading */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#1a3c6e]">
                  {activeClass === 'All' ? 'All Learners' : `${activeClass} Class`}
                  <span className="ml-2 text-gray-400 text-sm font-normal">({filteredStudents.length} learners)</span>
                </h3>
              </div>

              {/* Students Table */}
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
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400">No learners in this class yet.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-[#1a3c6e]">
                              {student.photo ? (
                                <img src={`http://localhost:5000${student.photo}`} alt={student.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-sm">
                                  {student.firstName?.charAt(0)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full">{student.studentId}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-[#1a3c6e]">{student.firstName} {student.lastName}</td>
                          <td className="px-6 py-4">
                            <span className="bg-[#1a3c6e] text-white text-xs font-bold px-3 py-1 rounded-full">{student.gradeLevel}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{student.gender}</td>
                          <td className="px-6 py-4">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{student.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white p-2 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                title="Remove Learner"
                              >
                                <Trash2 size={16} />
                              </button>
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
              {createSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">Account created successfully!</div>
              )}
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{createError}</div>
              )}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Full Name</label>
                  <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Email Address</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Enter email address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Password</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Enter password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1a3c6e] mb-2">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700">
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button onClick={handleCreateAccount} disabled={createLoading} className="w-full bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif">Learner Profile</h2>
              <button onClick={() => setSelectedStudent(null)} className="hover:text-[#d4a017] transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">

              {/* Photo and ID */}
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-[#1a3c6e]">
                  {selectedStudent.photo ? (
                    <img src={`http://localhost:5000${selectedStudent.photo}`} alt={selectedStudent.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-2xl">
                      {selectedStudent.firstName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a3c6e]">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mt-1">{selectedStudent.studentId}</span>
                  <p className="text-gray-500 text-sm mt-1">{selectedStudent.gradeLevel}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {[
                  { label: 'Date of Birth', value: selectedStudent.dateOfBirth },
                  { label: 'Gender', value: selectedStudent.gender },
                  { label: 'Grade Level', value: selectedStudent.gradeLevel },
                  { label: 'Parent Name', value: selectedStudent.parentName },
                  { label: 'Parent Email', value: selectedStudent.parentEmail },
                  { label: 'Parent Phone', value: selectedStudent.parentPhone },
                  { label: 'Address', value: selectedStudent.address },
                  { label: 'Status', value: selectedStudent.status },
                  { label: 'Enrolled On', value: new Date(selectedStudent.createdAt).toLocaleDateString() },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-[#1a3c6e] w-32 shrink-0">{item.label}</span>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
const AdminDashboard = () => {
  return <div>...</div>;
}

export default AdminDashboard;