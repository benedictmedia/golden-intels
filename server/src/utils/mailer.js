const sendWithGmailApi = async ({ to, subject, text, html }) => {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN
  const user = (process.env.GMAIL_USER || 'goldenintelse@gmail.com').trim().toLowerCase()

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail API is not fully configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN.')
  }
  if (user !== 'goldenintelse@gmail.com') {
    throw new Error('GMAIL_USER must be the authorized school mailbox.')
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })

  const tokenBody = await tokenResponse.json().catch(() => ({}))
  if (!tokenResponse.ok || !tokenBody.access_token) {
    const reason = tokenBody.error_description || tokenBody.error || ('HTTP ' + tokenResponse.status)
    throw new Error('Google OAuth token refresh failed: ' + reason)
  }

  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean)
  if (!recipients.length) throw new Error('At least one email recipient is required.')

  const boundary = 'goldenintels_' + require('crypto').randomBytes(12).toString('hex')
  const encodePart = (value) => Buffer.from(String(value || ''), 'utf8').toString('base64').replace(/.{1,76}/g, '$&\r\n').trim()
  const safeHeader = (value) => String(value || '').replace(/[\r\n]+/g, ' ').trim()
  const mime = [
    'From: Golden-Intels International School <' + user + '>',
    'To: ' + recipients.map(safeHeader).join(', '),
    'Subject: ' + safeHeader(subject),
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodePart(text),
    '--' + boundary,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodePart(html || text),
    '--' + boundary + '--',
    ''
  ].join('\r\n')

  const raw = Buffer.from(mime, 'utf8').toString('base64url')
  const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: {
      Authorization: 'Bearer ' + tokenBody.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  })

  const sendBody = await sendResponse.json().catch(() => ({}))
  if (!sendResponse.ok || !sendBody.id) {
    const reason = (sendBody.error && sendBody.error.message) || sendBody.error_description || ('HTTP ' + sendResponse.status)
    throw new Error('Gmail API send failed: ' + reason)
  }

  console.log('Password-reset email accepted by Gmail API.')
  return { id: sendBody.id }
}

const sendWithResend = async ({ to, subject, text, html }) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    throw new Error('No email provider is configured. Configure Gmail API OAuth credentials.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: 'Bearer ' + apiKey,
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
    const details = result.message || result.name || ('HTTP ' + response.status)
    throw new Error('Resend email API failed: ' + details)
  }

  console.log('Email sent via Resend fallback:', result.id || 'accepted')
  return result
}

const sendMail = async ({ to, subject, text, html, throwOnError = false }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.warn('sendMail skipped: no recipient email provided')
    return
  }
  try {
    const gmailConfigured = Boolean(
      process.env.GMAIL_CLIENT_ID ||
      process.env.GMAIL_CLIENT_SECRET ||
      process.env.GMAIL_REFRESH_TOKEN
    )
    if (gmailConfigured) {
      return await sendWithGmailApi({ to, subject, text, html })
    }
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend({ to, subject, text, html })
    }
    throw new Error('No email provider is configured. Configure Gmail API OAuth credentials.')
  } catch (error) {
    console.error('Failed to send email:', error.message)
    if (throwOnError) throw error
  }
}

module.exports = { sendMail }
