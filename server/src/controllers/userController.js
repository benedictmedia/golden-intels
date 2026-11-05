const prisma = require('../config/prismaClient')
const bcrypt = require('bcryptjs')
const { sendMail } = require('../utils/mailer')
const { archive } = require('../utils/archive')
const { validateTemporaryPassword } = require('../utils/temporaryPassword')

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character])

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
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

const normalizeOptionalField = (value) => {
  if (value === undefined) return undefined
  if (typeof value === 'string' && value.trim() === '') return null
  return value
}

const getUsers = async (req, res) => {
  try {
    // query params: q, page, limit, role
    const { q = '', page = 1, limit = 10, role } = req.query
    const where = {}
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }]
    if (role) where.role = role

    const pageNum = parseInt(page) || 1
    const showAll = String(limit).toLowerCase() === 'all'
    const pageSize = showAll ? null : Math.min(parseInt(limit) || 10, 100)

    const [total, users, parentTotal, teacherTotal] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...(showAll ? {} : { skip: (pageNum - 1) * pageSize, take: pageSize }),
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where: { role: 'parent' } }),
      prisma.user.count({ where: { role: 'teacher' } })
    ])

    const usersWithTeacherInfo = await Promise.all(users.map(async (user) => {
      if (user.role !== 'teacher') return user

      const teacherInfo = await prisma.staff.findFirst({
        where: { email: user.email, source: 'account' },
        orderBy: { createdAt: 'desc' }
      })

      return {
        ...user,
        teacherInfo: teacherInfo ? {
          ...teacherInfo,
          photo: teacherInfo.photo || null
        } : null
      }
    }))

    res.json({ users: usersWithTeacherInfo, total, page: pageNum, limit: showAll ? 'all' : pageSize, parentTotal, teacherTotal })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { id } = req.params

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!existingUser) return res.status(404).json({ message: 'User not found' })

    const nextName = req.body.name || existingUser.name
    const nextEmail = req.body.email || existingUser.email
    const nextRole = req.body.role || existingUser.role

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name: nextName, email: nextEmail, role: nextRole }
    })

    if (existingUser.role === 'teacher' && nextRole !== 'teacher') {
      await prisma.staff.deleteMany({ where: { email: existingUser.email, source: 'account' } })
    }

    if (nextRole === 'teacher') {
      const parsedClasses = parseArrayField(req.body.classes)
      const parsedSubjects = parseArrayField(req.body.subjects)
      const parsedClassTeacherClasses = parseArrayField(req.body.classTeacherClasses)

      if (parsedClasses.length === 0 && parsedSubjects.length === 0 && parsedClassTeacherClasses.length === 0) {
        return res.status(400).json({ message: 'Teachers must be assigned at least one class, subject, or class-teacher class.' })
      }

      const existingAccountStaff = await prisma.staff.findFirst({
        where: { email: existingUser.email, source: 'account' },
        orderBy: { createdAt: 'desc' }
      })

      const nextSubject = normalizeOptionalField(req.body.subject)
      const nextBio = normalizeOptionalField(req.body.bio)
      const nextPhone = normalizeOptionalField(req.body.phone)

      const staffData = {
        name: nextName,
        role: 'teacher',
        department: req.body.department || existingAccountStaff?.department || 'Teaching',
        subject: nextSubject === undefined ? (existingAccountStaff?.subject ?? null) : nextSubject,
        subjects: parsedSubjects,
        classes: parsedClasses,
        classTeacherClasses: parsedClassTeacherClasses,
        source: 'account',
        bio: nextBio === undefined ? (existingAccountStaff?.bio ?? null) : nextBio,
        email: nextEmail,
        phone: nextPhone === undefined ? (existingAccountStaff?.phone ?? null) : nextPhone,
        category: existingAccountStaff?.category || 'teaching',
        photo: req.file ? req.file.path : existingAccountStaff?.photo || null
      }

      if (existingAccountStaff) {
        await prisma.staff.update({
          where: { id: existingAccountStaff.id },
          data: staffData
        })
      } else {
        await prisma.staff.create({ data: staffData })
      }
    }

    if (existingUser.email !== nextEmail) {
      if (existingUser.role === 'parent') {
        await prisma.student.updateMany({ where: { parentEmail: existingUser.email }, data: { parentEmail: nextEmail } })
      }
      if (existingUser.role === 'teacher') {
        await prisma.staff.updateMany({ where: { email: existingUser.email, source: 'account' }, data: { email: nextEmail } })
      }
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const resetUserPassword = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { id } = req.params
  const { password } = req.body || {}

  try {
    const userId = Number(id)
    if (!Number.isSafeInteger(userId) || userId < 1) return res.status(400).json({ message: 'A valid account ID is required.' })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const passwordError = validateTemporaryPassword(password, user.role)
    if (passwordError) return res.status(400).json({ message: passwordError })

    const hashed = await bcrypt.hash(password, 10)
    await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: user.id }, data: { password: hashed } })
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() }
      })
      await tx.accountAudit.create({
        data: {
          userId: user.id,
          action: 'password_reset_by_admin',
          performedBy: req.user.email,
          details: { email: user.email, role: user.role }
        }
      })
    })

    let emailSent = true
    try {
      await sendMail({
        to: user.email,
        subject: 'Your Golden-Intels portal password was reset',
        text: `An administrator reset your portal password. Your temporary password is: ${password}\n\nPlease log in and change it as soon as possible.`,
        html: `
          <p>Hello ${escapeHtml(user.name)},</p>
          <p>An administrator reset your portal password.</p>
          <p><strong>Temporary password:</strong> ${escapeHtml(password)}</p>
          <p>Please log in and change it as soon as possible.</p>
        `,
        throwOnError: true
      })
    } catch (emailError) {
      emailSent = false
      console.error(`Temporary password was set, but email delivery failed for user ${user.id}:`, emailError.message)
    }

    res.json({
      message: emailSent
        ? 'Temporary password set successfully and sent by email.'
        : 'Temporary password was set, but the email could not be sent. Please give it to the user securely.',
      emailSent
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const resetUserPasswords = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { userIds, password, sendEmail: shouldSendEmail = true } = req.body || {}
  const normalizedUserIds = Array.isArray(userIds)
    ? userIds.map(id => typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id)
    : userIds

  if (!Array.isArray(normalizedUserIds) || normalizedUserIds.length === 0 || normalizedUserIds.length > 100 ||
      normalizedUserIds.some(id => !Number.isSafeInteger(id) || id < 1) ||
      new Set(normalizedUserIds).size !== normalizedUserIds.length) {
    return res.status(400).json({ message: 'Select between 1 and 100 unique accounts.' })
  }
  if (typeof shouldSendEmail !== 'boolean') {
    return res.status(400).json({ message: 'Email delivery preference must be true or false.' })
  }

  try {
    const users = await prisma.user.findMany({
      where: { id: { in: normalizedUserIds } },
      select: { id: true, name: true, email: true, role: true }
    })
    if (users.length !== normalizedUserIds.length) {
      return res.status(404).json({ message: 'One or more selected accounts could not be found. Refresh the list and try again.' })
    }

    if (users.some(user => !['parent', 'learner', 'teacher'].includes(user.role))) {
      return res.status(400).json({ message: 'Admin accounts cannot be included in this reset.' })
    }

    const passwordError = users
      .map(user => validateTemporaryPassword(password, user.role))
      .find(Boolean)
    if (passwordError) return res.status(400).json({ message: passwordError })

    const hashedPassword = await bcrypt.hash(password, 10)
    const resetAt = new Date()
    await prisma.$transaction(async tx => {
      const updates = await Promise.all(users.map(user => tx.user.updateMany({
        where: { id: user.id, role: user.role },
        data: { password: hashedPassword }
      })))
      if (updates.some(result => result.count !== 1)) {
        const error = new Error('The selected accounts changed during the reset. Refresh the list and try again.')
        error.statusCode = 409
        throw error
      }

      await tx.passwordResetToken.updateMany({
        where: { userId: { in: normalizedUserIds }, usedAt: null },
        data: { usedAt: resetAt }
      })
      await tx.accountAudit.createMany({
        data: users.map(user => ({
          userId: user.id,
          action: 'password_reset_by_admin',
          performedBy: req.user.email,
          details: { email: user.email, role: user.role }
        }))
      })
    }, { timeout: 30000 })

    let emailFailures = []
    if (shouldSendEmail) {
      const emailResults = await Promise.allSettled(users.map(user => sendMail({
        to: user.email,
        subject: 'Your Golden-Intels portal password was reset',
        text: `An administrator reset your portal password. Your temporary password is: ${password}\n\nPlease log in and change it as soon as possible.`,
        html: `
          <p>Hello ${escapeHtml(user.name)},</p>
          <p>An administrator reset your portal password.</p>
          <p><strong>Temporary password:</strong> ${escapeHtml(password)}</p>
          <p>Please log in and change it as soon as possible.</p>
        `,
        throwOnError: true
      })))
      emailFailures = users
        .filter((_, index) => emailResults[index].status === 'rejected')
        .map(user => user.email)
    }

    res.json({
      message: shouldSendEmail
        ? emailFailures.length
          ? `Temporary password set for ${users.length} accounts; email delivery failed for ${emailFailures.length}.`
          : `Temporary password set and emailed to ${users.length} accounts.`
        : `Temporary password set for ${users.length} accounts.`,
      updatedCount: users.length,
      emailFailures,
      users
    })
  } catch (error) {
    console.error('Bulk temporary password reset failed:', error.message)
    res.status(error.statusCode || 500).json({
      message: error.statusCode === 409
        ? error.message
        : 'Could not reset the selected passwords. Refresh the account list and try again.'
    })
  }
}

const deactivateUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { email } = req.body
  try {
    const user = await prisma.user.update({ where: { email }, data: { active: false } })
    // create audit
    await prisma.accountAudit.create({ data: { userId: user.id, action: 'deactivate', performedBy: req.user.email, details: { email } } })
    res.json({ message: 'User deactivated', email })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const reactivateUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { email } = req.body
  try {
    const user = await prisma.user.update({ where: { email }, data: { active: true } })
    await prisma.accountAudit.create({ data: { userId: user.id, action: 'reactivate', performedBy: req.user.email, details: { email } } })
    res.json({ message: 'User reactivated', email })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  if (req.body?.confirm !== true) return res.status(400).json({ message: 'Explicit confirmation is required.' })
  const { id } = req.params
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(400).json({ message: 'Administrator accounts cannot be deleted here.' })

    await prisma.$transaction(async tx => {
      if (user.role === 'parent') {
        const children = await tx.student.findMany({
          where: { OR: [{ parentEmail: user.email }, { parentId: user.id }] },
          include: {
            results: true, feePayments: true, attendance: true, manualExercises: true,
            classworkSubmissions: { include: { classworkItem: true } },
            admissionApplication: true
          }
        })
        for (const child of children) {
          if (child.archivedAt) continue
          const messages = await tx.message.findMany({ where: { conversationUserId: child.id } })
          await archive(tx, {
            entityType: 'student', entityId: child.id, studentId: child.id,
            title: `${child.firstName} ${child.lastName}`.trim(),
            academicYear: child.academicYear || null, term: null,
            reason: 'parent-account-deleted',
            payload: JSON.parse(JSON.stringify({ student: child, messages, previousStatus: child.status || 'active' })),
            archivedBy: req.user.name || req.user.email
          })
          await tx.student.update({
            where: { id: child.id },
            data: { archivedAt: new Date(), status: 'archived', parentId: null, parentEmail: null }
          })
        }
      }
      const accountAudits = await tx.accountAudit.findMany({ where: { userId: user.id } })
      const teacherStaff = user.role === 'teacher'
        ? await tx.staff.findMany({ where: { email: user.email } })
        : []
      if (user.role === 'parent' || user.role === 'teacher') {
        await archive(tx, {
          entityType: user.role,
          entityId: user.id,
          title: user.name,
          academicYear: null,
          term: null,
          reason: 'account-deleted',
          payload: JSON.parse(JSON.stringify({ user, staff: teacherStaff, accountAudits })),
          archivedBy: req.user.name || req.user.email
        })
      }
      if (user.role === 'parent') {
        await tx.student.updateMany({
          where: { OR: [{ parentEmail: user.email }, { parentId: user.id }] },
          data: { parentId: null, parentEmail: null }
        })
      }
      if (user.role === 'teacher') await tx.staff.deleteMany({ where: { email: user.email } })
      await tx.accountAudit.deleteMany({ where: { userId: user.id } })
      await tx.user.delete({ where: { id: user.id } })
    })
    res.json({ message: 'Account and related records moved to the archive.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAccountAudits = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  try {
    const { userId, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const pageSize = Math.min(parseInt(limit) || 20, 200)
    const where = {}
    if (userId) where.userId = parseInt(userId)
    const [total, audits] = await Promise.all([
      prisma.accountAudit.count({ where }),
      prisma.accountAudit.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * pageSize, take: pageSize })
    ])
    res.json({ audits, total, page: pageNum, limit: pageSize })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getUsers, updateUser, resetUserPassword, resetUserPasswords, deactivateUser, reactivateUser, deleteUser, getAccountAudits }
