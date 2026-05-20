import Hero from '../components/layout/Hero'
import WhyChooseUs from '../components/layout/WhyChooseUs'
import AcademicExcellence from '../components/layout/AcademicExcellence'
import CampusLife from '../components/layout/CampusLife'
import CallToAction from '../components/layout/CallToAction'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-[#ffb3ec] via-[#fff0fb] to-[#ffe0f7]">
      <Hero />
      <WhyChooseUs />
      <AcademicExcellence />
      <CampusLife />
      <CallToAction />
    </div>
  )
}
