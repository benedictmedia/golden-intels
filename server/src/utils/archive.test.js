const test = require('node:test')
const assert = require('node:assert/strict')
const { isAcademicPeriodVisible, isPreviousAcademicPeriod } = require('./archive')

const dbFor = (academicYear, term) => ({
  academicContext: {
    findFirst: async () => ({ academicYear, term })
  }
})

test('recognizes previous years and previous terms', async () => {
  const db = dbFor('2026/2027', 'Term 2')
  assert.equal(await isPreviousAcademicPeriod(db, '2025/2026', 'Term 3'), true)
  assert.equal(await isPreviousAcademicPeriod(db, '2026/2027', 'Term 1'), true)
  assert.equal(await isPreviousAcademicPeriod(db, '2026/2027', 'Term 2'), false)
  assert.equal(await isPreviousAcademicPeriod(db, '2027/2028', 'Term 1'), false)
})

test('limits non-admin visibility to 2026/2027 and earlier active periods', async () => {
  const db = dbFor('2026/2027', 'Term 1')
  assert.equal(await isAcademicPeriodVisible(db, '2025/2026', 'Term 3'), false)
  assert.equal(await isAcademicPeriodVisible(db, '2026/2027', 'Term 1'), true)
  assert.equal(await isAcademicPeriodVisible(db, '2026/2027', 'Term 2'), false)
  assert.equal(await isAcademicPeriodVisible(db, '2027/2028', 'Term 1'), false)
})