const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
})

const sendMail = async ({ to, subject, text, html }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.warn('⚠️ sendMail skipped: no recipient email provided')
    return
  }
  try {
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
    // Don't throw — a failed email should never block admission approval
  }
}

module.exports = { sendMail }