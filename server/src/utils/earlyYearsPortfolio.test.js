const test = require('node:test')
const assert = require('node:assert/strict')
const {
  PORTFOLIO_AREAS,
  PORTFOLIO_EVIDENCE_TYPES,
  PORTFOLIO_ENGAGEMENT_OPTIONS,
  getPortfolioDraftTargets,
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
  assert.equal(result.learningAreas.communication.strengths, '')
  assert.equal(result.learningAreas.communication.supportStrategies, '')
  assert.equal(result.learningAreas.communication.engagement, '')
  assert.deepEqual(result.learningAreas.communication.evidenceImages, [])
  assert.equal(result.learningAreas.phonics.attainment, '')
  assert.equal(result.summary.nextTermTargets, 'Practice counting.')
  assert.equal(Object.keys(result.learningAreas).length, PORTFOLIO_AREAS.length)
  assert.equal('unexpected' in result, false)
})

test('preserves selectable observations and approved image evidence', () => {
  const result = normalizePortfolioData({
    learningAreas: {
      literacy: {
        engagement: 'engaged',
        evidenceType: 'work-sample',
        observationDate: '2026-11-20',
        evidenceImages: [{ url: 'https://res.cloudinary.com/school/image/upload/work.png', name: 'Letter tracing' }]
      }
    }
  })

  assert.equal(result.learningAreas.literacy.engagement, 'engaged')
  assert.equal(result.learningAreas.literacy.evidenceType, 'work-sample')
  assert.equal(result.learningAreas.literacy.observationDate, '2026-11-20')
  assert.deepEqual(result.learningAreas.literacy.evidenceImages, [
    { url: 'https://res.cloudinary.com/school/image/upload/work.png', name: 'Letter tracing' }
  ])
  assert.throws(() => normalizePortfolioData({
    learningAreas: { literacy: { engagement: 'always' } }
  }), /valid Literacy engagement/)
  assert.throws(() => normalizePortfolioData({
    learningAreas: { literacy: { evidenceType: 'video' } }
  }), /valid Literacy evidence type/)
  assert.throws(() => normalizePortfolioData({
    learningAreas: { literacy: { observationDate: '2026-02-30' } }
  }), /valid date/)
  assert.throws(() => normalizePortfolioData({
    learningAreas: { literacy: { evidenceImages: [{ url: 'https://untrusted.example/work.png', name: 'Work' }] } }
  }), /approved image storage URL/)
  assert.ok(PORTFOLIO_ENGAGEMENT_OPTIONS.includes('engaged'))
  assert.ok(PORTFOLIO_EVIDENCE_TYPES.includes('work-sample'))
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

test('selects only blank narrative fields supported by learning-area or summary notes', () => {
  const portfolioData = normalizePortfolioData({
    childProfile: { preferredName: 'Keep personal details out of AI drafts' },
    learningAreas: {
      communication: {
        attainment: 'developing',
        evidence: 'Explained how the toy bridge fell and tried a wider base.',
        strengths: 'Uses descriptive language.'
      },
      mathematics: {
        attainment: 'secure',
        teacherComment: 'Counts five counters accurately during a small-group game.'
      }
    }
  })

  const { targets } = getPortfolioDraftTargets(portfolioData)
  assert.deepEqual(targets.filter(target => target.section === 'learningArea').map(({ areaKey, field }) => [areaKey, field]), [
    ['communication', 'teacherComment'],
    ['communication', 'supportStrategies'],
    ['communication', 'nextSteps'],
    ['mathematics', 'evidence'],
    ['mathematics', 'strengths'],
    ['mathematics', 'supportStrategies'],
    ['mathematics', 'nextSteps']
  ])
  assert.deepEqual(targets.filter(target => target.section === 'summary').map(target => target.field), [
    'termHighlights',
    'overallProgress',
    'homeSupport',
    'nextTermTargets'
  ])
  assert.equal(targets.some(target => target.notes.includes('Keep personal details out of AI drafts')), false)
  assert.equal(getPortfolioDraftTargets(normalizePortfolioData({
    learningAreas: { communication: { attainment: 'secure' } }
  })).targets.length, 0)
})
