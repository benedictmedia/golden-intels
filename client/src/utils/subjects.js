export const SUBJECTS = ['English', 'Maths', 'Science', 'Computing', 'Geography', 'RME', 'History', 'Creative Arts', 'Ewe', 'French', 'UC MAS']

const SUBJECT_ALIASES = {
  english: 'English',
  englishlanguage: 'English',
  maths: 'Maths',
  mathematics: 'Maths',
  math: 'Maths',
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
  'u c mas': 'UC MAS'
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
