const { test } = require('node:test')
const assert = require('node:assert/strict')
const { getAgeFromDateOfBirth } = require('./studentAge')

test('calculates age based on whether the birthday has passed this year', () => {
  assert.equal(getAgeFromDateOfBirth('2010-03-12', new Date(2026, 3, 1)), '16')
  assert.equal(getAgeFromDateOfBirth('2010-04-12', new Date(2026, 3, 1)), '15')
})

test('returns null for invalid, future, or missing dates of birth', () => {
  const today = new Date(2026, 3, 1)
  assert.equal(getAgeFromDateOfBirth('2010-02-30', today), null)
  assert.equal(getAgeFromDateOfBirth('2027-01-01', today), null)
  assert.equal(getAgeFromDateOfBirth('', today), null)
})
