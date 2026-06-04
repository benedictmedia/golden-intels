const nodemailer = require('nodemailer')

const buildTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

const sendMail = async ({ to, subject, text, html }) => {
  const recipients = Array.from(new Set((Array.isArray(to) ? to : [to]).filter(Boolean)))
  if (!recipients.length) return { sent: false, reason: 'No recipients' }

  const transport = buildTransport()
  if (!transport) {
    console.warn(`Email not sent because SMTP is not configured. Subject: ${subject}. Recipients: ${recipients.join(', ')}`)
    return { sent: false, reason: 'SMTP not configured' }
  }

  return transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: recipients.join(', '),
    subject,
    text,
    html
  })
}

module.exports = { sendMail }
