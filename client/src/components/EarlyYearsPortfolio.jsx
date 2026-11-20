import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Download, FileText, Save, Trash2 } from 'lucide-react'
import API_URL from '../api/config'
import { canonicalStudentClassName, displayStudentClassName, isEarlyYearsStudentClass, normalizeStudentClassName } from '../utils/studentClasses'

const LEARNING_AREAS = [
  { key: 'communication', label: 'Communication & Language' },
  { key: 'personalSocialEmotional', label: 'Personal, Social & Emotional Development' },
  { key: 'physical', label: 'Physical Development' },
  { key: 'literacy', label: 'Literacy' },
  { key: 'mathematics', label: 'Mathematics' },
  { key: 'understandingWorld', label: 'Understanding the World' },
  { key: 'expressiveArts', label: 'Expressive Arts & Design' },
  { key: 'phonics', label: "Floppy's Phonics" }
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

const emptyPortfolioData = () => ({
  childProfile: Object.fromEntries(CHILD_PROFILE_FIELDS.map(([key]) => [key, ''])),
  learningAreas: Object.fromEntries(LEARNING_AREAS.map(({ key }) => [key, {
    attainment: '',
    teacherComment: '',
    evidence: '',
    nextSteps: ''
  }])),
  summary: Object.fromEntries(SUMMARY_FIELDS.map(([key]) => [key, '']))
})

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const getStudentName = (student) => `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Learner'

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

  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageWidth, 34, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('My Learning Journey', 14, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Golden-Intels International School - Early Years Learner Portfolio', 14, 24)
  y = 43

  addText(getStudentName(student), { bold: true, size: 15, color: [37, 99, 235] })
  addText(`Learner ID: ${student?.studentId || '—'}  |  Date of birth: ${student?.dateOfBirth || '—'}`)
  addText(`Class: ${getPortfolioClassName(portfolio.gradeLevel)}  |  Academic year: ${portfolio.academicYear}  |  ${portfolio.term}`, { size: 10 })
  addText(`Submitted by: ${portfolio.submittedBy || 'Teacher'}  |  Status: ${portfolio.status}`, { size: 9, color: [100, 116, 139], gap: 7 })

  addText('All About Me', { bold: true, size: 13, color: [37, 99, 235] })
  CHILD_PROFILE_FIELDS.forEach(([key, label]) => addText(`${label}: ${data.childProfile?.[key] || '—'}`))

  LEARNING_AREAS.forEach(area => {
    const entry = data.learningAreas?.[area.key] || {}
    addText(area.label, { bold: true, size: 12, color: [37, 99, 235], gap: 1 })
    addText(`Progress: ${entry.attainment ? entry.attainment[0].toUpperCase() + entry.attainment.slice(1) : 'Not recorded'}`)
    addText(`Teacher observation: ${entry.teacherComment || '—'}`)
    addText(`Evidence / learning journey: ${entry.evidence || '—'}`)
    addText(`Next steps: ${entry.nextSteps || '—'}`, { gap: 6 })
  })

  addText('End of Term', { bold: true, size: 13, color: [37, 99, 235] })
  SUMMARY_FIELDS.forEach(([key, label]) => addText(`${label}: ${data.summary?.[key] || '—'}`))
  addText(`Parent / carer reflection: ${portfolio.parentComment || '—'}`)
  doc.save(`learning-portfolio-${String(student?.studentId || portfolio.studentId)}-${portfolio.term.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

function TextField({ label, value, onChange, rows = 2, disabled = false }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <textarea
        rows={rows}
        value={value || ''}
        onChange={event => onChange(event.target.value)}
        disabled={disabled}
        maxLength={4000}
        className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
      />
    </label>
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
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedPortfolio = portfolios.find(portfolio => portfolio.id === selectedPortfolioId) || null
  const classStudents = students.filter(student => normalizeStudentClassName(student.gradeLevel) === normalizeStudentClassName(selectedClass))
  const resolvedSelectedStudentId = selectedStudentId || String(classStudents[0]?.id || '')
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
    let active = true
    axios.get(`${API_URL}/api/portfolios`, { headers: getAuthHeaders() })
      .then(response => {
        if (!active) return
        setPortfolios(response.data || [])
        setLoading(false)
      })
      .catch(requestError => {
        if (!active) return
        setError(requestError.response?.data?.message || 'Unable to load portfolios.')
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
      setError(requestError.response?.data?.message || 'Unable to save this portfolio.')
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
      setError(requestError.response?.data?.message || 'Unable to update portfolio status.')
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
      setError(requestError.response?.data?.message || 'Unable to delete this portfolio.')
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
      setError(requestError.response?.data?.message || 'Unable to save your reflection.')
    } finally {
      setSaving(false)
    }
  }

  const visiblePortfolios = role === 'teacher'
    ? portfolios.filter(portfolio => earlyYearsClasses.some(className => normalizeStudentClassName(className) === normalizeStudentClassName(portfolio.gradeLevel)))
    : portfolios

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-700">My Learning Journey</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Early-years progress portfolio for Pre-Nursery, Nursery 1–2, and Reception 1–2. Includes child voice, learning-area observations, evidence, term reflections, and next-step targets.
          </p>
        </div>
        {role === 'teacher' && earlyYearsClasses.length > 0 && (
          <button type="button" onClick={startNewPortfolio} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            Start a portfolio
          </button>
        )}
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

        <div className="min-w-0 space-y-5">
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
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-700 p-5 text-white">
              <div>
                <h3 className="text-lg font-bold">{getStudentName(selectedPortfolio.student)}</h3>
                <p className="mt-1 text-sm text-blue-100">
                  {getPortfolioClassName(selectedPortfolio.gradeLevel)} · {selectedPortfolio.academicYear} · {selectedPortfolio.term}
                </p>
                <p className="mt-1 text-xs text-blue-100">
                  Learner ID: {selectedPortfolio.student?.studentId || '—'} · Date of birth: {selectedPortfolio.student?.dateOfBirth || '—'}
                </p>
                {role !== 'parent' && <p className="mt-1 text-xs text-blue-100">Submitted by {selectedPortfolio.submittedBy || 'Teacher'}</p>}
              </div>
              <button type="button" onClick={() => downloadPortfolioPdf(selectedPortfolio)} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-blue-700">
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
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-lg font-bold text-blue-700">All About Me</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {CHILD_PROFILE_FIELDS.map(([key, label]) => (
                      <TextField key={key} label={label} value={form.childProfile?.[key]} disabled={!editingEnabled} rows={1}
                        onChange={value => updateFormField('childProfile', key, value)} />
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-700">Areas of Learning</h3>
                  <p className="text-sm text-slate-500">Record progress, specific examples, teacher observations, and next steps for each area.</p>
                </div>
                {LEARNING_AREAS.map(area => {
                  const entry = form.learningAreas?.[area.key] || {}
                  return (
                    <article key={area.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-800">{area.label}</h4>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Progress
                          <select
                            value={entry.attainment || ''}
                            disabled={!editingEnabled}
                            onChange={event => updateLearningArea(area.key, 'attainment', event.target.value)}
                            className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold normal-case tracking-normal text-slate-700 disabled:bg-slate-50"
                          >
                            {ATTAINMENT_OPTIONS.map(([value, label]) => <option key={value || 'none'} value={value}>{label}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <TextField label="Teacher observation and milestone" value={entry.teacherComment} disabled={!editingEnabled}
                          onChange={value => updateLearningArea(area.key, 'teacherComment', value)} />
                        <TextField label="Evidence / learning journey" value={entry.evidence} disabled={!editingEnabled}
                          onChange={value => updateLearningArea(area.key, 'evidence', value)} />
                        <TextField label="Next steps" value={entry.nextSteps} disabled={!editingEnabled} rows={2}
                          onChange={value => updateLearningArea(area.key, 'nextSteps', value)} />
                      </div>
                    </article>
                  )
                })}
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-blue-700">End of Term & Targets for Next Term</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SUMMARY_FIELDS.map(([key, label]) => (
                    <TextField key={key} label={label} value={form.summary?.[key]} disabled={!editingEnabled}
                      onChange={value => updateFormField('summary', key, value)} />
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
                <button type="button" onClick={savePortfolio} disabled={saving || (role === 'teacher' && Boolean(existingForSelection && !selectedPortfolio))} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50">
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
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
                {LEARNING_AREAS.map(area => {
                  const entry = selectedPortfolio.portfolioData?.learningAreas?.[area.key] || {}
                  return (
                    <article key={area.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-800">{area.label}</h4>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">{entry.attainment || 'Progress not recorded'}</span>
                      </div>
                      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div><dt className="text-xs font-semibold text-slate-500">Teacher observation</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.teacherComment || '—'}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Evidence / learning journey</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.evidence || '—'}</dd></div>
                        <div><dt className="text-xs font-semibold text-slate-500">Next steps</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.nextSteps || '—'}</dd></div>
                      </dl>
                    </article>
                  )
                })}
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
