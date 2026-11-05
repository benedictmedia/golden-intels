const { test } = require('node:test')
const assert = require('node:assert/strict')
const passwordResetRateLimit = require('./passwordResetRateLimit')

test('limits repeated reset requests for the same email without exposing account status', () => {
  const email = `reset-limit-${Date.now()}@example.com`
  const req = { body: { email } }
  let responseStatus = 200
  let responseBody
  let retryAfter
  const res = {
    set: (name, value) => {
      if (name === 'Retry-After') retryAfter = value
    },
    status: status => {
      responseStatus = status
      return res
    },
    json: body => {
      responseBody = body
      return res
    }
  }
  let passed = 0

  for (let index = 0; index < 3; index += 1) {
    passwordResetRateLimit(req, res, () => { passed += 1 })
  }
  passwordResetRateLimit(req, res, () => { passed += 1 })

  assert.equal(passed, 3)
  assert.equal(responseStatus, 429)
  assert.equal(typeof retryAfter, 'string')
  assert.match(responseBody.message, /wait before requesting another/)
})
