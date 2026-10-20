import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countLearnersByGender } from './learnerGenderCounts.js'

test('counts male and female learners case-insensitively', () => {
  assert.deepEqual(countLearnersByGender([
    { gender: 'Male' },
    { gender: ' FEMALE ' },
    { gender: 'male' },
    { gender: '' },
    {},
  ]), { male: 2, female: 1 })
})