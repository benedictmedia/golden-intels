const SUBJECT_ALIASES = {
  mathematics: 'maths',
  maths: 'maths',
  math: 'maths',
  'religious and moral education': 'rme',
  'religious & moral education': 'rme',
  'creative arts': 'creative arts',
  'uc mas': 'uc mas'
}

const normalizeSubject = (value) => {
  const raw = String(value ?? '').trim().toLowerCase()
  if (!raw) return ''

  return SUBJECT_ALIASES[raw] || raw
}

const normalizeSubjectList = (subjects = []) => Array.from(new Set((subjects || []).map(normalizeSubject).filter(Boolean)))

const hasScoreData = (scoreEntry) => {
  if (!scoreEntry || typeof scoreEntry !== 'object') {
    return false
  }

  return ['classScore', 'cat1', 'cat2', 'exam'].every((field) => {
    const value = scoreEntry[field]
    return value !== undefined && value !== null && value !== ''
  })
}

const normalizeScoreMap = (scores = {}) => {
  const normalized = {}

  Object.entries(scores || {}).forEach(([subject, value]) => {
    normalized[normalizeSubject(subject)] = value
  })

  return normalized
}

const isScoresCompleteForSubjects = (scores = {}, requiredSubjects = []) => {
  const normalizedScores = normalizeScoreMap(scores)

  return requiredSubjects.every((subject) => {
    const normalizedSubject = normalizeSubject(subject)
    return normalizedSubject in normalizedScores && hasScoreData(normalizedScores[normalizedSubject])
  })
}

const sanitizeTeacherScores = (scores = {}, allowedSubjects = []) => {
  const normalizedAllowed = new Set(normalizeSubjectList(allowedSubjects))
  const sanitized = {}

  Object.entries(scores || {}).forEach(([subject, value]) => {
    if (normalizedAllowed.has(normalizeSubject(subject))) {
      sanitized[subject] = value
    }
  })

  return sanitized
}

const validateTeacherScores = (scores = {}, allowedSubjects = []) => {
  const normalizedAllowed = normalizeSubjectList(allowedSubjects)
  const invalidSubjects = Object.keys(scores || {}).filter((subject) => !normalizedAllowed.includes(normalizeSubject(subject)))

  if (invalidSubjects.length > 0) {
    return {
      ok: false,
      message: `You may only submit scores for your assigned subjects: ${Array.from(new Set(normalizedAllowed)).join(', ') || 'none assigned'}.`
    }
  }

  return { ok: true }
}

const getMissingSubjects = (scores = {}, requiredSubjects = []) => {
  const normalizedScores = normalizeScoreMap(scores)

  return requiredSubjects
    .map(normalizeSubject)
    .filter((subject) => !(subject in normalizedScores) || !hasScoreData(normalizedScores[subject]))
}

module.exports = {
  normalizeSubject,
  normalizeSubjectList,
  normalizeScoreMap,
  hasScoreData,
  isScoresCompleteForSubjects,
  sanitizeTeacherScores,
  validateTeacherScores,
  getMissingSubjects
}
