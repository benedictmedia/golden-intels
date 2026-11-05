import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getLearnerAge } from './learnerAge.js'

test("calculates the learner age based on whether this year's birthday has passed", () => {
  assert.equal(getLearnerAge('2010-03-12', new Date(2026, 3, 1)), '16')
  assert.equal(getLearnerAge('2010-04-12', new Date(2026, 3, 1)), '15')
})

test('returns an empty value for invalid, future, or missing dates of birth', () => {
  const today = new Date(2026, 3, 1)
  assert.equal(getLearnerAge('2010-02-30', today), '')
  assert.equal(getLearnerAge('2027-01-01', today), '')
  assert.equal(getLearnerAge('', today), '')
})
