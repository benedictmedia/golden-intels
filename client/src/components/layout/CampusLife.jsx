import { Link } from 'react-router-dom'
import { Code, Music, Dumbbell, Scissors, FlaskConical, Palette } from 'lucide-react'
import campusImg from '../../assets/campus.jpg'

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
    <section className="py-20 bg-[#009dff] text-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

        {/* Left: Photo */}
        <div className="flex-1">
          <img
            src={campusImg}
            alt="Our Activities & Clubs at Golden-Intels"
            className="w-full h-[420px] object-cover rounded-2xl shadow-xl border-4 border-white/70" loading="lazy" decoding="async" />
        </div>

        {/* Right: Text */}
        <div className="flex-1">
          <span className="inline-block bg-[#009dff] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-sm border border-white/70">
            Activities & Clubs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-6">
            Discover Our Activities & Clubs
          </h2>
          <p className="text-white text-lg leading-relaxed mb-8">
            Beyond academics, our students thrive in a rich environment of coding, computer skills, STEM, arts and music, baking, sewing and braiding, physical education and sports, and many more. We believe in developing well-rounded individuals prepared for all aspects of life.
          </p>

          {/* Activities */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {activities.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white font-medium">
                <div className="text-white">{item.icon}</div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link
            to="/campus-life"
            className="inline-block bg-[#009dff] hover:bg-[#008ee6] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-blue-950/20 border border-white/80"
          >
            Discover Our Activities & Clubs
          </Link>
        </div>

      </div>
    </section>
  )
}
