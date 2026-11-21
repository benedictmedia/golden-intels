import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Camera, Download, FileText, Save, Sparkles, Trash2 } from 'lucide-react'
import API_URL from '../api/config'
import { canonicalStudentClassName, displayStudentClassName, isEarlyYearsStudentClass, normalizeStudentClassName } from '../utils/studentClasses'

const LEARNING_AREAS = [
  { key: 'communication', label: 'Communication & Language', tone: 'sky' },
  { key: 'personalSocialEmotional', label: 'Personal, Social & Emotional Development', tone: 'rose' },
  { key: 'physical', label: 'Physical Development', tone: 'emerald' },
  { key: 'literacy', label: 'Literacy', tone: 'indigo' },
  { key: 'mathematics', label: 'Mathematics', tone: 'amber' },
  { key: 'understandingWorld', label: 'Understanding the World', tone: 'violet' },
  { key: 'expressiveArts', label: 'Expressive Arts & Design', tone: 'fuchsia' },
  { key: 'phonics', label: "Floppy's Phonics", tone: 'cyan' }
]

const AREA_TONE_CLASSES = {
  sky: 'border-l-sky-400 bg-gradient-to-br from-sky-50/80 to-white',
  rose: 'border-l-rose-400 bg-gradient-to-br from-rose-50/80 to-white',
  emerald: 'border-l-emerald-400 bg-gradient-to-br from-emerald-50/80 to-white',
  indigo: 'border-l-indigo-400 bg-gradient-to-br from-indigo-50/80 to-white',
  amber: 'border-l-amber-400 bg-gradient-to-br from-amber-50/80 to-white',
  violet: 'border-l-violet-400 bg-gradient-to-br from-violet-50/80 to-white',
  fuchsia: 'border-l-fuchsia-400 bg-gradient-to-br from-fuchsia-50/80 to-white',
  cyan: 'border-l-cyan-400 bg-gradient-to-br from-cyan-50/80 to-white'
}

const AI_AREA_FIELDS = ['teacherComment', 'evidence', 'strengths', 'supportStrategies', 'nextSteps']

const AREA_PDF_COLORS = [
  [14, 116, 144], [190, 24, 93], [4, 120, 87], [67, 56, 202],
  [180, 83, 9], [109, 40, 217], [162, 28, 175], [14, 116, 144]
]

const CHILD_PROFILE_FIELDS = [
  ['preferredName', 'Name I like to be called'],
  ['ageOnEntry', 'Age on entry'],
  ['languagesAtHome', 'Languages spoken at home'],
  ['favoriteBook', 'Favourite story or book'],
  ['favoriteSubject', 'Favourite subject'],
  ['favoriteActivity', 'Favourite activity'],
  ['favoriteFood', 'Favourite food'],
  ['bestFriend', 'My best friend'],
  ['proudOf', 'Something I am proud of'],
  ['aspirations', 'When I grow up']
]

const SUMMARY_FIELDS = [
  ['termHighlights', 'Term highlights'],
  ['overallProgress', 'End-of-term summary'],
  ['homeSupport', 'How families can support learning at home'],
  ['nextTermTargets', 'Targets for next term']
]

const ATTAINMENT_OPTIONS = [
  ['', 'Choose progress level'],
  ['emerging', 'Emerging'],
  ['developing', 'Developing'],
  ['secure', 'Secure'],
  ['exceeding', 'Exceeding']
]

const ENGAGEMENT_OPTIONS = [
  ['', 'Choose engagement'],
  ['enthusiastic', 'Enthusiastic'],
  ['engaged', 'Engaged'],
  ['developing-interest', 'Developing interest'],
  ['needs-encouragement', 'Needs encouragement'],
  ['not-observed', 'Not observed']
]

const EVIDENCE_TYPE_OPTIONS = [
  ['', 'Choose evidence type'],
  ['observation', 'Teacher observation'],
  ['work-sample', 'Work sample'],
  ['photograph', 'Photograph'],
  ['conversation', 'Conversation'],
  ['group-activity', 'Group activity'],
  ['performance', 'Performance']
]

const emptyPortfolioData = () => ({
  childProfile: Object.fromEntries(CHILD_PROFILE_FIELDS.map(([key]) => [key, ''])),
  learningAreas: Object.fromEntries(LEARNING_AREAS.map(({ key }) => [key, {
    attainment: '',
    engagement: '',
    evidenceType: '',
    observationDate: '',
    teacherComment: '',
    evidence: '',
    strengths: '',
    supportStrategies: '',
    nextSteps: '',
    evidenceImages: []
  }])),
  summary: Object.fromEntries(SUMMARY_FIELDS.map(([key]) => [key, '']))
})

const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

const getRequestError = (error, fallback) => error.response?.data?.message ||
  (!error.response ? `${fallback} Check your connection and try again.` : fallback)

const getStudentName = (student) => `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Learner'
const formatOptionLabel = value => value ? value.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : 'Not recorded'

const getPortfolioClassName = (gradeLevel) => {
  const normalized = normalizeStudentClassName(gradeLevel)
  if (normalized === 'kg 1') return 'Reception 1 (KG 1)'
  if (normalized === 'kg 2') return 'Reception 2 (KG 2)'
  return displayStudentClassName(gradeLevel)
}

const downloadPortfolioPdf = async (portfolio) => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const data = portfolio.portfolioData || emptyPortfolioData()
  const student = portfolio.student
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 18

  const addText = (text, options = {}) => {
    const lines = doc.splitTextToSize(String(text || '—'), options.width || pageWidth - 28)
    if (y + lines.length * 5.5 > 275) {
      doc.addPage()
      y = 18
    }
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal')
    doc.setFontSize(options.size || 10)
    doc.setTextColor(...(options.color || [45, 55, 72]))
    doc.text(lines, 14, y)
    y += lines.length * 5.5 + (options.gap ?? 3)
  }

  doc.setFillColor(136, 34, 48)
  doc.rect(0, 0, pageWidth, 34, 'F')
  doc.setFillColor(251, 191, 36)
  doc.rect(0, 31, pageWidth, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('My Learning Journey', 14, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Golden-Intels International School - Early Years Learner Portfolio', 14, 24)
  y = 43

  addText(getStudentName(student), { bold: true, size: 15, color: [136, 34, 48] })
  addText(`Learner ID: ${student?.studentId || '—'}  |  Date of birth: ${student?.dateOfBirth || '—'}`)
  addText(`Class: ${getPortfolioClassName(portfolio.gradeLevel)}  |  Academic year: ${portfolio.academicYear}  |  ${portfolio.term}`, { size: 10 })
  addText(`Submitted by: ${portfolio.submittedBy || 'Teacher'}  |  Status: ${portfolio.status}`, { size: 9, color: [100, 116, 139], gap: 7 })

  addText('All About Me', { bold: true, size: 13, color: [136, 34, 48] })
  CHILD_PROFILE_FIELDS.forEach(([key, label]) => addText(`${label}: ${data.childProfile?.[key] || '—'}`))

  LEARNING_AREAS.forEach((area, index) => {
    const entry = data.learningAreas?.[area.key] || {}
    addText(area.label, { bold: true, size: 12, color: AREA_PDF_COLORS[index], gap: 1 })
    addText(`Progress: ${entry.attainment ? entry.attainment[0].toUpperCase() + entry.attainment.slice(1) : 'Not recorded'}`)
    addText(`Engagement: ${formatOptionLabel(entry.engagement)}  |  Evidence type: ${formatOptionLabel(entry.evidenceType)}`)
    addText(`Observation date: ${entry.observationDate || 'Not recorded'}`)
    addText(`Teacher observation: ${entry.teacherComment || '—'}`)
    addText(`Evidence / learning journey: ${entry.evidence || '—'}`)
    addText(`Strengths and interests: ${entry.strengths || '—'}`)
    addText(`Support strategies used: ${entry.supportStrategies || '—'}`)
    ;(entry.evidenceImages || []).forEach(image => addText(`Work photo: ${image.name} (${image.url})`, { size: 8 }))
    addText(`Next steps: ${entry.nextSteps || '—'}`, { gap: 6 })
  })

  addText('End of Term', { bold: true, size: 13, color: [136, 34, 48] })
  SUMMARY_FIELDS.forEach(([key, label]) => addText(`${label}: ${data.summary?.[key] || '—'}`))
  addText(`Parent / carer reflection: ${portfolio.parentComment || '—'}`)
  doc.save(`learning-portfolio-${String(student?.studentId || portfolio.studentId)}-${portfolio.term.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

function TextField({ label, value, onChange, rows = 2, disabled = false, onAssist, assisting = false, assistDisabled = false }) {
  return (
    <div className="block text-sm font-semibold text-slate-700">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        {onAssist && (
          <button type="button" onClick={onAssist} disabled={disabled || assistDisabled || assisting} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-violet-700 hover:bg-violet-50 disabled:opacity-50">
            <Sparkles size={13} /> {assisting ? 'Drafting…' : 'AI draft'}
          </button>
        )}
      </span>
      <textarea
        rows={rows}
        value={value || ''}
        onChange={event => onChange(event.target.value)}
        aria-label={label}
        disabled={disabled}
        maxLength={4000}
        className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
      />
    </div>
  )
}

function EvidenceImages({ images = [] }) {
  if (!images.length) return null
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((image, index) => (
        <a key={`${image.url}-${index}`} href={image.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img src={image.url} alt={image.name || 'Learner work evidence'} loading="lazy" className="h-32 w-full object-cover transition group-hover:scale-105" />
          <span className="block truncate px-2 py-1.5 text-xs text-slate-600">{image.name || 'Learner work'}</span>
        </a>
      ))}
    </div>
  )
}
export default function EarlyYearsPortfolio({
  role,
  students = [],
  assignedClasses = [],
  academicYear = '2026/2027',
  term = 'Term 1',
  userEmail = '',
  canEdit = true,
  canApprove = true,
  canDelete = true
}) {
  const earlyYearsClasses = useMemo(() => Array.from(new Set(
    assignedClasses.filter(isEarlyYearsStudentClass).map(canonicalStudentClassName)
  )), [assignedClasses])
  const [portfolios, setPortfolios] = useState([])
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null)
  const [form, setForm] = useState(emptyPortfolioData)
  const [selectedClass, setSelectedClass] = useState(earlyYearsClasses[0] || '')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedYear, setSelectedYear] = useState(academicYear)
  const [selectedTerm, setSelectedTerm] = useState(term)
  const [parentComment, setParentComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiBusyField, setAiBusyField] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const portfolioContextRef = useRef('')

  const selectedPortfolio = portfolios.find(portfolio => portfolio.id === selectedPortfolioId) || null
  const classStudents = students.filter(student => normalizeStudentClassName(student.gradeLevel) === normalizeStudentClassName(selectedClass))
  const resolvedSelectedStudentId = selectedStudentId || String(classStudents[0]?.id || '')
  const portfolioContextKey = selectedPortfolioId
    ? `portfolio:${selectedPortfolioId}`
    : `draft:${resolvedSelectedStudentId}:${selectedYear}:${selectedTerm}`
  const selectedStudent = classStudents.find(student => String(student.id) === resolvedSelectedStudentId)
  const existingForSelection = portfolios.find(portfolio => (
    String(portfolio.studentId) === resolvedSelectedStudentId &&
    portfolio.academicYear === selectedYear &&
    portfolio.term === selectedTerm
  ))
  const editingEnabled = role === 'teacher'
    ? !selectedPortfolio || (selectedPortfolio.status !== 'approved' && selectedPortfolio.submittedByEmail === userEmail)
    : role === 'admin' && canEdit && Boolean(selectedPortfolio)

  useEffect(() => {
    portfolioContextRef.current = portfolioContextKey
  }, [portfolioContextKey])

  useEffect(() => {
    let active = true
    axios.get(`${API_URL}/api/portfolios`, { headers: getAuthHeaders() })
      .then(response => {
        if (!active) return
        setPortfolios(response.data || [])
        setLoading(false)
      })
      .catch(requestError => {
        if (!active) return
        setError(getRequestError(requestError, 'Unable to load portfolios.'))
        setLoading(false)
      })
    return () => { active = false }
  }, [role, refreshKey])

  const startNewPortfolio = () => {
    setSelectedPortfolioId(null)
    setForm(emptyPortfolioData())
    setParentComment('')
    setMessage('')
    setError('')
  }

  const selectPortfolio = (portfolio) => {
    setSelectedPortfolioId(portfolio.id)
    setForm({ ...emptyPortfolioData(), ...(portfolio.portfolioData || {}) })
    setParentComment(portfolio.parentComment || '')
    setSelectedClass(canonicalStudentClassName(portfolio.gradeLevel))
    setSelectedStudentId(String(portfolio.studentId))
    setSelectedYear(portfolio.academicYear)
    setSelectedTerm(portfolio.term)
    setMessage('')
    setError('')
  }

  const updateFormField = (section, field, value) => {
    setForm(previous => ({
      ...previous,
      [section]: { ...previous[section], [field]: value }
    }))
  }

  const updateLearningArea = (areaKey, field, value) => {
    setForm(previous => ({
      ...previous,
      learningAreas: {
        ...previous.learningAreas,
        [areaKey]: { ...previous.learningAreas[areaKey], [field]: value }
      }
    }))
  }

  const requestAiDraft = async (section, areaKey, field) => {
    const requestContext = portfolioContextRef.current
    const sourceNotes = section === 'learningArea'
      ? Object.entries(form.learningAreas?.[areaKey] || {})
        .filter(([key, value]) => AI_AREA_FIELDS.includes(key) && value)
        .map(([, value]) => value)
        .join('\n')
      : Object.entries(form.summary || {})
        .filter(([, value]) => value)
        .map(([, value]) => value)
        .join('\n')
    if (sourceNotes.trim().length < 3) {
      setError('Add brief, non-identifying classroom notes before asking AI to draft this field.')
      return
    }

    const busyKey = `${section}:${areaKey || ''}:${field}`
    setAiBusyField(busyKey)
    setError('')
    setMessage('')
    try {
      const response = await axios.post(`${API_URL}/api/portfolios/assist`, {
        section,
        areaKey,
        field,
        notes: sourceNotes,
        attainment: areaKey ? form.learningAreas?.[areaKey]?.attainment : undefined,
        gradeLevel: selectedPortfolio?.gradeLevel || selectedClass
      }, { headers: getAuthHeaders() })
      if (portfolioContextRef.current !== requestContext) return
      if (section === 'learningArea') updateLearningArea(areaKey, field, response.data.suggestion)
      else updateFormField('summary', field, response.data.suggestion)
      setMessage('AI draft added. Review it for accuracy and edit before saving.')
    } catch (requestError) {
      setError(getRequestError(requestError, 'AI writing help is unavailable.'))
    } finally {
      setAiBusyField('')
    }
  }

  const requestMissingFieldDrafts = async () => {
    const requestContext = portfolioContextRef.current
    const aiPortfolioData = {
      learningAreas: Object.fromEntries(LEARNING_AREAS.map(({ key }) => {
        const entry = form.learningAreas?.[key] || {}
        return [key, {
          attainment: entry.attainment,
          engagement: entry.engagement,
          evidenceType: entry.evidenceType,
          ...Object.fromEntries(AI_AREA_FIELDS.map(field => [field, entry[field] || '']))
        }]
      })),
      summary: form.summary
    }
    const areaNotesLength = Object.values(aiPortfolioData.learningAreas).reduce((total, entry) => (
      total + AI_AREA_FIELDS.filter(field => entry[field])
        .map(field => `${field}: ${entry[field]}`)
        .join('\n').length
    ), 0)
    const summaryNotesLength = Object.entries(aiPortfolioData.summary).filter(([, value]) => value)
      .map(([field, value]) => `${field}: ${value}`)
      .join('\n').length
    if (areaNotesLength + summaryNotesLength > 12000) {
      setError('Shorten the portfolio notes to 12,000 characters or fewer before drafting.')
      return
    }
    setAiBusyField('complete')
    setError('')
    setMessage('')
    try {
      const response = await axios.post(`${API_URL}/api/portfolios/assist/complete`, {
        portfolioData: aiPortfolioData,
        gradeLevel: selectedPortfolio?.gradeLevel || selectedClass
      }, { headers: getAuthHeaders() })
      if (portfolioContextRef.current !== requestContext) return

      const suggestions = response.data.suggestions || []
      setForm(previous => {
        let next = previous
        suggestions.forEach(({ section, areaKey, field, suggestion }) => {
          if (section === 'learningArea') {
            const entry = next.learningAreas?.[areaKey]
            if (!entry || entry[field]?.trim()) return
            next = {
              ...next,
              learningAreas: {
                ...next.learningAreas,
                [areaKey]: { ...entry, [field]: suggestion }
              }
            }
          } else if (section === 'summary' && !next.summary?.[field]?.trim()) {
            next = { ...next, summary: { ...next.summary, [field]: suggestion } }
          }
        })
        return next
      })
      const remaining = response.data.remainingCount
      setMessage(`AI drafted ${response.data.draftedCount} missing field${response.data.draftedCount === 1 ? '' : 's'}${remaining ? `; ${remaining} need more evidence` : ''}. Review and edit every draft before saving.`)
    } catch (requestError) {
      setError(getRequestError(requestError, 'AI writing help is unavailable.'))
    } finally {
      setAiBusyField('')
    }
  }

  const uploadEvidence = async (areaKey, file) => {
    if (!selectedPortfolio || !file) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = new FormData()
      payload.append('image', file)
      const response = await axios.post(
        `${API_URL}/api/portfolios/${selectedPortfolio.id}/evidence/${areaKey}`,
        payload,
        { headers: getAuthHeaders() }
      )
      const saved = response.data
      setPortfolios(previous => previous.map(item => item.id === saved.id ? saved : item))
      setForm({ ...emptyPortfolioData(), ...(saved.portfolioData || {}) })
      setMessage('Learner work image added to the portfolio.')
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not upload the learner work image.'))
    } finally {
      setSaving(false)
    }
  }

  const savePortfolio = async () => {
    if (role === 'teacher' && !selectedPortfolio && (!selectedStudent || !selectedYear || !selectedTerm)) {
      setError('Choose an assigned early-years class, learner, academic year, and term.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const request = selectedPortfolio
        ? axios.put(`${API_URL}/api/portfolios/${selectedPortfolio.id}`, { portfolioData: form }, { headers: getAuthHeaders() })
        : axios.post(`${API_URL}/api/portfolios`, {
          studentId: resolvedSelectedStudentId,
          academicYear: selectedYear,
          term: selectedTerm,
          portfolioData: form
        }, { headers: getAuthHeaders() })
      const response = await request
      const saved = response.data
      setPortfolios(previous => {
        const index = previous.findIndex(item => item.id === saved.id)
        return index === -1 ? [saved, ...previous] : previous.map(item => item.id === saved.id ? saved : item)
      })
      setSelectedPortfolioId(saved.id)
      setMessage('Portfolio submitted for administrator review.')
      setRefreshKey(value => value + 1)
    } catch (requestError) {
      setError(getRequestError(requestError, 'Unable to save this portfolio.'))
    } finally {
      setSaving(false)
    }
  }

  const reviewPortfolio = async (status) => {
    if (!selectedPortfolio) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.put(`${API_URL}/api/portfolios/${selectedPortfolio.id}`, { status }, { headers: getAuthHeaders() })
      setPortfolios(previous => previous.map(item => item.id === response.data.id ? response.data : item))
      setMessage(status === 'approved' ? 'Portfolio approved and released to the learner’s parent.' : 'Portfolio sent back to the teacher for changes.')
    } catch (requestError) {
      setError(getRequestError(requestError, 'Unable to update portfolio status.'))
    } finally {
      setSaving(false)
    }
  }

  const deletePortfolio = async () => {
    if (!selectedPortfolio || !window.confirm(`Delete ${getStudentName(selectedPortfolio.student)}’s portfolio for ${selectedPortfolio.term}?`)) return
    setSaving(true)
    setError('')
    try {
      await axios.delete(`${API_URL}/api/portfolios/${selectedPortfolio.id}`, { headers: getAuthHeaders() })
      setPortfolios(previous => previous.filter(item => item.id !== selectedPortfolio.id))
      setSelectedPortfolioId(null)
      setMessage('Portfolio deleted.')
    } catch (requestError) {
      setError(getRequestError(requestError, 'Unable to delete this portfolio.'))
    } finally {
      setSaving(false)
    }
  }

  const saveParentComment = async () => {
    if (!selectedPortfolio) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.put(
        `${API_URL}/api/portfolios/${selectedPortfolio.id}/parent-comment`,
        { parentComment },
        { headers: getAuthHeaders() }
      )
      setPortfolios(previous => previous.map(item => item.id === response.data.id ? { ...item, parentComment: response.data.parentComment } : item))
      setMessage('Your reflection has been saved.')
    } catch (requestError) {
      setError(getRequestError(requestError, 'Unable to save your reflection.'))
    } finally {
      setSaving(false)
    }
  }

  const visiblePortfolios = role === 'teacher'
    ? portfolios.filter(portfolio => earlyYearsClasses.some(className => normalizeStudentClassName(className) === normalizeStudentClassName(portfolio.gradeLevel)))
    : portfolios

  return (
    <section className="space-y-5">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-rose-950 via-rose-800 to-amber-500 p-6 text-white shadow-xl sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[34px] border-amber-300/25" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-12 h-56 w-56 rounded-full bg-sky-300/20" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-200">Golden-Intels International School · Early Years</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">My Learning Journey</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-50 sm:text-base">
              A child-centred record of strengths, meaningful observations, learning evidence and the next steps we take together.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/15 px-3 py-1.5">8 areas of learning</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">Child voice & family partnership</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">Evidence-led progress</span>
            </div>
          </div>
          {role === 'teacher' && earlyYearsClasses.length > 0 && (
            <button type="button" onClick={startNewPortfolio} className="rounded-xl bg-amber-300 px-4 py-3 text-sm font-extrabold text-rose-950 shadow-md transition hover:bg-amber-200">
              Start a portfolio
            </button>
          )}
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

      {role === 'teacher' && earlyYearsClasses.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          You do not have an early-years class assigned. Portfolio entry is available to teachers assigned to Pre-Nursery, Nursery 1, Nursery 2, Reception 1 (KG 1), or Reception 2 (KG 2).
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)]">
        <aside className="space-y-3">
          <h3 className="font-bold text-slate-800">{role === 'parent' ? 'Released portfolios' : 'Learner portfolios'}</h3>
          {loading ? (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-500">Loading portfolios…</div>
          ) : visiblePortfolios.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm text-slate-500">
              {role === 'parent'
                ? 'No approved early-years portfolios are available for your children yet.'
                : 'No portfolios have been submitted for these classes yet.'}
            </div>
          ) : visiblePortfolios.map(portfolio => (
            <button
              type="button"
              key={portfolio.id}
              onClick={() => selectPortfolio(portfolio)}
              className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-300 ${selectedPortfolioId === portfolio.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100'}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block font-bold text-slate-800">{getStudentName(portfolio.student)}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {getPortfolioClassName(portfolio.gradeLevel)} · {portfolio.academicYear} · {portfolio.term}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  portfolio.status === 'approved' ? 'bg-green-100 text-green-700' :
                    portfolio.status === 'rejected' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                }`}>{portfolio.status}</span>
              </span>
            </button>
          ))}
        </aside>

        <div key={selectedPortfolioId || 'portfolio-draft'} className="portfolio-page-turn min-w-0 space-y-5">
          {role === 'teacher' && earlyYearsClasses.length > 0 && !selectedPortfolio && (
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                Class
                <select
                  value={selectedClass}
                  onChange={event => {
                    const nextClass = event.target.value
                    const firstStudent = students.find(student => normalizeStudentClassName(student.gradeLevel) === normalizeStudentClassName(nextClass))
                    setSelectedClass(nextClass)
                    setSelectedStudentId(String(firstStudent?.id || ''))
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"
                >
                  {earlyYearsClasses.map(className => <option key={className} value={className}>{getPortfolioClassName(className)}</option>)}
                </select>
              </label>
              <label className="text-sm font-bold text-slate-700">
                Learner
                <select
                  value={resolvedSelectedStudentId}
                  onChange={event => setSelectedStudentId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"
                >
                  <option value="">Select a learner</option>
                  {classStudents.map(student => <option key={student.id} value={student.id}>{getStudentName(student)}</option>)}
                </select>
              </label>
              <label className="text-sm font-bold text-slate-700">
                Academic year
                <input value={selectedYear} onChange={event => setSelectedYear(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Term
                <select value={selectedTerm} onChange={event => setSelectedTerm(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal">
                  {['Term 1', 'Term 2', 'Term 3'].map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              {existingForSelection && (
                <p className="sm:col-span-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  A portfolio already exists for this learner and term. Open it from the list to continue editing.
                </p>
              )}
            </div>
          )}

          {!selectedPortfolio && role !== 'teacher' && (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
              <FileText className="mx-auto mb-2 text-blue-500" />
              Select a portfolio to view its learning journey.
            </div>
          )}

          {selectedPortfolio && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-600 p-5 text-white shadow-md">
              <div>
                <h3 className="text-lg font-bold">{getStudentName(selectedPortfolio.student)}</h3>
                <p className="mt-1 text-sm text-rose-100">
                  {getPortfolioClassName(selectedPortfolio.gradeLevel)} · {selectedPortfolio.academicYear} · {selectedPortfolio.term}
                </p>
                <p className="mt-1 text-xs text-rose-100">
                  Learner ID: {selectedPortfolio.student?.studentId || '—'} · Date of birth: {selectedPortfolio.student?.dateOfBirth || '—'}
                </p>
                {role !== 'parent' && <p className="mt-1 text-xs text-rose-100">Submitted by {selectedPortfolio.submittedBy || 'Teacher'}</p>}
              </div>
              <button type="button" onClick={() => downloadPortfolioPdf(selectedPortfolio)} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-rose-900">
                <Download size={16} /> Download portfolio
              </button>
            </div>
          )}

          {role === 'teacher' && !selectedPortfolio && earlyYearsClasses.length > 0 && (
            <p className="text-xs text-slate-500">            Learner: {getStudentName(selectedStudent)} · Class: {getPortfolioClassName(selectedClass)} · {selectedYear} · {selectedTerm}</p>
          )}

          {(role === 'teacher' || (role === 'admin' && selectedPortfolio)) && (
            <div className="space-y-5">
              {CHILD_PROFILE_FIELDS.length > 0 && (
                <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-5 shadow-sm">
                  <h3 className="mb-4 text-lg font-bold text-blue-700">All About Me</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {CHILD_PROFILE_FIELDS.map(([key, label]) => (
                      <TextField key={key} label={label} value={form.childProfile?.[key]} disabled={!editingEnabled || Boolean(aiBusyField)} rows={1}
                        onChange={value => updateFormField('childProfile', key, value)} />
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-blue-700">Areas of Learning</h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">Capture what the learner did or said, the evidence and context, their strengths, support offered and a practical next step.</p>
                  </div>
                  {role === 'teacher' && editingEnabled && (
                    <button
                      type="button"
                      onClick={requestMissingFieldDrafts}
                      disabled={saving || Boolean(aiBusyField)}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Sparkles size={16} /> {aiBusyField === 'complete' ? 'Drafting missing fields…' : 'AI draft missing fields'}
                    </button>
                  )}
                </div>
                {role === 'teacher' && editingEnabled && (
                  <p className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-900">
                    Add a progress level and brief, factual observation in one or more areas, then use AI draft missing fields. It can suggest related narratives and a term summary when evidence covers multiple areas; personal details and progress ratings are never drafted. Do not include names or identifying details, and review every suggestion.
                  </p>
                )}
                {LEARNING_AREAS.map((area, index) => {
                  const entry = form.learningAreas?.[area.key] || {}
                  return (
                    <article key={area.key} className={`rounded-2xl border border-slate-100 border-l-4 p-5 shadow-sm ${AREA_TONE_CLASSES[area.tone]}`}>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h4 className="flex items-center gap-3 font-bold text-slate-800">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm font-extrabold text-slate-600 shadow-sm">{index + 1}</span>
                          {area.label}
                        </h4>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Progress level
                          <select
                            value={entry.attainment || ''}
                            disabled={!editingEnabled || Boolean(aiBusyField)}
                            onChange={event => updateLearningArea(area.key, 'attainment', event.target.value)}
                            className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold normal-case tracking-normal text-slate-700 disabled:bg-slate-50"
                          >
                            {ATTAINMENT_OPTIONS.map(([value, label]) => <option key={value || 'none'} value={value}>{label}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="mb-4 grid gap-3 sm:grid-cols-3">
                        <label className="text-xs font-bold text-slate-600">
                          Engagement
                          <select
                            value={entry.engagement || ''}
                            disabled={!editingEnabled || Boolean(aiBusyField)}
                            onChange={event => updateLearningArea(area.key, 'engagement', event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-normal disabled:bg-slate-50"
                          >
                            {ENGAGEMENT_OPTIONS.map(([value, label]) => <option key={value || 'none'} value={value}>{label}</option>)}
                          </select>
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          Main evidence type
                          <select
                            value={entry.evidenceType || ''}
                            disabled={!editingEnabled || Boolean(aiBusyField)}
                            onChange={event => updateLearningArea(area.key, 'evidenceType', event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-normal disabled:bg-slate-50"
                          >
                            {EVIDENCE_TYPE_OPTIONS.map(([value, label]) => <option key={value || 'none'} value={value}>{label}</option>)}
                          </select>
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          Observation date
                          <input
                            type="date"
                            value={entry.observationDate || ''}
                            disabled={!editingEnabled || Boolean(aiBusyField)}
                            onChange={event => updateLearningArea(area.key, 'observationDate', event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-normal disabled:bg-slate-50"
                          />
                        </label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <TextField label="Observation & learning milestone" value={entry.teacherComment} disabled={!editingEnabled || Boolean(aiBusyField)}
                          onChange={value => updateLearningArea(area.key, 'teacherComment', value)}
                          onAssist={role === 'teacher' ? () => requestAiDraft('learningArea', area.key, 'teacherComment') : undefined}
                          assisting={aiBusyField === `learningArea:${area.key}:teacherComment`}
                          assistDisabled={Boolean(aiBusyField)} />
                        <TextField label="Evidence & learning journey (what happened?)" value={entry.evidence} disabled={!editingEnabled || Boolean(aiBusyField)}
                          onChange={value => updateLearningArea(area.key, 'evidence', value)}
                          onAssist={role === 'teacher' ? () => requestAiDraft('learningArea', area.key, 'evidence') : undefined}
                          assisting={aiBusyField === `learningArea:${area.key}:evidence`}
                          assistDisabled={Boolean(aiBusyField)} />
                        <TextField label="Strengths, interests & learner voice" value={entry.strengths} disabled={!editingEnabled || Boolean(aiBusyField)}
                          onChange={value => updateLearningArea(area.key, 'strengths', value)}
                          onAssist={role === 'teacher' ? () => requestAiDraft('learningArea', area.key, 'strengths') : undefined}
                          assisting={aiBusyField === `learningArea:${area.key}:strengths`}
                          assistDisabled={Boolean(aiBusyField)} />
                        <TextField label="Support strategies used" value={entry.supportStrategies} disabled={!editingEnabled || Boolean(aiBusyField)}
                          onChange={value => updateLearningArea(area.key, 'supportStrategies', value)}
                          onAssist={role === 'teacher' ? () => requestAiDraft('learningArea', area.key, 'supportStrategies') : undefined}
                          assisting={aiBusyField === `learningArea:${area.key}:supportStrategies`}
                          assistDisabled={Boolean(aiBusyField)} />
                        <TextField label="Next steps" value={entry.nextSteps} disabled={!editingEnabled || Boolean(aiBusyField)} rows={2}
                          onChange={value => updateLearningArea(area.key, 'nextSteps', value)}
                          onAssist={role === 'teacher' ? () => requestAiDraft('learningArea', area.key, 'nextSteps') : undefined}
                          assisting={aiBusyField === `learningArea:${area.key}:nextSteps`}
                          assistDisabled={Boolean(aiBusyField)} />
                      </div>
                      <EvidenceImages images={entry.evidenceImages} />
                      {role === 'teacher' && editingEnabled && selectedPortfolio && (
                        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">
                          <Camera size={16} /> {saving ? 'Uploading…' : 'Add work photo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={saving || (entry.evidenceImages || []).length >= 10}
                            className="sr-only"
                            onChange={event => {
                              uploadEvidence(area.key, event.target.files?.[0])
                              event.target.value = ''
                            }}
                          />
                        </label>
                      )}
                      {role === 'teacher' && editingEnabled && !selectedPortfolio && (
                        <p className="mt-3 text-xs text-slate-500">Submit the portfolio first to attach work photos. You can upload up to 10 JPEG, PNG, or WEBP images per learning area (8 MB each).</p>
                      )}
                    </article>
                  )
                })}
              </section>

              <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-blue-700">End of Term & Targets for Next Term</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SUMMARY_FIELDS.map(([key, label]) => (
                    <TextField key={key} label={label} value={form.summary?.[key]} disabled={!editingEnabled || Boolean(aiBusyField)}
                      onChange={value => updateFormField('summary', key, value)}
                      onAssist={role === 'teacher' ? () => requestAiDraft('summary', null, key) : undefined}
                      assisting={aiBusyField === `summary::${key}`}
                      assistDisabled={Boolean(aiBusyField)} />
                  ))}
                </div>
              </section>

              {role === 'admin' && selectedPortfolio?.parentComment && (
                <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <h3 className="font-bold text-amber-900">Parent / carer reflection</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-amber-900">{selectedPortfolio.parentComment}</p>
                </section>
              )}

              {editingEnabled && (role === 'teacher' || canEdit) && (
                <button type="button" onClick={savePortfolio} disabled={saving || Boolean(aiBusyField) || (role === 'teacher' && Boolean(existingForSelection && !selectedPortfolio))} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                  <Save size={17} /> {saving ? 'Saving…' : selectedPortfolio ? 'Save changes' : 'Submit for admin review'}
                </button>
              )}

              {role === 'admin' && selectedPortfolio && (
                <div className="flex flex-wrap gap-3">
                  {canApprove && selectedPortfolio.status !== 'approved' && (
                    <button type="button" onClick={() => reviewPortfolio('approved')} disabled={saving} className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50">
                      Approve & release to parent
                    </button>
                  )}
                  {canApprove && selectedPortfolio.status !== 'rejected' && selectedPortfolio.status !== 'approved' && (
                    <button type="button" onClick={() => reviewPortfolio('rejected')} disabled={saving} className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-800 disabled:opacity-50">
                      Return to teacher
                    </button>
                  )}
                  {canDelete && (
                    <button type="button" onClick={deletePortfolio} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-bold text-red-700 disabled:opacity-50">
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {role === 'parent' && selectedPortfolio && (
            <div className="space-y-5">
              <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-blue-700">All About Me</h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {CHILD_PROFILE_FIELDS.map(([key, label]) => (
                    <div key={key}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                      <dd className="mt-1 text-sm text-slate-800">{selectedPortfolio.portfolioData?.childProfile?.[key] || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-700">Areas of Learning</h3>
                {LEARNING_AREAS.map((area, index) => {
                  const entry = selectedPortfolio.portfolioData?.learningAreas?.[area.key] || {}
                  return (
                    <article key={area.key} className={`rounded-2xl border border-slate-100 border-l-4 p-5 shadow-sm ${AREA_TONE_CLASSES[area.tone]}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="flex items-center gap-3 font-bold text-slate-800">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm font-extrabold text-slate-600 shadow-sm">{index + 1}</span>
                          {area.label}
                        </h4>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">{entry.attainment || 'Progress not recorded'}</span>
                      </div>
                      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div><dt className="text-xs font-semibold text-slate-500">Engagement</dt><dd className="mt-1 text-sm text-slate-700">{formatOptionLabel(entry.engagement)}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Main evidence type</dt><dd className="mt-1 text-sm text-slate-700">{formatOptionLabel(entry.evidenceType)}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Observation date</dt><dd className="mt-1 text-sm text-slate-700">{entry.observationDate || 'Not recorded'}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Teacher observation</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.teacherComment || '—'}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Evidence / learning journey</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.evidence || '—'}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Strengths, interests & learner voice</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.strengths || '—'}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Support strategies used</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.supportStrategies || '—'}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Next steps</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.nextSteps || '—'}</dd></div>
                      </dl>
                      <EvidenceImages images={entry.evidenceImages} />
                    </article>
                  )
                })}
              </section>

              <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-blue-700">End of Term & Targets for Next Term</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {SUMMARY_FIELDS.map(([key, label]) => (
                    <div key={key}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{selectedPortfolio.portfolioData?.summary?.[key] || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <TextField label="Parent / carer reflection" value={parentComment} onChange={setParentComment} disabled={saving} rows={4} />
                <button type="button" onClick={saveParentComment} disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                  <Save size={16} /> {saving ? 'Saving…' : 'Save reflection'}
                </button>
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
