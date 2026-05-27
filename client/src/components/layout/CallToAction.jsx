import { Link } from 'react-router-dom'

export default function CallToAction() {
  return (
    <section className="py-20 bg-[#0000FF] text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* Badge */}
        <span className="inline-block bg-[#0000FF] text-white text-sm font-bold px-4 py-1 rounded-full mb-6 shadow-sm border border-white/70">
          Admissions Open
        </span>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6">
          Begin Your Journey With Us
        </h2>

        {/* Subtext */}
        <p className="text-white text-lg max-w-2xl mx-auto mb-10">
          Join a community dedicated to excellence, innovation, and nurturing the leaders of tomorrow.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/admissions"
            className="bg-[#0000FF] hover:bg-[#008ee6] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-blue-950/20 border border-white/80"
          >
            Start Application
          </Link>
          <Link
            to="/contact"
            className="border-2 border-white hover:text-white/80 text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            Schedule a Visit
          </Link>
        </div>

      </div>
    </section>
  )
}
