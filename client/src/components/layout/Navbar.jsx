import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import BrandLogo from './BrandLogo'
import oxfordLogo from '../assets/oxford-logo.png'

// School colour palette is defined in index.css as CSS variables
// --color-primary (purple), --color-secondary (blue), --color-accent (yellow)

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
    <nav className="sticky top-0 z-40 bg-[var(--color-primary)] text-white border-b border-white/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <BrandLogo className="w-10 h-10 shadow-md" />
          {/* School Name */}
          <div className="leading-tight min-w-0">
            <p className="font-bold text-sm tracking-wide text-white">Golden-Intels</p>
            <p className="text-xs text-white truncate">International School</p>
          </div>
        </Link>
        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.path} className="hover:text-[var(--color-accent)] transition-colors duration-300">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        {/* Portal button */}
        <Link
          to="/login"
          className="hidden lg:block bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-bold text-sm px-5 py-2 rounded-lg transition-all duration-300 shadow-md"
        >
          Portal Login
        </Link>

        {/* Oxford International Curriculum badge */}
          <a
  href="https://www.oxfordinternational.com"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-1.5 ml-2"
  title="Oxford International Curriculum Accredited School"
>
  <img
    src={oxfordLogo}
    alt="Oxford International Curriculum"
    className="h-9 w-auto object-contain"
  />
</a>
        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-2 -mr-2 rounded-lg hover:bg-white/10" aria-label="Toggle navigation menu" aria-expanded={menuOpen}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[var(--color-primary)] border-t border-white/20 px-4 pb-6 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.path} onClick={() => setMenuOpen(false)} className="hover:text-[var(--color-accent)] hover:bg-white/10 transition-colors duration-300 block rounded-lg px-3 py-3">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          {/* Mobile Portal Button */}
          <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-4 block text-center bg-[var(--color-secondary)] hover:bg-white/10 text-white font-bold text-sm px-5 py-3 rounded-lg transition-all duration-300">
            Portal Login
          </Link>

          {/* Oxford International Curriculum badge */}
          <a
  href="https://www.oxfordinternational.com"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-1.5 ml-2"
  title="Oxford International Curriculum Accredited School"
>
  <img
    src={oxfordLogo}
    alt="Oxford International Curriculum"
    className="h-9 w-auto object-contain"
  />
</a>
        </div>
      )}
    </nav>
  )
}
