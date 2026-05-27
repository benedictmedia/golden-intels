import { Link } from 'react-router-dom'
import heroBg from '../../assets/hero-bg.jpg'

export default function Hero() {
  return (
    <div className="relative text-white min-h-[90vh] flex items-center justify-center overflow-hidden bg-sky-500">
      {/* Background image with slow zoom animation */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 animate-[slowZoom_15s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/85 via-cyan-500/75 to-blue-700/80"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-400 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        
        {/* Badge */}
        <span className="inline-block bg-yellow-300 text-blue-950 text-sm font-bold px-4 py-1 rounded-full mb-6 shadow-sm">
          Oxford Accredited School
        </span>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight mb-6">
          Welcome to <br />
          <span className="text-yellow-200">Golden-Intels</span> <br />
          International School
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-cyan-50 max-w-2xl mx-auto mb-10">
          We nurture for nature.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/admissions" className="bg-yellow-300 hover:bg-yellow-200 text-blue-950 font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-blue-950/20">
            Apply Now
          </Link>
          <Link to="/about" className="border-2 border-white hover:border-yellow-200 hover:text-yellow-200 text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors">
            Learn More
          </Link>
          <Link to="/about" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-blue-950/20">
            Discover Our Story
          </Link>
        </div>

      </div>
    </div>
  )
}
