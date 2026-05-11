import Hero from '../components/layout/Hero'
import WhyChooseUs from '../components/layout/WhyChooseUs'
import AcademicExcellence from '../components/layout/AcademicExcellence'
import CampusLife from '../components/layout/CampusLife'
import CallToAction from '../components/layout/CallToAction'

export default function Home() {
  return (
    <div>
      <Hero />
      <WhyChooseUs />
      <AcademicExcellence />
      <CampusLife />
      <CallToAction />
    </div>
  )
}