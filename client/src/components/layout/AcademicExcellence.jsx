import { Link } from 'react-router-dom'
import { BookOpen, Lightbulb, Brain, Heart } from 'lucide-react'
import heroBg from '../../assets/school.jpg'

const highlights = [
  { icon: <BookOpen size={24} />, label: 'Rigorous Academics' },
  { icon: <Lightbulb size={24} />, label: 'Innovative Teaching' },
  { icon: <Brain size={24} />, label: 'Critical Thinking' },
  { icon: <Heart size={24} />, label: 'Love of Learning' },
]

export default function AcademicExcellence() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

        {/* Left: Text */}
        <div className="flex-1">
          <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
            Academic Excellence
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-6">
            A Curriculum Built for the Future
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Our comprehensive curriculum combines rigorous academics with innovative teaching methods. From Early Years through Primary education, we foster critical thinking, creativity, innovation and a lifelong love of learning.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-[#1a3c6e] font-medium">
                <div className="text-[#d4a017]">{item.icon}</div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link
            to="/academics"
            className="inline-block bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            Explore Our Programs
          </Link>
        </div>

        {/* Right: Visual card */}
       {/* Right: Photo */}
        <div className="flex-1">
          <img
            src="/src/assets/school.jpg"
            alt="Golden-Intels International School"
            className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}