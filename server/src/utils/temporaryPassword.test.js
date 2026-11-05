const { test } = require('node:test')
const assert = require('node:assert/strict')
const { getMinimumTemporaryPasswordLength, validateTemporaryPassword } = require('./temporaryPassword')

test('allows three-character temporary passwords for parents and learners', () => {
  for (const role of ['parent', 'learner']) {
    assert.equal(getMinimumTemporaryPasswordLength(role), 3)
    assert.equal(validateTemporaryPassword('abc', role), null)
    assert.match(validateTemporaryPassword('ab', role), /at least 3 characters/)
  }
})

test('keeps the six-character minimum for teachers', () => {
  assert.equal(getMinimumTemporaryPasswordLength('teacher'), 6)
  assert.equal(validateTemporaryPassword('abcde', 'teacher'), 'Temporary password must be at least 6 characters for this account type.')
  assert.equal(validateTemporaryPassword('abcdef', 'teacher'), null)
})

test('rejects blank and bcrypt-truncated temporary passwords', () => {
  assert.equal(validateTemporaryPassword('   ', 'parent'), 'Enter a temporary password.')
  assert.equal(validateTemporaryPassword('a'.repeat(73), 'learner'), 'Temporary password must be no more than 72 bytes.')
})
