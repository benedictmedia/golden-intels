const test = require('node:test')
const assert = require('node:assert/strict')

const {
  getMissingSubjects,
  isScoresCompleteForSubjects,
  normalizeSubject,
  normalizeScoreMap,
  validateTeacherScores
} = require('./resultSubjectHelpers')

test('normalizeScoreMap canonicalizes subject aliases for approval checks', () => {
  const normalized = normalizeScoreMap({ Mathematics: { classScore: '10', cat1: '8', cat2: '7', exam: '30' } })

  assert.deepEqual(Object.keys(normalized), ['maths'])
  assert.equal(normalized.maths.classScore, '10')
})

test('normalizeSubject recognizes the new subject aliases', () => {
  assert.equal(normalizeSubject('Numeracy'), 'numeracy')
  assert.equal(normalizeSubject('Literacy'), 'literacy')
  assert.equal(normalizeSubject('Phonics'), 'floppy phonics (phonics)')
})

test('isScoresCompleteForSubjects accepts canonical aliases for required subjects', () => {
  const scores = {
    Maths: { classScore: '10', cat1: '8', cat2: '7', exam: '30' }
  }

  assert.equal(isScoresCompleteForSubjects(scores, ['Mathematics']), true)
})

test('getMissingSubjects reports incomplete required subjects', () => {
  const missing = getMissingSubjects({ Maths: { classScore: '10', cat1: '8', cat2: '', exam: '30' } }, ['Mathematics'])

  assert.deepEqual(missing, ['maths'])
})

test('validateTeacherScores accepts aliased subject labels for assigned subjects', () => {
  const result = validateTeacherScores({ Mathematics: { classScore: '10', cat1: '8', cat2: '7', exam: '30' } }, ['Maths'])

  assert.deepEqual(result, { ok: true })
})

test('validateTeacherScores accepts maximum values with the existing exam scale', () => {
  const result = validateTeacherScores({
    Mathematics: { classScore: '10', cat1: '20', cat2: '20', exam: '100' }
  }, ['Maths'])

  assert.deepEqual(result, { ok: true })
})

test('validateTeacherScores rejects scores above each field maximum', () => {
  for (const [field, maximum] of Object.entries({ classScore: 10, cat1: 20, cat2: 20, exam: 100 })) {
    const result = validateTeacherScores({
      Mathematics: { classScore: '10', cat1: '20', cat2: '20', exam: '100', [field]: String(maximum + 1) }
    }, ['Maths'])

    assert.equal(result.ok, false, `${field} should be capped at ${maximum}`)
  }
})

test('validateTeacherScores rejects negative and non-numeric values', () => {
  for (const value of ['-1', 'not-a-score']) {
    const result = validateTeacherScores({
      Mathematics: { classScore: value, cat1: '0', cat2: '0', exam: '0' }
    }, ['Maths'])

    assert.equal(result.ok, false)
  }
})
