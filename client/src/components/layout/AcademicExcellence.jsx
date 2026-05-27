import { Link } from 'react-router-dom'
import { BookOpen, Lightbulb, Brain, Heart } from 'lucide-react'
import schoolImg from '../../assets/school.jpg'

const highlights = [
  { icon: <BookOpen size={24} />, label: 'Rigorous Academics' },
  { icon: <Lightbulb size={24} />, label: 'Innovative Teaching' },
  { icon: <Brain size={24} />, label: 'Critical Thinking' },
  { icon: <Heart size={24} />, label: 'Love of Learning' },
]

export default function AcademicExcellence() {
  return (
    <section className="py-20 bg-[#0000FF] text-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

        {/* Left: Text */}
        <div className="flex-1">
          <span className="inline-block bg-[#0000FF] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-sm border border-white/70">
            Academic Excellence
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-6">
            A Curriculum Built for the Future
          </h2>
          <p className="text-white text-lg leading-relaxed mb-8">
            Our comprehensive curriculum combines rigorous academics with innovative teaching methods. From Early Years through Primary education, we foster critical thinking, creativity, innovation and a lifelong love of learning.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white font-medium">
                <div className="text-white">{item.icon}</div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link
            to="/academics"
            className="inline-block bg-[#0000FF] hover:bg-[#008ee6] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-blue-950/20 border border-white/80"
          >
            Explore Our Programs
          </Link>
        </div>

        {/* Right: Visual card */}
       {/* Right: Photo */}
        <div className="flex-1">
          <img
            src={schoolImg}
            alt="Golden-Intels International School"
            className="w-full h-[420px] object-cover rounded-2xl shadow-xl border-4 border-white/70" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  )
}
