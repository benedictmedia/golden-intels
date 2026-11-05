import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageTransition from './components/layout/PageTransition'
import Home from './pages/Home'
import About from './pages/About'
import Academics from './pages/Academics'
import Curriculum from './pages/Curriculum'
import CampusLife from './pages/CampusLife'
import OurServices from './pages/OurServices'
import Admissions from './pages/Admissions'
import Gallery from './pages/Gallery'
import NewsEvents from './pages/NewsEvents'
import Staff from './pages/Staff'
import Contact from './pages/Contact'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ParentDashboard from './pages/parent/ParentDashboard'
import FeePayment from './pages/parent/FeePayment'
import LearnerDashboard from './pages/learner/LearnerDashboard'
import ScrollToTop from './components/ScrollToTop'

const ROLE_HOME = {
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
  learner: '/learner'
}

function RequireRole({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading portal...</div>
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
  return children
}

function SessionIdleGuard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const logoutRef = useRef(logout)
  const userKey = user?.id || user?.email

  useEffect(() => {
    logoutRef.current = logout
  }, [logout])

  useEffect(() => {
    if (!userKey) return undefined

    const timeoutMs = 10 * 60 * 1000
    const activityKey = 'goldenIntelsLastActivityAt'
    let timerId
    let lastBroadcastAt = 0

    const expireSession = () => {
      logoutRef.current()
      navigate('/login', { replace: true, state: { reason: 'inactive' } })
    }

    const armTimer = (lastActivityAt) => {
      window.clearTimeout(timerId)
      const remaining = timeoutMs - (Date.now() - lastActivityAt)
      if (remaining <= 0) {
        expireSession()
        return
      }
      timerId = window.setTimeout(expireSession, remaining)
    }

    const storedActivity = Number(localStorage.getItem(activityKey))
    const initialActivity = Number.isFinite(storedActivity) && storedActivity > 0
      ? storedActivity
      : Date.now()
    if (!storedActivity) localStorage.setItem(activityKey, String(initialActivity))
    armTimer(initialActivity)

    const recordActivity = (event) => {
      const now = Date.now()
      if (event.type === 'mousemove' && now - lastBroadcastAt < 1000) return
      armTimer(now)
      if (now - lastBroadcastAt >= 5000) {
        localStorage.setItem(activityKey, String(now))
        lastBroadcastAt = now
      }
    }

    const syncActivity = event => {
      if (event.key === activityKey && event.newValue) {
        const activityAt = Number(event.newValue)
        if (Number.isFinite(activityAt)) armTimer(activityAt)
      }
      if (event.key === 'token' && event.newValue === null) expireSession()
    }

    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove', 'focus']
    activityEvents.forEach(eventName => window.addEventListener(eventName, recordActivity, { passive: true }))
    window.addEventListener('storage', syncActivity)

    return () => {
      window.clearTimeout(timerId)
      activityEvents.forEach(eventName => window.removeEventListener(eventName, recordActivity))
      window.removeEventListener('storage', syncActivity)
    }
  }, [navigate, userKey])

  return null
}


function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Navbar /><Home /><Footer /></PageTransition>} />
          <Route path="/about" element={<PageTransition><Navbar /><About /><Footer /></PageTransition>} />
          <Route path="/academics" element={<PageTransition><Navbar /><Academics /><Footer /></PageTransition>} />
          <Route path="/curriculum" element={<PageTransition><Navbar /><Curriculum /><Footer /></PageTransition>} />
          <Route path="/campus-life" element={<PageTransition><Navbar /><CampusLife /><Footer /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Navbar /><OurServices /><Footer /></PageTransition>} />
          <Route path="/admissions" element={<PageTransition><Navbar /><Admissions /><Footer /></PageTransition>} />
          <Route path="/gallery" element={<PageTransition><Navbar /><Gallery /><Footer /></PageTransition>} />
          <Route path="/news" element={<PageTransition><Navbar /><NewsEvents /><Footer /></PageTransition>} />
          <Route path="/staff" element={<PageTransition><Navbar /><Staff /><Footer /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Navbar /><Contact /><Footer /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
          <Route path="/teacher" element={<RequireRole role="teacher"><TeacherDashboard /></RequireRole>} />
          <Route path="/parent" element={<RequireRole role="parent"><ParentDashboard /></RequireRole>} />
          <Route path="/parent/pay-fees" element={<RequireRole role="parent"><FeePayment /></RequireRole>} />
          <Route path="/learner" element={<RequireRole role="learner"><LearnerDashboard /></RequireRole>} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SessionIdleGuard />
      <AnimatedRoutes />
      <ScrollToTop />
    </BrowserRouter>
  )
}

export default App