const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAttendance = async (req, res) => {
  try {
    const { date, gradeLevel } = req.query
    const where = {}
    if (date) where.date = date
    if (gradeLevel) where.gradeLevel = gradeLevel
    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(records)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: parseInt(studentId) },
      include: { student: true },
      orderBy: { date: 'desc' }
    })
    res.json(records)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const saveAttendance = async (req, res) => {
  const { records, date, gradeLevel, recordedBy } = req.body
  try {
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
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: parseInt(studentId) }
    })
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