const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const normalizeClassName = (value) => String(value ?? '').trim().toLowerCase()
const normalizeClassList = (classes = []) => (classes || []).map(normalizeClassName).filter(Boolean)

const getAttendance = async (req, res) => {
  try {
    const { date, gradeLevel } = req.query
    const where = {}
    if (date) where.date = date
    if (gradeLevel) where.gradeLevel = gradeLevel
    // If parent, restrict to their children
    if (req.user && req.user.role === 'parent') {
      const children = await prisma.student.findMany({ where: { parentEmail: req.user.email }, select: { id: true } })
      const ids = children.map(c => c.id)
      where.studentId = { in: ids }
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
      if (!student || student.parentEmail !== req.user.email) return res.status(403).json({ message: 'Forbidden' })
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

    const records = await prisma.attendanceRecord.findMany({ where, include: { student: true }, orderBy: { date: 'desc' } })
    res.json(records)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const saveAttendance = async (req, res) => {
  const { records, date, gradeLevel, recordedBy } = req.body
  try {
    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const classTeacherClasses = normalizeClassList(staff?.classTeacherClasses)
      const normalizedGradeLevel = normalizeClassName(gradeLevel)
      const allowed = classTeacherClasses.includes(normalizedGradeLevel)

      if (!allowed) {
        return res.status(403).json({ message: 'Forbidden: You may only record attendance for classes where you are assigned as class teacher.' })
      }
    }

    // Delete existing records for this date, class, and same term/year only
    const { academicYear, term } = req.body
    await prisma.attendanceRecord.deleteMany({
      where: {
        date,
        gradeLevel,
        ...(academicYear ? { academicYear } : {}),
        ...(term ? { term } : {})
      }
    })
    // Create new records
    const created = await prisma.attendanceRecord.createMany({
      data: records.map(r => ({
        studentId: parseInt(r.studentId),
        date,
        status: r.status,
        gradeLevel,
        recordedBy,
        academicYear: academicYear || null,
        term: term || null
      })),
      skipDuplicates: true
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
      if (!student || student.parentEmail !== req.user.email) return res.status(403).json({ message: 'Forbidden' })
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
    const absent = records.filter(r => r.status === 'absent').length
    const late = records.filter(r => r.status === 'late').length
    // Late counts as present for percentage calculation
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    res.json({ total, present, absent, late, percentage, records })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAttendance, getStudentAttendance, saveAttendance, getAttendanceSummary }