import { Heart, Eye, Target, CheckCircle } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import aboutImg from '../assets/about.jpg'
import oxfordImg from '../assets/oxford.jpg'
import educationalprogramsImg from '../assets/educationalprograms.jpg'

const values = [
  { title: 'C - Character', description: 'We model humility, Godliness, and obedience in word and action.' },
  { title: 'H - Honesty', description: 'We respect authority, self, and others in all we do.' },
  { title: 'R - Respect', description: 'We respect everyone first and pursue wisdom that begins with the fear of the Lord.' },
  { title: 'I - Integrity', description: 'We choose moral uprightness even when no one is watching.' },
  { title: 'S - Sincerity', description: 'We are truthful and genuine in our intentions and actions.' },
  { title: 'T - Teamwork & Service', description: 'We work together to help our environment by serving others locally and globally, using our gifts to impact the world for the greater good.' },
]

const goals = [
  'Provide a safe, inclusive and stimulating learning environment.',
  'Achieve outstanding academic results across all levels.',
  'Develop learners who are confident communicators and critical thinkers.',
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
              How it All Began
            </h2>

            <div className="text-gray-700 text-lg leading-relaxed space-y-5">
              <p>
                Founded as Goldenintels Educare in 2017 as a small care centre, Golden-Intels International School is the first Oxford International Curriculum based school in the Volta Region of Ghana to be accredited by Oxford University Press.
              </p>

              <p>
                Our Oxford International Curriculum, based on British Curriculum develops confident, creative, and globally minded learners through academic excellence and holistic development.
              </p>

              <p>
                At Golden-Intels, we are driven by a deep commitment to humanitarian assistance, providing quality education and compassionate care to unique, brilliant, and vulnerable children. We specialize in welcoming children who have been turned away by formal educational institutions. Our doors are open to the poor and needy, as well as those with unique needs, offering them a nurturing environment where they receive personalized training, academic instruction, and holistic support. Through dedicated care and innovative teaching approaches, we help transform challenges into opportunities for growth and success.
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

{/* Our Educational Programs Section */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

    {/* Left: Text Content */}
    <div className="flex-1">
      <span className="inline-block bg-[#0654f9] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
        Our Educational Programs
      </span>

      <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#8a2be2] mb-6">
        A Complete Learning Pathway
      </h2>

      <p className="text-gray-700 text-lg leading-relaxed mb-6">
        We offer a comprehensive, progressive learning pathway designed to support children from infancy through adolescence:
      </p>

      <div className="space-y-5 text-gray-700 text-lg leading-relaxed">

        <div>
          <h5 className="font-bold text-[#0654f9] mb-1">Early Childhood Education</h5>
          <ul className="ml-4 space-y-1 text-gray-600">
            <li>• Creche (Babies)</li>
            <li>• Pre-Nursery</li>
            <li>• Early Years Foundation Stage: Nursery 1, Nursery 2, Reception (Kindergarten) 1 & 2</li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-[#0654f9] mb-1">Primary Education</h5>
          <p className="ml-4 text-gray-600">
            Grades 1 to 6 – A forward-thinking, futuristic curriculum that builds strong foundational skills while nurturing curiosity and creativity.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-[#0654f9] mb-1">Secondary Education</h5>
          <ul className="ml-4 space-y-1 text-gray-600">
            <li>• Lower Secondary (Grades 7 to 9)</li>
            <li>• Upper Secondary (Grades 10 to 12)</li>
          </ul>
        </div>

      </div>

      <p className="mt-6 text-gray-700 text-lg leading-relaxed">
        <strong>Our programs emphasize academic excellence, character development, and practical life skills.</strong> We continue to thrive as an institution while investing in the growth of every baby and young star entrusted to our care.
      </p>
    </div>

    {/* Right: Photo */}
    <div className="flex-1">
      <img
        src={educationalprogramsImg}
        alt="Our Educational Programs - Children learning in a nurturing environment"
        className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
        loading="lazy"
        decoding="async"
      />
      <p className="text-center text-gray-500 text-sm mt-3">
        A vibrant learning environment where every child thrives
      </p>
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
              Raising Godly, globally minded scholars through international local education that builds academic excellence through critical thinking and Christ-centred character for a life of purpose.
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
               To be a leading Christ-centred international school, raising a generation of Godly and innovative leaders who excel academically, walk in integrity, and impact nations for the greater good of all.
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