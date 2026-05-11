import { useState } from 'react'
import { Search, X } from 'lucide-react'
import PageHero from '../components/layout/PageHero'

const programs = [
  {
    category: 'Early Years',
    title: 'Early Years Foundation Stage',
    image: '/src/assets/eyfs.jpg',
    targetAudience: 'Children aged 3-5 years (Nursery & Reception)',
    overview: 'Our Early Years Foundation Stage program provides a nurturing and stimulating environment for our youngest learners, fostering their development across all key areas. We focus on play-based learning to build a strong foundation for future academic success.',
    shortOutcome: 'Children will develop strong communication skills, physical...',
    fullOutcome: 'Children will develop strong communication skills, physical coordination, social-emotional intelligence, early literacy and numeracy, and a foundational understanding of the world around them, preparing them for primary education.',
    curriculumOverview: "The curriculum is based on the UK's Early Years Foundation Stage framework, covering seven areas of learning: Communication and Language, Physical Development, Personal, Social and Emotional Development, Literacy, Mathematics, Understanding the World, and Expressive Arts and Design. Activities are child-led and teacher-supported.",
  },
  {
    category: 'Primary',
    title: 'Lower and Upper Primary Years Programme',
    image: '/src/assets/primary.jpg',
    targetAudience: 'Children aged 5-11 years (Years 1-6)',
    overview: 'The Primary Years Programme at Golden-Intels International School is designed to develop inquiring, knowledgeable, and caring young people who are motivated to succeed. We offer a holistic, inquiry-based approach to learning that encourages critical thinking and global awareness.',
    shortOutcome: 'Students will become independent learners, develop strong academic skills in core subjects...',
    fullOutcome: 'Students will become independent learners, develop strong academic skills in core subjects, cultivate international mindedness, enhance their problem-solving abilities, and grow into responsible global citizens ready for secondary education, while developing their wellbeing.',
    curriculumOverview: 'Our primary curriculum is built upon the Oxford International Primary Curriculum, an internationally-minded, thematic, and creative curriculum. It integrates subjects like Science, History, Geography, Art, Sustainability, Wellbeing, Global Skills Projects and Technology through engaging units of inquiry, alongside dedicated English and Mathematics instruction.',
  },
  {
    category: 'International',
    title: 'International Primary Curriculum',
    image: '/src/assets/ipc.jpg',
    targetAudience: 'Ages 5-11 (Years 1-6)',
    overview: 'The IPC is a comprehensive, thematic, creative curriculum for 5-11 year olds, with a clear process of learning and specific learning goals for every subject.',
    shortOutcome: 'Students will gain deep subject knowledge, develop critical thinking and research skills...',
    fullOutcome: 'Students will gain deep subject knowledge, develop critical thinking and research skills, become globally aware citizens, and cultivate personal attributes like adaptability and resilience.',
    curriculumOverview: 'Integrated subjects including Science, History, Geography, Art, Music, Technology, and Physical Education, all taught through engaging thematic units. Strong emphasis on international mindedness and personal learning goals.',
  },
]

export default function Curriculum() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = programs.filter(program =>
    program.title.toLowerCase().includes(search.toLowerCase()) ||
    program.overview.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>

      {/* Hero Banner */}
      <PageHero badge="Curriculum" title="Our Curriculum" subtitle="Explore our comprehensive academic programs designed to nurture excellence and foster lifelong learning." />

      {/* Search Bar */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 text-lg py-20">
              No programs found. Try a different search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((program, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

                  {/* Image */}
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-48 object-cover"
                  />

                  {/* Content */}
                  <div className="p-8">
                    <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mb-4">
                      {program.category}
                    </span>
                    <h3 className="text-xl font-bold text-[#1a3c6e] mb-3">{program.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-2">{program.overview}</p>

                    <div className="mt-4 mb-2">
                      <span className="text-sm font-bold text-[#1a3c6e]">Target Audience: </span>
                      <span className="text-sm text-gray-600">{program.targetAudience}</span>
                    </div>

                    <div className="mt-2 mb-4">
                      <span className="text-sm font-bold text-[#1a3c6e]">Learning Outcomes: </span>
                      <span className="text-sm text-gray-600">{program.shortOutcome}</span>
                    </div>

                    <button
                      onClick={() => setSelected(program)}
                      className="bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                    >
                      Learn More
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Image */}
            <div className="relative">
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full h-56 object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-[#1a3c6e]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mb-4">
                {selected.category}
              </span>
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-4">{selected.title}</h2>

              <div className="space-y-5 text-gray-600">
                <div>
                  <h4 className="font-bold text-[#1a3c6e] mb-1">Overview</h4>
                  <p className="leading-relaxed">{selected.overview}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#1a3c6e] mb-1">Target Audience</h4>
                  <p>{selected.targetAudience}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#1a3c6e] mb-1">Learning Outcomes</h4>
                  <p className="leading-relaxed">{selected.fullOutcome}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#1a3c6e] mb-1">Curriculum Overview</h4>
                  <p className="leading-relaxed">{selected.curriculumOverview}</p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-8 w-full bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    {/* Why Choose Our Curriculum */}
     <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Advantage
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
              Why Choose Our Curriculum?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our programs are designed with a holistic approach to education.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="bg-[#1a3c6e] text-white rounded-2xl p-8 text-center shadow-md">
              <div className="w-14 h-14 bg-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#1a3c6e] font-bold text-xl">C</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Comprehensive</h4>
              <p className="text-blue-200 leading-relaxed">
                Well-rounded curriculum covering all essential subjects and skills.
              </p>
            </div>

            <div className="bg-[#4a235a] text-white rounded-2xl p-8 text-center shadow-md">
              <div className="w-14 h-14 bg-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#1a3c6e] font-bold text-xl">G</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Goal-Oriented</h4>
              <p className="text-purple-200 leading-relaxed">
                Clear learning outcomes aligned with international standards.
              </p>
            </div>

            <div className="bg-[#0f6e56] text-white rounded-2xl p-8 text-center shadow-md">
              <div className="w-14 h-14 bg-[#d4a017] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#1a3c6e] font-bold text-xl">E</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Excellence-Focused</h4>
              <p className="text-green-200 leading-relaxed">
                Rigorous standards ensuring academic excellence and achievement.
              </p>
            </div>

            <div className="bg-[#d4a017] text-[#1a3c6e] rounded-2xl p-8 text-center shadow-md">
              <div className="w-14 h-14 bg-[#1a3c6e] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#d4a017] font-bold text-xl">S</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Student-Centered</h4>
              <p className="text-[#1a3c6e]/80 leading-relaxed">
                Personalized learning experiences tailored to individual needs.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}