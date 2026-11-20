const test = require('node:test')
const assert = require('node:assert/strict')
const {
  PORTFOLIO_AREAS,
  hasPortfolioProgress,
  isEarlyYearsClass,
  normalizePortfolioData
} = require('./earlyYearsPortfolio')

test('only the five supported early-years classes are eligible', () => {
  for (const gradeLevel of ['Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Reception 1(KG1)', 'Reception 1 (KG1)', 'Reception 2(KG2)', 'Reception 2 (KG2)']) {
    assert.equal(isEarlyYearsClass(gradeLevel), true)
  }
  assert.equal(isEarlyYearsClass('Creche'), false)
  assert.equal(isEarlyYearsClass('Grade 1'), false)
})

test('normalizes portfolio content to the supported learner, area, and summary fields', () => {
  const result = normalizePortfolioData({
    childProfile: { preferredName: ' Ama ', unexpected: 'discarded' },
    learningAreas: { communication: { attainment: 'secure', evidence: 'Explains her ideas.' } },
    summary: { nextTermTargets: 'Practice counting.' },
    unexpected: 'discarded'
  })

  assert.equal(result.childProfile.preferredName, 'Ama')
  assert.equal(result.learningAreas.communication.attainment, 'secure')
  assert.equal(result.learningAreas.communication.evidence, 'Explains her ideas.')
  assert.equal(result.learningAreas.phonics.attainment, '')
  assert.equal(result.summary.nextTermTargets, 'Practice counting.')
  assert.equal(Object.keys(result.learningAreas).length, PORTFOLIO_AREAS.length)
  assert.equal('unexpected' in result, false)
})

test('rejects invalid attainment values and oversized text', () => {
  assert.throws(() => normalizePortfolioData({
    learningAreas: { communication: { attainment: 'complete' } }
  }), /valid progress level/)
  assert.throws(() => normalizePortfolioData({
    childProfile: { preferredName: 'a'.repeat(4001) }
  }), /4000 characters or fewer/)
})

test('requires at least one documented learning area before submission', () => {
  assert.equal(hasPortfolioProgress(normalizePortfolioData({})), false)
  assert.equal(hasPortfolioProgress(normalizePortfolioData({
    learningAreas: { phonics: { attainment: 'developing' } }
  })), true)
})
