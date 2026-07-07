const prisma = require('../config/prismaClient')
const bcrypt = require('bcryptjs')
const { sendMail } = require('../utils/mailer')

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
    const pageSize = Math.min(parseInt(limit) || 10, 100)

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      })
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

    res.json({ users: usersWithTeacherInfo, total, page: pageNum, limit: pageSize })
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
  const { password } = req.body

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Temporary password must be at least 6 characters.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    await prisma.accountAudit.create({
      data: {
        userId: user.id,
        action: 'password_reset_by_admin',
        performedBy: req.user.email,
        details: { email: user.email, role: user.role }
      }
    })

    await sendMail({
      to: user.email,
      subject: 'Your Golden-Intels portal password was reset',
      text: `An administrator reset your portal password. Your temporary password is: ${password}\n\nPlease log in and change it as soon as possible.`,
      html: `
        <p>Hello ${user.name},</p>
        <p>An administrator reset your portal password.</p>
        <p><strong>Temporary password:</strong> ${password}</p>
        <p>Please log in and change it as soon as possible.</p>
      `
    })

    res.json({ message: 'Temporary password set successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
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
  const { id } = req.params
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.active) return res.status(400).json({ message: 'Deactivate account before deleting it' })

    const operations = []
    if (user.role === 'parent') {
      const children = await prisma.student.findMany({ where: { parentEmail: user.email } })
      const studentIds = children.map(s => s.id)
      if (studentIds.length) {
        operations.push(prisma.result.deleteMany({ where: { studentId: { in: studentIds } } }))
        operations.push(prisma.feePayment.deleteMany({ where: { studentId: { in: studentIds } } }))
        operations.push(prisma.attendanceRecord.deleteMany({ where: { studentId: { in: studentIds } } }))
        operations.push(prisma.student.deleteMany({ where: { id: { in: studentIds } } }))
      }
    }
    if (user.role === 'teacher') {
      operations.push(prisma.staff.deleteMany({ where: { email: user.email } }))
    }
    operations.push(prisma.accountAudit.deleteMany({ where: { userId: user.id } }))
    operations.push(prisma.user.delete({ where: { id: user.id } }))

    await prisma.$transaction(operations)
    res.json({ message: 'User deleted and related data cleared' })
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

module.exports = { getUsers, updateUser, resetUserPassword, deactivateUser, reactivateUser, deleteUser, getAccountAudits }
