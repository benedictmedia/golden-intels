const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const protect = require('../middleware/authMiddleware')
const prisma = new PrismaClient()

// GET current active academic context (all roles)
router.get('/', protect, async (req, res) => {
  try {
    const context = await prisma.academicContext.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    res.json(context || { academicYear: '2025/2026', term: 'Term 1' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// POST set active academic context (admin only)
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' })
  const { academicYear, term } = req.body
  if (!academicYear || !term) return res.status(400).json({ message: 'Academic year and term are required.' })
  try {
    // Always upsert the single active context record
    const existing = await prisma.academicContext.findFirst({ orderBy: { updatedAt: 'desc' } })
    const context = existing
      ? await prisma.academicContext.update({
          where: { id: existing.id },
          data: { academicYear, term, setBy: req.user.name }
        })
      : await prisma.academicContext.create({
          data: { academicYear, term, setBy: req.user.name }
        })
    res.json(context)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router