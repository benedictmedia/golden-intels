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
      ...Object.fromEntries(AREA_FIELDS.map(field => [
        field,
        readText(entry[field], `${area.label} ${field}`)
      ]))
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

const hasPortfolioProgress = (portfolioData) => PORTFOLIO_AREAS.some(({ key }) => {
  const area = portfolioData.learningAreas[key]
  return Boolean(area.attainment || area.teacherComment || area.evidence || area.nextSteps)
})

module.exports = {
  EARLY_YEARS_CLASSES,
  PORTFOLIO_AREAS,
  PORTFOLIO_ATTAINMENTS,
  isEarlyYearsClass,
  normalizePortfolioData,
  hasPortfolioProgress
}
