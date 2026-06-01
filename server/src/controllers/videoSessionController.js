const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')
const prisma = new PrismaClient()

// Get sessions
const getSessions = async (req, res) => {
  const { gradeLevel, status } = req.query
  const user = req.user
  try {
    const where = {}
    if (gradeLevel) where.gradeLevel = gradeLevel
    if (status) where.status = status

    if (user.role === 'teacher') {
      where.teacherId = user.id
    }

    const sessions = await prisma.videoSession.findMany({
      where,
      orderBy: { scheduledAt: 'asc' }
    })
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create a new session
const createSession = async (req, res) => {
  const { title, description, gradeLevel, subject, scheduledAt, duration } = req.body
  const user = req.user

  if (!title || !gradeLevel || !scheduledAt) {
    return res.status(400).json({ message: 'Title, gradeLevel and scheduledAt are required' })
  }

  try {
    const roomName = `golden-intels-${uuidv4().replace(/-/g, '').slice(0, 20)}`

    const session = await prisma.videoSession.create({
      data: {
        title,
        description: description || null,
        roomName,
        gradeLevel,
        subject: subject || null,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration) || 60,
        createdBy: user.name,
        teacherId: user.id,
        status: 'scheduled'
      }
    })

    // === NOTIFY PARENTS / LEARNERS ===
    const { createNotification } = require('./notificationController')

    const studentsInClass = await prisma.student.findMany({
      where: { gradeLevel: gradeLevel },
      include: { parent: true }
    })

    for (const student of studentsInClass) {
      if (student.parent) {
        await createNotification(
          student.parent.id,
          "New Live Class Scheduled",
          `${title} for ${gradeLevel} has been scheduled.`,
          "classroom"
        )
      }
    }

    res.json(session)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update session
const updateSession = async (req, res) => {
  const { id } = req.params
  const user = req.user
  try {
    const session = await prisma.videoSession.findUnique({ where: { id: parseInt(id) } })
    if (!session) return res.status(404).json({ message: 'Session not found' })
    if (session.teacherId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' })
    }
    const updated = await prisma.videoSession.update({
      where: { id: parseInt(id) },
      data: req.body
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete session
const deleteSession = async (req, res) => {
  const { id } = req.params
  const user = req.user
  try {
    const session = await prisma.videoSession.findUnique({ where: { id: parseInt(id) } })
    if (!session) return res.status(404).json({ message: 'Session not found' })
    if (session.teacherId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' })
    }
    await prisma.videoSession.delete({ where: { id: parseInt(id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getSessions, createSession, updateSession, deleteSession }