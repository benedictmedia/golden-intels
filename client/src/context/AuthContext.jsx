import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import API_URL from '../api/config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) return null

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    try {
      const res = await axios.get(`${API_URL}/api/auth/me`)
      const nextUser = res.data
      localStorage.setItem('user', JSON.stringify(nextUser))
      setUser(nextUser)
      return nextUser
    } catch (error) {
      console.error('Failed to refresh user profile', error)
      return null
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    if (token) {
      refreshUser().finally(() => setLoading(false))
      return
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}