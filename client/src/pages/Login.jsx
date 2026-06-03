import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/layout/BrandLogo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'teacher') navigate('/teacher')
      else if (user.role === 'parent') navigate('/parent')
      else if (user.role === 'learner') navigate('/learner')
      else navigate('/')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <BrandLogo className="w-20 h-20 mx-auto mb-4 shadow-md" />
          <h1 className="text-2xl font-bold font-serif text-cyan-700">Portal Login</h1>
          <p className="text-gray-500 text-sm mt-1">Golden-Intels International School</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-cyan-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-cyan-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Roles info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-4">
          <p className="text-xs font-bold text-cyan-700 mb-2">Portal Access:</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">👤 Admin — Full school management</p>
            <p className="text-xs text-gray-500">📚 Teacher — Classes and gradebook</p>
            <p className="text-xs text-gray-500">👨‍👩‍👧 Parent — Child progress and school updates</p>
            <p className="text-xs text-gray-500">👩‍🎓 Learner — Learning resources, assignments and quizzes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
