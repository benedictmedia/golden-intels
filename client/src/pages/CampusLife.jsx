import { useState } from 'react'
import { X } from 'lucide-react'
import PageHero from '../components/layout/PageHero'

const activities = [
  {
    category: 'Academic',
    image: '/src/assets/academic-activities.jpg',
    color: 'bg-[#1a3c6e]',
    textColor: 'text-blue-200',
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
    image: '/src/assets/arts-activities.jpg',
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
    image: '/src/assets/sports-activities.jpg',
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
    image: '/src/assets/community-activities.jpg',
    color: 'bg-[#d4a017]',
    textColor: 'text-[#1a3c6e]/80',
    shortDescription: 'Developing responsible citizens through environmental and sustainability initiatives.',
    fullDescription: 'Our Community Service programs instill in students a deep sense of responsibility towards their environment and community. Environmental Day is a school-wide event where students come together to clean, plant, and care for their surroundings, developing environmental consciousness and a sense of civic duty. Our Sustainability Projects challenge students to think critically about the world around them and develop practical solutions to real environmental issues, preparing them to become responsible global citizens who make a positive impact in their communities and beyond.',
    items: [
      'Environmental Day',
      'Sustainability Projects',
    ],
  },
]

export default function CampusLife() {
  const [selected, setSelected] = useState(null)

  return (
    <div>

      {/* Hero Banner */}
      <PageHero badge="Campus Life" title="Campus Life" subtitle="A vibrant community where students grow, explore, and thrive beyond the classroom." image="/src/assets/campus-life.jpg" />

      {/* Beyond Academics */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Beyond Academics
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-6">
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
              src="/src/assets/campus-life.jpg"
              alt="Campus Life at Golden-Intels"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
            />
          </div>

        </div>
      </section>

      {/* Activities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Activities
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
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
                  className="w-full h-48 object-cover"
                />

                {/* Content */}
                <div className={`${activity.color} p-6 h-full`}>
                  <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {activity.category}
                  </span>
                  <p className={`${activity.textColor} text-sm leading-relaxed mb-4`}>
                    {activity.shortDescription}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {activity.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#d4a017]"></div>
                        <span className={`${activity.textColor} text-sm`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelected(activity)}
                    className="w-full bg-[#d4a017] hover:bg-[#f0c040] text-[#1a3c6e] font-bold py-2 rounded-lg text-sm transition-colors"
                  >
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
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-4">{selected.category} Activities</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{selected.fullDescription}</p>

              <h4 className="font-bold text-[#1a3c6e] mb-3">What We Offer:</h4>
              <ul className="space-y-2 mb-8">
                {selected.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#d4a017]"></div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>

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

    {/* Student Life Highlights */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Highlights
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
              Student Life Highlights
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="bg-[#1a3c6e] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">🎉</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Annual Events</h4>
              <p className="text-blue-200 leading-relaxed">
                Cultural week celebrations, sports days, educational field trips, graduation, and celebrations throughout the year.
              </p>
            </div>

            <div className="bg-[#4a235a] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">🏅</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Student Leadership</h4>
              <p className="text-purple-200 leading-relaxed">
                Opportunities to develop leadership skills through student council and peer mentoring.
              </p>
            </div>

            <div className="bg-[#0f6e56] text-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#d4a017] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1a3c6e] font-bold text-lg">🤝</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Community Service</h4>
              <p className="text-green-200 leading-relaxed">
                Making a difference through volunteer programs and social responsibility initiatives within the school community.
              </p>
            </div>

            <div className="bg-[#d4a017] text-[#1a3c6e] rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-[#1a3c6e] rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">🌍</span>
              </div>
              <h4 className="text-xl font-bold mb-3">International Exchange</h4>
              <p className="text-[#1a3c6e]/80 leading-relaxed">
                Global connections through exchange programs.
              </p>
              <span className="inline-block mt-3 bg-[#1a3c6e] text-[#d4a017] text-xs font-bold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}