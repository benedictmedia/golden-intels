const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { isStudentFeeCleared } = require('../utils/feeStatus')
const { archive, isPreviousAcademicPeriod, isAcademicPeriodVisible } = require('../utils/archive')
const { canonicalStudentClassName, normalizeStudentClassName, studentClassNameVariants } = require('../utils/studentClasses')

const normalizeClassName = normalizeStudentClassName
const normalizeClassList = (classes = []) => (classes || []).map(normalizeClassName).filter(Boolean)

const getAttendance = async (req, res) => {
  try {
    const { date, gradeLevel, academicYear, term } = req.query
    if (req.user?.role !== 'admin' && !await isAcademicPeriodVisible(prisma, academicYear, term)) {
      return res.status(403).json({ message: 'Upcoming attendance periods are visible to administrators only.' })
    }
    const where = {}
    if (date) where.date = date
    if (gradeLevel) where.gradeLevel = { in: studentClassNameVariants(gradeLevel), mode: 'insensitive' }
    if (academicYear) where.academicYear = academicYear
    if (term) where.term = term
    // If parent, restrict to their children
    if (req.user && req.user.role === 'parent') {
      const children = await prisma.student.findMany({
        where: { archivedAt: null, OR: [{ parentEmail: req.user.email }, { parentId: req.user.id }] },
        select: { id: true }
      })
      const clearedIds = []
      for (const child of children) {
        if (await isStudentFeeCleared(child.id)) clearedIds.push(child.id)
      }
      where.studentId = { in: clearedIds }
      const records = await prisma.attendanceRecord.findMany({ where, include: { student: true }, orderBy: { createdAt: 'desc' } })
      return res.json(records)
    }

    // If teacher, restrict to their class-teacher classes or records they recorded
    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const classTeacherClasses = normalizeClassList(staff?.classTeacherClasses)
      const records = await prisma.attendanceRecord.findMany({ where, include: { student: true }, orderBy: { createdAt: 'desc' } })
      const filteredRecords = records.filter(record => classTeacherClasses.includes(normalizeClassName(record.gradeLevel)) || record.recordedBy === req.user.name)
      return res.json(filteredRecords)
    }

    const records = await prisma.attendanceRecord.findMany({ where, include: { student: true }, orderBy: { createdAt: 'desc' } })
    res.json(records)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params
  try {
    // If parent, ensure the requested student belongs to them
    if (req.user && req.user.role === 'parent') {
      const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
      if (!student || student.archivedAt || (student.parentEmail !== req.user.email && student.parentId !== req.user.id)) return res.status(403).json({ message: 'Forbidden' })
      // Fees outstanding for this child: withhold attendance records entirely.
      const cleared = await isStudentFeeCleared(studentId)
      if (!cleared) return res.json([])
    }
    if (req.user && req.user.role === 'teacher') {
      const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const classTeacherClasses = normalizeClassList(staff?.classTeacherClasses)
      const allowedByClass = classTeacherClasses.includes(normalizeClassName(student?.gradeLevel))
      if (!allowedByClass) return res.status(403).json({ message: 'Forbidden' })
    }
    const { academicYear, term } = req.query
    if (req.user?.role !== 'admin' && !await isAcademicPeriodVisible(prisma, academicYear, term)) {
      return res.status(403).json({ message: 'Upcoming attendance periods are visible to administrators only.' })
    }
    const where = { studentId: parseInt(studentId) }
    if (academicYear) where.academicYear = academicYear
    if (term) where.term = term

    const records = await prisma.attendanceRecord.findMany({ where, include: { student: true }, orderBy: { date: 'desc' } })
    res.json(records)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const saveAttendance = async (req, res) => {
  const { records, date, dates, gradeLevel, recordedBy } = req.body
  try {
    if (!['admin', 'teacher'].includes(req.user?.role)) return res.status(403).json({ message: 'Only teachers and administrators can record attendance.' })
    const { academicYear, term } = req.body
    const isBulkBackfill = Array.isArray(dates)
    const targetDates = isBulkBackfill ? Array.from(new Set(dates)) : [date]
    const isValidDate = value => {
      if (typeof value !== 'string') return false
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
      if (!match) return false
      const [, yearText, monthText, dayText] = match
      const parsed = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)))
      return parsed.getUTCFullYear() === Number(yearText) &&
        parsed.getUTCMonth() === Number(monthText) - 1 &&
        parsed.getUTCDate() === Number(dayText)
    }
    if (
      !Array.isArray(records) ||
      !records.length ||
      !targetDates.length ||
      targetDates.some(targetDate => !isValidDate(targetDate)) ||
      records.some(record => !record || typeof record !== 'object' || Array.isArray(record))
    ) {
      return res.status(400).json({ message: 'Choose at least one valid attendance date and learner record.' })
    }
    const validStatuses = new Set(['present', 'late', 'absent', 'absent_permission', 'absent_without_permission'])
    const studentIds = records.map(record => Number(record.studentId))
    if (records.some((record, index) => (
      !Number.isInteger(studentIds[index]) ||
      !validStatuses.has(record.status)
    ))) {
      return res.status(400).json({ message: 'Each learner must have a valid ID and attendance status.' })
    }

    const isPrevious = await isPreviousAcademicPeriod(prisma, academicYear, term)
    if (isPrevious && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Previous-term attendance is read-only. Contact an administrator to correct it.' })
    }
    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const classTeacherClasses = normalizeClassList(staff?.classTeacherClasses)
      const normalizedGradeLevel = normalizeClassName(gradeLevel)
      const allowed = classTeacherClasses.includes(normalizedGradeLevel)

      if (!allowed) {
        return res.status(403).json({ message: 'Forbidden: You may only record attendance for classes where you are assigned as class teacher.' })
      }
    }

    if (isBulkBackfill) {
      if (new Set(studentIds).size !== studentIds.length) {
        return res.status(400).json({ message: 'A learner can only be included once per bulk attendance update.' })
      }
      const eligibleStudents = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          archivedAt: null,
          gradeLevel: { in: studentClassNameVariants(gradeLevel), mode: 'insensitive' }
        },
        select: { id: true }
      })
      if (eligibleStudents.length !== studentIds.length) {
        return res.status(400).json({ message: 'One or more selected learners are not in this active class.' })
      }
    }

    const where = {
      gradeLevel: { in: studentClassNameVariants(gradeLevel), mode: 'insensitive' },
      ...(academicYear ? { academicYear } : {}),
      ...(term ? { term } : {})
    }
    const createdCount = await prisma.$transaction(async tx => {
      let totalCreated = 0
      for (const targetDate of targetDates) {
        const dateWhere = { ...where, date: targetDate }
        if (isBulkBackfill) dateWhere.studentId = { in: records.map(record => Number(record.studentId)) }
        const oldRecords = await tx.attendanceRecord.findMany({ where: dateWhere })
        if (isPrevious && req.user?.role === 'admin') {
          for (const oldRecord of oldRecords) {
            await archive(tx, {
              entityType: 'attendanceRecord', entityId: oldRecord.id, studentId: oldRecord.studentId,
              title: `Attendance: ${oldRecord.date} (${oldRecord.gradeLevel})`,
              academicYear: oldRecord.academicYear, term: oldRecord.term,
              reason: 'admin-replaced-historical-attendance',
              payload: JSON.parse(JSON.stringify(oldRecord)),
              archivedBy: req.user.name || req.user.email
            })
          }
        }
        await tx.attendanceRecord.deleteMany({ where: dateWhere })
        const created = await tx.attendanceRecord.createMany({
          data: records.map(record => ({
            studentId: Number(record.studentId),
            date: targetDate,
            status: record.status,
            gradeLevel: canonicalStudentClassName(gradeLevel),
            recordedBy,
            academicYear: academicYear || null,
            term: term || null
          })),
          skipDuplicates: true
        })
        totalCreated += created.count
      }
      return totalCreated
    })
    res.json({ message: 'Attendance saved', count: createdCount })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAttendanceSummary = async (req, res) => {
  const { studentId } = req.params
  try {
    // If parent, ensure the requested student belongs to them
    if (req.user && req.user.role === 'parent') {
      const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
      if (!student || student.archivedAt || (student.parentEmail !== req.user.email && student.parentId !== req.user.id)) return res.status(403).json({ message: 'Forbidden' })
      const cleared = await isStudentFeeCleared(studentId)
      if (!cleared) return res.json({ total: 0, present: 0, absent: 0, absentOnPermission: 0, absentWithoutPermission: 0, late: 0, percentage: 0, records: [], feeLocked: true })
    }

    if (req.user && req.user.role === 'teacher') {
      const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const classTeacherClasses = normalizeClassList(staff?.classTeacherClasses)
      const allowedByClass = classTeacherClasses.includes(normalizeClassName(student?.gradeLevel))
      if (!allowedByClass) return res.status(403).json({ message: 'Forbidden' })
    }

    const { academicYear, term } = req.query
    const where = { studentId: parseInt(studentId) }
    if (academicYear) where.academicYear = academicYear
    if (term) where.term = term

    const records = await prisma.attendanceRecord.findMany({ where })
    const total = records.length
    const present = records.filter(r => r.status === 'present').length
    const absentOnPermission = records.filter(r => r.status === 'absent_permission').length
    const absentWithoutPermission = records.filter(r => r.status === 'absent_without_permission' || r.status === 'absent').length
    const absent = absentOnPermission + absentWithoutPermission
    const late = records.filter(r => r.status === 'late').length
    // Late counts as present for percentage calculation
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    res.json({ total, present, absent, absentOnPermission, absentWithoutPermission, late, percentage, records })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAttendance, getStudentAttendance, saveAttendance, getAttendanceSummary }