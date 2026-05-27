import { Award, Globe, Users, BookOpen, Shield, Star } from 'lucide-react'

const reasons = [
  {
    icon: <Award size={32} />,
    title: 'Oxford Accredited',
    description: 'Our curriculum meets the highest international standards recognized by Oxford.',
  },
  {
    icon: <Globe size={32} />,
    title: 'Global Perspective',
    description: 'We prepare students to thrive in an interconnected and diverse world.',
  },
  {
    icon: <Users size={32} />,
    title: 'Expert Teachers',
    description: 'Our staff are highly qualified professionals passionate about education.',
  },
  {
    icon: <BookOpen size={32} />,
    title: 'Rich Curriculum',
    description: 'A balanced mix of academics, arts, sports, and character development.',
  },
  {
    icon: <Shield size={32} />,
    title: 'Safe Environment',
    description: 'We provide a secure and nurturing space where every child can flourish.',
  },
  {
    icon: <Star size={32} />,
    title: 'Proven Excellence',
    description: 'A track record of outstanding results and student achievements.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-sky-400 via-cyan-200 to-blue-500">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block bg-yellow-300 text-blue-950 text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-sm">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-blue-950 mb-4">
            Why Choose Golden-Intels
          </h2>
          <p className="text-blue-950/80 text-lg max-w-2xl mx-auto">
            We provide world-class education that prepares students for global success.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="bg-blue-600 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-cyan-200/40">
              <div className="text-yellow-300 mb-4">
                {reason.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{reason.title}</h3>
              <p className="text-cyan-50">{reason.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
