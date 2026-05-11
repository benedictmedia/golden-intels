import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1a3c6e] text-white">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] text-lg">G</div>
            <div>
              <p className="font-bold text-sm">Golden-Intels</p>
              <p className="text-xs text-yellow-300">International School</p>
            </div>
          </div>
          <p className="text-blue-200 text-sm leading-relaxed mb-4">
            An Oxford-accredited institution dedicated to developing confident, creative, and globally minded learners since 2017.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-[#d4a017] hover:text-[#1a3c6e] rounded-full flex items-center justify-center transition-colors text-xs font-bold">
              f
            </a>
            <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-[#d4a017] hover:text-[#1a3c6e] rounded-full flex items-center justify-center transition-colors text-xs font-bold">
              X
            </a>
            <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-[#d4a017] hover:text-[#1a3c6e] rounded-full flex items-center justify-center transition-colors text-xs font-bold">
              in
            </a>
            <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-[#d4a017] hover:text-[#1a3c6e] rounded-full flex items-center justify-center transition-colors text-xs font-bold">
              yt
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-[#d4a017] mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'Academics', path: '/academics' },
              { label: 'Curriculum', path: '/curriculum' },
              { label: 'Campus Life', path: '/campus-life' },
              { label: 'Student Life', path: '/student-life' },
              { label: 'Admissions', path: '/admissions' },
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path} className="text-blue-200 hover:text-[#f0c040] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h4 className="font-bold text-[#d4a017] mb-4">More</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Our Staff', path: '/staff' },
              { label: 'Gallery', path: '/gallery' },
              { label: 'News & Events', path: '/news' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Portal Login', path: '/login' },
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path} className="text-blue-200 hover:text-[#f0c040] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-[#d4a017] mb-4">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-[#d4a017] mt-0.5 shrink-0" />
              <span className="text-blue-200">Golden-Intels International School, Ghana</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#d4a017] shrink-0" />
              <span className="text-blue-200">+233 000 000 000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#d4a017] shrink-0" />
              <span className="text-blue-200">info@goldenintels.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-800 py-6 text-center text-sm text-blue-300">
        <p>© {new Date().getFullYear()} Golden-Intels International School. All rights reserved.</p>
      </div>

    </footer>
  )
}