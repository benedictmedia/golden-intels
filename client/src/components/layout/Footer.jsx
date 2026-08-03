import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { FaFacebook, FaLinkedin, FaYoutube, FaXTwitter } from "react-icons/fa6";
import BrandLogo from './BrandLogo'

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] text-slate-200">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BrandLogo className="w-10 h-10 shadow-md" />
            <div>
              <p className="font-bold text-sm text-white tracking-wide">
                Golden-Intels
              </p>
              <p className="text-xs text-slate-400">
                International School
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            A warm, modern learning community dedicated to confident, creative, and globally minded students.
          </p>

          {/* Social Media Links */}
          <div className="flex gap-3">
            <a
              href="https://facebook.com/Goldenintels" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-[#1E293B] hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-all duration-300 text-white hover:scale-110"
              title="Facebook"
            >
              <FaFacebook size={18} />
            </a>

            <a
              href="https://twitter.com/Goldenintels"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-[#1E293B] hover:bg-black rounded-full flex items-center justify-center transition-all duration-300 text-white hover:scale-110"
              title="X (Twitter)"
            >
              <FaXTwitter size={18} />
            </a>

            <a
              href="https://linkedin.com/school/goldenintels"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-[#1E293B] hover:bg-[#0A66C2] rounded-full flex items-center justify-center transition-all duration-300 text-white hover:scale-110"
              title="LinkedIn"
            >
              <FaLinkedin size={18} />
            </a>

            <a
              href="https://youtube.com/@goldenintels"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-[#1E293B] hover:bg-[#FF0000] rounded-full flex items-center justify-center transition-all duration-300 text-white hover:scale-110"
              title="YouTube"
            >
              <FaYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'Academics', path: '/academics' },
              { label: 'Curriculum', path: '/curriculum' },
              { label: 'Campus Life', path: '/campus-life' },
              { label: 'Admissions', path: '/admissions' },
            ].map(link => (
              <li key={link.label}>
                <Link
                  to={link.path}
                  className="text-slate-300 hover:text-[#128038] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h4 className="font-bold text-white mb-4">More</h4>
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
                  className="text-slate-300 hover:text-[#128038] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-[#128038] mb-4">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
  <span className="text-xs text-[#2563eb] mt-1 block">Get Directions →</span>
  <MapPin size={16} className="text-[#2563eb] mt-0.5 shrink-0" />
  <a
    href="https://www.google.com/maps/search/?api=1&query=JF8G+32Q%2C+Ho%2C+Volta+Region%2C+Ghana"
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-300 hover:text-[#128038] hover:underline transition-colors duration-300 flex items-start gap-1 group"
  >
    Golden-Intels International School, <br />
    New Housing, directly opposite the Voltic Depot, <br />
    Ho-Volta Region, Ghana <br />
    <span className="text-xs text-[#2563eb] group-hover:underline">(JF8G+32Q)</span>
    <ExternalLink size={14} className="mt-0.5 opacity-70 group-hover:opacity-100" />
  </a>
</li>

            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#2563eb] shrink-0" />
              <span className="text-slate-300">+233 59 433 0816</span>
            </li>

            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#2563eb] shrink-0" />
              <span className="text-slate-300">info@goldenintels.edu.gh</span>
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