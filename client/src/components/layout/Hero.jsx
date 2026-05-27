import { Link } from 'react-router-dom'
import heroBg from '../../assets/hero-bg.jpg'

export default function Hero() {
  return (
    <div className="relative text-[#2D2D2D] min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#F8FAFC]">
      
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 animate-[slowZoom_15s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[#0F172A]/65"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
        
        {/* Badge */}
        <span className="inline-block bg-[#2563EB] text-white text-sm font-bold px-4 py-1 rounded-full mb-6 shadow-md">
          Oxford Accredited School
        </span>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight mb-6">
          Welcome to <br />
          <span className="text-[#F4B400]">Golden-Intels</span> <br />
          International School
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
          We nurture for nature.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          {/* Primary Button */}
          <Link
            to="/admissions"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg"
          >
            Apply Now
          </Link>

          {/* Secondary Button */}
          <Link
            to="/about"
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </div>
  )
}