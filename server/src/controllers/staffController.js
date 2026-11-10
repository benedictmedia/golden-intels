const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

const normalizeStaffName = value => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase()

const ensureTeacherStaffRecords = async () => {
  const [teachers, staffRecords] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'teacher' },
      select: { name: true, email: true }
    }),
    prisma.staff.findMany({
      where: { source: { in: ['manual', 'account'] } }
    })
  ])
  const staffByEmail = new Map(
    staffRecords
      .filter(member => member.email)
      .map(member => [member.email.trim().toLowerCase(), member])
  )

  for (const teacher of teachers) {
    const emailKey = teacher.email.trim().toLowerCase()
    const linkedStaff = staffByEmail.get(emailKey)
    const nameMatches = staffRecords.filter(member =>
      member.source === 'manual' &&
      !member.email &&
      !member.archivedAt &&
      normalizeStaffName(member.name) === normalizeStaffName(teacher.name)
    )
    if (linkedStaff) {
      if (linkedStaff.archivedAt) continue

      const legacyDuplicate = nameMatches.length === 1 ? nameMatches[0] : null
      const profileData = legacyDuplicate ? {
        staffId: linkedStaff.staffId || legacyDuplicate.staffId || null,
        phone: linkedStaff.phone || legacyDuplicate.phone,
        bio: linkedStaff.bio || legacyDuplicate.bio,
        photo: linkedStaff.photo || legacyDuplicate.photo,
        subject: linkedStaff.subject || legacyDuplicate.subject,
        subjects: linkedStaff.subjects.length ? linkedStaff.subjects : legacyDuplicate.subjects,
        classes: linkedStaff.classes.length ? linkedStaff.classes : legacyDuplicate.classes,
        classTeacherClasses: linkedStaff.classTeacherClasses.length
          ? linkedStaff.classTeacherClasses
          : legacyDuplicate.classTeacherClasses
      } : {}
      if (linkedStaff.name !== teacher.name || linkedStaff.source !== 'account' || legacyDuplicate) {
        const { updatedStaff, archivedAt } = await prisma.$transaction(async transaction => {
          const archivedAt = legacyDuplicate ? new Date() : null
          if (legacyDuplicate) {
            await transaction.staff.update({
              where: { id: legacyDuplicate.id },
              data: {
                staffId: null,
                archivedAt,
                archivedBy: 'system: consolidated with teacher account'
              }
            })
          }
          const updated = await transaction.staff.update({
            where: { id: linkedStaff.id },
            data: { name: teacher.name, source: 'account', ...profileData }
          })
          return { updatedStaff: updated, archivedAt }
        })
        Object.assign(linkedStaff, updatedStaff)
        if (legacyDuplicate) {
          legacyDuplicate.staffId = null
          legacyDuplicate.archivedAt = archivedAt
          legacyDuplicate.archivedBy = 'system: consolidated with teacher account'
        }
      }
      continue
    }

    if (nameMatches.length === 1) {
      const [matchedStaff] = nameMatches
      const updatedStaff = await prisma.staff.update({
        where: { id: matchedStaff.id },
        data: { name: teacher.name, email: teacher.email, role: 'teacher', source: 'account' }
      })
      Object.assign(matchedStaff, updatedStaff)
      staffByEmail.set(emailKey, updatedStaff)
      continue
    }

    const createdStaff = await prisma.staff.create({
      data: {
        name: teacher.name,
        role: 'teacher',
        department: 'Teaching',
        source: 'account',
        email: teacher.email,
        category: 'teaching',
        showOnPublicPage: true
      }
    })
    staffRecords.push(createdStaff)
    staffByEmail.set(emailKey, createdStaff)
  }
}

const getStaff = async (req, res) => {
  try {
    await ensureTeacherStaffRecords()
    const archived = req.query.archived === 'true'
    const staff = await prisma.staff.findMany({
      where: {
        source: { in: ['manual', 'account'] },
        archivedAt: archived ? { not: null } : null
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getStaffAudit = async (req, res) => {
  try {
    const [staffMembers, teacherAccounts] = await Promise.all([
      prisma.staff.findMany({
        where: { source: { in: ['manual', 'account'] } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        where: { role: 'teacher' },
        select: { id: true, name: true, email: true }
      })
    ])

    const rosterByEmail = new Map()
    const rosterWithoutEmail = []
    staffMembers.forEach(member => {
      const emailKey = member.email?.trim().toLowerCase()
      if (!emailKey) {
        rosterWithoutEmail.push(member)
        return
      }

      const existing = rosterByEmail.get(emailKey)
      if (!existing || (member.source === 'account' && existing.source !== 'account')) {
        rosterByEmail.set(emailKey, {
          ...existing,
          ...member,
          staffId: member.staffId || existing?.staffId
        })
      }
    })

    teacherAccounts.forEach(account => {
      const emailKey = account.email.trim().toLowerCase()
      if (!rosterByEmail.has(emailKey)) {
        rosterByEmail.set(emailKey, {
          id: null,
          staffId: null,
          name: account.name,
          role: 'teacher',
          department: 'Teaching',
          subject: null,
          subjects: [],
          classes: [],
          classTeacherClasses: [],
          source: 'account',
          bio: null,
          photo: null,
          email: account.email,
          phone: null,
          category: 'teaching',
          accountId: account.id
        })
      }
    })

    const roster = [...rosterByEmail.values()]
    rosterWithoutEmail.forEach(member => {
      const matchingAccounts = teacherAccounts.filter(account =>
        normalizeStaffName(account.name) === normalizeStaffName(member.name)
      )
      if (matchingAccounts.length !== 1) {
        roster.push(member)
        return
      }

      const teacher = rosterByEmail.get(matchingAccounts[0].email.trim().toLowerCase())
      if (!teacher) {
        roster.push(member)
        return
      }

      Object.assign(teacher, {
        staffId: teacher.staffId || member.staffId,
        phone: teacher.phone || member.phone,
        bio: teacher.bio || member.bio,
        photo: teacher.photo || member.photo,
        subject: teacher.subject || member.subject,
        subjects: teacher.subjects?.length ? teacher.subjects : member.subjects,
        classes: teacher.classes?.length ? teacher.classes : member.classes,
        classTeacherClasses: teacher.classTeacherClasses?.length ? teacher.classTeacherClasses : member.classTeacherClasses
      })
    })
    res.json(roster)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getPublicStaff = async (req, res) => {
  try {
    await ensureTeacherStaffRecords()
    const staff = await prisma.staff.findMany({
      where: { source: { in: ['manual', 'account'] }, showOnPublicPage: true, archivedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        subject: true,
        bio: true,
        photo: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
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

const createStaff = async (req, res) => {
  try {
    const { name, role, department, subject, bio, email, phone, staffId, category, classes, subjects, classTeacherClasses } = req.body
    const parsedClasses = parseArrayField(classes)
    const parsedSubjects = parseArrayField(subjects)
    const parsedClassTeacherClasses = parseArrayField(classTeacherClasses)
    if (role === 'teacher' && parsedClasses.length === 0 && parsedSubjects.length === 0 && parsedClassTeacherClasses.length === 0) {
      return res.status(400).json({ message: 'Teachers must be assigned at least one class, subject, or class-teacher class.' })
    }
    const photo = req.file ? req.file.path : null
    const staff = await prisma.staff.create({
      data: {
        name,
        role,
        department,
        subject: subject || parsedSubjects[0] || null,
        subjects: parsedSubjects,
        classes: parsedClasses,
        classTeacherClasses: parsedClassTeacherClasses,
        source: 'manual',
        bio,
        email,
        phone,
        staffId: typeof staffId === 'string' ? staffId.trim() || null : null,
        category,
        showOnPublicPage: parseBooleanField(req.body.showOnPublicPage, true),
        photo
      }
    })
    res.status(201).json(staff)
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'This staff ID is already in use.' })
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateStaff = async (req, res) => {
  const { id } = req.params
  try {
    const { name, role, department, subject, bio, email, phone, staffId, category, classes, subjects, classTeacherClasses } = req.body
    const existing = await prisma.staff.findUnique({ where: { id: parseInt(id) } })
    if (!existing) return res.status(404).json({ message: 'Staff member not found.' })
    const parsedClasses = parseArrayField(classes)
    const parsedSubjects = parseArrayField(subjects)
    const parsedClassTeacherClasses = parseArrayField(classTeacherClasses)
    if (existing.source !== 'account' && role === 'teacher' && parsedClasses.length === 0 && parsedSubjects.length === 0 && parsedClassTeacherClasses.length === 0) {
      return res.status(400).json({ message: 'Teachers must be assigned at least one class, subject, or class-teacher class.' })
    }
    const photo = req.file ? req.file.path : existing?.photo
    const updateData = {
        name,
        role,
        department,
        subject: subject || parsedSubjects[0] || existing?.subject || null,
        subjects: parsedSubjects,
        classes: parsedClasses,
        classTeacherClasses: parsedClassTeacherClasses,
        source: existing?.source || 'manual',
        bio,
        email,
        phone,
        staffId: typeof staffId === 'string' ? staffId.trim() || null : existing?.staffId || null,
        category,
        showOnPublicPage: parseBooleanField(req.body.showOnPublicPage, existing.showOnPublicPage),
        photo
    }
    const staff = await prisma.$transaction(async transaction => {
      const updated = await transaction.staff.update({
        where: { id: parseInt(id) },
        data: updateData
      })
      if (existing.source === 'account' && existing.email) {
        await transaction.user.updateMany({
          where: { email: existing.email, role: 'teacher' },
          data: { name, email }
        })
      }
      return updated
    })
    res.json(staff)
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'This staff ID is already in use.' })
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const parseBooleanField = (value, fallback) => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return fallback
}

const setStaffVisibility = async (req, res) => {
  try {
    const showOnPublicPage = parseBooleanField(req.body.showOnPublicPage, null)
    if (showOnPublicPage === null) {
      return res.status(400).json({ message: 'showOnPublicPage must be a boolean.' })
    }
    const staff = await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: { showOnPublicPage }
    })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const archiveStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: { archivedAt: new Date(), archivedBy: req.user?.email || req.user?.name || 'admin' }
    })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const restoreStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: { archivedAt: null, archivedBy: null }
    })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteStaff = async (req, res) => {
  const { id } = req.params
  try {
    const staff = await prisma.staff.findUnique({ where: { id: parseInt(id) } })
    if (staff?.photo) {
      const fullPath = path.join(__dirname, '../../', staff.photo)
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    }
    await prisma.staff.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getStaff,
  getStaffAudit,
  getPublicStaff,
  createStaff,
  updateStaff,
  setStaffVisibility,
  archiveStaff,
  restoreStaff,
  deleteStaff
}