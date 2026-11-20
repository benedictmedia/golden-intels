import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/layout/BrandLogo'
import API_URL, { MAIN_WEBSITE_URL } from '../api/config'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'teacher') navigate('/teacher')
      else if (user.role === 'parent') navigate('/parent')
      else if (user.role === 'learner') navigate('/learner')
      else navigate('/')
    } catch (err) {
      if (!err.response) {
        setError('Could not reach the portal server. Check your connection or contact school support.')
      } else if (err.response.status >= 500) {
        setError('The portal is temporarily unavailable. Please try again shortly or contact school support.')
      } else {
        setError(err.response.data?.message || 'Invalid email or password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email: email.trim() })
      setMessage(res.data.message || 'If that email is registered, a password reset link has been sent.')
    } catch (err) {
      if (!err.response) {
        setError('Could not reach the portal server. Check your connection or contact school support.')
      } else if (err.response.status === 503) {
        setError('We could not send a password reset email right now. Please try again later or contact school support.')
      } else {
        setError(err.response.data?.message || 'Could not request password reset. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <BrandLogo className="w-20 h-20 mx-auto mb-4 shadow-md" />
          <h1 className="text-2xl font-bold font-serif text-blue-800">{forgotMode ? 'Reset your password' : 'Welcome back'}</h1>
          <p className="text-gray-500 text-sm mt-2">
            {forgotMode ? 'Enter the email address linked to your school account.' : 'Sign in to your Golden-Intels school portal.'}
          </p>
        </div>

        {location.state?.reason === 'inactive' && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
            You were logged out after 10 minutes of inactivity. Please log in again.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={forgotMode ? handleForgotPassword : handleSubmit} className="space-y-5" aria-label={forgotMode ? 'Request a password reset' : 'Portal login'}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-bold text-blue-800 mb-2">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700"
            />
          </div>
          {!forgotMode && (
            <div>
              <label htmlFor="login-password" className="block text-sm font-bold text-blue-800 mb-2">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {loading ? (forgotMode ? 'Sending...' : 'Logging in...') : (forgotMode ? 'Send Reset Link' : 'Login')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setForgotMode(prev => !prev)
            setError('')
            setMessage('')
          }}
          className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-800 mt-4"
        >
          {forgotMode ? 'Back to login' : 'Forgot password?'}
        </button>

        <a href={MAIN_WEBSITE_URL} className="mt-5 block text-center text-sm font-semibold text-blue-700 hover:text-blue-900">
          ← Main website
        </a>
      </div>
    </div>
  )
}
