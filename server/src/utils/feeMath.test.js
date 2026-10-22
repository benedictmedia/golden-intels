const test = require('node:test')
const assert = require('node:assert/strict')
const { calculateFeeBalance, getFeeStatus } = require('./feeMath')

test('includes prior-term arrears in a learner term balance', () => {
  const balance = calculateFeeBalance(1200, 300, 500)
  assert.equal(balance, 1000)
  assert.equal(getFeeStatus(balance, 500), 'partial')
})

test('does not allow a negative balance after overpayment', () => {
  const balance = calculateFeeBalance(1200, 300, 1800)
  assert.equal(balance, 0)
  assert.equal(getFeeStatus(balance, 1800), 'paid')
})