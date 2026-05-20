import { Link } from 'react-router-dom'

export default function CallToAction() {
  return (
    <section className="py-20 bg-[#0066ff]">
      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* Badge */}
        <span className="inline-block bg-[#fff25c] text-[#12356a] text-sm font-bold px-4 py-1 rounded-full mb-6">
          Admissions Open
        </span>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6">
          Begin Your Journey With Us
        </h2>

        {/* Subtext */}
        <p className="text-blue-50 text-lg max-w-2xl mx-auto mb-10">
          Join a community dedicated to excellence, innovation, and nurturing the leaders of tomorrow.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/admissions"
            className="bg-[#fff25c] hover:bg-[#ffe600] text-[#12356a] font-bold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            Start Application
          </Link>
          <Link
            to="/contact"
            className="border-2 border-white hover:border-[#fff25c] hover:text-[#fff25c] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            Schedule a Visit
          </Link>
        </div>

      </div>
    </section>
  )
}
