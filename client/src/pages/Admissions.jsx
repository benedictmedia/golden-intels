import { useState } from 'react'
import { CheckCircle, Calendar, FileText, Users, Download, Lock } from 'lucide-react'
import { generateAdmissionBooklet } from '../utils/generateAdmissionBooklet'
import axios from 'axios'
import PageHero from '../components/layout/PageHero'
import API_URL from '../api/config'

const steps = [
  { icon: <FileText size={28} />, step: 'Step 1', title: 'Submit Application', description: 'Complete and submit the online application form with required documents' },
  { icon: <Calendar size={28} />, step: 'Step 2', title: 'Schedule Assessment', description: 'Arrange a date for student assessment and family interview' },
  { icon: <Users size={28} />, step: 'Step 3', title: 'Campus Visit', description: 'Tour our facilities and meet with faculty and current students' },
  { icon: <CheckCircle size={28} />, step: 'Step 4', title: 'Enrolment', description: 'Receive admission decision and complete enrolment process' },
]

const requirements = [
  'Completed application form',
  'Birth certificate or passport copy',
  'Previous school records and transcripts',
  'Immunization records',
  'Two passport-sized photographs',
  'Parent/guardian identification',
]

export default function Admissions() {
  const [isVerified, setIsVerified] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [pin, setPin] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [verifiedSerial, setVerifiedSerial] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleTokenLogin = async () => {
    if (!serialNumber || !pin) {
      setLoginError('Please enter both serial number and PIN.')
      return
    }
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await axios.post(`${API_URL}/api/admission-tokens/verify`, { serialNumber, pin })
      setVerifiedSerial(res.data.serialNumber)
      setIsVerified(true)
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid serial number or PIN.')
    } finally {
      setLoginLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '', age: '',
    monthOfBirth: '', placeOfBirth: '', height: '', weight: '', hometown: '',
    motherTongue: '', religion: '', dateOfAdmission: '', gradeLevel: '',
    previousSchool: '', parentName: '', parentOccupation: '', parentEmail: '',
    parentPhone: '', secondaryContactName: '', secondaryContactPhone: '',
    fatherName: '', fatherAddress: '', fatherNationality: '', fatherMaritalStatus: '',
    fatherPhone: '', fatherHouseNumber: '', fatherReligion: '', fatherOccupation: '',
    fatherPlaceOfWork: '', fatherEducation: '', fatherEmail: '', fatherDate: '',
    motherName: '', motherAddress: '', motherNationality: '', motherMaritalStatus: '',
    motherPhone: '', motherHouseNumber: '', motherReligion: '', motherOccupation: '',
    motherPlaceOfWork: '', motherEducation: '', motherEmail: '', motherDate: '',
    livesWith: '', olderChildren: '', youngerChildren: '',
    language1: '', language2: '', language3: '', language4: '',
    medicalConditions: '', allergies: '', specialNeeds: '',
    doctorName: '', doctorPhone: '', hospitalName: '', hospitalPhone: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
    emergencyEmail: '', emergencyAddress: '', emergencyWhatsapp: '',
    admissionDate: '',
  })

  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [nhisFront, setNhisFront] = useState(null)
  const [nhisBack, setNhisBack] = useState(null)
  const [ghanaFront, setGhanaFront] = useState(null)
  const [ghanaBack, setGhanaBack] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [signedBooklet, setSignedBooklet] = useState(null)
  const [consentGiven, setConsentGiven] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.parentEmail || !formData.gradeLevel) {
      alert('Please fill in all required fields.')
      return
    }
    if (!consentGiven || !signedBooklet) {
      alert('Please upload the signed booklet and check the consent box.')
      return
    }
    setSubmitLoading(true)
    try {
      const data = new FormData()
      data.append('serialNumber', verifiedSerial)
      Object.entries(formData).forEach(([key, value]) => data.append(key, value))
      if (photo) data.append('photo', photo)
      if (nhisFront) data.append('nhisFront', nhisFront)
      if (nhisBack) data.append('nhisBack', nhisBack)
      if (ghanaFront) data.append('ghanaFront', ghanaFront)
      if (ghanaBack) data.append('ghanaBack', ghanaBack)
      if (signedBooklet) data.append('signedBooklet', signedBooklet)

      await axios.post(`${API_URL}/api/admissions`, data)

      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to submit application. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8a2be2] text-gray-700 text-sm text-base"
  const labelClass = "block text-sm font-bold text-[#8a2be2] mb-2"
  const sectionClass = "bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6"

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-12 shadow-xl max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-slate-800 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-2">Thank you for applying to Golden-Intels International School.</p>
          <p className="text-gray-600 mb-6">We will review your application and contact you within <strong>1 week</strong> to schedule an assessment.</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-8">
            <p className="text-sm text-[#8a2be2] font-bold">What happens next?</p>
            <p className="text-sm text-gray-600 mt-1">Our admissions team will reach out to you via email or phone to schedule your child's assessment and campus visit.</p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-[#8a2be2] hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div>
        <PageHero badge="Admissions" title="Admissions" subtitle="Begin your journey to excellence. Join our community of learners." />

        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-[#8a2be2] text-white rounded-2xl p-10 shadow-md mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold font-serif">Admission Access</h2>
              </div>
              <p className="text-blue-100 text-lg mb-6">
                To begin admissions, please visit the school or call the school office. Admission conversations are arranged in person or by phone with our school leaders.
              </p>
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <h3 className="text-white font-bold text-lg mb-4">How to get your access credentials</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Once your admission discussion is completed with the school office, you will receive a unique <strong>Serial Number</strong> and <strong>PIN</strong> to access the online admission form.
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-blue-100 text-sm font-bold mb-1">Need help?</p>
                <p className="text-blue-100 text-sm">
                  Contact the school office for assistance with admission access and credential issuance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold font-serif text-slate-800 mb-2">Already Have a Serial Number?</h3>
              <p className="text-gray-500 mb-6">Enter your serial number and PIN to access the admission form.</p>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                  {loginError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#8a2be2] mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={e => setSerialNumber(e.target.value)}
                    placeholder="e.g. GI-2026-12345"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8a2be2] text-gray-700 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#8a2be2] mb-2">PIN</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Enter your 4-digit PIN"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8a2be2] text-gray-700 text-base"
                  />
                </div>
                <button
                  onClick={handleTokenLogin}
                  disabled={loginLoading}
                  className="sm:col-span-2 w-full bg-[#8a2be2] hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loginLoading ? 'Verifying...' : 'Access Admission Form'}
                </button>
              </div>

              <div className="mt-6 bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  <strong className="text-[#8a2be2]">Need help?</strong> Contact the school office for assistance with your serial number and PIN.
                </p>
                <p className="text-sm text-gray-500 mt-1">📞 +233 594 330 816 &nbsp;|&nbsp; ✉️ info@goldenintels.edu.gh</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-[#8a2be2] text-white py-20 text-center">
        <span className="inline-block bg-yellow-400 text-slate-900 text-sm font-bold px-4 py-1 rounded-full mb-4">
          Admissions
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Admissions</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Begin your journey to excellence. Join our community of learners.
        </p>
      </section>

      {/* Admission Process */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#8a2be2] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">Process</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 mb-4">Admission Process</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Our straightforward admission process ensures a smooth experience for families.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#8a2be2] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <span className="text-[#8a2be2] text-sm font-bold">{step.step}</span>
                <h4 className="text-xl font-bold mt-1 mb-3 text-slate-800">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements and Dates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-[#8a2be2] text-white rounded-2xl p-10 shadow-md">
            <h3 className="text-2xl font-bold font-serif mb-6">Admission Requirements</h3>
            <h4 className="text-yellow-300 font-bold mb-4">Required Documents</h4>
            <ul className="space-y-3">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-yellow-300 mt-0.5 shrink-0" />
                  <span className="text-blue-100 text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-600 text-white rounded-2xl p-10 shadow-md">
            <h3 className="text-2xl font-bold font-serif mb-6">Important Dates</h3>
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="text-yellow-300 font-bold mb-1">Application Deadline</h4>
                <p className="text-green-100 text-sm">Rolling admissions — Applications accepted first and second term</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="text-yellow-300 font-bold mb-1">Assessment Period</h4>
                <p className="text-green-100 text-sm">Scheduled within 1 week of application submission</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="text-yellow-300 font-bold mb-1">Enrolment Confirmation</h4>
                <p className="text-green-100 text-sm">Within 1 week of assessment completion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Form */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#8a2be2] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">Apply Now</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 mb-4">Admission Form</h2>
            <p className="text-gray-600">Complete all sections below to begin your admission process.</p>
          </div>

          {/* Learner's Data */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b border-gray-100">Learner's Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Month of Birth</label>
                <select name="monthOfBirth" value={formData.monthOfBirth} onChange={handleChange} className={inputClass}>
                  <option value="">Select month</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Place of Birth</label>
                <input name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hometown</label>
                <input name="hometown" value={formData.hometown} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mother Tongue</label>
                <input name="motherTongue" value={formData.motherTongue} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Religion</label>
                <input name="religion" value={formData.religion} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Admission</label>
                <input type="date" name="dateOfAdmission" value={formData.dateOfAdmission} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Level Applying For <span className="text-red-500">*</span></label>
                <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className={inputClass}>
                  <option value="">Select level</option>
                  {['Creche(Babies)', 'Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Reception 1', 'Reception 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Previous School (if applicable)</label>
                <input name="previousSchool" value={formData.previousSchool} onChange={handleChange} className={inputClass} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Passport-Sized Picture</label>
                <p className="text-xs text-gray-400 mb-2">Recommended: JPG or PNG format, 4x6 cm (passport size)</p>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl bg-blue-100 overflow-hidden border-2 border-[#8a2be2] flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-2">No Photo</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Family Data */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b border-gray-100">Family Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Parent/Guardian Name <span className="text-red-500">*</span></label>
                <input name="parentName" value={formData.parentName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Parent/Guardian Occupation</label>
                <input name="parentOccupation" value={formData.parentOccupation} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                <input name="parentPhone" value={formData.parentPhone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Secondary Contact Name</label>
                <input name="secondaryContactName" value={formData.secondaryContactName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Secondary Contact Phone</label>
                <input name="secondaryContactPhone" value={formData.secondaryContactPhone} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Father Info */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b border-gray-100">Father Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Name', name: 'fatherName' },
                { label: 'Address', name: 'fatherAddress' },
                { label: 'Nationality', name: 'fatherNationality' },
                { label: 'Telephone Number', name: 'fatherPhone' },
                { label: 'House Number', name: 'fatherHouseNumber' },
                { label: 'Religion', name: 'fatherReligion' },
                { label: 'Occupation', name: 'fatherOccupation' },
                { label: 'Place of Work', name: 'fatherPlaceOfWork' },
                { label: 'Level of Education', name: 'fatherEducation' },
                { label: 'Email', name: 'fatherEmail' },
                { label: 'Date', name: 'fatherDate', type: 'date' },
              ].map(field => (
                <div key={field.name}>
                  <label className={labelClass}>{field.label}</label>
                  <input type={field.type || 'text'} name={field.name} value={formData[field.name]} onChange={handleChange} className={inputClass} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Marital Status</label>
                <select name="fatherMaritalStatus" value={formData.fatherMaritalStatus} onChange={handleChange} className={inputClass}>
                  <option value="">Select marital status</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mother Info */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b border-gray-100">Mother Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Name', name: 'motherName' },
                { label: 'Address', name: 'motherAddress' },
                { label: 'Nationality', name: 'motherNationality' },
                { label: 'Telephone Number', name: 'motherPhone' },
                { label: 'House Number', name: 'motherHouseNumber' },
                { label: 'Religion', name: 'motherReligion' },
                { label: 'Occupation', name: 'motherOccupation' },
                { label: 'Place of Work', name: 'motherPlaceOfWork' },
                { label: 'Level of Education', name: 'motherEducation' },
                { label: 'Email', name: 'motherEmail' },
                { label: 'Date', name: 'motherDate', type: 'date' },
              ].map(field => (
                <div key={field.name}>
                  <label className={labelClass}>{field.label}</label>
                  <input type={field.type || 'text'} name={field.name} value={formData[field.name]} onChange={handleChange} className={inputClass} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Marital Status</label>
                <select name="motherMaritalStatus" value={formData.motherMaritalStatus} onChange={handleChange} className={inputClass}>
                  <option value="">Select marital status</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Significant Data */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b border-gray-100">Significant Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Youngster/Learner Lives With</label>
                <select name="livesWith" value={formData.livesWith} onChange={handleChange} className={inputClass}>
                  <option value="">Select who the youngster/learner lives with</option>
                  <option value="Both Parents">Both Parents</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Siblings(s)">Sibling(s)</option>
                  <option value="Grandparent(s)">Grandparent(s)</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Relatives">Relatives</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Number of Older Children Living in Household</label>
                <input type="number" name="olderChildren" value={formData.olderChildren} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Number of Younger Children Living in Household</label>
                <input type="number" name="youngerChildren" value={formData.youngerChildren} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Language 1</label>
                <input name="language1" value={formData.language1} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Language 2</label>
                <input name="language2" value={formData.language2} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Language 3</label>
                <input name="language3" value={formData.language3} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Language 4</label>
                <input name="language4" value={formData.language4} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Medical Conditions</label>
                <input name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Allergies</label>
                <input name="allergies" value={formData.allergies} onChange={handleChange} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Special Needs or Requirements</label>
                <textarea name="specialNeeds" value={formData.specialNeeds} onChange={handleChange} rows={3} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Preferred Doctor Name</label>
                <input name="doctorName" value={formData.doctorName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Doctor Phone</label>
                <input name="doctorPhone" value={formData.doctorPhone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hospital Name</label>
                <input name="hospitalName" value={formData.hospitalName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hospital Phone</label>
                <input name="hospitalPhone" value={formData.hospitalPhone} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b border-gray-100">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Contact Name <span className="text-red-500">*</span></label>
                <input name="emergencyName" value={formData.emergencyName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Relationship <span className="text-red-500">*</span></label>
                <input name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" name="emergencyEmail" value={formData.emergencyEmail} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address/House Number</label>
                <input name="emergencyAddress" value={formData.emergencyAddress} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input name="emergencyWhatsapp" value={formData.emergencyWhatsapp} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Admission</label>
                <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b border-gray-100">Child's National Health Insurance Scheme (NHIS) Card</h3>
            <p className="text-sm text-gray-500 mb-4">Please upload clear images of both the front and back of the NHIS card</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>NHIS Card - Front Side</label>
                <input type="file" accept="image/*" onChange={e => setNhisFront(e.target.files[0])} className="text-sm text-gray-600" />
                {nhisFront && <p className="text-xs text-green-600 mt-1">✓ {nhisFront.name}</p>}
              </div>
              <div>
                <label className={labelClass}>NHIS Card - Back Side</label>
                <input type="file" accept="image/*" onChange={e => setNhisBack(e.target.files[0])} className="text-sm text-gray-600" />
                {nhisBack && <p className="text-xs text-green-600 mt-1">✓ {nhisBack.name}</p>}
              </div>
            </div>

            <h3 className="text-xl font-bold font-serif text-slate-800 mt-8 mb-4 pb-2 border-b border-gray-100">Guardian's Ghana Card (National ID)</h3>
            <p className="text-sm text-gray-500 mb-4">Please upload clear images of both the front and back of the Ghana card</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Ghana Card - Front Side</label>
                <input type="file" accept="image/*" onChange={e => setGhanaFront(e.target.files[0])} className="text-sm text-gray-600" />
                {ghanaFront && <p className="text-xs text-green-600 mt-1">✓ {ghanaFront.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Ghana Card - Back Side</label>
                <input type="file" accept="image/*" onChange={e => setGhanaBack(e.target.files[0])} className="text-sm text-gray-600" />
                {ghanaBack && <p className="text-xs text-green-600 mt-1">✓ {ghanaBack.name}</p>}
              </div>
            </div>
          </div>

          {/* Admission Booklet & Consent */}
          <div className={sectionClass}>
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-2 pb-2 border-b border-gray-100">
              Admission Booklet & Consent
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Please follow these steps before submitting your application:
            </p>

            <div className="bg-blue-50 rounded-xl p-5 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#8a2be2] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-1">Download Admission Booklet</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Click to download our admission document. It contains the school policies, rules and regulations, and a preview of your filled form.
                  </p>
                  <button
                    onClick={() => generateAdmissionBooklet(formData, photo, nhisFront, nhisBack, ghanaFront, ghanaBack)}
                    className="flex items-center gap-2 bg-[#8a2be2] hover:bg-violet-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Download size={16} />
                    Download Admission Booklet (.docx)
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#8a2be2] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Read, Sign and Save</h4>
                  <p className="text-sm text-gray-600">
                    Carefully read all the school policies. Sign the consent section by taking a clear picture of your signature and resizing it into the signature field in the document. Save the signed document as a <strong>PDF file</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-1">Upload Signed Booklet</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload the signed copy of your admission booklet below before submitting.
                  </p>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={e => {
                      const file = e.target.files[0]
                      if (file && file.type !== 'application/pdf') {
                        alert('Please upload your signed admission booklet as a PDF file. Word documents and images are not accepted for this field.')
                        e.target.value = ''
                        setSignedBooklet(null)
                        return
                      }
                      setSignedBooklet(file)
                    }}
                    className="text-sm text-gray-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">Accepted format: PDF only</p>
                  {signedBooklet && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle size={14} />
                      {signedBooklet.name} uploaded successfully
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#8a2be2] rounded-xl p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={e => setConsentGiven(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-white"
                />
                <span className="text-white text-sm leading-relaxed">
                  I have read and understand the School Rules and Regulations, and I agree to uphold these standards and ensure my child complies with all school policies.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!consentGiven || !signedBooklet || submitLoading}
              className="bg-[#8a2be2] hover:bg-violet-700 text-white font-bold px-16 py-4 rounded-xl text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'Submitting Application...' : 'Submit Application'}
            </button>
            {(!consentGiven || !signedBooklet) && (
              <p className="text-sm text-red-500 mt-3">
                Please upload the signed booklet and check the consent box to submit.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
