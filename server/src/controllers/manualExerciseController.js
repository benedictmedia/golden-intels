const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { isStudentFeeCleared } = require('../utils/feeStatus')

const createManualExercise = async (req, res) => {
  try {
    const payload = req.body
    // Basic validation
    if (!payload.studentId || !payload.title || !payload.subject) return res.status(400).json({ message: 'Missing required fields' })

    // If teacher, allow creating
    if (req.user && req.user.role === 'teacher') {
      const teacherName = req.user.name || payload.teacherName || 'Teacher'
      const teacherEmail = req.user.email || payload.teacherEmail || ''

      const student = await prisma.student.findUnique({ where: { id: Number(payload.studentId) } })
      if (!student) return res.status(404).json({ message: 'Student not found' })

      const created = await prisma.manualExercise.create({ data: {
        teacherName,
        teacherEmail,
        studentId: Number(payload.studentId),
        learnerName: payload.learnerName || `${student.firstName} ${student.lastName}`,
        gradeLevel: payload.gradeLevel || student.gradeLevel || '',
        subject: payload.subject,
        title: payload.title,
        workStatus: payload.workStatus || 'completed',
        score: payload.score != null ? Number(payload.score) : null,
        maxScore: payload.maxScore != null ? Number(payload.maxScore) : 100,
        feedback: payload.feedback || '',
        academicYear: payload.academicYear || null,
        term: payload.term || null,
        markedBy: teacherName
      }})

      return res.json(created)
    }

    return res.status(403).json({ message: 'Forbidden' })
  } catch (error) {
    console.error('ManualExercise create error', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getManualExercises = async (req, res) => {
  try {
    const { studentId } = req.query
    const where = {}
    if (studentId) where.studentId = Number(studentId)

    // If parent, restrict to their children
    if (req.user && req.user.role === 'parent') {
      const children = await prisma.student.findMany({ where: { parentEmail: req.user.email }, select: { id: true } })
      const ids = children.map(c => c.id)
      if (studentId && !ids.includes(Number(studentId))) return res.status(403).json({ message: 'Forbidden' })

      if (studentId) {
        // Single child requested — withhold entirely if fees are outstanding.
        const cleared = await isStudentFeeCleared(Number(studentId))
        if (!cleared) return res.json([])
        where.studentId = Number(studentId)
      } else {
        // No specific child requested — only include children whose fees are cleared.
        const clearedIds = []
        for (const id of ids) {
          if (await isStudentFeeCleared(id)) clearedIds.push(id)
        }
        where.studentId = { in: clearedIds }
      }
    }

    // If teacher, allow but limit to their own created records optionally
    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      // teachers can view all for now
    }

    const records = await prisma.manualExercise.findMany({ where, orderBy: { createdAt: 'desc' }, include: { student: true } })
    res.json(records)
  } catch (error) {
    console.error('Get manual exercises error', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createManualExercise, getManualExercises }