import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Academics', path: '/academics' },
  { name: 'Curriculum', path: '/curriculum' },
  { name: 'Our Activities & Clubs', path: '/campus-life' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Admissions', path: '/admissions' },
  { name: 'Our Staff', path: '/staff' },
  { name: 'News & Events', path: '/news' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-white border-b border-cyan-200/50 shadow-lg shadow-cyan-900/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center font-bold text-blue-950 text-lg shadow-sm">G</div>
          <div className="leading-tight">
            <p className="font-bold text-sm text-white">Golden-Intels</p>
            <p className="text-xs text-cyan-50">International School</p>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navLinks.map(link => (
            <li key={link.name}>
              <Link to={link.path} className="text-white/95 hover:text-yellow-200 transition-colors">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Portal button */}
        <Link to="/login" className="hidden lg:block bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm shadow-fuchsia-950/20">
          Portal Login
        </Link>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-blue-700/95 border-t border-cyan-200/40 px-4 pb-4 shadow-sm">
          <ul className="flex flex-col gap-3 mt-3 text-sm">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link to={link.path} onClick={() => setMenuOpen(false)} className="text-white hover:text-yellow-200 transition-colors block">
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" className="block bg-fuchsia-600 text-white font-bold text-center py-2 rounded-lg mt-2 hover:bg-fuchsia-700 transition-colors">
                Portal Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
