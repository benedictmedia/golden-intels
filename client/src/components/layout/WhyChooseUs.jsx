import { Award, Globe, Users, BookOpen, Shield, Star } from 'lucide-react'

const reasons = [
  {
    icon: <Award size={32} />,
    title: 'Oxford International Curriculum',
    description: 'Our Oxford International Curriculum, based on British Curriculum, meets the highest international standards recognized by Oxford University Press.',
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
    title: 'Oxford International & Ghana Education Service Curriculum',
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
    <section className="py-20 bg-[#0c7f9c] text-white">

      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-14">

          {/* Badge */}
          <span className="inline-block bg-[#128038] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-md">
            Why Choose Us
          </span>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4">
            Why Choose <span className="text-[#4ade80]">Golden-Intels</span>
          </h2>

          {/* Description */}
          <p className="text-[#E5E7EB] text-lg max-w-2xl mx-auto">
            We provide world-class education that prepares students for global success.
          </p>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/20"
            >

              {/* Icon */}
              <div className="text-[#128038] mb-4">
                {reason.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3">
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-[#E5E7EB] leading-relaxed">
                {reason.description}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  )
}