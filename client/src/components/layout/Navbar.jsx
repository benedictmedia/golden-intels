import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import BrandLogo from './BrandLogo'
import oxfordLogo from "../../assets/oxford-logo.png"

// School colour palette is defined in index.css as CSS variables
// --color-primary (royal blue-700), --color-secondary (royal blue-600), --color-accent (summer green)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Admissions', path: '/admissions' },
  { name: 'Our Services', path: '/services' },
  { name: 'News & Events', path: '/news' },
  { name: 'Contact', path: '/contact' },
]

const aboutLinks = [
  { name: 'Overview', path: '/about' },
  { name: 'Academics', path: '/academics' },
  { name: 'Curriculum', path: '/curriculum' },
  { name: 'Our Activities & Clubs', path: '/campus-life' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Our Staff', path: '/staff' },
]

const dropdownLinkClass = 'block whitespace-nowrap rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)

  const closeMenu = () => {
    setAboutOpen(false)
    setPortalOpen(false)
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-40 bg-[var(--color-primary)] text-white border-b border-white/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 min-w-0">
          <BrandLogo className="w-10 h-10 shadow-md" />
          {/* School Name */}
          <div className="leading-tight min-w-0">
            <p className="font-bold text-sm tracking-wide text-white">Golden-Intels</p>
            <p className="text-xs text-white truncate">International School</p>
          </div>
        </Link>
        {/* Desktop links */}
        <ul className="hidden lg:flex flex-1 items-center justify-center gap-5 px-4 text-xs font-medium">
          {navLinks.slice(0, 1).map((link) => (
            <li key={link.name}>
              <Link to={link.path} className="whitespace-nowrap hover:text-[var(--color-accent)] transition-colors duration-300">
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setPortalOpen(false)
                  setAboutOpen(open => !open)
                }}
                aria-expanded={aboutOpen}
                className="flex cursor-pointer items-center gap-1 whitespace-nowrap hover:text-[var(--color-accent)]"
              >
                About Us <ChevronDown size={14} className={`transition-transform duration-300 ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`navbar-dropdown-panel absolute left-0 top-full z-50 mt-3 min-w-52 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10 ${aboutOpen ? 'is-open' : ''}`}>
                {aboutLinks.map((link, index) => (
                  <div key={link.name}>
                    {index === 1 && <div className="my-1 border-t border-gray-200" />}
                    <Link to={link.path} onClick={closeMenu} className={dropdownLinkClass}>
                      {link.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </li>
          {navLinks.slice(1).map((link) => (
            <li key={link.name}>
              <Link to={link.path} className="whitespace-nowrap hover:text-[var(--color-accent)] transition-colors duration-300">
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAboutOpen(false)
                  setPortalOpen(open => !open)
                }}
                aria-expanded={portalOpen}
                className="flex cursor-pointer items-center gap-1 whitespace-nowrap hover:text-[var(--color-accent)]"
              >
                Portal <ChevronDown size={14} className={`transition-transform duration-300 ${portalOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`navbar-dropdown-panel absolute right-0 top-full z-50 mt-3 min-w-44 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10 ${portalOpen ? 'is-open' : ''}`}>
                <Link to="/login" target="_blank" rel="noopener noreferrer" onClick={closeMenu} className={dropdownLinkClass}>
                  Academics
                </Link>
                <div className="my-1 border-t border-gray-200" />
                <a
                  href="https://goldenintels.wavesoms.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={dropdownLinkClass}
                >
                  Finance
                </a>
              </div>
            </div>
          </li>
        </ul>

        {/* Oxford International Curriculum badge */}
          <a
  href="https://global.oup.com/education/primary/curricula/oxford-international-curriculum/?region=international"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-1.5 ml-2"
  title="Oxford International Curriculum Accredited School"
>
  <img
    src={oxfordLogo}
    alt="Oxford International Curriculum"
      className="h-8 w-auto object-contain"
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
            {navLinks.slice(0, 1).map((link) => (
              <li key={link.name}>
                <Link to={link.path} onClick={() => setMenuOpen(false)} className="hover:text-[var(--color-accent)] hover:bg-white/10 transition-colors duration-300 block rounded-lg px-3 py-3">
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="rounded-lg bg-white/5">
              <button
                type="button"
                onClick={() => setAboutOpen(open => !open)}
                aria-expanded={aboutOpen}
                className="flex w-full items-center justify-between px-3 py-3 text-left font-bold"
              >
                About Us <ChevronDown size={16} className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`navbar-dropdown-panel ${aboutOpen ? 'is-open' : ''}`}>
                {aboutLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-5 py-2.5 hover:bg-white/10 hover:text-[var(--color-accent)]"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </li>
            {navLinks.slice(1).map((link) => (
              <li key={link.name}>
                <Link to={link.path} onClick={() => setMenuOpen(false)} className="hover:text-[var(--color-accent)] hover:bg-white/10 transition-colors duration-300 block rounded-lg px-3 py-3">
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="rounded-lg bg-white/5">
              <button
                type="button"
                onClick={() => setPortalOpen(open => !open)}
                aria-expanded={portalOpen}
                className="flex w-full items-center justify-between px-3 py-3 text-left font-bold"
              >
                Portal <ChevronDown size={16} className={`transition-transform ${portalOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`navbar-dropdown-panel ${portalOpen ? 'is-open' : ''}`}>
                  <Link
                    to="/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-5 py-2.5 hover:bg-white/10 hover:text-[var(--color-accent)]"
                  >
                    Academics
                  </Link>
                  <div className="mx-3 border-t border-white/20" />
                  <a
                    href="https://goldenintels.wavesoms.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-5 py-2.5 hover:bg-white/10 hover:text-[var(--color-accent)]"
                  >
                    Finance
                  </a>
              </div>
            </li>
          </ul>

          {/* Oxford International Curriculum badge */}
          <a
  href="https://global.oup.com/education/primary/curricula/oxford-international-curriculum/?region=international"
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
