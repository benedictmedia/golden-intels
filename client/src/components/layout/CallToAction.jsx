import { Link } from 'react-router-dom'

export default function CallToAction() {
  return (

    <section className="py-20 bg-[#2563EB] text-white">

      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* Badge */}
        <span className="inline-block bg-[#7C3AED] text-white text-sm font-bold px-4 py-1 rounded-full mb-6 shadow-md">
          Admissions Open
        </span>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6 leading-tight">
          Begin Your Journey <br />
          <span className="text-[#ffff00]">With Us</span>
        </h2>

        {/* Subtext */}
        <p className="text-[#E5E7EB] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Join a community dedicated to excellence, innovation, and nurturing the leaders of tomorrow.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          {/* Primary Button */}
          <Link
            to="/admissions"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-8 py-3 rounded-lg text-lg transition-all duration-300 shadow-lg"
          >
            Start Application
          </Link>

          {/* Secondary Button */}
          <Link
            to="/contact"
            className="border-2 border-white/80 hover:border-[#F4B400] hover:text-[#F4B400] text-white font-bold px-8 py-3 rounded-lg text-lg transition-all duration-300"
          >
            Schedule a Visit
          </Link>

        </div>

      </div>

    </section>

  )
}