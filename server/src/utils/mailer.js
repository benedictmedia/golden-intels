const nodemailer = require('nodemailer')
const dns = require('node:dns')
const tls = require('node:tls')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  getSocket(options, callback) {
    dns.promises.resolve4(options.host)
      .then((addresses) => {
        const ipv4Address = addresses[0]
        if (!ipv4Address) {
          throw new Error(`No IPv4 address found for mail server ${options.host}.`)
        }

        const connection = tls.connect({
          host: ipv4Address,
          port: options.port,
          servername: options.host
        })
        const onError = (error) => {
          connection.destroy()
          callback(error)
        }

        connection.once('error', onError)
        connection.once('secureConnect', () => {
          connection.removeListener('error', onError)
          callback(null, { connection, secured: true })
        })
      })
      .catch(callback)
  }
})

const sendWithResend = async ({ to, subject, text, html }) => {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error('EMAIL_FROM must be configured when using Resend.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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

  console.log('✅ Email sent via Resend:', result.id || 'accepted')
  return result
}

const sendMail = async ({ to, subject, text, html, throwOnError = false }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.warn('⚠️ sendMail skipped: no recipient email provided')
    return
  }
  try {
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend({ to, subject, text, html })
    }

    const info = await transporter.sendMail({
      from: `"Golden-Intels International School" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text,
      html
    })
    console.log('✅ Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Failed to send email:', error.message)
    if (throwOnError) throw error
  }
}

module.exports = { sendMail }