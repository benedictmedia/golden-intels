import { useState } from 'react'
import { Search, X } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import campusLifeImg from '../assets/campus-life.jpg'
import academicActivitiesImg from '../assets/academic-activities.jpg'
import artsActivitiesImg from '../assets/arts-activities.jpg'
import sportsActivitiesImg from '../assets/sports-activities.jpg'
import communityActivitiesImg from '../assets/community-activities.jpg'
import clubDebateImg from '../assets/club-debate.jpg'
import clubScienceImg from '../assets/club-science.jpg'
import clubCodingImg from '../assets/club-coding.jpg'
import clubMusicImg from '../assets/club-music.jpg'
import clubSportsImg from '../assets/club-sports.jpg'
import clubDramaImg from '../assets/club-drama.jpg'
import clubEnvironmentImg from '../assets/club-environment.jpg'

const activities = [
  {
    category: 'Academic',
    image: academicActivitiesImg,
    color: 'bg-blue-600',
    textColor: 'text-cyan-100',
    shortDescription: 'Igniting curiosity and innovation through academic clubs and technology programs.',
    fullDescription: 'Our Academic activities are designed to extend learning beyond the classroom. Students engage in Coding and Robotics, where they develop computational thinking and problem-solving skills by building and programming robots. Our Science and Maths Club encourages students to explore scientific concepts through hands-on experiments and mathematical challenges. The Reading and Spelling "B" Club nurtures a love for literature and language, building strong communication skills. Our STEM program, coming soon, will integrate Science, Technology, Engineering, and Mathematics in exciting and practical ways.',
    items: [
      'Coding and Robotics',
      'STEM — Coming Soon',
      'Science and Maths Club',
      'Reading and Spelling "B" Club',
    ],
  },
  {
    category: 'Arts',
    image: artsActivitiesImg,
    color: 'bg-[#4a235a]',
    textColor: 'text-purple-200',
    shortDescription: 'Nurturing creativity and cultural appreciation through music, drama, and cuisine.',
    fullDescription: 'Our Arts programs celebrate creativity, culture, and self-expression. Each term, students participate in International Cuisine Sessions where they explore and prepare dishes from different cultures around the world, building appreciation for global diversity. Our Student School Choir and Orchestra provides students with the opportunity to develop musical talent, discipline, and teamwork through regular rehearsals and performances. The Drama Society brings stories to life through theatrical productions, helping students build confidence, public speaking skills, and emotional intelligence.',
    items: [
      'International Cuisine Sessions (Termly)',
      'Student School Choir and Orchestra',
      'Drama Society',
    ],
  },
  {
    category: 'Sports',
    image: sportsActivitiesImg,
    color: 'bg-[#0f6e56]',
    textColor: 'text-green-200',
    shortDescription: 'Building healthy bodies, teamwork, and resilience through sport and physical activity.',
    fullDescription: 'At Golden-Intels, we believe a healthy body supports a healthy mind. Our Sports programs are designed to promote physical fitness, teamwork, and a lifelong love of active living. Football is one of our most popular activities, where students learn the values of teamwork, discipline, and sportsmanship through regular training and friendly competitions. Our Physical Fitness program ensures every student maintains an active lifestyle through structured exercise routines, promoting strength, coordination, and overall wellbeing.',
    items: [
      'Football',
      'Physical Fitness',
    ],
  },
  {
    category: 'Community Service',
    image: communityActivitiesImg,
    color: 'bg-blue-500',
    textColor: 'text-cyan-700/80',
    shortDescription: 'Developing responsible citizens through environmental and sustainability initiatives.',
    fullDescription: 'Our Community Service programs instill in students a deep sense of responsibility towards their environment and community. Environmental Day is a school-wide event where students come together to clean, plant, and care for their surroundings, developing environmental consciousness and a sense of civic duty. Our Sustainability Projects challenge students to think critically about the world around them and develop practical solutions to real environmental issues, preparing them to become responsible global citizens who make a positive impact in their communities and beyond.',
    items: [
      'Environmental Day',
      'Sustainability Projects',
    ],
  },
]

const clubs = [
  {
    name: 'Debators Club',
    category: 'Academic',
    image: clubDebateImg,
    color: 'bg-blue-600',
    textColor: 'text-cyan-100',
    tagColor: 'bg-blue-500 text-cyan-700',
    shortDescription: 'Building confident communicators and critical thinkers through the art of debate.',
    fullDescription: 'The Debators Club at Golden-Intels is a dynamic platform where students develop the art of persuasive communication, critical thinking, and logical reasoning. Members engage in structured debates on a wide range of topics — from current affairs to philosophical questions — sharpening their ability to construct well-reasoned arguments and respond confidently under pressure. The club prepares students for public speaking competitions, inter-school debate tournaments, and builds the confidence needed to express ideas clearly and respectfully in any setting.',
    meets: 'Every Tuesday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Science and Maths Club',
    category: 'Academic',
    image: clubScienceImg,
    color: 'bg-[#0f6e56]',
    textColor: 'text-green-200',
    tagColor: 'bg-blue-500 text-cyan-700',
    shortDescription: 'Exploring the wonders of science and mathematics through hands-on experiments.',
    fullDescription: 'The Science and Maths Club is a haven for curious minds who love to explore, experiment, and discover. Students engage in exciting lab experiments, mathematical puzzles, science quizzes, and problem-solving challenges that go beyond the regular curriculum. The club encourages students to think like scientists and mathematicians — asking questions, forming hypotheses, testing ideas, and drawing conclusions. Members regularly participate in science fairs and mathematics competitions, representing Golden-Intels with pride and enthusiasm.',
    meets: 'Every Wednesday after school',
    openTo: 'Years 3 and above',
  },
  {
    name: 'Coding and STEM Club',
    category: 'Technology',
    image: clubCodingImg,
    color: 'bg-[#185fa5]',
    textColor: 'text-blue-100',
    tagColor: 'bg-blue-500 text-cyan-700',
    shortDescription: 'Empowering future innovators through coding, robotics, and technology.',
    fullDescription: 'The Coding and STEM Club is where future innovators, engineers, and tech leaders are born. Students learn programming languages, build robots, design apps, and explore the exciting intersection of Science, Technology, Engineering, and Mathematics. Through project-based learning and creative challenges, members develop computational thinking, problem-solving skills, and a passion for innovation. The club also introduces students to emerging technologies like artificial intelligence and automation, preparing them for the careers of tomorrow.',
    meets: 'Every Thursday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Music and Orchestra Club',
    category: 'Arts',
    image: clubMusicImg,
    color: 'bg-[#4a235a]',
    textColor: 'text-purple-200',
    tagColor: 'bg-blue-500 text-cyan-700',
    shortDescription: 'Celebrating musical talent through choir, orchestra, and performance.',
    fullDescription: 'The Music and Orchestra Club nurtures the musical talents of students across all year groups. Whether a student is a complete beginner or an experienced musician, the club provides a welcoming and inspiring environment to learn, practice, and perform. Members participate in the school choir, learn to play various instruments, and come together as an orchestra to perform at school events, concerts, and community gatherings. The club instills discipline, teamwork, and a deep appreciation for music and the performing arts.',
    meets: 'Every Monday and Friday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Sports Club',
    category: 'Sports',
    image: clubSportsImg,
    color: 'bg-[#0f6e56]',
    textColor: 'text-green-200',
    tagColor: 'bg-blue-500 text-cyan-700',
    shortDescription: 'Building healthy bodies, teamwork, and resilience through sport.',
    fullDescription: 'The Sports Club at Golden-Intels promotes physical fitness, teamwork, and a healthy lifestyle for all students. Members participate in a variety of sporting activities including football, athletics, and physical fitness training. The club teaches students the values of sportsmanship, perseverance, and teamwork while helping them build physical strength, coordination, and confidence. Students have the opportunity to represent the school in inter-school sporting competitions and develop a lifelong love for physical activity and healthy living.',
    meets: 'Every Tuesday and Thursday',
    openTo: 'All year groups',
  },
  {
    name: 'Drama Club',
    category: 'Arts',
    image: clubDramaImg,
    color: 'bg-[#993556]',
    textColor: 'text-cyan-200',
    tagColor: 'bg-blue-500 text-cyan-700',
    shortDescription: 'Bringing stories to life through theatre, performance, and creative expression.',
    fullDescription: 'The Drama Club is a creative space where students discover the joy of storytelling, performance, and theatrical arts. Members explore scriptwriting, acting techniques, stage direction, costume design, and set building, gaining a comprehensive understanding of what it takes to produce a theatrical performance. The club stages termly productions and performances that showcase the incredible talent of our students. Drama builds confidence, emotional intelligence, empathy, and public speaking skills — all of which are invaluable life skills that extend well beyond the stage.',
    meets: 'Every Wednesday and Friday after school',
    openTo: 'All year groups',
  },
  {
    name: 'Environmental and Health Club',
    category: 'Community',
    image: clubEnvironmentImg,
    color: 'bg-[#3B6D11]',
    textColor: 'text-green-100',
    tagColor: 'bg-blue-500 text-cyan-700',
    shortDescription: 'Championing sustainability, health, and environmental responsibility.',
    fullDescription: 'The Environmental and Health Club empowers students to become responsible stewards of the environment and advocates for healthy living. Members engage in sustainability projects, environmental clean-up campaigns, tree planting, recycling initiatives, and health awareness programs. The club organizes the school\'s annual Environmental Day and leads campaigns that raise awareness about climate change, personal hygiene, nutrition, and mental wellness. Students develop a deep sense of responsibility towards their community, their environment, and their own wellbeing.',
    meets: 'Every Friday after school',
    openTo: 'All year groups',
  },
]

const categories = ['All', 'Academic', 'Technology', 'Arts', 'Sports', 'Community']

export default function CampusLife() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedClub, setSelectedClub] = useState(null)

  return (
    <div>

      {/* Hero Banner */}
      <PageHero badge="Activities & Clubs" title="Our Activities & Clubs" subtitle="A vibrant community where students grow, explore, and thrive beyond the classroom." image={campusLifeImg}/>
      {/* Beyond Academics */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-blue-500 text-cyan-700 text-sm font-bold px-4 py-1 rounded-full mb-4">
              Beyond Academics
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-cyan-700 mb-6">
              Life at Golden-Intels
            </h2>
            <div className="text-gray-600 text-lg leading-relaxed space-y-5">
              <p>
                At Golden-Intels, we believe that education extends far beyond the classroom. Our vibrant campus life offers students countless opportunities to discover their passions, develop new skills, and build lasting friendships.
              </p>
              <p>
                From sports and arts to community service and leadership programs, our diverse range of activities ensures every student finds their place and develops into a well-rounded individual.
              </p>
              <p>
                Our supportive community fosters personal growth, encourages exploration, and creates memories that last a lifetime.
              </p>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="flex-1">
            <img
              src={campusLifeImg}
              alt="Campus Life at Golden-Intels"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl" loading="lazy" decoding="async" />
          </div>

        </div>
      </section>

      {/* Activities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-500 text-cyan-700 text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Activities
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-cyan-700 mb-4">
              Something for Everyone
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore the wide range of activities available to our students across all areas of school life.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

                {/* Image */}
                <img
                  src={activity.image}
                  alt={activity.category}
                  className="w-full h-48 object-cover" loading="lazy" decoding="async" />

                {/* Content */}
                <div className={`${activity.color} p-6 h-full`}>
                  <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {activity.category}
                  </span>
                  <p className={`${activity.textColor} text-sm leading-relaxed mb-4`}>
                    {activity.shortDescription}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {activity.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className={`${activity.textColor} text-sm`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelected(activity)}
                    className="w-full bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold py-2 rounded-lg text-sm transition-colors"
                  >
                    Learn More
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs / Student Life (migrated) */}
      <section className="bg-blue-50 py-10">
        <div className="max-w-4xl mx-auto px-4">

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search activities and clubs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-700 text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {['All', 'Academic', 'Technology', 'Arts', 'Sports', 'Community'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-cyan-700 border border-blue-600 hover:bg-blue-600 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clubs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.filter(club => {
              const matchesSearch =
                club.name.toLowerCase().includes(search.toLowerCase()) ||
                club.shortDescription.toLowerCase().includes(search.toLowerCase())
              const matchesCategory = activeCategory === 'All' || club.category === activeCategory
              return matchesSearch && matchesCategory
            }).map((club, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <img src={club.image} alt={club.name} className="w-full h-48 object-cover" loading="lazy" decoding="async" />
                <div className={`${club.color} p-6`}>
                  <span className={`inline-block ${club.tagColor} text-xs font-bold px-3 py-1 rounded-full mb-3`}>
                    {club.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
                  <p className={`${club.textColor} text-sm leading-relaxed mb-4`}>{club.shortDescription}</p>
                  <div className={`${club.textColor} text-xs mb-4 space-y-1`}>
                    <p><span className="text-cyan-600 font-bold">Meets:</span> {club.meets}</p>
                    <p><span className="text-cyan-600 font-bold">Open to:</span> {club.openTo}</p>
                  </div>
                  <button onClick={() => setSelectedClub(club)} className="w-full bg-blue-500 hover:bg-blue-300 text-cyan-700 font-bold py-2 rounded-lg text-sm transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                alt={selected.category}
                className="w-full h-56 object-cover rounded-t-2xl" loading="lazy" decoding="async" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-blue-100 transition-colors"
              >
                <X size={20} className="text-cyan-700" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                {selected.category}
              </span>
              <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-4">{selected.category} Activities</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{selected.fullDescription}</p>

              <h4 className="font-bold text-cyan-700 mb-3">What We Offer:</h4>
              <ul className="space-y-2 mb-8">
                {selected.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelected(null)}
                className="w-full bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Club Modal (for migrated Student Life clubs) */}
      {selectedClub && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Image */}
            <div className="relative">
              <img src={selectedClub.image} alt={selectedClub.name} className="w-full h-56 object-cover rounded-t-2xl" loading="lazy" decoding="async" />
              <button onClick={() => setSelectedClub(null)} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-blue-100 transition-colors">
                <X size={20} className="text-cyan-700" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <span className="inline-block bg-blue-500 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full mb-4">{selectedClub.category}</span>
              <h2 className="text-2xl font-bold font-serif text-cyan-700 mb-4">{selectedClub.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{selectedClub.fullDescription}</p>

              <div className="bg-blue-50 rounded-xl p-4 mb-8 space-y-2">
                <p className="text-gray-700"><span className="font-bold text-cyan-700">Meets: </span>{selectedClub.meets}</p>
                <p className="text-gray-700"><span className="font-bold text-cyan-700">Open to: </span>{selectedClub.openTo}</p>
              </div>

              <button onClick={() => setSelectedClub(null)} className="w-full bg-blue-600 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors">Close</button>
            </div>

          </div>
        </div>
      )}

    {/* Student Life Highlights */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-500 text-cyan-700 text-sm font-bold px-4 py-1 rounded-full mb-4">
              Highlights
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-cyan-700 mb-4">
              Student Life Highlights
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="bg-blue-600 text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-cyan-700 font-bold text-lg">🎉</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Annual Events</h4>
              <p className="text-cyan-100 leading-relaxed">
                Cultural week celebrations, sports days, educational field trips, graduation, and celebrations throughout the year.
              </p>
            </div>

            <div className="bg-[#4a235a] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-cyan-700 font-bold text-lg">🏅</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Student Leadership</h4>
              <p className="text-purple-200 leading-relaxed">
                Opportunities to develop leadership skills through student council and peer mentoring.
              </p>
            </div>

            <div className="bg-[#0f6e56] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-cyan-700 font-bold text-lg">🤝</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Community Service</h4>
              <p className="text-green-200 leading-relaxed">
                Making a difference through volunteer programs and social responsibility initiatives within the school community.
              </p>
            </div>

            <div className="bg-blue-500 text-cyan-700 rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">🌍</span>
              </div>
              <h4 className="text-xl font-bold mb-3">International Exchange</h4>
              <p className="text-cyan-700/80 leading-relaxed">
                Global connections through exchange programs.
              </p>
              <span className="inline-block mt-3 bg-blue-600 text-cyan-600 text-xs font-bold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
