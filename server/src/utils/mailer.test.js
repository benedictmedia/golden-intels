const { test } = require('node:test')
const assert = require('node:assert/strict')
const nodemailer = require('nodemailer')
const { sendMail } = require('./mailer')

const originalFetch = global.fetch
const originalCreateTransport = nodemailer.createTransport
const originalResendKey = process.env.RESEND_API_KEY
const originalEmailFrom = process.env.EMAIL_FROM
const originalEmailUser = process.env.EMAIL_USER
const originalEmailPassword = process.env.EMAIL_APP_PASSWORD

test('reports missing provider configuration instead of attempting an anonymous send', async () => {
  delete process.env.RESEND_API_KEY
  delete process.env.EMAIL_FROM
  delete process.env.EMAIL_USER
  delete process.env.EMAIL_APP_PASSWORD

  await assert.rejects(
    sendMail({ to: 'user@example.com', subject: 'Reset', text: 'Reset', throwOnError: true }),
    /No outgoing email provider is configured/
  )
})

test('sends through Resend using configured credentials and sender', async () => {
  process.env.RESEND_API_KEY = 'test-key'
  process.env.EMAIL_FROM = 'Golden-Intels <noreply@example.com>'
  let capturedRequest
  global.fetch = async (url, options) => {
    capturedRequest = { url, options }
    return { ok: true, text: async () => JSON.stringify({ id: 'test-message-id' }) }
  }

  try {
    await sendMail({
      to: 'user@example.com',
      subject: 'Reset',
      text: 'Reset link',
      html: '<p>Reset link</p>',
      throwOnError: true
    })
    assert.equal(capturedRequest.url, 'https://api.resend.com/emails')
    assert.equal(capturedRequest.options.headers.Authorization, 'Bearer test-key')
    assert.deepEqual(JSON.parse(capturedRequest.options.body).to, ['user@example.com'])
  } finally {
    global.fetch = originalFetch
    if (originalResendKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalResendKey
    if (originalEmailFrom === undefined) delete process.env.EMAIL_FROM
    else process.env.EMAIL_FROM = originalEmailFrom
    if (originalEmailUser === undefined) delete process.env.EMAIL_USER
    else process.env.EMAIL_USER = originalEmailUser
    if (originalEmailPassword === undefined) delete process.env.EMAIL_APP_PASSWORD
    else process.env.EMAIL_APP_PASSWORD = originalEmailPassword
  }
})

test('sends through the configured Gmail fallback', async () => {
  delete process.env.RESEND_API_KEY
  process.env.EMAIL_USER = 'school@example.com'
  process.env.EMAIL_APP_PASSWORD = 'test-password'
  let capturedMessage
  nodemailer.createTransport = options => ({
    sendMail: async message => {
      capturedMessage = { options, message }
      return { messageId: 'test-gmail-message-id' }
    }
  })

  try {
    await sendMail({
      to: ['user@example.com'],
      subject: 'Reset',
      text: 'Reset link',
      throwOnError: true
    })
    assert.equal(capturedMessage.options.auth.user, 'school@example.com')
    assert.equal(capturedMessage.message.to, 'user@example.com')
    assert.equal(capturedMessage.message.from, '"Golden-Intels International School" <school@example.com>')
  } finally {
    nodemailer.createTransport = originalCreateTransport
    if (originalResendKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalResendKey
    if (originalEmailUser === undefined) delete process.env.EMAIL_USER
    else process.env.EMAIL_USER = originalEmailUser
    if (originalEmailPassword === undefined) delete process.env.EMAIL_APP_PASSWORD
    else process.env.EMAIL_APP_PASSWORD = originalEmailPassword
  }
})
