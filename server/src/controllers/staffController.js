const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

const getStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { source: 'manual' },
      orderBy: { createdAt: 'desc' }
    })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const normalizeStaffName = value => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase()

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

const importStaff = async (req, res) => {
  const { staff } = req.body || {}
  if (!Array.isArray(staff) || staff.length === 0) {
    return res.status(400).json({ message: 'The import must contain at least one staff row.' })
  }
  if (staff.length > 1000) {
    return res.status(400).json({ message: 'Import no more than 1,000 staff rows at a time.' })
  }

  const result = { created: 0, updated: 0, errors: [] }
  const rowsByStaffId = new Map()
  const rowsByName = new Map()
  staff.forEach((row, index) => {
    const staffId = String(row?.staffId ?? '').trim().toLowerCase()
    if (staffId) {
      const rows = rowsByStaffId.get(staffId) || []
      rows.push(Number.isInteger(row?.rowNumber) ? row.rowNumber : index + 2)
      rowsByStaffId.set(staffId, rows)
    }
    const nameKey = normalizeStaffName(row?.name)
    if (nameKey) {
      const rows = rowsByName.get(nameKey) || []
      rows.push(Number.isInteger(row?.rowNumber) ? row.rowNumber : index + 2)
      rowsByName.set(nameKey, rows)
    }
  })

  try {
    const [existingStaff, teacherAccounts] = await Promise.all([
      prisma.staff.findMany({ where: { source: { in: ['manual', 'account'] } } }),
      prisma.user.findMany({ where: { role: 'teacher' }, select: { id: true, name: true, email: true } })
    ])

    for (const [index, row] of staff.entries()) {
      const rowNumber = Number.isInteger(row?.rowNumber) ? row.rowNumber : index + 2
      const name = typeof row?.name === 'string' ? row.name.trim().replace(/\s+/g, ' ') : ''
      const staffId = typeof row?.staffId === 'string' ? row.staffId.trim() : ''
      if (!name || !staffId) {
        result.errors.push({ row: rowNumber, message: 'STAFF NAME and STAFF ID are required.' })
        continue
      }
      if ((rowsByStaffId.get(staffId.toLowerCase()) || []).length > 1) {
        result.errors.push({ row: rowNumber, staffId, message: 'This STAFF ID appears more than once in the CSV; all rows with this ID were skipped.' })
        continue
      }

      const idMatches = existingStaff.filter(member => member.staffId?.toLowerCase() === staffId.toLowerCase())
      if (idMatches.length > 1) {
        result.errors.push({ row: rowNumber, staffId, message: 'This STAFF ID matches multiple existing records. Ask an administrator to resolve the duplicate IDs.' })
        continue
      }
      if (!idMatches.length && (rowsByName.get(normalizeStaffName(name)) || []).length > 1) {
        result.errors.push({ row: rowNumber, staffId, message: 'This STAFF NAME appears more than once in the CSV and cannot safely be matched by name. Import each record separately or use existing STAFF IDs.' })
        continue
      }

      let existing = idMatches[0] || null
      const nameMatches = existingStaff.filter(member =>
        normalizeStaffName(member.name) === normalizeStaffName(name)
      )
      let teacherAccount = existing?.email
        ? teacherAccounts.find(account => account.email.toLowerCase() === existing.email.toLowerCase())
        : null
      let duplicateManualStaff = existing?.source === 'manual' ? existing : null

      if (!teacherAccount) {
        const namesToMatch = existing ? [existing.name, name] : [name]
        const matchingTeachers = teacherAccounts.filter(account =>
          namesToMatch.some(candidateName =>
            normalizeStaffName(account.name) === normalizeStaffName(candidateName)
          )
        )
        const uniqueMatchingTeachers = [...new Map(matchingTeachers.map(account => [account.id, account])).values()]
        if (uniqueMatchingTeachers.length > 1) {
          result.errors.push({ row: rowNumber, staffId, message: 'This name matches multiple teacher accounts. Use a unique STAFF ID or ask an administrator to resolve the duplicate names.' })
          continue
        }
        teacherAccount = uniqueMatchingTeachers[0] || null
      }

      if (!existing && teacherAccount) {
        const matchingStaff = existingStaff.filter(member =>
          normalizeStaffName(member.name) === normalizeStaffName(teacherAccount.name)
        )
        const accountStaff = matchingStaff.find(member =>
          member.source === 'account' && member.email?.toLowerCase() === teacherAccount.email.toLowerCase()
        )
        const unlinkedStaff = matchingStaff.filter(member =>
          member.source === 'manual' && !member.email
        )
        if (unlinkedStaff.length > 1) {
          result.errors.push({ row: rowNumber, staffId, message: 'Multiple unlinked staff records have this teacher name. Use an existing STAFF ID or ask an administrator to resolve the duplicate records.' })
          continue
        }
        duplicateManualStaff = unlinkedStaff[0] || duplicateManualStaff
        existing = accountStaff || unlinkedStaff[0] || null
      } else if (!existing && !teacherAccount) {
        if (nameMatches.length > 1) {
          result.errors.push({ row: rowNumber, staffId, message: 'This name matches multiple existing staff records. Use an existing STAFF ID to update the correct record.' })
          continue
        }
        existing = nameMatches[0] || null
      }

      try {
        if (teacherAccount) {
          const accountStaff = existingStaff.find(member =>
            member.source === 'account' && member.email?.toLowerCase() === teacherAccount.email.toLowerCase()
          )
          const unlinkedStaff = duplicateManualStaff || (existing?.source === 'manual' ? existing : null)
          await prisma.$transaction(async tx => {
            let targetStaff
            if (accountStaff) {
              const profileData = {
                name,
                staffId,
                bio: accountStaff.bio || unlinkedStaff?.bio,
                photo: accountStaff.photo || unlinkedStaff?.photo,
                phone: accountStaff.phone || unlinkedStaff?.phone,
                subject: accountStaff.subject || unlinkedStaff?.subject,
                subjects: accountStaff.subjects.length ? accountStaff.subjects : unlinkedStaff?.subjects || [],
                classes: accountStaff.classes.length ? accountStaff.classes : unlinkedStaff?.classes || [],
                classTeacherClasses: accountStaff.classTeacherClasses.length ? accountStaff.classTeacherClasses : unlinkedStaff?.classTeacherClasses || []
              }
              if (unlinkedStaff) await tx.staff.delete({ where: { id: unlinkedStaff.id } })
              targetStaff = await tx.staff.update({ where: { id: accountStaff.id }, data: profileData })
            } else if (unlinkedStaff) {
              targetStaff = await tx.staff.update({
                where: { id: unlinkedStaff.id },
                data: {
                  name,
                  staffId,
                  email: teacherAccount.email,
                  role: 'teacher',
                  department: unlinkedStaff.department || 'Teaching',
                  source: 'account',
                  category: unlinkedStaff.category || 'teaching'
                }
              })
            } else {
              targetStaff = await tx.staff.create({
                data: {
                  name,
                  staffId,
                  role: 'teacher',
                  department: 'Teaching',
                  source: 'account',
                  email: teacherAccount.email,
                  category: 'teaching'
                }
              })
            }
            if (teacherAccount.name !== name) {
              await tx.user.update({ where: { id: teacherAccount.id }, data: { name } })
            }
            return targetStaff
          })
          if (accountStaff) Object.assign(accountStaff, { name, staffId })
          else if (unlinkedStaff) Object.assign(unlinkedStaff, { name, staffId, source: 'account', email: teacherAccount.email, role: 'teacher' })
          else existingStaff.push({ name, staffId, source: 'account', email: teacherAccount.email, role: 'teacher' })
          if (unlinkedStaff && accountStaff) {
            const manualIndex = existingStaff.findIndex(member => member.id === unlinkedStaff.id)
            if (manualIndex >= 0) existingStaff.splice(manualIndex, 1)
          }
          teacherAccount.name = name
          result.updated += 1
        } else if (existing) {
          const updated = await prisma.staff.update({
            where: { id: existing.id },
            data: { name, staffId }
          })
          Object.assign(existing, updated)
          result.updated += 1
        } else {
          await prisma.staff.create({
            data: {
              name,
              staffId,
              role: 'staff',
              department: 'General',
              source: 'manual',
              category: 'support'
            }
          })
          result.created += 1
        }
      } catch (error) {
        if (error.code === 'P2002') {
          result.errors.push({ row: rowNumber, staffId, message: 'This STAFF ID is already in use.' })
          continue
        }
        result.errors.push({ row: rowNumber, staffId, message: error.message || 'This row could not be imported.' })
      }
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Could not load staff records for import.', error: error.message })
  }
}

const getPublicStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        source: 'manual',
        department: { equals: 'Leadership & Management', mode: 'insensitive' }
      },
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
    const parsedClasses = parseArrayField(classes)
    const parsedSubjects = parseArrayField(subjects)
    const parsedClassTeacherClasses = parseArrayField(classTeacherClasses)
    if (role === 'teacher' && parsedClasses.length === 0 && parsedSubjects.length === 0 && parsedClassTeacherClasses.length === 0) {
      return res.status(400).json({ message: 'Teachers must be assigned at least one class, subject, or class-teacher class.' })
    }
    const photo = req.file ? req.file.path : existing?.photo
    const staff = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: {
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
        photo
      }
    })
    res.json(staff)
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'This staff ID is already in use.' })
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

module.exports = { getStaff, getStaffAudit, importStaff, getPublicStaff, createStaff, updateStaff, deleteStaff }