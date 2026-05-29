import { BookOpen, Lightbulb, Users, Globe } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import academicsImg from '../assets/academics.jpg'
import programmesImg from '../assets/programmes.jpg'

const approaches = [
  { icon: <BookOpen size={24} />, label: 'Project-Based Learning' },
  { icon: <Lightbulb size={24} />, label: 'Play-Based Learning' },
  { icon: <Users size={24} />, label: 'Place-Based Learning' },
  { icon: <Globe size={24} />, label: 'Inquiry-Based Learning' },
]

export default function Academics() {
  return (
    <div>

      {/* Hero Banner */}
      <PageHero
        badge="Academics"
        title="Academics"
        subtitle="A comprehensive hybrid curriculum designed to inspire excellence and foster lifelong learning."
        image={academicsImg}
      />

      {/* Our Hybrid Curriculum */}
      <section className="py-20 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">

            <span className="inline-block bg-[#8a2be2] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Approach
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0654f9] mb-6">
              Our Hybrid Curriculum
            </h2>

            <div className="text-gray-700 text-lg leading-relaxed space-y-5">

              <p>
                At Golden-Intels, we offer a unique hybrid curriculum that combines the best of international and local education standards. Our approach integrates Oxford International Curriculum (OIC) subjects with Ghana Education Service (GES) subjects for lower and upper primary learners, while Early Years and Reception learners are given pure Oxford and Montessori education, laying a good educational foundation.
              </p>

              <p>
                We emphasize project-based learning, play-based learning, place-based learning and inquiry-based learning, encouraging students to ask questions, explore ideas, and develop solutions.
              </p>

              <p>
                Through personalized attention and differentiated instruction, we ensure each student reaches their full potential and develops the skills needed for success in higher education and beyond.
              </p>

            </div>

            {/* Approaches */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {approaches.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="text-[#22c55e]">{item.icon}</div>
                  <span className="text-[#0654f9] font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right: Photo */}
          <div className="flex-1">
            <img
              src={academicsImg}
              alt="Our Hybrid Curriculum"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
              loading="lazy"
              decoding="async"
            />
          </div>

        </div>
      </section>

      {/* Grade Levels & Curriculum Structure */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">

            <span className="inline-block bg-[#0654f9] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Curriculum Structure
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#8a2be2] mb-4">
              Grade Levels & Curriculum Structure
            </h2>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We serve students from Early Years through Reception to Primary with a balanced blend of international and local curricula.
            </p>

          </div>

          {/* Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* OIC Card */}
            <div className="bg-[#0654f9] text-white rounded-2xl p-10 shadow-xl">

              <span className="inline-block bg-[#ffff00] text-[#0654f9] text-sm font-bold px-4 py-1 rounded-full mb-4">
                International
              </span>

              <h3 className="text-2xl font-bold font-serif mb-3">
                Oxford International Curriculum (OIC)
              </h3>

              <p className="text-blue-100 mb-6">
                Our OIC subjects develop global competencies and critical thinking skills:
              </p>

              <ul className="space-y-3">
                {[
                  'Science',
                  'Mathematics',
                  'English',
                  'Computing',
                  'Geography',
                  'Global Skills Projects',
                  'Wellbeing',
                  'Sustainability',
                ].map((subject, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ffff00]"></div>
                    <span className="text-blue-100">{subject}</span>
                  </li>
                ))}
              </ul>

            </div>

            {/* GES Card */}
            <div className="bg-[#8a2be2] text-white rounded-2xl p-10 shadow-xl">

              <span className="inline-block bg-[#22c55e] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
                Local
              </span>

              <h3 className="text-2xl font-bold font-serif mb-3">
                Ghana Education Service (GES)
              </h3>

              <p className="text-purple-100 mb-6">
                Our GES subjects connect students to their cultural heritage and local context:
              </p>

              <ul className="space-y-3">
                {[
                  'Creative Arts',
                  'History',
                  'Ghanaian Language (Ewe)',
                  'French',
                  'Religious and Moral Education (RME)',
                ].map((subject, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ffff00]"></div>
                    <span className="text-purple-100">{subject}</span>
                  </li>
                ))}
              </ul>

            </div>

          </div>
        </div>
      </section>

      {/* A Growing School */}
      <section className="py-20 bg-gradient-to-br from-[#ecfdf5] to-[#dbeafe]">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">

            <span className="inline-block bg-[#22c55e] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Growth & Development
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0654f9] mb-4">
              A Growing School
            </h2>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Golden-Intels is a dynamic, expanding school committed to continuous growth and excellence.
            </p>

          </div>

          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

            <div className="bg-[#0654f9] text-white rounded-2xl p-10 shadow-xl">
              <h3 className="text-2xl font-bold font-serif mb-3">
                Expanding Every Year
              </h3>

              <p className="text-blue-100 text-lg leading-relaxed">
                Golden-Intels is actively growing and expanding its facilities and programs.
              </p>
            </div>

            <div className="bg-[#8a2be2] text-white rounded-2xl p-10 shadow-xl">
              <h3 className="text-2xl font-bold font-serif mb-3">
                Future Expansion Plans
              </h3>

              <p className="text-purple-100 text-lg leading-relaxed">
                We are planning to introduce enhanced facilities and Lower and Upper Secondary levels.
              </p>
            </div>

          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            <div className="bg-[#22c55e] text-white rounded-2xl p-10 shadow-xl">

              <h3 className="text-2xl font-bold font-serif mb-3">
                Modern Learning Facilities
              </h3>

              <p className="text-green-100 mb-6 text-lg">
                Our school is equipped with innovative learning spaces:
              </p>

              <ul className="space-y-3">
                {[
                  'Computer Lab',
                  'Science Lab',
                  'Library',
                  'Playgrounds to enhance motor skills',
                ].map((facility, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ffff00]"></div>
                    <span className="text-green-100">{facility}</span>
                  </li>
                ))}
              </ul>

            </div>

            <div className="bg-[#0654f9] text-white rounded-2xl p-10 shadow-xl">

              <h3 className="text-2xl font-bold font-serif mb-3">
                Current Offerings
              </h3>

              <p className="text-blue-100 text-lg leading-relaxed">
                Currently serving students from Early Years through Reception to Primary with our hybrid OIC and GES curriculum.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Educational Pathways */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-14">

            <span className="inline-block bg-[#8a2be2] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              Pathways
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0654f9] mb-4">
              Educational Pathways
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-[#22c55e] text-white rounded-2xl p-10 shadow-xl">

              <span className="inline-block bg-[#ffff00] text-[#0654f9] text-sm font-bold px-4 py-1 rounded-full mb-4">
                Local
              </span>

              <h3 className="text-2xl font-bold font-serif mb-6">
                Ghana Education Pathway
              </h3>

            </div>

            <div className="bg-[#8a2be2] text-white rounded-2xl p-10 shadow-xl">

              <span className="inline-block bg-[#0654f9] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
                International
              </span>

              <h3 className="text-2xl font-bold font-serif mb-6">
                International Pathway
              </h3>

            </div>

            <div className="bg-[#0654f9] text-white rounded-2xl p-10 shadow-xl">

              <span className="inline-block bg-[#22c55e] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
                Flexible
              </span>

              <h3 className="text-2xl font-bold font-serif mb-6">
                Flexible Progression
              </h3>

            </div>

          </div>
        </div>
      </section>

      {/* Programme Offerings */}
      <section className="py-20 bg-gradient-to-br from-[#dbeafe] to-[#ecfdf5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Photo */}
          <div className="flex-1">
            <img
              src={programmesImg}
              alt="Programme Offerings"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Right: Text Card */}
          <div className="flex-1 bg-[#0654f9] text-white rounded-2xl p-10 shadow-xl">

            <span className="inline-block bg-[#ffff00] text-[#0654f9] text-sm font-bold px-4 py-1 rounded-full mb-4">
              What We Offer
            </span>

            <h3 className="text-2xl font-bold font-serif mb-6">
              Programme Offerings
            </h3>

            <p className="text-blue-100 text-lg leading-relaxed mb-6">
              Golden-Intels offers Oxford International Curriculum (OIC) and Ghana Education Service (GES) programmes.
            </p>

          </div>

        </div>
      </section>

      {/* Our Learning Approach */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-14">

            <span className="inline-block bg-[#22c55e] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
              How We Teach
            </span>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#8a2be2] mb-4">
              Our Learning Approach
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {[
              {
                number: 1,
                title: 'Inquiry-Based Learning',
                text: 'Students explore concepts through questions and investigations.',
                bg: 'bg-[#0654f9]',
              },
              {
                number: 2,
                title: 'Collaborative Project-Based Learning',
                text: 'Team-based activities foster communication and leadership.',
                bg: 'bg-[#8a2be2]',
              },
              {
                number: 3,
                title: 'Technology Integration',
                text: 'Modern tools enhance learning experiences.',
                bg: 'bg-[#22c55e]',
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`${item.bg} text-white rounded-2xl p-8 shadow-xl`}
              >
                <div className="w-10 h-10 bg-[#ffff00] text-[#0654f9] rounded-full flex items-center justify-center font-bold mb-4">
                  {item.number}
                </div>

                <h4 className="text-xl font-bold mb-3">
                  {item.title}
                </h4>

                <p className="text-white/90 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

    </div>
  )
}