import { useState } from 'react'
import { Mail, MessageCircle, Phone, MapPin, Whatsapp } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Contact form submitted', formData)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <main className="bg-gradient-to-br from-cyan-50 via-fuchsia-50 to-violet-100 text-slate-900">
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
            Reach out to Golden-Intels
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Contact our admissions and support team
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Bright, responsive support for parents, students, and partners. Call, message, or use the form to reach school administration directly.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-fuchsia-600 p-4 text-white shadow-md">
                  <Phone size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Phone</h2>
                  <p className="mt-3 text-slate-600">Call our school office for quick support and admissions help.</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p><strong>Main:</strong> <a href="tel:+233200000000" className="text-fuchsia-600 hover:text-fuchsia-700">+233 20 000 0000</a></p>
                    <p><strong>Admissions:</strong> <a href="tel:+233240000000" className="text-fuchsia-600 hover:text-fuchsia-700">+233 24 000 0000</a></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-emerald-600 p-4 text-white shadow-md">
                  <Whatsapp size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">WhatsApp</h2>
                  <p className="mt-3 text-slate-600">Reach school staff on WhatsApp for fast, informal support.</p>
                  <p className="mt-4 text-slate-700"><a href="https://wa.me/233240000000" className="text-emerald-700 hover:text-emerald-800">+233 24 000 0000</a></p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-cyan-600 p-4 text-white shadow-md">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Email</h2>
                  <p className="mt-3 text-slate-600">Send documents, questions, or admissions requests to our official inbox.</p>
                  <p className="mt-4 text-slate-700"><a href="mailto:info@goldenintels.com" className="text-cyan-700 hover:text-cyan-800">info@goldenintels.com</a></p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-violet-600 p-4 text-white shadow-md">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Location</h2>
                  <p className="mt-3 text-slate-600">Meet us in person for campus tours, admissions interviews, and school events.</p>
                  <p className="mt-4 text-slate-700">Golden-Intels International School, Accra, Ghana</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[2rem] bg-slate-950/95 p-8 shadow-2xl ring-1 ring-slate-900/10 text-slate-100">
            <div className="flex items-center gap-3 rounded-3xl bg-fuchsia-600/95 p-5 text-white shadow-lg">
              <div className="rounded-2xl bg-white/10 p-3">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-fuchsia-100">Send a direct message</p>
                <h2 className="mt-2 text-2xl font-semibold">Message the admin team</h2>
              </div>
            </div>

            <p className="mt-6 text-slate-300">Fill in your details and a member of our team will respond within one business day.</p>

            <div className="mt-8 grid gap-6">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">Full Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
                  placeholder="Your full name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">Email address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  placeholder="+233 24 000 0000"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">Subject</span>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  placeholder="Reason for your message"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">Message</span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  placeholder="How can we help you today?"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200/20 transition hover:scale-[1.01] hover:shadow-fuchsia-300/30"
              >
                Send message
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
