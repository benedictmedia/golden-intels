const { normalizeStudentClassName } = require('./studentClasses')

const EARLY_YEARS_CLASSES = ['Pre-Nursery', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2']
const PORTFOLIO_AREAS = [
  { key: 'communication', label: 'Communication & Language' },
  { key: 'personalSocialEmotional', label: 'Personal, Social & Emotional Development' },
  { key: 'physical', label: 'Physical Development' },
  { key: 'literacy', label: 'Literacy' },
  { key: 'mathematics', label: 'Mathematics' },
  { key: 'understandingWorld', label: 'Understanding the World' },
  { key: 'expressiveArts', label: 'Expressive Arts & Design' },
  { key: 'phonics', label: "Floppy's Phonics" }
]
const PORTFOLIO_ATTAINMENTS = ['', 'emerging', 'developing', 'secure', 'exceeding']
const PORTFOLIO_ENGAGEMENT_OPTIONS = ['', 'enthusiastic', 'engaged', 'developing-interest', 'needs-encouragement', 'not-observed']
const PORTFOLIO_EVIDENCE_TYPES = ['', 'observation', 'work-sample', 'photograph', 'conversation', 'group-activity', 'performance']
const CHILD_PROFILE_FIELDS = [
  'preferredName',
  'ageOnEntry',
  'languagesAtHome',
  'favoriteBook',
  'favoriteSubject',
  'favoriteActivity',
  'favoriteFood',
  'bestFriend',
  'proudOf',
  'aspirations'
]
const SUMMARY_FIELDS = ['termHighlights', 'overallProgress', 'homeSupport', 'nextTermTargets']
const AREA_FIELDS = ['teacherComment', 'evidence', 'nextSteps']

const isEarlyYearsClass = (gradeLevel) => EARLY_YEARS_CLASSES.some(
  className => normalizeStudentClassName(className) === normalizeStudentClassName(gradeLevel)
)

const readText = (value, label, maximumLength = 4000) => {
  if (value == null) return ''
  if (typeof value !== 'string') throw new Error(`${label} must be text.`)
  const text = value.trim()
  if (text.length > maximumLength) throw new Error(`${label} must be ${maximumLength} characters or fewer.`)
  return text
}

const normalizePortfolioData = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Portfolio details are required.')
  }

  const childProfile = value.childProfile && typeof value.childProfile === 'object' && !Array.isArray(value.childProfile)
    ? value.childProfile
    : {}
  const learningAreas = value.learningAreas && typeof value.learningAreas === 'object' && !Array.isArray(value.learningAreas)
    ? value.learningAreas
    : {}
  const summary = value.summary && typeof value.summary === 'object' && !Array.isArray(value.summary)
    ? value.summary
    : {}

  const normalizedAreas = {}
  for (const area of PORTFOLIO_AREAS) {
    const entry = learningAreas[area.key] && typeof learningAreas[area.key] === 'object' && !Array.isArray(learningAreas[area.key])
      ? learningAreas[area.key]
      : {}
    const attainment = entry.attainment == null ? '' : entry.attainment
    if (!PORTFOLIO_ATTAINMENTS.includes(attainment)) {
      throw new Error(`Choose a valid progress level for ${area.label}.`)
    }
    normalizedAreas[area.key] = {
      attainment,
      engagement: normalizeOption(entry.engagement, PORTFOLIO_ENGAGEMENT_OPTIONS, `${area.label} engagement`),
      evidenceType: normalizeOption(entry.evidenceType, PORTFOLIO_EVIDENCE_TYPES, `${area.label} evidence type`),
      observationDate: normalizeObservationDate(entry.observationDate, area.label),
      ...Object.fromEntries(AREA_FIELDS.map(field => [
        field,
        readText(entry[field], `${area.label} ${field}`)
      ])),
      evidenceImages: normalizeEvidenceImages(entry.evidenceImages, area.label)
    }
  }

  return {
    childProfile: Object.fromEntries(CHILD_PROFILE_FIELDS.map(field => [
      field,
      readText(childProfile[field], field)
    ])),
    learningAreas: normalizedAreas,
    summary: Object.fromEntries(SUMMARY_FIELDS.map(field => [
      field,
      readText(summary[field], field)
    ]))
  }
}

const normalizeOption = (value, options, label) => {
  const option = value == null ? '' : value
  if (!options.includes(option)) throw new Error(`Choose a valid ${label}.`)
  return option
}

const normalizeObservationDate = (value, label) => {
  const date = readText(value, `${label} observation date`, 10)
  if (!date) return ''
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00.000Z`) : null
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${label} observation date must be a valid date.`)
  }
  return date
}

const normalizeEvidenceImages = (value, label) => {
  if (value == null) return []
  if (!Array.isArray(value) || value.length > 10) {
    throw new Error(`${label} can have up to 10 image evidence files.`)
  }
  return value.map((image, index) => {
    if (!image || typeof image !== 'object' || Array.isArray(image)) {
      throw new Error(`${label} image ${index + 1} is invalid.`)
    }
    const url = readText(image.url, `${label} image URL`, 2048)
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch {
      throw new Error(`${label} image URL is invalid.`)
    }
    const isCloudinary = parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'res.cloudinary.com'
    const isLocalDevelopment = process.env.NODE_ENV !== 'production' &&
      ['localhost', '127.0.0.1'].includes(parsedUrl.hostname) &&
      ['http:', 'https:'].includes(parsedUrl.protocol)
    if (!isCloudinary && !isLocalDevelopment) {
      throw new Error(`${label} images must use an approved image storage URL.`)
    }
    const name = readText(image.name, `${label} image name`, 255)
    return { url, name }
  })
}

const hasPortfolioProgress = (portfolioData) => PORTFOLIO_AREAS.some(({ key }) => {
  const area = portfolioData.learningAreas[key]
  return Boolean(area.attainment || area.teacherComment || area.evidence || area.nextSteps)
})

module.exports = {
  EARLY_YEARS_CLASSES,
  PORTFOLIO_AREAS,
  PORTFOLIO_ATTAINMENTS,
  PORTFOLIO_ENGAGEMENT_OPTIONS,
  PORTFOLIO_EVIDENCE_TYPES,
  isEarlyYearsClass,
  normalizePortfolioData,
  hasPortfolioProgress
}
