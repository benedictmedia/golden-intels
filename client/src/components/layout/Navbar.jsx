import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Academics', path: '/academics' },
  { name: 'Curriculum', path: '/curriculum' },
  { name: 'Campus Life', path: '/campus-life' },
  { name: 'Student Life', path: '/student-life' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Admissions', path: '/admissions' },
  { name: 'Our Staff', path: '/staff' },
  { name: 'News & Events', path: '/news' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-cyan-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-cyan-200 rounded-full flex items-center justify-center font-bold text-cyan-900 text-lg">G</div>
          <div className="leading-tight">
            <p className="font-bold text-sm">Golden-Intels</p>
            <p className="text-xs text-cyan-100">International School</p>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navLinks.map(link => (
            <li key={link.name}>
              <Link to={link.path} className="hover:text-cyan-100 transition-colors">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Portal button */}
        <Link to="/login" className="hidden lg:block bg-cyan-200 hover:bg-cyan-300 text-cyan-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
          Portal Login
        </Link>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-cyan-600 border-t border-cyan-300 px-4 pb-4">
          <ul className="flex flex-col gap-3 mt-3 text-sm">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link to={link.path} onClick={() => setMenuOpen(false)} className="hover:text-cyan-100 transition-colors block">
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" className="block bg-cyan-200 text-cyan-900 font-bold text-center py-2 rounded-lg mt-2">
                Portal Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
