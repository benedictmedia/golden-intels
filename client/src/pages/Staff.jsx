import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Mail, Phone } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import API_URL from '../api/config'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState(null)

  useEffect(() => {
    axios.get('${API_URL}/api/staff')
      .then(res => { setStaff(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const leadership = staff.filter(s => s.category === 'leadership')
  const teaching = staff.filter(s => s.category === 'teaching')
  const support = staff.filter(s => s.category === 'support')

  const StaffCard = ({ member }) => (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedStaff(member)}
    >
      <div className="relative">
        {member.photo ? (
          <img src={`${member.photo}`} alt={member.name} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-[#1a3c6e] flex items-center justify-center">
            <span className="text-[#d4a017] text-5xl font-bold">{member.name?.charAt(0)}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full">
            {member.department}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-[#1a3c6e] text-lg mb-1">{member.name}</h3>
        <p className="text-sm text-gray-500 mb-1">{member.role}</p>
        {member.subject && <p className="text-xs text-[#d4a017] font-bold mb-3">{member.subject}</p>}
        <p className="text-sm text-gray-600 line-clamp-2">{member.bio}</p>
      </div>
    </div>
  )

  const SectionTitle = ({ title, subtitle }) => (
    <div className="text-center mb-12">
      <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">{subtitle}</span>
      <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3c6e]">{title}</h2>
    </div>
  )

  return (
    <div>

      {/* Hero Banner */}
      <PageHero badge="Our Team" title="Our Staff" subtitle="Meet the dedicated professionals committed to nurturing excellence and shaping the leaders of tomorrow." />
      {loading ? (
        <div className="text-center text-gray-400 py-20">Loading staff...</div>
      ) : (
        <>
          {/* Leadership */}
          {leadership.length > 0 && (
            <section className="py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4">
                <SectionTitle title="Leadership & Management" subtitle="Our Leaders" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {leadership.map(member => <StaffCard key={member.id} member={member} />)}
                </div>
              </div>
            </section>
          )}

          {/* Teaching Staff */}
          {teaching.length > 0 && (
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <SectionTitle title="Teaching Staff" subtitle="Our Educators" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {teaching.map(member => <StaffCard key={member.id} member={member} />)}
                </div>
              </div>
            </section>
          )}

          {/* Support Staff */}
          {support.length > 0 && (
            <section className="py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4">
                <SectionTitle title="Support Staff" subtitle="Our Support Team" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {support.map(member => <StaffCard key={member.id} member={member} />)}
                </div>
              </div>
            </section>
          )}

          {staff.length === 0 && (
            <div className="text-center text-gray-400 py-20">No staff members added yet.</div>
          )}
        </>
      )}

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif">Staff Profile</h2>
              <button onClick={() => setSelectedStaff(null)} className="hover:text-[#d4a017]"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-[#1a3c6e] shrink-0">
                  {selectedStaff.photo ? (
                    <img src={`${selectedStaff.photo}`} alt={selectedStaff.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1a3c6e] font-bold text-2xl">
                      {selectedStaff.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a3c6e]">{selectedStaff.name}</h3>
                  <p className="text-gray-500">{selectedStaff.role}</p>
                  <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full mt-1">{selectedStaff.department}</span>
                  {selectedStaff.subject && <p className="text-xs text-[#1a3c6e] font-bold mt-1">Teaches: {selectedStaff.subject}</p>}
                </div>
              </div>
              {selectedStaff.bio && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedStaff.bio}</p>
                </div>
              )}
              <div className="space-y-2">
                {selectedStaff.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#d4a017]" />
                    <span className="text-sm text-gray-600">{selectedStaff.email}</span>
                  </div>
                )}
                {selectedStaff.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#d4a017]" />
                    <span className="text-sm text-gray-600">{selectedStaff.phone}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-full bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}