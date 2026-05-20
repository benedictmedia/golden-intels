import Hero from '../components/layout/Hero'
import WhyChooseUs from '../components/layout/WhyChooseUs'
import AcademicExcellence from '../components/layout/AcademicExcellence'
import CampusLife from '../components/layout/CampusLife'
import CallToAction from '../components/layout/CallToAction'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-cyan-200 via-cyan-50 to-cyan-100">
      <Hero />
      <WhyChooseUs />
      <AcademicExcellence />
      <CampusLife />
      <CallToAction />
    </div>
  )
}
