const axios = require('axios')
const prisma = require('../config/prismaClient')
const { createNotification, createNotificationsForRole } = require('./notificationController')
const { hasAdminPermission } = require('../middleware/adminPermissions')
const { canonicalStudentClassName, normalizeStudentClassName, studentClassNameVariants } = require('../utils/studentClasses')
const {
  hasPortfolioProgress,
  isEarlyYearsClass,
  normalizePortfolioData,
  PORTFOLIO_AREAS,
  PORTFOLIO_ATTAINMENTS
} = require('../utils/earlyYearsPortfolio')

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
  const staff = await prisma.staff.findFirst({ where: { email: { equals: email.trim(), mode: 'insensitive' } } })
  return Array.from(new Set([
    ...(staff?.classes || []),
    ...(staff?.classTeacherClasses || [])
  ].map(normalizeStudentClassName).filter(isEarlyYearsClass)))
}

const isPortfolioSchemaError = (error) =>
  ['P2021', 'P2022'].includes(error?.code) &&
  /PortfolioEntry/i.test(`${error.meta?.table || ''} ${error.meta?.column || ''} ${error.message || ''}`)

const respondWithPortfolioError = (res, error, fallbackMessage) => {
  if (isPortfolioSchemaError(error)) {
    return res.status(503).json({
      message: 'Portfolio storage is not ready. The server deployment must apply the latest database migrations.'
    })
  }
  return res.status(500).json({ message: fallbackMessage })
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
    console.error('Failed to fetch portfolios:', { code: error.code, message: error.message })
    return respondWithPortfolioError(res, error, 'Could not load learner portfolios.')
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
    console.error('Failed to create portfolio:', { code: error.code, message: error.message })
    return respondWithPortfolioError(res, error, 'Could not submit the learner portfolio.')
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
    console.error('Failed to update portfolio:', { code: error.code, message: error.message })
    return respondWithPortfolioError(res, error, 'Could not update the learner portfolio.')
  }
}

const authorizePortfolioEvidenceUpload = async (req, res, next) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can upload learner work evidence.' })
  }
  if (!PORTFOLIO_AREAS.some(area => area.key === req.params.areaKey)) {
    return res.status(400).json({ message: 'Choose a valid learning area.' })
  }
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid portfolio.' })

  try {
    const portfolio = await prisma.portfolioEntry.findUnique({
      where: { id },
      select: { id: true, gradeLevel: true, status: true, submittedByEmail: true, portfolioData: true }
    })
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' })
    if (portfolio.status === 'approved' || portfolio.submittedByEmail !== req.user.email) {
      return res.status(403).json({ message: 'Only your own unapproved portfolios can include evidence.' })
    }
    const classes = await getTeacherClasses(req.user.email)
    if (!classes.includes(normalizeStudentClassName(portfolio.gradeLevel))) {
      return res.status(403).json({ message: 'You may only upload evidence for your assigned classes.' })
    }
    const areaData = portfolio.portfolioData?.learningAreas?.[req.params.areaKey]
    if (Array.isArray(areaData?.evidenceImages) && areaData.evidenceImages.length >= 10) {
      return res.status(400).json({ message: 'Each learning area can have up to 10 image evidence files.' })
    }
    req.portfolio = portfolio
    return next()
  } catch (error) {
    console.error('Failed to authorize portfolio evidence upload:', { code: error.code, message: error.message })
    return respondWithPortfolioError(res, error, 'Could not verify portfolio upload access.')
  }
}

const addPortfolioEvidence = async (req, res) => {
  const areaKey = req.params.areaKey
  const area = PORTFOLIO_AREAS.find(item => item.key === areaKey)
  if (!area) return res.status(400).json({ message: 'Choose a valid learning area.' })
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload.' })

  const fileUrl = req.file.path?.startsWith('http')
    ? req.file.path
    : `${req.protocol}://${req.get('host')}/uploads/portfolio-evidence/${encodeURIComponent(req.file.filename)}`
  const image = {
    url: fileUrl,
    name: String(req.file.originalname || 'Learner work').replace(/[\\/]/g, '_').slice(0, 255)
  }

  try {
    const existing = await prisma.portfolioEntry.findUnique({
      where: { id: req.portfolio.id },
      select: { gradeLevel: true, status: true, submittedByEmail: true, portfolioData: true }
    })
    if (!existing || existing.status === 'approved' || existing.submittedByEmail !== req.user.email) {
      return res.status(403).json({ message: 'Only your own unapproved portfolios can include evidence.' })
    }
    const classes = await getTeacherClasses(req.user.email)
    if (!classes.includes(normalizeStudentClassName(existing.gradeLevel))) {
      return res.status(403).json({ message: 'You may only upload evidence for your assigned classes.' })
    }
    const portfolioData = normalizePortfolioData(existing?.portfolioData)
    const images = portfolioData.learningAreas[areaKey].evidenceImages
    if (images.length >= 10) return res.status(400).json({ message: 'Each learning area can have up to 10 image evidence files.' })
    portfolioData.learningAreas[areaKey].evidenceImages = [...images, image]
    const result = await prisma.portfolioEntry.updateMany({
      where: {
        id: req.portfolio.id,
        status: { not: 'approved' },
        submittedByEmail: req.user.email
      },
      data: { portfolioData },
    })
    if (result.count !== 1) {
      return res.status(403).json({ message: 'The portfolio was approved before the image could be attached.' })
    }
    const updated = await prisma.portfolioEntry.findUnique({
      where: { id: req.portfolio.id },
      include: { student: { select: portfolioStudentSelect } }
    })
    return res.status(201).json(updated)
  } catch (error) {
    console.error('Failed to attach portfolio evidence:', { code: error.code, message: error.message })
    return respondWithPortfolioError(res, error, 'Could not attach the learner work image.')
  }
}

const assistPortfolioText = async (req, res) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'AI writing help is available to teachers only.' })
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'AI writing help is not configured on the school server.' })
  }

  const { section, areaKey, field, notes, attainment, gradeLevel } = req.body || {}
  const area = PORTFOLIO_AREAS.find(item => item.key === areaKey)
  const summaryFields = new Set(['termHighlights', 'overallProgress', 'homeSupport', 'nextTermTargets'])
  const validField = section === 'learningArea'
    ? area && ['teacherComment', 'evidence', 'nextSteps'].includes(field)
    : section === 'summary' && summaryFields.has(field)
  if (!validField || typeof notes !== 'string' || notes.trim().length < 3 || notes.length > 2000) {
    return res.status(400).json({ message: 'Select a portfolio field and provide brief, non-identifying classroom notes (3–2,000 characters).' })
  }
  if (section === 'learningArea' && !PORTFOLIO_ATTAINMENTS.includes(attainment)) {
    return res.status(400).json({ message: 'Choose a valid progress level before asking for an AI draft.' })
  }

  const normalizedClass = normalizeStudentClassName(gradeLevel)
  if (!isEarlyYearsClass(gradeLevel)) {
    return res.status(400).json({ message: 'AI writing help is limited to early-years classes.' })
  }

  try {
    const classes = await getTeacherClasses(req.user.email)
    if (!classes.includes(normalizedClass)) {
      return res.status(403).json({ message: 'You may only use AI writing help for your assigned early-years classes.' })
    }

    const targetLabel = section === 'learningArea'
      ? `${area.label}: ${field}`
      : `End-of-term portfolio: ${field}`
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 220,
        messages: [
          {
            role: 'system',
            content: 'You help early-years teachers improve portfolio wording. Use only facts in the teacher notes, do not invent achievements, diagnoses, causes, or dates. Write one concise, warm, objective, family-friendly draft for the requested field. If evidence is insufficient, ask for a specific detail instead of making a claim. Return only the draft text.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              class: canonicalStudentClassName(gradeLevel),
              learningArea: section === 'learningArea' ? area.label : undefined,
              progressLevel: section === 'learningArea' ? attainment : undefined,
              targetField: targetLabel,
              teacherNotes: notes.trim()
            })
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        timeout: 20000
      }
    )
    const suggestion = response.data?.choices?.[0]?.message?.content?.trim()
    if (!suggestion) return res.status(502).json({ message: 'AI writing help returned an empty suggestion. Please try again.' })
    return res.json({ suggestion: suggestion.slice(0, 2000) })
  } catch (error) {
    console.error('Portfolio AI assistance failed:', { code: error.code, status: error.response?.status })
    return res.status(502).json({ message: 'AI writing help is temporarily unavailable. Please try again later.' })
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
  deletePortfolio,
  authorizePortfolioEvidenceUpload,
  addPortfolioEvidence,
  assistPortfolioText
}
