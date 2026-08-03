import { useState } from 'react'
import axios from 'axios'
import { X, Eye, EyeOff, Lock } from 'lucide-react'
import API_URL from '../api/config'

// Defined OUTSIDE the component so it never remounts on re-render
function PasswordField({ label, field, value, onChange, show, onToggle, accentColor }) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2" style={{ color: accentColor }}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-700 pr-12"
          placeholder="••••••••"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordModal({ onClose, accentColor = '#0c7f9c' }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ currentPassword: false, newPassword: false, confirmPassword: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleShow = (field) => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return setError('All fields are required.')
    }
    if (form.newPassword.length < 6) {
      return setError('New password must be at least 6 characters.')
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match.')
    }
    if (form.currentPassword === form.newPassword) {
      return setError('New password must be different from current password.')
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/api/auth/change-password`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ background: accentColor }}>
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-white" />
            <h2 className="text-lg font-bold text-white">Change Password</h2>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-70"><X size={22} /></button>
        </div>

        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${accentColor}15` }}>
                <Lock size={28} style={{ color: accentColor }} />
              </div>
              <p className="font-bold text-lg" style={{ color: accentColor }}>Password Changed!</p>
              <p className="text-gray-500 text-sm mt-1">Your password has been updated successfully.</p>
            </div>
          ) : (
            <>
              <PasswordField
                label="Current Password"
                field="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                show={show.currentPassword}
                onToggle={() => toggleShow('currentPassword')}
                accentColor={accentColor}
              />
              <PasswordField
                label="New Password"
                field="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                show={show.newPassword}
                onToggle={() => toggleShow('newPassword')}
                accentColor={accentColor}
              />
              <PasswordField
                label="Confirm New Password"
                field="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                show={show.confirmPassword}
                onToggle={() => toggleShow('confirmPassword')}
                accentColor={accentColor}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: accentColor }}>
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
                <button onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl">
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Password must be at least 6 characters.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}