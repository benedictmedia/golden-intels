// routes/attendance.js
// Mount in your server.js with: app.use('/api/attendance', require('./routes/attendance'))

const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ─── Auth middleware (reuse your existing one or inline here) ─────────────────
const jwt = require('jsonwebtoken')
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// ─── GET /api/attendance ──────────────────────────────────────────────────────
// Query params: ?date=YYYY-MM-DD&gradeLevel=Year+1
// Returns all attendance records for that date + class
router.get('/', authenticate, async (req, res) => {
  try {
    const { date, gradeLevel } = req.query
    const where = {}
    if (date) where.date = date
    if (gradeLevel) where.gradeLevel = gradeLevel

    const records = await prisma.attendance.findMany({
      where,
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(records)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch attendance' })
  }
})

// ─── GET /api/attendance/student/:studentId ───────────────────────────────────
// Returns full attendance history for one student (for parent portal)
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId: parseInt(req.params.studentId) },
      orderBy: { date: 'desc' }
    })
    res.json(records)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch student attendance' })
  }
})

// ─── POST /api/attendance/bulk ────────────────────────────────────────────────
// Body: { date, gradeLevel, recordedBy, records: [{ studentId, status }] }
// Upserts attendance for every student in the class for that date
router.post('/bulk', authenticate, async (req, res) => {
  try {
    const { date, gradeLevel, recordedBy, records } = req.body
    if (!date || !gradeLevel || !records?.length) {
      return res.status(400).json({ message: 'date, gradeLevel and records are required' })
    }

    const upserts = records.map(({ studentId, status }) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: parseInt(studentId), date } },
        update: { status, recordedBy },
        create: { studentId: parseInt(studentId), date, status, gradeLevel, recordedBy }
      })
    )

    const saved = await prisma.$transaction(upserts)
    res.json({ message: `Saved ${saved.length} attendance records`, records: saved })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to save attendance' })
  }
})

// ─── GET /api/attendance/summary/:gradeLevel ─────────────────────────────────
// Returns per-student attendance counts for admin overview
router.get('/summary/:gradeLevel', authenticate, async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { gradeLevel: req.params.gradeLevel },
      include: { student: { select: { id: true, firstName: true, lastName: true, studentId: true } } }
    })

    // Group by student
    const map = {}
    records.forEach(r => {
      if (!map[r.studentId]) {
        map[r.studentId] = { student: r.student, present: 0, absent: 0, late: 0, total: 0 }
      }
      map[r.studentId][r.status] = (map[r.studentId][r.status] || 0) + 1
      map[r.studentId].total += 1
    })

    res.json(Object.values(map))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch summary' })
  }
})

module.exports = router