import { useState } from 'react'
import { Mail, MessageCircle, MessageSquare, Phone, MapPin, CheckCircle, ExternalLink } from 'lucide-react'
import axios from 'axios'
import API_URL from '../api/config'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      await axios.post(`${API_URL}/api/contact`, formData)
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  // ... add success/error UI before the button:
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-slate-900">
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white">
            Reach out to Golden-Intels
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
            Contact our admissions and support team
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Bright, responsive support for parents, students, and partners. Call, message, or use the form to reach school administration directly.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:gap-10 md:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr]">
          
          {/* Contact Info Cards */}
          <div className="space-y-6 md:col-span-2 lg:col-span-1">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-[#2563eb] p-4 text-white shadow-md">
                  <Phone size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Phone</h2>
                  <p className="mt-3 text-slate-600">Call our school office for quick support and admissions help.</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p><strong>Main:</strong> <a href="tel:+233 59 433 0816" className="text-[#2563eb] hover:text-violet-700">+233 59 433 0816</a></p>
                    <p><strong>Admissions:</strong> <a href="tel:+233 59 433 0816" className="text-[#2563eb] hover:text-violet-700">+233 59 433 0816</a></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-green-600 p-4 text-white shadow-md">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">WhatsApp</h2>
                  <p className="mt-3 text-slate-600">Reach school staff on WhatsApp for fast, informal support.</p>
                  <p className="mt-4 text-slate-700"><a href="https://wa.me/233594330816" className="text-green-600 hover:text-green-700">+233 59 433 0816</a></p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-[#2563eb] p-4 text-white shadow-md">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Email</h2>
                  <p className="mt-3 text-slate-600">Send documents, questions, or admissions requests to our official inbox.</p>
                  <p className="mt-4 text-slate-700"><a href="mailto:info@goldenintels.edu.gh" className="text-[#2563eb] hover:text-violet-700">info@goldenintels.edu.gh</a></p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-100">
  <div className="flex items-start gap-4">
    <div className="rounded-3xl bg-green-600 p-4 text-white shadow-md">
      <MapPin size={24} />
    </div>
    <div>
      <h2 className="text-xl font-semibold text-slate-800">Location</h2>
      <p className="mt-3 text-slate-600">Meet us in person for campus tours, admissions interviews, and school events.</p>
      
      <a
        href="https://www.google.com/maps/search/?api=1&query=JF8G+32Q%2C+Ho%2C+Volta+Region%2C+Ghana"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-slate-700 hover:text-[#2563eb] transition-colors group"
      >
        <p>
          Golden-Intels International School<br />
          New Housing, directly opposite the Voltic Depot<br />
          Ho-Volta Region, Ghana
        </p>
        <p className="mt-2 text-sm flex items-center gap-1.5 text-[#2563eb] group-hover:underline">
          Digital Address: JF8G+32Q
          <ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
        </p>
      </a>
    </div>
  </div>
</div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="rounded-[2rem] bg-slate-900 p-6 sm:p-8 shadow-2xl text-white md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[#2563eb] to-violet-600 p-5 shadow-lg">
              <div className="rounded-2xl bg-white/10 p-3">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-blue-100">Send a direct message</p>
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
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
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
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
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
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
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
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
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
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                  placeholder="How can we help you today?"
                />
              </label>

              {success && (
                <div className="flex items-center gap-3 bg-green-900/40 border border-green-500 text-green-300 px-4 py-3 rounded-2xl">
                  <CheckCircle size={18} />
                  <p className="text-sm font-semibold">Message sent! We'll get back to you within 24 hours of working days.</p>
                </div>
              )}
              {error && (
                <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-2xl text-sm">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#2563eb] via-violet-600 to-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>

            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
