import { Link } from 'react-router-dom'
import heroBg from '../../assets/hero-bg.jpg'

export default function Hero() {
  return (
    <div className="relative text-white min-h-[90vh] flex items-center justify-center overflow-hidden bg-blue-500">
      {/* Background image with slow zoom animation */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 animate-[slowZoom_15s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-blue-500/70"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        
        {/* Badge */}
        <span className="inline-block bg-blue-200 text-slate-950 text-sm font-bold px-4 py-1 rounded-full mb-6">
          Oxford Accredited School
        </span>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight mb-6">
          Welcome to <br />
          <span className="text-cyan-200">Golden-Intels</span> <br />
          International School
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-cyan-50 max-w-2xl mx-auto mb-10">
          We nurture for nature.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/admissions" className="bg-blue-200 hover:bg-blue-300 text-slate-950 font-bold px-8 py-3 rounded-lg text-lg transition-colors">
            Apply Now
          </Link>
          <Link to="/about" className="border-2 border-white hover:border-blue-200 hover:text-cyan-200 text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors">
            Learn More
          </Link>
          <Link to="/about" className="bg-white hover:bg-blue-100 text-cyan-700 font-bold px-8 py-3 rounded-lg text-lg transition-colors">
            Discover Our Story
          </Link>
        </div>

      </div>
    </div>
  )
}
