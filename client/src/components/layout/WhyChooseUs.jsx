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
    <section className="py-20 bg-[#0000FF] text-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block bg-[#0000FF] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-sm border border-white/70">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4">
            Why Choose Golden-Intels
          </h2>
          <p className="text-white text-lg max-w-2xl mx-auto">
            We provide world-class education that prepares students for global success.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="bg-[#0000FF] rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/40">
              <div className="text-white mb-4">
                {reason.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{reason.title}</h3>
              <p className="text-white">{reason.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
