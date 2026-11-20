const prisma = require('../config/prismaClient')
const { createNotification, createNotificationsForRole } = require('./notificationController')
const { hasAdminPermission } = require('../middleware/adminPermissions')
const { canonicalStudentClassName, normalizeStudentClassName, studentClassNameVariants } = require('../utils/studentClasses')
const { hasPortfolioProgress, isEarlyYearsClass, normalizePortfolioData } = require('../utils/earlyYearsPortfolio')

const portfolioStudentSelect = {
  id: true,
  studentId: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  gradeLevel: true,
  parentEmail: true,
  parentId: true
}

const getTeacherClasses = async (email) => {
  if (typeof email !== 'string' || !email.trim()) return []
  const staff = await prisma.staff.findFirst({ where: { email } })
  return Array.from(new Set([
    ...(staff?.classes || []),
    ...(staff?.classTeacherClasses || [])
  ].map(normalizeStudentClassName).filter(isEarlyYearsClass)))
}

const getAssignedStudentIds = async (classes) => {
  if (!classes.length) return []
  const gradeLevels = classes.flatMap(studentClassNameVariants)
  const students = await prisma.student.findMany({
    where: { archivedAt: null, gradeLevel: { in: gradeLevels, mode: 'insensitive' } },
    select: { id: true }
  })
  return students.map(student => student.id)
}

const getPortfolioFilters = (query) => {
  const where = {}
  if (query.studentId) {
    const studentId = Number(query.studentId)
    if (!Number.isInteger(studentId) || studentId < 1) throw new Error('Invalid learner.')
    where.studentId = studentId
  }
  if (query.academicYear) where.academicYear = String(query.academicYear)
  if (query.term) where.term = String(query.term)
  return where
}

const getPortfolios = async (req, res) => {
  try {
    const filters = getPortfolioFilters(req.query)
    const user = req.user
    let studentIds = null

    if (user.role === 'parent') {
      const children = await prisma.student.findMany({
        where: {
          archivedAt: null,
          OR: [{ parentEmail: user.email }, { parentId: Number(user.id) }]
        },
        select: { id: true }
      })
      studentIds = children.map(student => student.id)
      filters.status = 'approved'
    } else if (user.role === 'teacher') {
      const classes = await getTeacherClasses(user.email)
      studentIds = await getAssignedStudentIds(classes)
    } else if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have access to learner portfolios.' })
    }

    const portfolios = await prisma.portfolioEntry.findMany({
      where: {
        ...filters,
        ...(studentIds ? { studentId: { in: studentIds } } : {})
      },
      include: { student: { select: portfolioStudentSelect } },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }]
    })
    return res.json(portfolios)
  } catch (error) {
    if (error.message === 'Invalid learner.') return res.status(400).json({ message: error.message })
    console.error('Failed to fetch portfolios:', error)
    return res.status(500).json({ message: 'Could not load learner portfolios.' })
  }
}

const createPortfolio = async (req, res) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only assigned teachers can submit learner portfolios.' })
  }
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'Portfolio details are required.' })
  }
  const { studentId, academicYear, term } = body

  const parsedStudentId = Number(studentId)
  if (!Number.isInteger(parsedStudentId) || parsedStudentId < 1 ||
      typeof academicYear !== 'string' || !academicYear.trim() ||
      typeof term !== 'string' || !term.trim()) {
    return res.status(400).json({ message: 'Learner, academic year, and term are required.' })
  }

  let portfolioData
  try {
    portfolioData = normalizePortfolioData(body.portfolioData)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
  if (!hasPortfolioProgress(portfolioData)) {
    return res.status(400).json({ message: 'Record progress or evidence in at least one learning area before submitting.' })
  }

  try {
    const student = await prisma.student.findFirst({
      where: { id: parsedStudentId, archivedAt: null },
      select: portfolioStudentSelect
    })
    if (!student || !isEarlyYearsClass(student.gradeLevel)) {
      return res.status(404).json({ message: 'Early-years learner not found.' })
    }

    const teacherClasses = await getTeacherClasses(req.user.email)
    if (!teacherClasses.includes(normalizeStudentClassName(student.gradeLevel))) {
      return res.status(403).json({ message: 'You may only submit portfolios for your assigned early-years classes.' })
    }

    const portfolio = await prisma.portfolioEntry.create({
      data: {
        studentId: student.id,
        gradeLevel: canonicalStudentClassName(student.gradeLevel),
        academicYear: academicYear.trim(),
        term: term.trim(),
        portfolioData,
        submittedBy: req.user.name || req.user.email,
        submittedByEmail: req.user.email
      },
      include: { student: { select: portfolioStudentSelect } }
    })

    await createNotificationsForRole(
      'admin',
      'Early-years portfolio submitted',
      `${portfolio.student.firstName} ${portfolio.student.lastName}'s ${portfolio.term} ${portfolio.academicYear} portfolio is ready for review.`,
      'portfolio-review'
    )
    return res.status(201).json(portfolio)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A portfolio already exists for this learner and term. Open it from the portfolio list to make changes.' })
    }
    console.error('Failed to create portfolio:', error)
    return res.status(500).json({ message: 'Could not submit the learner portfolio.' })
  }
}

const updatePortfolio = async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid portfolio.' })
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'Portfolio changes are required.' })
  }

  try {
    const existing = await prisma.portfolioEntry.findUnique({
      where: { id },
      include: { student: { select: portfolioStudentSelect } }
    })
    if (!existing) return res.status(404).json({ message: 'Portfolio not found.' })

    const isAdmin = req.user?.role === 'admin'
    const isTeacher = req.user?.role === 'teacher'
    if (!isAdmin && !isTeacher) return res.status(403).json({ message: 'You cannot edit this portfolio.' })

    if (isTeacher) {
      if (existing.status === 'approved' || existing.submittedByEmail !== req.user.email) {
        return res.status(403).json({ message: 'Only your own unapproved portfolios can be edited.' })
      }
      const teacherClasses = await getTeacherClasses(req.user.email)
      if (!teacherClasses.includes(normalizeStudentClassName(existing.gradeLevel))) {
        return res.status(403).json({ message: 'You may only edit portfolios for your assigned classes.' })
      }
    }

    const updateData = {}
    if (body.portfolioData !== undefined) {
      if (isAdmin && !hasAdminPermission(req, 'portfolios:edit')) {
        return res.status(403).json({ message: 'You do not have permission to edit portfolio content.' })
      }
      try {
        updateData.portfolioData = normalizePortfolioData(body.portfolioData)
      } catch (error) {
        return res.status(400).json({ message: error.message })
      }
      if (isTeacher && !hasPortfolioProgress(updateData.portfolioData)) {
        return res.status(400).json({ message: 'Record progress or evidence in at least one learning area before submitting.' })
      }
      if (isTeacher && existing.status !== 'pending') {
        updateData.status = 'pending'
        updateData.reviewedBy = null
        updateData.reviewedAt = null
      }
    }

    if (body.status !== undefined) {
      if (!isAdmin || !hasAdminPermission(req, 'portfolios:approve')) {
        return res.status(403).json({ message: 'You do not have permission to change portfolio status.' })
      }
      if (!['pending', 'approved', 'rejected'].includes(body.status)) {
        return res.status(400).json({ message: 'Invalid portfolio status.' })
      }
      updateData.status = body.status
      updateData.reviewedBy = body.status === 'pending' ? null : (req.user.name || req.user.email)
      updateData.reviewedAt = body.status === 'pending' ? null : new Date()
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: 'No portfolio changes were provided.' })
    }

    const portfolio = await prisma.portfolioEntry.update({
      where: { id },
      data: updateData,
      include: { student: { select: portfolioStudentSelect } }
    })

    if (isTeacher && existing.status !== 'pending' && portfolio.status === 'pending') {
      await createNotificationsForRole(
        'admin',
        'Early-years portfolio resubmitted',
        `${portfolio.student.firstName} ${portfolio.student.lastName}'s updated ${portfolio.term} ${portfolio.academicYear} portfolio is ready for review.`,
        'portfolio-review'
      )
    }

    if (portfolio.status === 'approved' && existing.status !== 'approved') {
      const parentMatches = [
        ...(portfolio.student.parentId ? [{ id: portfolio.student.parentId }] : []),
        ...(portfolio.student.parentEmail ? [{ email: portfolio.student.parentEmail }] : [])
      ]
      const parent = parentMatches.length
        ? await prisma.user.findFirst({ where: { role: 'parent', active: true, OR: parentMatches } })
        : null
      if (parent) {
        await createNotification(
          parent.id,
          'Early-years portfolio released',
          `${portfolio.student.firstName} ${portfolio.student.lastName}'s ${portfolio.term} ${portfolio.academicYear} learning portfolio is ready to view.`,
          'portfolio'
        )
      }
    }

    return res.json(portfolio)
  } catch (error) {
    console.error('Failed to update portfolio:', error)
    return res.status(500).json({ message: 'Could not update the learner portfolio.' })
  }
}

const updateParentComment = async (req, res) => {
  if (req.user?.role !== 'parent') return res.status(403).json({ message: 'Only a parent can add a portfolio reflection.' })
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      typeof body.parentComment !== 'string' || body.parentComment.length > 2000) {
    return res.status(400).json({ message: 'Parent reflection must be 2,000 characters or fewer.' })
  }
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid portfolio.' })

  try {
    const portfolio = await prisma.portfolioEntry.findFirst({
      where: {
        id,
        status: 'approved',
        student: {
          is: {
            archivedAt: null,
            OR: [{ parentEmail: req.user.email }, { parentId: Number(req.user.id) }]
          }
        }
      },
      select: { id: true }
    })
    if (!portfolio) return res.status(404).json({ message: 'Approved portfolio not found.' })

    const updated = await prisma.portfolioEntry.update({
      where: { id },
      data: { parentComment: body.parentComment.trim() }
    })
    return res.json(updated)
  } catch (error) {
    console.error('Failed to save parent portfolio reflection:', error)
    return res.status(500).json({ message: 'Could not save your portfolio reflection.' })
  }
}

const deletePortfolio = async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid portfolio.' })

  try {
    const portfolio = await prisma.portfolioEntry.findUnique({ where: { id } })
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' })

    if (req.user?.role === 'teacher') {
      if (portfolio.status === 'approved' || portfolio.submittedByEmail !== req.user.email) {
        return res.status(403).json({ message: 'Only your own unapproved portfolios can be deleted.' })
      }
      const teacherClasses = await getTeacherClasses(req.user.email)
      if (!teacherClasses.includes(normalizeStudentClassName(portfolio.gradeLevel))) {
        return res.status(403).json({ message: 'You may only delete portfolios for your assigned classes.' })
      }
    } else if (req.user?.role !== 'admin' || !hasAdminPermission(req, 'portfolios:delete')) {
      return res.status(403).json({ message: 'You do not have permission to delete this portfolio.' })
    }

    await prisma.portfolioEntry.delete({ where: { id } })
    return res.json({ message: 'Portfolio deleted.' })
  } catch (error) {
    console.error('Failed to delete portfolio:', error)
    return res.status(500).json({ message: 'Could not delete the learner portfolio.' })
  }
}

module.exports = {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  updateParentComment,
  deletePortfolio
}
