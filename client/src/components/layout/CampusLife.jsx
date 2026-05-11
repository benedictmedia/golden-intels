import { Link } from 'react-router-dom'
import { Code, Music, Dumbbell, Scissors, FlaskConical, Palette } from 'lucide-react'

const activities = [
  { icon: <Code size={24} />, label: 'Coding & Computer Skills' },
  { icon: <FlaskConical size={24} />, label: 'STEM Programs' },
  { icon: <Music size={24} />, label: 'Arts & Music' },
  { icon: <Scissors size={24} />, label: 'Baking, Sewing & Braiding' },
  { icon: <Dumbbell size={24} />, label: 'Physical Education & Sports' },
  { icon: <Palette size={24} />, label: 'Creative Arts' },
]

export default function CampusLife() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

        {/* Left: Photo */}
        <div className="flex-1">
          <img
            src="/src/assets/campus.jpg"
            alt="Campus Life at Golden-Intels"
            className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
          />
        </div>

        {/* Right: Text */}
        <div className="flex-1">
          <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
            Campus Life
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-6">
            Vibrant Campus Life
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Beyond academics, our students thrive in a rich environment of coding, Computer Skills, STEM, arts and music, baking, sewing and braiding, Physical education and sports, and many more. We believe in developing well-rounded individuals prepared for all aspects of life.
          </p>

          {/* Activities */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {activities.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-[#1a3c6e] font-medium">
                <div className="text-[#d4a017]">{item.icon}</div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link
            to="/campus-life"
            className="inline-block bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            Discover Campus Life
          </Link>
        </div>

      </div>
    </section>
  )
}