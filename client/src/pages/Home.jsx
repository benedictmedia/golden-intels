import Hero from '../components/layout/Hero'
import WhyChooseUs from '../components/layout/WhyChooseUs'
import AcademicExcellence from '../components/layout/AcademicExcellence'
import CampusLife from '../components/layout/CampusLife'
import CallToAction from '../components/layout/CallToAction'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-200 via-blue-60 to-blue-100">
      <Hero />
      <WhyChooseUs />
      <AcademicExcellence />
      <CampusLife />
      <CallToAction />
    </div>
  )
}
