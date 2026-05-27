import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (

    <footer className="bg-[#0B1120] text-slate-200">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>

          <div className="flex items-center gap-2 mb-4">

            {/* Logo */}
            <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md">
              G
            </div>

            {/* School Name */}
            <div>
              <p className="font-bold text-sm text-white tracking-wide">
                Golden-Intels
              </p>

              <p className="text-xs text-slate-400">
                International School
              </p>
            </div>

          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            A warm, modern learning community dedicated to confident, creative, and globally minded students.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3">

            <a
              href="#"
              className="w-8 h-8 bg-[#1E293B] hover:bg-[#2563EB] rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold text-white"
            >
              f
            </a>

            <a
              href="#"
              className="w-8 h-8 bg-[#1E293B] hover:bg-[#2563EB] rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold text-white"
            >
              X
            </a>

            <a
              href="#"
              className="w-8 h-8 bg-[#1E293B] hover:bg-[#2563EB] rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold text-white"
            >
              in
            </a>

            <a
              href="#"
              className="w-8 h-8 bg-[#1E293B] hover:bg-[#2563EB] rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold text-white"
            >
              yt
            </a>

          </div>

        </div>

        {/* Quick Links */}
        <div>

          <h4 className="font-bold text-white mb-4">
            Quick Links
          </h4>

          <ul className="space-y-2 text-sm">

            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'Academics', path: '/academics' },
              { label: 'Curriculum', path: '/curriculum' },
              { label: 'Our Activities & Clubs', path: '/campus-life' },
              { label: 'Admissions', path: '/admissions' },
            ].map(link => (

              <li key={link.label}>
                <Link
                  to={link.path}
                  className="text-slate-300 hover:text-[#F4B400] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>

            ))}

          </ul>

        </div>

        {/* More Links */}
        <div>

          <h4 className="font-bold text-white mb-4">
            More
          </h4>

          <ul className="space-y-2 text-sm">

            {[
              { label: 'Our Staff', path: '/staff' },
              { label: 'Gallery', path: '/gallery' },
              { label: 'News & Events', path: '/news' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Portal Login', path: '/login' },
            ].map(link => (

              <li key={link.label}>
                <Link
                  to={link.path}
                  className="text-slate-300 hover:text-[#F4B400] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>

            ))}

          </ul>

        </div>

        {/* Contact */}
        <div>

          <h4 className="font-bold text-[#F4B400] mb-4">
            Contact Us
          </h4>

          <ul className="space-y-4 text-sm">

            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-[#2563EB] mt-0.5 shrink-0" />
              <span className="text-slate-300">
                Golden-Intels International School, Ghana
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#2563EB] shrink-0" />
              <span className="text-slate-300">
                +233 59 433 0816
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#2563EB] shrink-0" />
              <span className="text-slate-300">
                info@goldenintels.com
              </span>
            </li>

          </ul>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 text-center text-sm text-slate-500">

        <p>
          © {new Date().getFullYear()} Golden-Intels International School. All rights reserved.
        </p>

      </div>

    </footer>
  )
}