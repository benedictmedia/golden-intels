const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { isStudentFeeCleared } = require('../utils/feeStatus')
const { archive, isPreviousAcademicPeriod, isAcademicPeriodVisible } = require('../utils/archive')

const normalizeClassName = (value) => String(value ?? '').trim().toLowerCase()
const normalizeClassList = (classes = []) => (classes || []).map(normalizeClassName).filter(Boolean)

const getAttendance = async (req, res) => {
  try {
    const { date, gradeLevel, academicYear, term } = req.query
    if (req.user?.role !== 'admin' && !await isAcademicPeriodVisible(prisma, academicYear, term)) {
      return res.status(403).json({ message: 'Upcoming attendance periods are visible to administrators only.' })
    }
    const where = {}
    if (date) where.date = date
    if (gradeLevel) where.gradeLevel = gradeLevel
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
  const { records, date, gradeLevel, recordedBy } = req.body
  try {
    if (!['admin', 'teacher'].includes(req.user?.role)) return res.status(403).json({ message: 'Only teachers and administrators can record attendance.' })
    const { academicYear, term } = req.body
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

    const where = {
      date,
      gradeLevel,
      ...(academicYear ? { academicYear } : {}),
      ...(term ? { term } : {})
    }
    const created = await prisma.$transaction(async tx => {
      const oldRecords = await tx.attendanceRecord.findMany({ where })
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
      await tx.attendanceRecord.deleteMany({ where })
      return tx.attendanceRecord.createMany({
        data: records.map(r => ({
          studentId: parseInt(r.studentId), date, status: r.status, gradeLevel, recordedBy,
          academicYear: academicYear || null, term: term || null
        })),
        skipDuplicates: true
      })
    })
    res.json({ message: 'Attendance saved', count: created.count })
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