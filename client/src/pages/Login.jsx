import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      else navigate('/')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff0fb] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e600a9] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 bg-[#ff00c8] rounded-full flex items-center justify-center font-bold text-[#e600a9] text-xl">G</div>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#e600a9]">Portal Login</h1>
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
            <label className="block text-sm font-bold text-[#e600a9] mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e600a9] text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#e600a9] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e600a9] text-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e600a9] hover:bg-[#ff33c7] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Roles info */}
        <div className="mt-8 bg-[#fff0fb] rounded-xl p-4">
          <p className="text-xs font-bold text-[#e600a9] mb-2">Portal Access:</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">👤 Admin — Full school management</p>
            <p className="text-xs text-gray-500">📚 Teacher — Classes and gradebook</p>
            <p className="text-xs text-gray-500">👨‍👩‍👧 Parent — Child progress and fees</p>
          </div>
        </div>

      </div>
    </div>
  )
}