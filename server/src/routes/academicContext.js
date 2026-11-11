const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission } = require('../middleware/adminPermissions')
const prisma = new PrismaClient()
const FIRST_ACADEMIC_YEAR = 2026
const TERMS = ['Term 1', 'Term 2', 'Term 3']

const getYearStart = (academicYear) => Number(String(academicYear || '').match(/^(\d{4})/)?.[1])
const formatAcademicYear = (startYear) => `${startYear}/${startYear + 1}`
const getAcademicYears = (currentYear, isAdmin) => {
  const lastYear = isAdmin ? Math.max(currentYear + 10, FIRST_ACADEMIC_YEAR) : currentYear
  return Array.from({ length: Math.max(0, lastYear - FIRST_ACADEMIC_YEAR + 1) }, (_, index) => (
    formatAcademicYear(FIRST_ACADEMIC_YEAR + index)
  ))
}

const getAvailableTerms = (academicYear, currentYear, currentTerm, isAdmin) => {
  if (isAdmin || getYearStart(academicYear) < currentYear) return TERMS
  if (getYearStart(academicYear) > currentYear) return []
  const termIndex = TERMS.indexOf(currentTerm)
  return TERMS.slice(0, Math.max(1, termIndex + 1))
}

// Return the active context and only the periods this role may select.
router.get('/', protect, async (req, res) => {
  try {
    const storedContext = await prisma.academicContext.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    const activeContext = storedContext && getYearStart(storedContext.academicYear) >= FIRST_ACADEMIC_YEAR
      ? storedContext
      : { ...storedContext, academicYear: '2026/2027', term: 'Term 1' }
    const currentYear = Math.max(FIRST_ACADEMIC_YEAR, getYearStart(activeContext.academicYear) || FIRST_ACADEMIC_YEAR)
    const selectedYear = String(req.query.academicYear || activeContext.academicYear)
    const isAdmin = req.user.role === 'admin'
    res.json({
      ...activeContext,
      availableAcademicYears: getAcademicYears(currentYear, isAdmin),
      availableTerms: getAvailableTerms(selectedYear, currentYear, activeContext.term, isAdmin),
      currentAcademicYear: activeContext.academicYear,
      currentTerm: activeContext.term
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// POST set active academic context (admin only)
router.post('/', protect, requireAdminPermission('academic-context'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' })
  const { academicYear, term } = req.body
  if (!academicYear || !term) return res.status(400).json({ message: 'Academic year and term are required.' })
  if (!/^\d{4}\/\d{4}$/.test(academicYear) || getYearStart(academicYear) < FIRST_ACADEMIC_YEAR) {
    return res.status(400).json({ message: 'Academic years must start at 2026/2027 or later.' })
  }
  if (!TERMS.includes(term)) return res.status(400).json({ message: 'Choose a valid academic term.' })
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
    res.json({
      ...context,
      availableAcademicYears: getAcademicYears(getYearStart(academicYear), true)
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router