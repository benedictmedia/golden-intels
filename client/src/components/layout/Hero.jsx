import { Link } from 'react-router-dom'
import heroBg from '../../assets/hero-bg.jpg'

export default function Hero() {
  return (
    <div className="relative text-white min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#2D2D2D]">
      {/* Background image with slow zoom animation */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 animate-[slowZoom_15s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#000000]/85"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        
        {/* Badge */}
        <span className="inline-block bg-[#2D2D2D] text-white text-sm font-bold px-4 py-1 rounded-full mb-6 shadow-sm border border-white/70">
          Oxford Accredited School
        </span>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight mb-6">
          Welcome to <br />
          <span className="text-[#2D2D2D]">Golden-Intels</span> <br />
          International School
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-[#666666] max-w-2xl mx-auto mb-10">
          We nurture for nature.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/admissions" className="bg-[#F2C94C] hover:bg-[#7B61FF] text-#666666 font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-blue-950/20 border border-[#E0E0E0]/80">
            Apply Now
          </Link>
          <Link to="/about" className="border-2 border-white hover:text-#666666/80 text-#666666 font-bold px-8 py-3 rounded-lg text-lg transition-colors">
            Learn More
          </Link>
          <Link to="/about" className="bg-[#0000FF] hover:bg-[#008ee6] text-#666666 font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-blue-950/20 border border-[#E0E0E0]/80">
            Discover Our Story
          </Link>
        </div>

      </div>
    </div>
  )
}
