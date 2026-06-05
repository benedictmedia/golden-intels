import { Heart, Eye, Target, CheckCircle } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import aboutImg from '../assets/about.jpg'
import oxfordImg from '../assets/oxford.jpg'

const values = [
  { title: 'C - Christ-like Character', description: 'We model godliness, humility, and obedience to God in word and action.' },
  { title: 'H - Honour', description: 'We respect God, authority, self, and others in all we do.' },
  { title: 'R - Reverence for God', description: 'We put God first and pursue wisdom that begins with the fear of the Lord. Prov 9:10' },
  { title: 'I - Integrity', description: 'We choose honesty and moral uprightness even when no one is watching.' },
  { title: 'S - Scholarship', description: 'We pursue academic excellence and critical thinking as an act of worship.' },
  { title: 'T - Teamwork & Service', description: 'We serve others locally and globally, using our gifts to impact the world for Christ.' },
]

const goals = [
  'Provide a safe, inclusive and stimulating learning environment.',
  'Achieve outstanding academic results across all year groups.',
  'Develop students who are confident communicators and critical thinkers.',
  'Foster a culture of innovation, creativity and lifelong learning.',
  'Build strong partnerships between school, families and the community.',
]

export default function About() {
  return (
    <div>

      {/* Hero Banner */}
      <PageHero
        badge="About Golden-Intels"
        title="About Golden-Intels"
        subtitle="Shaping minds, building character, inspiring excellence since 2017."
        image={aboutImg}
      />

      {/* Our Story */}
      <section className="py-20 bg-gradient-to-br from-[#f0f8ff] to-[#dbeafe]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-[#8a2be2] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Story
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0654f9] mb-6">
              How It All Began
            </h2>

            <div className="text-gray-700 text-lg leading-relaxed space-y-5">
              <p>
                Founded as Goldenintels Educare in 2017, Golden-Intels International School is the first British school in the Volta Region of Ghana to be accredited by Oxford University Press.
              </p>

              <p>
                Our British Curriculum develops confident, creative, and globally minded learners through academic excellence and holistic development.
              </p>

              <p>
                From a small care center to a thriving learning community, we continue to provide a British Curriculum education that prepares students for university and life in an ever-changing world.
              </p>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="flex-1">
            <img
              src={aboutImg}
              alt="Our Story"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
              loading="lazy"
              decoding="async"
            />
          </div>

        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Mission */}
          <div className="bg-[#0654f9] text-white rounded-2xl p-10 shadow-xl">
            <div className="text-[#ffff00] mb-4">
              <Target size={40} />
            </div>

            <h3 className="text-2xl font-bold font-serif mb-4">
              Our Mission
            </h3>

            <p className="text-blue-100 text-lg leading-relaxed">
              Raising godly, globally minded scholars through international education that builds academic excellence, critical thinking, and Christ-like character for a life of purpose.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-[#8a2be2] text-white rounded-2xl p-10 shadow-xl">
            <div className="text-[#ffff00] mb-4">
              <Eye size={40} />
            </div>

            <h3 className="text-2xl font-bold font-serif mb-4">
              Our Vision
            </h3>

            <p className="text-purple-100 text-lg leading-relaxed">
               To be a leading Christ-centered international school raising a generation of godly, innovative leaders who excel academically, walk in integrity, and impact nations for God’s glory.
            </p>
          </div>

        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5]">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-14">
            <span className="inline-block bg-[#0654f9] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Core Values
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#8a2be2]">
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white border-t-4 border-[#ffff00] rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition"
              >
                <div className="text-[#0654f9] flex justify-center mb-4">
                  <Heart size={36} />
                </div>

                <h4 className="text-xl font-bold text-[#8a2be2] mb-2">
                  {value.title}
                </h4>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Our Goals */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">

          <div className="text-center mb-14">
            <span className="inline-block bg-[#8a2be2] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Goals
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0654f9] mb-6">
              Our Goals
            </h2>
          </div>

          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-[#f9fafb] border-l-4 border-[#22c55e] rounded-xl p-6 shadow-md"
              >
                <div className="text-[#22c55e] mt-1">
                  <CheckCircle size={24} />
                </div>

                <p className="text-gray-700 text-lg">
                  {goal}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Oxford Accreditation */}
      <section className="py-20 bg-gradient-to-br from-[#dbeafe] to-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">

            <span className="inline-block bg-[#0654f9] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Accreditation
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#8a2be2] mb-6">
              Oxford Accreditation
            </h2>

            <div className="text-gray-700 text-lg leading-relaxed space-y-5">

              <p>
                Golden-Intels International School is proud to be the first school in the Volta Region of Ghana to be accredited by Oxford University Press. This prestigious Oxford accreditation reflects our strong commitment to educational excellence and validates our curriculum, teaching standards, and student outcomes against internationally recognized benchmarks.
              </p>

              <p>
                This accreditation confirms the strength of our curriculum, teaching, learning environment, and student development.
              </p>

              <p>
                It also provides our learners with globally recognized credentials that support future academic and career opportunities.
              </p>

            </div>
          </div>

          {/* Right: Photo */}
          <div className="flex-1">
            <img
              src={oxfordImg}
              alt="Oxford Accreditation"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
              loading="lazy"
              decoding="async"
            />
          </div>

        </div>
      </section>

    </div>
  )
}