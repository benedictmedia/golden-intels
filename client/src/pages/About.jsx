import { Heart, Eye, Target, CheckCircle } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import aboutImg from '../assets/about.jpg'

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
      <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-6">
              How It All Began
            </h2>
            <div className="text-gray-600 text-lg leading-relaxed space-y-5">
              <p>
                Founded in 2017, Golden-Intels International School emerged from a vision to create an educational institution that combines academic rigor with holistic development. Golden-Intels International School is an Oxford-accredited institution dedicated to developing confident, creative, and globally minded learners. Our Oxford accreditation reflects our commitment to maintaining higher standards of educational excellence.
              </p>
              <p>
                Over the years, we have grown from a small school to a thriving community of learners, educators, and families united by a shared commitment to excellence.
              </p>
              <p>
                Today, we continue to innovate and adapt, ensuring our students receive an education that prepares them not just for university, but for life in an ever-changing global landscape.
              </p>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="flex-1">
            <img
              src="/src/assets/about.jpg"
              alt="Our Story"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
            />
          </div>

        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Mission */}
          <div className="bg-[#1a3c6e] text-white rounded-2xl p-10 shadow-md">
            <div className="text-[#d4a017] mb-4">
              <Target size={40} />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-4">Our Mission</h3>
            <p className="text-blue-200 text-lg leading-relaxed">
              To deliver a high-quality international education that nurtures curiosity, critical thinking, and academic excellence, empowering learners to become confident, ethical, and globally minded individuals prepared for lifelong learning.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-[#1a3c6e] text-white rounded-2xl p-10 shadow-md">
            <div className="text-[#d4a017] mb-4">
              <Eye size={40} />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-4">Our Vision</h3>
            <p className="text-blue-200 text-lg leading-relaxed">
              To nurture confident, responsible individuals who aspire to achieve their full potential.
            </p>
          </div>

        </div>
      </section>

      {/* Core Values */}
     <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e]">
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-[#1a3c6e] text-white rounded-2xl p-8 text-center shadow-md">
                <div className="text-[#d4a017] flex justify-center mb-4">
                  <Heart size={36} />
                </div>
                <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                <p className="text-blue-200 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Goals */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Where We Are Headed
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e]">
              Our Goals
            </h2>
          </div>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-4 bg-[#1a3c6e] text-white rounded-xl p-6 shadow-md">
                <div className="text-[#d4a017] mt-1">
                  <CheckCircle size={24} />
                </div>
                <p className="text-blue-200 text-lg">{goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* Oxford Accreditation */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Accreditation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-6">
              Oxford Accreditation
            </h2>
            <div className="text-gray-600 text-lg leading-relaxed space-y-5">
              <p>
                Our Oxford accreditation is a testament to our unwavering commitment to educational excellence. This prestigious recognition validates our curriculum, teaching standards, and student outcomes against internationally recognized benchmarks.
              </p>
              <p>
                The accreditation process involves rigorous evaluation of our academic programs, faculty qualifications, facilities, and student support services. It ensures that our students receive an education that meets higher global standards.
              </p>
              <p>
                This accreditation opens doors for our graduates, providing them with credentials recognized by universities and employers worldwide.
              </p>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="flex-1">
            <img
              src="/src/assets/oxford.jpg"
              alt="Oxford Accreditation"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
            />
          </div>

        </div>
      </section>

    </div>
  )
}