import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  Mail,
  MapPin,
  Moon,
  Phone,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import classroomImage from '../assets/services-classroom.png'
import computingImage from '../assets/services-computing.png'
import cookingImage from '../assets/services-cooking.png'
import cookingTeamImage from '../assets/services-cooking-team.png'

const serviceFilters = ['All services', 'Learning', 'Extended care', 'Enrichment']

const services = [
  {
    id: 'learning-day',
    title: 'The Golden Learning Day',
    category: 'Learning',
    schedule: 'Monday to Friday · 7:00 AM – 3:30 PM',
    summary: 'A full school day built around strong learning, wellbeing and joyful discovery.',
    details: [
      'The Oxford International Curriculum alongside the Ghana Education Service curriculum.',
      'Quality teaching, balanced meals, supervised play and caring support.',
      'A safe, Christ-centred environment with sports, cooking competitions and global-skills projects.',
    ],
    image: classroomImage,
    imageAlt: 'Learners enjoying a lesson together in the classroom',
    icon: BookOpen,
  },
  {
    id: 'pick-up',
    title: 'Golden Pick-Up Time',
    category: 'Extended care',
    schedule: 'Monday to Friday · 3:30 PM – 4:30 PM',
    summary: 'A calm, organised handover so families can collect children with confidence.',
    details: [
      'A dedicated collection window for parents and guardians.',
      'Learners are released only to a parent, guardian or authorised person.',
      'Please let the school know who is authorised to collect your child.',
    ],
    icon: ShieldCheck,
  },
  {
    id: 'after-school',
    title: 'Golden After-School Care',
    category: 'Extended care',
    schedule: 'Monday to Friday · 4:30 PM – 7:00 PM',
    summary: 'When work runs late, children can stay in safe hands in a caring environment.',
    details: [
      'Supervised and guided activities after the regular school day.',
      'A calm space to read, play and enjoy positive time with friends.',
      'Care continues until you arrive for pick-up.',
    ],
    image: computingImage,
    imageAlt: 'Learners practising computer skills at school',
    icon: Clock3,
  },
  {
    id: 'saturday-holiday',
    title: 'Golden Saturday and Holiday Classes',
    category: 'Learning',
    schedule: 'Saturdays and school holidays · 8:00 AM – 12:00 PM',
    summary: 'Focused extra classes to revise, catch up and build confidence for the term ahead.',
    details: [
      'Small, focused sessions that help each learner stay on track.',
      'Core subjects include English, Maths and Science.',
      'Computing sessions support typing skills development.',
    ],
    image: classroomImage,
    imageAlt: 'Children learning together in a bright classroom',
    icon: CalendarDays,
  },
  {
    id: 'summer',
    title: 'Golden Summer Vacation',
    category: 'Enrichment',
    schedule: 'During the long school break',
    summary: 'A lively holiday programme where learning, creativity and fun go hand in hand.',
    details: [
      'Creative and educational activities throughout the break.',
      'A chance to make friends and explore new interests.',
      'Children return to school refreshed, confident and ready to learn.',
    ],
    image: cookingImage,
    imageAlt: 'Learners taking part in a hands-on cooking activity',
    icon: Sun,
  },
  {
    id: 'day-care',
    title: 'Golden Day Care',
    category: 'Extended care',
    schedule: 'Weekdays and weekends',
    summary: 'A warm, nurturing space for babies and young children, with care shaped around their needs.',
    details: [
      'Loving care from our team in a safe, welcoming setting.',
      'Healthy meals, rest time and age-appropriate play.',
      'Flexible weekday and weekend care for families.',
    ],
    image: cookingTeamImage,
    imageAlt: 'School staff and learners sharing a supervised activity',
    icon: Heart,
  },
  {
    id: 'day-night-care',
    title: 'Day and Night Care',
    category: 'Extended care',
    schedule: 'Extended care by arrangement',
    summary: 'For families who need extra flexibility, supervised day and night care is available by arrangement.',
    details: [
      'Discuss your family’s care needs directly with our team.',
      'Care arrangements are agreed in advance with a parent or guardian.',
      'Your child’s safety and wellbeing remain our priority.',
    ],
    icon: Moon,
  },
  {
    id: 'every-child',
    title: 'Support for Every Child',
    category: 'Enrichment',
    schedule: 'Personalised support throughout the school day',
    summary: 'Our doors are open to every child, including children with unique needs.',
    details: [
      'Personalised care, instruction and support for each learner.',
      'We work with families to understand each child’s needs.',
      'A welcoming community where every child is encouraged to participate and grow.',
    ],
    image: classroomImage,
    imageAlt: 'Learners participating together in a classroom',
    icon: Users,
  },
]

export default function OurServices() {
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState('All services')
  const [expandedService, setExpandedService] = useState('learning-day')
  const visibleServices = activeFilter === 'All services'
    ? services
    : services.filter(service => service.category === activeFilter)

  useEffect(() => {
    const serviceId = location.hash.slice(1)
    if (!serviceId) return

    const service = services.find(item => item.id === serviceId)
    if (!service) return

    let scrollFrame
    const updateFrame = window.requestAnimationFrame(() => {
      setActiveFilter('All services')
      setExpandedService(serviceId)
      scrollFrame = window.requestAnimationFrame(() => {
        document.getElementById(serviceId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    })

    return () => {
      window.cancelAnimationFrame(updateFrame)
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
    }
  }, [location.hash])

  return (
    <main>
      <PageHero
        badge="Care, learning and enrichment"
        title="Our Services"
        subtitle="Flexible programmes that help every child feel safe, supported and ready to thrive."
        image={cookingTeamImage}
      />

      <section className="bg-white px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">More than a school day</p>
            <h2 className="mb-5 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              A little more support, whenever your family needs it.
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
              At Golden-Intels International School, we support families beyond the classroom.
              From early morning to evening, on weekdays, weekends and holidays, our flexible
              programmes keep children learning, cared for and safe.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: Clock3, title: 'Extended day', text: 'Care from 7:00 AM to 7:00 PM on school days' },
              { icon: ShieldCheck, title: 'Safe handovers', text: 'Children released to authorised adults' },
              { icon: Sparkles, title: 'Learning beyond class', text: 'Projects, skills and creative activities' },
              { icon: Heart, title: 'Care that includes', text: 'Personalised support for every child' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
                <Icon className="mb-3 text-blue-700" size={24} aria-hidden="true" />
                <h3 className="mb-1 font-bold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Find the right fit</p>
            <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">Explore our services</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Choose a programme to see the schedule and what your child can expect.
              Contact us to discuss availability and arrangements.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter services">
            {serviceFilters.map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter)
                  const firstMatch = filter === 'All services'
                    ? services[0]
                    : services.find(service => service.category === filter)
                  setExpandedService(firstMatch?.id ?? null)
                }}
                aria-pressed={activeFilter === filter}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'border border-blue-200 bg-white text-slate-700 hover:bg-blue-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map(service => {
              const Icon = service.icon
              const isExpanded = expandedService === service.id
              return (
                <article id={service.id} key={service.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      className="h-52 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100">
                      <Icon size={56} className="text-blue-700" aria-hidden="true" />
                    </div>
                  )}
                  <div className="p-5 sm:p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{service.category}</span>
                      <Icon size={20} className="shrink-0 text-blue-700" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-2 flex items-start gap-2 text-sm font-semibold leading-relaxed text-blue-800">
                      <Clock3 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                      {service.schedule}
                    </p>
                    <p className="mt-3 leading-relaxed text-slate-600">{service.summary}</p>
                    {isExpanded && (
                      <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                        {service.details.map(detail => (
                          <li key={detail} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                            <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedService(isExpanded ? null : service.id)}
                      aria-expanded={isExpanded}
                      className="mt-5 inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-900"
                    >
                      {isExpanded ? 'Show less' : 'Explore service'}
                      <ArrowRight size={16} className={isExpanded ? 'rotate-90 transition-transform' : 'transition-transform'} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl bg-blue-800 text-white shadow-xl lg:grid-cols-2">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Get in touch</p>
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">Enrol or join our team</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-blue-100">
              We would love to help you find the right programme for your family, or tell you
              more about joining the Golden-Intels team.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="tel:+233594330816" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50">
                <Phone size={18} aria-hidden="true" /> Call 059 433 0816
              </a>
              <a href="mailto:goldenintelse@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-bold text-white transition hover:bg-white/10">
                <Mail size={18} aria-hidden="true" /> Email our team
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-5 bg-blue-900/50 p-7 sm:p-10 lg:p-12">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 shrink-0 text-blue-200" size={20} aria-hidden="true" />
              <div><h3 className="font-bold">Visit us</h3><p className="mt-1 text-sm leading-relaxed text-blue-100">New Housing Estate, House No. 114, Ho</p></div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 shrink-0 text-blue-200" size={20} aria-hidden="true" />
              <div><h3 className="font-bold">Digital Address</h3><p className="mt-1 text-sm text-blue-100">VH-0011-0157</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Moon className="mt-1 shrink-0 text-blue-200" size={20} aria-hidden="true" />
              <div><h3 className="font-bold">Flexible care</h3><p className="mt-1 text-sm text-blue-100">Ask us about weekend, holiday and extended-care arrangements.</p></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
