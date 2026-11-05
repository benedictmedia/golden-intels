const nodemailer = require('nodemailer')

const sendWithResend = async ({ to, subject, text, html }) => {
  const { RESEND_API_KEY: apiKey, EMAIL_FROM: from } = process.env
  if (!apiKey || !from) {
    throw new Error('Resend email requires both RESEND_API_KEY and EMAIL_FROM to be configured.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html
    })
  })

  const responseText = await response.text()
  let result
  try {
    result = responseText ? JSON.parse(responseText) : {}
  } catch {
    result = { message: responseText }
  }

  if (!response.ok) {
    const details = result.message || result.name || `HTTP ${response.status}`
    throw new Error(`Resend email API failed: ${details}`)
  }

  console.log('Email sent via Resend:', result.id || 'accepted')
  return result
}

const sendWithGmail = async ({ to, subject, text, html }) => {
  const { EMAIL_USER: user, EMAIL_APP_PASSWORD: pass } = process.env
  if (!user || !pass) {
    throw new Error('No outgoing email provider is configured. Set RESEND_API_KEY and EMAIL_FROM, or EMAIL_USER and EMAIL_APP_PASSWORD.')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  })

  const info = await transporter.sendMail({
    from: `"Golden-Intels International School" <${user}>`,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    text,
    html
  })
  console.log('Email sent:', info.messageId)
  return info
}

const sendMail = async ({ to, subject, text, html, throwOnError = false }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.warn('sendMail skipped: no recipient email provided')
    return
  }
  try {
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend({ to, subject, text, html })
    }
    return await sendWithGmail({ to, subject, text, html })
  } catch (error) {
    console.error('Failed to send email:', error.message)
    if (throwOnError) throw error
  }
}

module.exports = { sendMail }
