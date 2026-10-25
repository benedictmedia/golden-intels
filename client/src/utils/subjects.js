export const SUBJECTS = [
  'English', 'Maths', 'Numeracy', 'Literacy', 'Science', 'Computing', 'Geography',
  'RME', 'History', 'Creative Arts', 'Ewe', 'French', 'UC MAS', 'Floppy Phonics (Phonics)'
]

export const SCORE_FIELD_MAXIMUMS = {
  classScore: 10,
  cat1: 20,
  cat2: 20,
  exam: 100
}

const SUBJECT_ALIASES = {
  english: 'English',
  englishlanguage: 'English',
  maths: 'Maths',
  mathematics: 'Maths',
  math: 'Maths',
  numeracy: 'Numeracy',
  literacy: 'Literacy',
  science: 'Science',
  computing: 'Computing',
  geography: 'Geography',
  rme: 'RME',
  'religious and moral education': 'RME',
  'religious & moral education': 'RME',
  'religious moral education': 'RME',
  history: 'History',
  'creative arts': 'Creative Arts',
  ewe: 'Ewe',
  french: 'French',
  'uc mas': 'UC MAS',
  'u c mas': 'UC MAS',
  phonics: 'Floppy Phonics (Phonics)',
  'floppy phonics': 'Floppy Phonics (Phonics)',
  'floppy phonics (phonics)': 'Floppy Phonics (Phonics)'
}

export const normalizeSubjectName = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const normalized = raw.toLowerCase()
  return SUBJECT_ALIASES[normalized] || raw
}

export const getNormalizedScores = (scores = {}) => {
  const normalized = {}

  Object.entries(scores || {}).forEach(([subject, score]) => {
    const canonical = normalizeSubjectName(subject)
    if (!canonical) return

    normalized[canonical] = score
  })

  return normalized
}

export const getSubjectScore = (scores = {}, subject) => {
  const normalizedScores = getNormalizedScores(scores)
  return normalizedScores[normalizeSubjectName(subject)] || {}
}

export const isSubjectScoreComplete = (scoreEntry = {}) =>
  Object.keys(SCORE_FIELD_MAXIMUMS).every((field) => {
    const value = scoreEntry[field]
    return value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value))
  })

export const getCompletedSubjects = (scores = {}, subjects = SUBJECTS) =>
  subjects.filter(subject => isSubjectScoreComplete(getSubjectScore(scores, subject)))

export const clampScoreInput = (field, value) => {
  if (value === '') return ''
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return String(Math.max(0, Math.min(SCORE_FIELD_MAXIMUMS[field] ?? 100, number)))
}

export const getSubjectTotal = (scoreEntry = {}) => {
  const classScore = parseFloat(scoreEntry.classScore) || 0
  const cat1 = parseFloat(scoreEntry.cat1) || 0
  const cat2 = parseFloat(scoreEntry.cat2) || 0
  const exam = parseFloat(scoreEntry.exam) || 0
  const weightedExam = (exam / 100) * 50

  return classScore + cat1 + cat2 + weightedExam
}

export const calculateGrandTotal = (scores = {}, subjects = SUBJECTS) =>
  subjects.reduce((total, subject) => total + getSubjectTotal(getSubjectScore(scores, subject)), 0)

export const getRemarksText = (remarks) => {
  if (typeof remarks === 'string' && remarks.trim()) {
    return remarks.trim()
  }

  return 'No remarks provided.'
}

export default SUBJECTS
