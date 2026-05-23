const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

    // If teacher, restrict to their assigned classes or records they recorded
    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const teacherWhere = { ...where }
      if (staff?.classes?.length) teacherWhere.OR = [{ gradeLevel: { in: staff.classes } }, { recordedBy: req.user.name }]
      else if (staff?.department) teacherWhere.OR = [{ gradeLevel: staff.department }, { recordedBy: req.user.name }]
      else teacherWhere.recordedBy = req.user.name
      const records = await prisma.attendanceRecord.findMany({ where: teacherWhere, include: { student: true }, orderBy: { createdAt: 'desc' } })
      return res.json(records)
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
      const allowedByClass = staff?.classes?.includes(student?.gradeLevel) || staff?.department === student?.gradeLevel
      if (!allowedByClass) return res.status(403).json({ message: 'Forbidden' })
    }
    const records = await prisma.attendanceRecord.findMany({ where: { studentId: parseInt(studentId) }, include: { student: true }, orderBy: { date: 'desc' } })
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
      if (staff?.classes?.length && !staff.classes.includes(gradeLevel)) {
        return res.status(403).json({ message: 'Forbidden: You may only record attendance for your assigned classes.' })
      }
      if (!staff?.classes?.length && staff?.department && staff.department !== gradeLevel) {
        return res.status(403).json({ message: 'Forbidden: You may only record attendance for your assigned class.' })
      }
    }

    // Delete existing records for this date and class
    await prisma.attendanceRecord.deleteMany({
      where: { date, gradeLevel }
    })
    // Create new records
    const created = await prisma.attendanceRecord.createMany({
      data: records.map(r => ({
        studentId: parseInt(r.studentId),
        date,
        status: r.status,
        gradeLevel,
        recordedBy
      }))
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
    const records = await prisma.attendanceRecord.findMany({ where: { studentId: parseInt(studentId) } })
    const total = records.length
    const present = records.filter(r => r.status === 'present').length
    const absent = records.filter(r => r.status === 'absent').length
    const late = records.filter(r => r.status === 'late').length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    res.json({ total, present, absent, late, percentage, records })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAttendance, getStudentAttendance, saveAttendance, getAttendanceSummary }