import { Link } from 'react-router-dom'
import heroBg from '../../assets/hero-bg.jpg'

export default function Hero() {
  return (
    <div className="relative text-[#800080] min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#a7cdf3]">
      
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 animate-[slowZoom_15s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>

      {/* Mission Statement */}
<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 mb-6 max-w-lg">
  <div className="flex items-start gap-3">
    <div className="w-1 min-h-full bg-[#d4a017] rounded-full flex-shrink-0 self-stretch" />
    <div>
      <p className="text-[#d4a017] text-xs font-bold uppercase tracking-widest mb-2">
        Our Mission
      </p>
      <p className="text-white text-sm leading-relaxed font-medium">
        Raising godly, globally minded scholars through international education that builds academic excellence, critical thinking, and Christ-like character for a life of purpose.
      </p>
    </div>
  </div>
</div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[#2563EB]/30"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">

        {/* Badge */}
        <span className="inline-block bg-[#7C3AED] text-white text-sm font-bold px-4 py-1 rounded-full mb-6 shadow-md">
          A school Accredited by Oxford University Press
        </span>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight mb-6">
          Welcome to <br />
          <span className="text-[#ffff00]">Golden-Intels</span> <br />
          International School
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-[#ffff00]/200 max-w-2xl mx-auto mb-10">
          We nurture for nature.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          {/* Primary Button */}
          <Link
            to="/admissions"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg"
          >
            Apply Now
          </Link>

          {/* Secondary Button */}
          <Link
            to="/about"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </div>
  )
}