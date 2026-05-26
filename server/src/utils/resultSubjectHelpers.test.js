const test = require('node:test')
const assert = require('node:assert/strict')

const {
  getMissingSubjects,
  isScoresCompleteForSubjects,
  normalizeScoreMap,
  validateTeacherScores
} = require('./resultSubjectHelpers')

test('normalizeScoreMap canonicalizes subject aliases for approval checks', () => {
  const normalized = normalizeScoreMap({ Mathematics: { classScore: '10', cat1: '8', cat2: '7', exam: '30' } })

  assert.deepEqual(Object.keys(normalized), ['maths'])
  assert.equal(normalized.maths.classScore, '10')
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
