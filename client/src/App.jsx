import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageTransition from './components/layout/PageTransition'
import Home from './pages/Home'
import About from './pages/About'
import Academics from './pages/Academics'
import Curriculum from './pages/Curriculum'
import CampusLife from './pages/CampusLife'
import StudentLife from './pages/StudentLife'
import Admissions from './pages/Admissions'
import Gallery from './pages/Gallery'
import NewsEvents from './pages/NewsEvents'
import Staff from './pages/Staff'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ParentDashboard from './pages/parent/ParentDashboard'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Navbar /><Home /><Footer /></PageTransition>} />
        <Route path="/about" element={<PageTransition><Navbar /><About /><Footer /></PageTransition>} />
        <Route path="/academics" element={<PageTransition><Navbar /><Academics /><Footer /></PageTransition>} />
        <Route path="/curriculum" element={<PageTransition><Navbar /><Curriculum /><Footer /></PageTransition>} />
        <Route path="/campus-life" element={<PageTransition><Navbar /><CampusLife /><Footer /></PageTransition>} />
        <Route path="/student-life" element={<PageTransition><Navbar /><StudentLife /><Footer /></PageTransition>} />
        <Route path="/admissions" element={<PageTransition><Navbar /><Admissions /><Footer /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Navbar /><Gallery /><Footer /></PageTransition>} />
        <Route path="/news" element={<PageTransition><Navbar /><NewsEvents /><Footer /></PageTransition>} />
        <Route path="/staff" element={<PageTransition><Navbar /><Staff /><Footer /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App