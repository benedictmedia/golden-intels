import { Link } from 'react-router-dom'
import { Code, Music, Dumbbell, Scissors, FlaskConical, Palette } from 'lucide-react'
import campusImg from '../../assets/campus.jpg'

const activities = [
  { icon: <Code size={24} />, label: 'Computer Skills' },
  { icon: <FlaskConical size={24} />, label: 'STEM Programs' },
  { icon: <Music size={24} />, label: 'Arts & Music' },
  { icon: <Scissors size={24} />, label: 'Global Skills Projects' },
  { icon: <Dumbbell size={24} />, label: 'Physical Education & Sports' },
  { icon: <Palette size={24} />, label: 'Creative Arts' },
]

export default function CampusLife() {
  return (
    <section className="py-20 bg-[#1D4ED8] text-white">

      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

        {/* Left: Photo */}
        <div className="flex-1">

          <img
            src={campusImg}
            alt="Our Activities & Clubs at Golden-Intels"
            className="w-full h-[420px] object-cover rounded-2xl shadow-2xl border-4 border-white/20"
            loading="lazy"
            decoding="async"
          />

        </div>

        {/* Right: Text */}
        <div className="flex-1">

          {/* Badge */}
          <span className="inline-block bg-[#2563eb] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-md">
            Activities & Clubs
          </span>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-6 leading-tight">
            Discover Our <span className="text-[#60a5fa]">Activities & Clubs</span>
          </h2>

          {/* Description */}
          <p className="text-[#E5E7EB] text-lg leading-relaxed mb-8">
            Beyond academics, our Oxford International Curriculum based on the British Curriculum and GES Curriculum help students thrive in computer skills, STEM, arts, physical education and sports together with well-being, and Global Skills Projects. We believe our Oxford International GES Curriculum develops well-rounded learners prepared for every aspect of life.
          </p>

          {/* Activities */}
          <div className="grid grid-cols-2 gap-4 mb-10">

            {activities.map((item, index) => (

              <div
                key={index}
                className="flex items-center gap-3 bg-white/10 rounded-xl p-4 border border-white/20 shadow-md"
              >

                <div className="text-[#2563eb]">
                  {item.icon}
                </div>

                <span className="text-white font-medium">
                  {item.label}
                </span>

              </div>

            ))}

          </div>

          {/* Button */}
          <Link
            to="/campus-life"
            className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-8 py-3 rounded-lg text-lg transition-all duration-300 shadow-lg"
          >
            Discover Our Activities & Clubs
          </Link>

        </div>

      </div>

    </section>
  )
}