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
     <PageHero badge="Academics" title="Academics" subtitle="A comprehensive hybrid curriculum designed to inspire excellence and foster lifelong learning." image={academicsImg}/>

      {/* Our Hybrid Curriculum */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Text */}
          <div className="flex-1">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Our Approach
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-6">
              Our Hybrid Curriculum
            </h2>
            <div className="text-gray-600 text-lg leading-relaxed space-y-5">
              <p>
                At Golden-Intels, we offer a unique hybrid curriculum that combines the best of international and local education standards. Our approach integrates Oxford International Curriculum (OIC) subjects with Ghana Education Service (GES) subjects for lower and upper primary learners, while Early Years and Reception learners are given pure Oxford and Montessori education, laying a good educational foundation.
              </p>
              <p>
                We emphasize project-based learning, play-based learning, place-based learning and inquiry-based learning, encouraging students to ask questions, explore ideas, and develop solutions. Our approach nurtures intellectual curiosity while building strong foundational knowledge across all disciplines.
              </p>
              <p>
                Through personalized attention and differentiated instruction, we ensure each student reaches their full potential and develops the skills needed for success in higher education and beyond.
              </p>
            </div>

            {/* Approaches */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {approaches.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-[#1a3c6e] font-medium">
                  <div className="text-[#d4a017]">{item.icon}</div>
                  <span>{item.label}</span>
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
            />
          </div>

        </div>
      </section>

    {/* Grade Levels & Curriculum Structure */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Curriculum Structure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
              Grade Levels & Curriculum Structure
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We serve students from Early Years through Reception to Primary with a balanced blend of international and local curricula.
            </p>
          </div>

          {/* Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* OIC Card */}
            <div className="bg-[#1a3c6e] text-white rounded-2xl p-10 shadow-md">
              <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
                International
              </span>
              <h3 className="text-2xl font-bold font-serif mb-3">
                Oxford International Curriculum (OIC)
              </h3>
              <p className="text-blue-200 mb-6">
                Our OIC subjects develop global competencies and critical thinking skills:
              </p>
              <ul className="space-y-3">
                {['Science', 'Mathematics', 'English', 'Computing', 'Geography', 'Global Skills Projects', 'Wellbeing', 'Sustainability'].map((subject, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#d4a017]"></div>
                    <span className="text-blue-100">{subject}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* GES Card */}
            <div className="bg-[#4a235a] text-white rounded-2xl p-10 shadow-md">
              <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
                Local
              </span>
              <h3 className="text-2xl font-bold font-serif mb-3">
                Ghana Education Service (GES)
              </h3>
              <p className="text-purple-200 mb-6">
                Our GES subjects connect students to their cultural heritage and local context:
              </p>
              <ul className="space-y-3">
                {['Creative Arts', 'History', 'Ghanaian Language (Ewe)', 'French', 'Religious and Moral Education (RME)'].map((subject, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#d4a017]"></div>
                    <span className="text-purple-100">{subject}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

   {/* A Growing School */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Growth & Development
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
              A Growing School
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Golden-Intels is a dynamic, expanding school committed to continuous growth and excellence.
            </p>
          </div>

          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

            {/* Expanding Every Year */}
            <div className="bg-[#d4a017] text-[#1a3c6e] rounded-2xl p-10 shadow-md">
              <h3 className="text-2xl font-bold font-serif mb-3">
                Expanding Every Year
              </h3>
              <p className="text-[#1a3c6e]/80 text-lg leading-relaxed">
                Golden-Intels is actively growing and expanding its facilities and programs. We are committed to excellence.
              </p>
            </div>

            {/* Future Expansion Plans */}
            <div className="bg-[#4a235a] text-white rounded-2xl p-10 shadow-md">
              <h3 className="text-2xl font-bold font-serif mb-3">
                Future Expansion Plans
              </h3>
              <p className="text-purple-200 text-lg leading-relaxed">
                As we grow, we are planning to introduce additional enhanced facilities and Lower and Upper Secondary levels for higher students.
              </p>
            </div>

          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Modern Learning Facilities */}
            <div className="bg-[#1a3c6e] text-white rounded-2xl p-10 shadow-md">
              <h3 className="text-2xl font-bold font-serif mb-3">
                Modern Learning Facilities
              </h3>
              <p className="text-blue-200 mb-6 text-lg">
                Our school is equipped with innovative learning spaces:
              </p>
              <ul className="space-y-3">
                {[
                  'Computer Lab',
                  'Science Lab',
                  'Library',
                  'Playgrounds, to enhance motto skills',
                ].map((facility, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#d4a017]"></div>
                    <span className="text-blue-100">{facility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Offerings */}
            <div className="bg-[#d4a017] text-[#1a3c6e] rounded-2xl p-10 shadow-md">
              <h3 className="text-2xl font-bold font-serif mb-3">
                Current Offerings
              </h3>
              <p className="text-[#1a3c6e]/80 text-lg leading-relaxed">
                Currently serving students from Early Years through Reception to Primary with our hybrid OIC and GES curriculum, with plans to expand progressively to Lower and Upper Secondary education.
              </p>
            </div>

          </div>
        </div>
      </section>

    {/* Educational Pathways */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              Pathways
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
              Educational Pathways
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Clear progression routes for students advancing through our school system.
            </p>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Ghana Education Pathway */}
            <div className="bg-[#0f6e56] text-white rounded-2xl p-10 shadow-md">
              <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
                Local
              </span>
              <h3 className="text-2xl font-bold font-serif mb-6">
                Ghana Education Pathway
              </h3>
              <div className="space-y-5">
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-[#f0c040] mb-1">BECE</h4>
                  <p className="text-green-100 text-sm">Basic Education Certificate Examination</p>
                  <p className="text-green-200 text-sm mt-1">Taken at the end of Junior High School (Grade 9)</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-[#f0c040] mb-1">SHS</h4>
                  <p className="text-green-100 text-sm">Senior High School</p>
                  <p className="text-green-200 text-sm mt-1">Three-year program following BECE qualification</p>
                </div>
                <p className="text-green-200 text-sm leading-relaxed">
                  Students following the GES pathway progress through Ghana's national education system.
                </p>
              </div>
            </div>

            {/* International Pathway */}
            <div className="bg-[#4a235a] text-white rounded-2xl p-10 shadow-md">
              <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
                International
              </span>
              <h3 className="text-2xl font-bold font-serif mb-6">
                International Pathway
              </h3>
              <div className="space-y-5">
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-[#f0c040] mb-1">International GCSE</h4>
                  <p className="text-purple-100 text-sm">Comprehensive qualification at Grade 10-11</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-[#f0c040] mb-1">A-Level & OxfordAQA</h4>
                  <p className="text-purple-100 text-sm">Advanced qualifications through Grade 12-13</p>
                </div>
                <p className="text-purple-200 text-sm leading-relaxed">
                  Students can continue to Grade 13 for advanced international qualifications.
                </p>
              </div>
            </div>

            {/* Flexible Progression */}
            <div className="bg-[#1a3c6e] text-white rounded-2xl p-10 shadow-md">
              <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
                Flexible
              </span>
              <h3 className="text-2xl font-bold font-serif mb-6">
                Flexible Progression
              </h3>
              <div className="space-y-5">
                <p className="text-blue-200 text-lg leading-relaxed">
                  Our hybrid curriculum allows students to transition between pathways based on their academic goals and aspirations.
                </p>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-[#f0c040] mb-1">Grade 1 - Grade 9</h4>
                  <p className="text-blue-100 text-sm">Students develop skills and knowledge to pursue either pathway successfully.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

   {/* Programme Offerings */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f8] to-[#e8edf5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Photo */}
          <div className="flex-1">
            <img
              src={programmesImg}
              alt="Programme Offerings"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
            />
          </div>

          {/* Right: Text Card */}
          <div className="flex-1 bg-[#1a3c6e] text-white rounded-2xl p-10 shadow-md">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              What We Offer
            </span>
            <h3 className="text-2xl font-bold font-serif mb-6">
              Programme Offerings
            </h3>
            <p className="text-blue-200 text-lg leading-relaxed mb-6">
              Golden-Intels offers Oxford International Curriculum (OIC) and Ghana Education Service (GES) programmes. Our focus is on providing quality education through our hybrid curriculum that combines international best practices with local educational standards, ensuring students receive a well-rounded education that prepares them for success in Ghana and on the global stage.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-[#f0c040] font-bold text-lg mb-1">OIC</div>
                <div className="text-blue-200 text-sm">Oxford International Curriculum</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-[#f0c040] font-bold text-lg mb-1">GES</div>
                <div className="text-blue-200 text-sm">Ghana Education Service</div>
              </div>
            </div>
          </div>

        </div>
      </section>

    {/* Our Learning Approach */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
              How We Teach
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e] mb-4">
              Our Learning Approach
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-[#1a3c6e] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">1</div>
              <h4 className="text-xl font-bold mb-3">Inquiry-Based Learning</h4>
              <p className="text-blue-200 leading-relaxed">
                Students explore concepts through questions and investigations, developing critical thinking and problem-solving skills.
              </p>
            </div>

            <div className="bg-[#4a235a] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">2</div>
              <h4 className="text-xl font-bold mb-3">Collaborative Project-Based Learning</h4>
              <p className="text-purple-200 leading-relaxed">
                Team-based activities foster communication, leadership, and cooperation while building real-world skills.
              </p>
            </div>

            <div className="bg-[#0f6e56] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">3</div>
              <h4 className="text-xl font-bold mb-3">Technology Integration</h4>
              <p className="text-green-200 leading-relaxed">
                Modern tools and digital resources enhance learning experiences and prepare students for the digital age.
              </p>
            </div>

            <div className="bg-[#0f6e56] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">4</div>
              <h4 className="text-xl font-bold mb-3">Personalized Support</h4>
              <p className="text-green-200 leading-relaxed">
                Individual attention and tailored instruction ensure every student receives the support they need to excel.
              </p>
            </div>

            <div className="bg-[#1a3c6e] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">5</div>
              <h4 className="text-xl font-bold mb-3">Global Perspectives</h4>
              <p className="text-blue-200 leading-relaxed">
                International curriculum and diverse viewpoints prepare students for success in a connected world.
              </p>
            </div>

            <div className="bg-[#4a235a] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">6</div>
              <h4 className="text-xl font-bold mb-3">Play-Based Learning</h4>
              <p className="text-purple-200 leading-relaxed">
                Learners at the Early Years are exposed to concepts through playful activities.
              </p>
            </div>

            <div className="bg-[#4a235a] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">7</div>
              <h4 className="text-xl font-bold mb-3">Place-Based Learning</h4>
              <p className="text-purple-200 leading-relaxed">
                Learners are exposed to knowledge through drawing their attention to their immediate environment.
              </p>
            </div>

            <div className="bg-[#0f6e56] text-white rounded-2xl p-8 shadow-md">
              <div className="w-10 h-10 bg-[#d4a017] rounded-full flex items-center justify-center font-bold text-[#1a3c6e] mb-4">8</div>
              <h4 className="text-xl font-bold mb-3">Assessment for Learning</h4>
              <p className="text-green-200 leading-relaxed">
                Continuous feedback and varied assessment methods guide student progress and inform instruction.
              </p>
            </div>

            {/* Empty card to balance the grid */}
            <div className="bg-[#1a3c6e] text-white rounded-2xl p-8 shadow-md flex items-center justify-center">
              <p className="text-blue-200 text-center text-lg font-serif italic">
                "Education is not the filling of a pail, but the lighting of a fire."
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}