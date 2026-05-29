import { Heart, Eye, Target, CheckCircle } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import aboutImg from '../assets/about.jpg'
import oxfordImg from '../assets/oxford.jpg'

const values = [
  { title: 'Honesty', description: 'We uphold truth and integrity in everything we do.' },
  { title: 'Responsibility', description: 'We take ownership of our actions and their impact on others.' },
  { title: 'Respect', description: 'We treat every individual with dignity and kindness.' },
  { title: 'Caring', description: 'We show genuine concern for the wellbeing of our community.' },
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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-[#7C3AED] text-[#ffffff] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#ffff00] mb-6">
              How It All Began
            </h2>
            <div className="text-gray-600 text-lg leading-relaxed space-y-5">
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
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl" loading="lazy" decoding="async" />
          </div>

        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Mission */}
          <div className="bg-[#0654f9] text-white rounded-2xl p-10 shadow-md">
            <div className="text-cyan-600 mb-4">
              <Target size={40} />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-4">Our Mission</h3>
            <p className="text-cyan-100 text-lg leading-relaxed">
              To deliver a high-quality international education that nurtures curiosity, critical thinking, and academic excellence, empowering learners to become confident, ethical, and globally minded individuals prepared for lifelong learning.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-[#0654f9] text-white rounded-2xl p-10 shadow-md">
            <div className="text-cyan-600 mb-4">
              <Eye size={40} />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-4">Our Vision</h3>
            <p className="text-cyan-100 text-lg leading-relaxed">
              To nurture confident, responsible individuals who aspire to achieve their full potential.
            </p>
          </div>

        </div>
      </section>

      {/* Core Values */}
     <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#8a2be2] text-cyan-700 text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Core Values
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-[#ffff00] text-white rounded-2xl p-8 text-center shadow-md">
                <div className="text-white flex justify-center mb-4">
                  <Heart size={36} />
                </div>
                <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                <p className="text-white text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Goals */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Goals
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-yellow-600 mb-6">
              Our Goals
            </h2>
          </div>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-4 bg-white text-yellow-600 rounded-xl p-6 shadow-md">
                <div className="text-yellow-600 mt-1">
                  <CheckCircle size={24} />
                </div>
                <p className="text-yellow-100 text-lg">{goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* Oxford Accreditation */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-[#8a2be2] text-yellow-600 text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Accreditation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-yellow-700 mb-6">
              Oxford Accreditation
            </h2>
            <div className="text-gray-600 text-lg leading-relaxed space-y-5">
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
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl" loading="lazy" decoding="async" />
          </div>

        </div>
      </section>

    </div>
  )
}