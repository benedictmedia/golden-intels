import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-900 text-lg">G</div>
            <div>
              <p className="font-bold text-sm text-white">Golden-Intels</p>
              <p className="text-xs text-slate-400">International School</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            A warm, modern learning community dedicated to confident, creative, and globally minded students.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-full flex items-center justify-center transition-colors text-xs font-bold text-white">
              f
            </a>
            <a href="#" className="w-8 h-8 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors text-xs font-bold text-white">
              X
            </a>
            <a href="#" className="w-8 h-8 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-colors text-xs font-bold text-white">
              in
            </a>
            <a href="#" className="w-8 h-8 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center transition-colors text-xs font-bold text-white">
              yt
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-300">
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
                <Link to={link.path} className="text-slate-300 hover:text-fuchsia-200 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h4 className="font-bold text-white mb-4">More</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {[
              { label: 'Our Staff', path: '/staff' },
              { label: 'Gallery', path: '/gallery' },
              { label: 'News & Events', path: '/news' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Portal Login', path: '/login' },
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path} className="text-slate-300 hover:text-cyan-200 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-cyan-200 mb-4">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-cyan-200 mt-0.5 shrink-0" />
              <span className="text-cyan-100">Golden-Intels International School, Ghana</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-cyan-200 shrink-0" />
              <span className="text-cyan-100">+233 000 000 000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-cyan-200 shrink-0" />
              <span className="text-cyan-100">info@goldenintels.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} Golden-Intels International School. All rights reserved.</p>
      </div>

    </footer>
  )
}