import { useState } from 'react'
import { Search, X } from 'lucide-react'
import PageHero from '../components/layout/PageHero'

const clubs = [
  {
    name: 'Debators Club',
    category: 'Academic',
    image: '/src/assets/club-debate.jpg',
    color: 'bg-[#1a3c6e]',
    textColor: 'text-blue-200',
    tagColor: 'bg-[#d4a017] text-[#1a3c6e]',
    shortDescription: 'Building confident communicators and critical thinkers through the art of debate.',
    fullDescription: 'The Debators Club at Golden-Intels is a dynamic platform where students develop the art of persuasive communication, critical thinking, and logical reasoning. Members engage in structured debates on a wide range of topics — from current affairs to philosophical questions — sharpening their ability to construct well-reasoned arguments and respond confidently under pressure. The club prepares students for public speaking competitions, inter-school debate tournaments, and builds the confidence needed to express ideas clearly and respectfully in any setting.',
    meets: 'Every Tuesday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Science and Maths Club',
    category: 'Academic',
    image: '/src/assets/club-science.jpg',
    color: 'bg-[#0f6e56]',
    textColor: 'text-green-200',
    tagColor: 'bg-[#d4a017] text-[#1a3c6e]',
    shortDescription: 'Exploring the wonders of science and mathematics through hands-on experiments.',
    fullDescription: 'The Science and Maths Club is a haven for curious minds who love to explore, experiment, and discover. Students engage in exciting lab experiments, mathematical puzzles, science quizzes, and problem-solving challenges that go beyond the regular curriculum. The club encourages students to think like scientists and mathematicians — asking questions, forming hypotheses, testing ideas, and drawing conclusions. Members regularly participate in science fairs and mathematics competitions, representing Golden-Intels with pride and enthusiasm.',
    meets: 'Every Wednesday after school',
    openTo: 'Years 3 and above',
  },
  {
    name: 'Coding and STEM Club',
    category: 'Technology',
    image: '/src/assets/club-coding.jpg',
    color: 'bg-[#185fa5]',
    textColor: 'text-blue-100',
    tagColor: 'bg-[#d4a017] text-[#1a3c6e]',
    shortDescription: 'Empowering future innovators through coding, robotics, and technology.',
    fullDescription: 'The Coding and STEM Club is where future innovators, engineers, and tech leaders are born. Students learn programming languages, build robots, design apps, and explore the exciting intersection of Science, Technology, Engineering, and Mathematics. Through project-based learning and creative challenges, members develop computational thinking, problem-solving skills, and a passion for innovation. The club also introduces students to emerging technologies like artificial intelligence and automation, preparing them for the careers of tomorrow.',
    meets: 'Every Thursday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Music and Orchestra Club',
    category: 'Arts',
    image: '/src/assets/club-music.jpg',
    color: 'bg-[#4a235a]',
    textColor: 'text-purple-200',
    tagColor: 'bg-[#d4a017] text-[#1a3c6e]',
    shortDescription: 'Celebrating musical talent through choir, orchestra, and performance.',
    fullDescription: 'The Music and Orchestra Club nurtures the musical talents of students across all year groups. Whether a student is a complete beginner or an experienced musician, the club provides a welcoming and inspiring environment to learn, practice, and perform. Members participate in the school choir, learn to play various instruments, and come together as an orchestra to perform at school events, concerts, and community gatherings. The club instills discipline, teamwork, and a deep appreciation for music and the performing arts.',
    meets: 'Every Monday and Friday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Sports Club',
    category: 'Sports',
    image: '/src/assets/club-sports.jpg',
    color: 'bg-[#0f6e56]',
    textColor: 'text-green-200',
    tagColor: 'bg-[#d4a017] text-[#1a3c6e]',
    shortDescription: 'Building healthy bodies, teamwork, and resilience through sport.',
    fullDescription: 'The Sports Club at Golden-Intels promotes physical fitness, teamwork, and a healthy lifestyle for all students. Members participate in a variety of sporting activities including football, athletics, and physical fitness training. The club teaches students the values of sportsmanship, perseverance, and teamwork while helping them build physical strength, coordination, and confidence. Students have the opportunity to represent the school in inter-school sporting competitions and develop a lifelong love for physical activity and healthy living.',
    meets: 'Every Tuesday and Thursday',
    openTo: 'All year groups',
  },
  {
    name: 'Drama Club',
    category: 'Arts',
    image: '/src/assets/club-drama.jpg',
    color: 'bg-[#993556]',
    textColor: 'text-pink-200',
    tagColor: 'bg-[#d4a017] text-[#1a3c6e]',
    shortDescription: 'Bringing stories to life through theatre, performance, and creative expression.',
    fullDescription: 'The Drama Club is a creative space where students discover the joy of storytelling, performance, and theatrical arts. Members explore scriptwriting, acting techniques, stage direction, costume design, and set building, gaining a comprehensive understanding of what it takes to produce a theatrical performance. The club stages termly productions and performances that showcase the incredible talent of our students. Drama builds confidence, emotional intelligence, empathy, and public speaking skills — all of which are invaluable life skills that extend well beyond the stage.',
    meets: 'Every Wednesday and Friday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Environmental and Health Club',
    category: 'Community',
    image: '/src/assets/club-environment.jpg',
    color: 'bg-[#3B6D11]',
    textColor: 'text-green-100',
    tagColor: 'bg-[#d4a017] text-[#1a3c6e]',
    shortDescription: 'Championing sustainability, health, and environmental responsibility.',
    fullDescription: 'The Environmental and Health Club empowers students to become responsible stewards of the environment and advocates for healthy living. Members engage in sustainability projects, environmental clean-up campaigns, tree planting, recycling initiatives, and health awareness programs. The club organizes the school\'s annual Environmental Day and leads campaigns that raise awareness about climate change, personal hygiene, nutrition, and mental wellness. Students develop a deep sense of responsibility towards their community, their environment, and their own wellbeing.',
    meets: 'Every Friday after school',
    openTo: 'All year groups',
  },
]

const categories = ['All', 'Academic', 'Technology', 'Arts', 'Sports', 'Community']

export default function StudentLife() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = clubs.filter(club => {
    const matchesSearch =
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.shortDescription.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategory === 'All' || club.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div>

      {/* Hero Banner */}
      <PageHero badge="Student Life" title="Student Life" subtitle="Discover the vibrant extracurricular activities and experiences that shape our students' journey." />

      {/* Search and Filter */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1a3c6e] text-white'
                    : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-16 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 text-lg py-20">
              No clubs found. Try a different search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((club, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

                  {/* Image */}
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-48 object-cover"
                  />

                  {/* Content */}
                  <div className={`${club.color} p-6`}>
                    <span className={`inline-block ${club.tagColor} text-xs font-bold px-3 py-1 rounded-full mb-3`}>
                      {club.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
                    <p className={`${club.textColor} text-sm leading-relaxed mb-4`}>
                      {club.shortDescription}
                    </p>
                    <div className={`${club.textColor} text-xs mb-4 space-y-1`}>
                      <p><span className="text-[#d4a017] font-bold">Meets:</span> {club.meets}</p>
                      <p><span className="text-[#d4a017] font-bold">Open to:</span> {club.openTo}</p>
                    </div>
                    <button
                      onClick={() => setSelected(club)}
                      className="w-full bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold py-2 rounded-lg text-sm transition-colors"
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
                alt={selected.name}
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
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-4">{selected.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{selected.fullDescription}</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-8 space-y-2">
                <p className="text-gray-700">
                  <span className="font-bold text-[#1a3c6e]">Meets: </span>{selected.meets}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-[#1a3c6e]">Open to: </span>{selected.openTo}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

   {/* Why Join Our Activities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Why Get Involved
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
              Why Join Our Activities?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Extracurricular activities are essential for holistic development.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

            <div className="bg-[#1a3c6e] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">🤝</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Build Friendships</h4>
              <p className="text-blue-200 leading-relaxed">
                Connect with peers who share your interests and passions.
              </p>
            </div>

            <div className="bg-[#4a235a] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">⭐</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Develop Skills</h4>
              <p className="text-purple-200 leading-relaxed">
                Discover and enhance talents in arts, sports, academics, and more.
              </p>
            </div>

            <div className="bg-[#0f6e56] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">🎉</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Create Memories</h4>
              <p className="text-green-200 leading-relaxed">
                Experience unforgettable moments and celebrate achievements together.
              </p>
            </div>

            <div className="bg-[#d4a017] text-[#1a3c6e] rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#1a3c6e] rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">🏅</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Leadership Growth</h4>
              <p className="text-[#1a3c6e]/80 leading-relaxed">
                Take on leadership roles and develop confidence and responsibility.
              </p>
            </div>

            <div className="bg-[#185fa5] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">🔍</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Explore Interests</h4>
              <p className="text-blue-100 leading-relaxed">
                Try new activities and discover hidden talents and passions.
              </p>
            </div>

            <div className="bg-[#993556] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">💚</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Balance & Wellness</h4>
              <p className="text-pink-200 leading-relaxed">
                Maintain a healthy balance between academics and personal growth.
              </p>
            </div>

          </div>

          {/* Call To Action */}
          <div className="bg-[#1a3c6e] rounded-2xl p-12 text-center shadow-md">
            <h3 className="text-2xl md:text-3xl font-bold font-serif text-white mb-4">
              Ready to Get Involved?
            </h3>
            <p className="text-blue-200 text-lg max-w-xl mx-auto mb-8">
              Explore the activities above and join the ones that excite you. Your student life awaits!
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold px-10 py-3 rounded-lg text-lg transition-colors"
            >
              Explore All Activities
            </button>
          </div>

        </div>
      </section>

    </div>
  )
}