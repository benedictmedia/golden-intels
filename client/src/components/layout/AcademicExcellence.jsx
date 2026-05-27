import { Link } from 'react-router-dom'

import { BookOpen, Lightbulb, Brain, Heart } from 'lucide-react'

import schoolImg from '../../assets/school.jpg'

const highlights = [

  { icon: <BookOpen size={24} />, label: 'Rigorous Academics' },

  { icon: <Lightbulb size={24} />, label: 'Innovative Teaching' },

  { icon: <Brain size={24} />, label: 'Critical Thinking' },

  { icon: <Heart size={24} />, label: 'Love of Learning' },

]

export default function AcademicExcellence() {

  return (

    <section className="py-20 bg-[#EEF4FF] text-[#1E293B]">

      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

        {/* Left: Text */}
        <div className="flex-1">

          {/* Badge */}
          <span className="inline-block bg-[#7C3AED] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-md">
            Academic Excellence
          </span>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#2563EB] mb-6 leading-tight">
            A Curriculum Built for the Future
          </h2>

          {/* Description */}
          <p className="text-[#374151] text-lg leading-relaxed mb-8">
            Our comprehensive curriculum combines rigorous academics with innovative teaching methods. From Early Years through Primary education, we foster critical thinking, creativity, innovation and a lifelong love of learning.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-5 mb-10">

            {highlights.map((item, index) => (

              <div
                key={index}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-md border border-[#D6E4FF]"
              >

                <div className="text-[#F4B400]">
                  {item.icon}
                </div>

                <span className="font-semibold text-[#1E293B]">
                  {item.label}
                </span>

              </div>

            ))}

          </div>

          {/* Button */}
          <Link
            to="/academics"
            className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-8 py-3 rounded-lg text-lg transition-all duration-300 shadow-lg"
          >
            Explore Our Programs
          </Link>

        </div>

        {/* Right: Photo */}
        <div className="flex-1">

          <img
            src={schoolImg}
            alt="Golden-Intels International School"
            className="w-full h-[420px] object-cover rounded-2xl shadow-2xl border-4 border-[#D6E4FF]"
            loading="lazy"
            decoding="async"
          />

        </div>

      </div>

    </section>

  )

}