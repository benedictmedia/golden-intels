const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prismaClient')
const { sendMail } = require('../utils/mailer')
const { createNotificationsForRole } = require('./notificationController')
const { canonicalStudentClassName } = require('../utils/studentClasses')
const { createParentAccountIfNeeded, createLearnerAccount } = require('../utils/studentAccounts')

// Generate JWT
const generateToken = (id, role, name, email) => {
  return jwt.sign({ id, role, name, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const parseArrayField = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean)
    } catch {
      return value.split(',').map(v => v.trim()).filter(Boolean)
    }
  }
  return []
}

const generateStudentId = async (tx) => {
  const year = new Date().getFullYear()
  let studentId
  let isUnique = false

  while (!isUnique) {
    const count = await tx.student.count()
    const random = Math.floor(Math.random() * 1000)
    const number = String(count + 1 + random).padStart(4, '0')
    studentId = `GI-${year}-${number}`
    const existing = await tx.student.findUnique({ where: { studentId } })
    if (!existing) isUnique = true
  }

  return studentId
}

const buildUserResponse = async (user) => {
  const responseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active
  }

  if (user.role === 'teacher') {
    const accountStaff = await prisma.staff.findFirst({
      where: { email: user.email, source: 'account' },
      orderBy: { createdAt: 'desc' }
    })

    const staff = accountStaff || await prisma.staff.findFirst({
      where: { email: user.email, source: 'manual' },
      orderBy: { createdAt: 'desc' }
    })

    if (staff) {
      responseUser.classes = staff.classes || []
      responseUser.subjects = staff.subjects || []
      responseUser.classTeacherClasses = staff.classTeacherClasses || []
      responseUser.department = staff.department
      responseUser.staffSubject = staff.subject || null
      responseUser.bio = staff.bio || null
      responseUser.phone = staff.phone || null
      responseUser.photo = staff.photo || null
    }
  }

  return responseUser
}

// Register
const register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    subject: teacherSubject,
    classes,
    subjects,
    classTeacherClasses,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    gradeLevel,
    parentEmail,
    parentName,
    parentPhone,
    address
  } = req.body

  try {
    const accountRole = role || 'parent'
    const learnerFirstName = firstName || String(name || '').split(' ')[0] || ''
    const learnerLastName = lastName || String(name || '').split(' ').slice(1).join(' ') || ''

    if (accountRole === 'learner') {
      if (!learnerFirstName || !gender || !gradeLevel) {
        return res.status(400).json({ message: 'Learner first name, gender, and grade level are required.' })
      }
    } else {
      if (!email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' })
      }
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' })
      }
    }

    const hashedPassword = accountRole === 'learner' ? null : await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async (tx) => {
      if (accountRole === 'learner') {
        const studentId = await generateStudentId(tx)
        const parentId = await createParentAccountIfNeeded(tx, {
          email: parentEmail,
          name: parentName
        })
        const learnerAccount = await createLearnerAccount(tx, {
          firstName: learnerFirstName,
          lastName: learnerLastName,
          studentId,
          active: false
        })
        await tx.student.create({
          data: {
            studentId,
            firstName: learnerFirstName,
            lastName: learnerLastName,
            dateOfBirth,
            gender,
            gradeLevel: canonicalStudentClassName(gradeLevel),
            parentId,
            parentName: parentName || `${learnerFirstName} ${learnerLastName}`,
            parentEmail: parentEmail || null,
            parentPhone: parentPhone || null,
            address: address || null,
            email: learnerAccount.email,
            learnerUserId: learnerAccount.id
          }
        })
        return tx.user.findUnique({ where: { id: learnerAccount.id } })
      }

      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: accountRole
        }
      })

      if (createdUser.role === 'teacher') {
        const parsedClasses = parseArrayField(classes)
        const parsedSubjects = parseArrayField(subjects)
        const parsedClassTeacherClasses = parseArrayField(classTeacherClasses)
        const hasTeacherAssignments = parsedClasses.length > 0 || parsedSubjects.length > 0 || parsedClassTeacherClasses.length > 0 || Boolean(teacherSubject)

        if (hasTeacherAssignments) {
          await tx.staff.create({
            data: {
              name,
              role: 'teacher',
              department: department || 'Teaching',
              subject: teacherSubject || parsedSubjects[0] || null,
              subjects: parsedSubjects,
              classes: parsedClasses,
              classTeacherClasses: parsedClassTeacherClasses,
              source: 'account',
              email,
              phone: null,
              category: 'teaching'
            }
          })
        }
      }

      return createdUser
    })

    const responseUser = await buildUserResponse(user)
    if (user.role === 'learner' && !user.active) {
      return res.status(201).json({ user: responseUser })
    }
    const token = generateToken(user.id, user.role, user.name, user.email)
    res.status(201).json({ token, user: responseUser })
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error' })
  }
}

// Login
const login = async (req, res) => {
  const body = req.body || {}
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const { password } = body
  if (!email || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    // Ensure DB is awake before querying
    await prisma.$queryRaw`SELECT 1`

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    // Block login if user is not active
    if (user.active === false) return res.status(403).json({ message: 'Account deactivated' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const token = generateToken(user.id, user.role, user.name, user.email)
    const responseUser = await buildUserResponse(user)
    res.json({ token, user: responseUser })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const responseUser = await buildUserResponse(user)
    res.json(responseUser)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' })
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed }
    })

    await prisma.accountAudit.create({
      data: {
        userId: user.id,
        action: 'password_changed',
        performedBy: user.email,
        details: { email: user.email, role: user.role }
      }
    })
    await createNotificationsForRole(
      'admin',
      'Password changed',
      `${user.name} (${user.email}) changed their portal password.`,
      'account'
    )

    res.json({ message: 'Password changed successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getClientUrl = () => {
  const fallbackUrl = process.env.NODE_ENV === 'production'
    ? 'https://www.goldenintels.edu.gh'
    : 'http://localhost:5173'
  const url = new URL(process.env.CLIENT_URL || process.env.FRONTEND_URL || fallbackUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('CLIENT_URL must use HTTP or HTTPS.')
  }
  return url.origin
}

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character])

const forgotPassword = async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  if (!email) return res.status(400).json({ message: 'Email address is required.' })
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' })
  }

  let resetTokenId
  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })

    if (user && user.active !== false) {
      const token = crypto.randomBytes(32).toString('hex')
      const tokenHash = hashResetToken(token)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      const resetToken = await prisma.passwordResetToken.create({
        data: { tokenHash, userId: user.id, expiresAt }
      })
      resetTokenId = resetToken.id

      const resetUrl = new URL(`/reset-password/${encodeURIComponent(token)}`, getClientUrl()).toString()
      await sendMail({
        to: user.email,
        subject: 'Reset your Golden-Intels portal password',
        text: `Use this link to reset your portal password: ${resetUrl}\n\nThis link expires in 1 hour.`,
        html: `
          <p>Hello ${escapeHtml(user.name)},</p>
          <p>Use the button below to reset your Golden-Intels portal password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Reset password</a></p>
          <p>If the button does not work, copy this link into your browser:</p>
          <p>${resetUrl}</p>
        `,
        throwOnError: true
      })
    }

    res.json({ message: 'If that email is registered, a password reset link has been sent.' })
  } catch (error) {
    if (resetTokenId) {
      try {
        await prisma.passwordResetToken.update({
          where: { id: resetTokenId },
          data: { usedAt: new Date() }
        })
      } catch (cleanupError) {
        console.error('Failed to invalidate unsent password reset token:', cleanupError.message)
      }
    }
    console.error('Password reset request failed:', error.message)
    res.status(503).json({ message: 'Password reset is temporarily unavailable. Please contact school support.' })
  }
}

const resetPassword = async (req, res) => {
  const { token, password } = req.body
  if (typeof token !== 'string' || typeof password !== 'string' || !token || !password) {
    return res.status(400).json({ message: 'Reset token and new password are required.' })
  }
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ message: 'This password reset link is invalid or has expired.' })
  }
  if (password.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' })

  try {
    const tokenHash = hashResetToken(token)
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    })

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This password reset link is invalid or has expired.' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const usedAt = new Date()
    await prisma.$transaction(async tx => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: usedAt } },
        data: { usedAt }
      })
      if (consumed.count !== 1) {
        const error = new Error('This password reset link is invalid or has expired.')
        error.statusCode = 400
        throw error
      }

      await tx.user.update({ where: { id: resetToken.userId }, data: { password: hashed } })
      await tx.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, usedAt: null },
        data: { usedAt }
      })
      await tx.accountAudit.create({
        data: {
          userId: resetToken.userId,
          action: 'password_reset_by_user',
          performedBy: resetToken.user.email,
          details: { email: resetToken.user.email, role: resetToken.user.role }
        }
      })
    })

    try {
      await createNotificationsForRole(
        'admin',
        'Password reset',
        `${resetToken.user.name} (${resetToken.user.email}) reset their portal password.`,
        'account'
      )
    } catch (notificationError) {
      console.error('Password reset completed but the admin notification failed:', notificationError.message)
    }

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }
    console.error('Password reset failed:', error.message)
    res.status(500).json({ message: 'Could not reset the password. Please request a new link.' })
  }
}

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword }
