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
    <nav className="bg-[#ffff00] text-white border-b border-white/20 shadow-lg">
      
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          
          {/* Logo Circle */}
          <div className="w-10 h-10 bg-[#F4B400] rounded-full flex items-center justify-center font-bold text-white shadow-md">
            G
          </div>

          {/* School Name */}
          <div className="leading-tight">
            
            <p className="font-bold text-sm tracking-wide text-white">
              Golden-Intels
            </p>

            <p className="text-xs text-[#E5E7EB]">
              International School
            </p>

          </div>

        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-6 text-sm font-medium">
          
          {navLinks.map(link => (
            
            <li key={link.name}>
              
              <Link
                to={link.path}
                className="hover:text-[#F4B400] transition-colors duration-300"
              >
                {link.name}
              </Link>

            </li>

          ))}

        </ul>

        {/* Portal button */}
        <Link
          to="/login"
          className="hidden lg:block bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm px-5 py-2 rounded-lg transition-all duration-300 shadow-md"
        >
          Portal Login
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-white"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile menu */}
      {menuOpen && (

        <div className="lg:hidden bg-[#2563EB] border-t border-white/20 px-4 pb-6">

          <ul className="flex flex-col gap-4 mt-4 text-sm">
            
            {navLinks.map(link => (
              
              <li key={link.name}>
                
                <Link
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#F4B400] transition-colors duration-300 block"
                >
                  {link.name}
                </Link>

              </li>

            ))}

          </ul>

          {/* Mobile Portal Button */}
          <Link
            to="/login"
            className="mt-6 inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm px-5 py-2 rounded-lg transition-all duration-300"
          >
            Portal Login
          </Link>

        </div>

      )}

    </nav>
  )
}