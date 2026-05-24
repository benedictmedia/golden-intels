const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const normalizeClassName = (value) => String(value ?? '').trim().toLowerCase()
const normalizeClassList = (classes = []) => (classes || []).map(normalizeClassName).filter(Boolean)

// Get all results
const getResults = async (req, res) => {
  try {
    // If parent, only return results for their children
    if (req.user && req.user.role === 'parent') {
      const email = req.user.email
      const children = await prisma.student.findMany({ where: { parentEmail: email }, select: { id: true } })
      const ids = children.map(c => c.id)
      const results = await prisma.result.findMany({ where: { studentId: { in: ids } }, include: { student: true }, orderBy: { createdAt: 'desc' } })
      return res.json(results)
    }

    // If teacher, restrict to their assigned classes or results they submitted
    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const teacherClasses = normalizeClassList(staff?.classes)
      const results = await prisma.result.findMany({ include: { student: true }, orderBy: { createdAt: 'desc' } })
      const filteredResults = teacherClasses.length
        ? results.filter(result => teacherClasses.includes(normalizeClassName(result.gradeLevel)) || result.submittedBy === req.user.name)
        : staff?.department
          ? results.filter(result => normalizeClassName(result.gradeLevel) === normalizeClassName(staff.department) || result.submittedBy === req.user.name)
          : results.filter(result => result.submittedBy === req.user.name)
      return res.json(filteredResults)
    }

    const results = await prisma.result.findMany({ include: { student: true }, orderBy: { createdAt: 'desc' } })
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const isTeacherAllowedForStudent = async (req, studentId, gradeLevel = null) => {
  if (!req.user || req.user.role !== 'teacher') return true
  const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
  if (!staff) return true
  if ((!staff.classes || staff.classes.length === 0) && !staff.department) return true

  const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
  if (!student) return false
  const teacherClasses = normalizeClassList(staff?.classes)
  const allowedClass = teacherClasses.length
    ? teacherClasses.includes(normalizeClassName(student.gradeLevel))
    : normalizeClassName(staff.department) === normalizeClassName(student.gradeLevel)
  const allowedGradeLevel = gradeLevel == null
    ? true
    : teacherClasses.length
      ? teacherClasses.includes(normalizeClassName(gradeLevel))
      : normalizeClassName(staff.department) === normalizeClassName(gradeLevel)
  return allowedClass && allowedGradeLevel
}

// Get results by student
const getResultsByStudent = async (req, res) => {
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
      const teacherClasses = normalizeClassList(staff?.classes)
      const allowedByClass = teacherClasses.length
        ? teacherClasses.includes(normalizeClassName(student?.gradeLevel))
        : normalizeClassName(staff?.department) === normalizeClassName(student?.gradeLevel)
      if (!allowedByClass) return res.status(403).json({ message: 'Forbidden' })
    }
    const results = await prisma.result.findMany({ where: { studentId: parseInt(studentId) }, include: { student: true }, orderBy: { createdAt: 'desc' } })
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create result
const createResult = async (req, res) => {
  const { studentId, gradeLevel, academicYear, term, scores, remarks, submittedBy } = req.body
  try {
    if (req.user && req.user.role === 'teacher') {
      const allowed = await isTeacherAllowedForStudent(req, studentId, gradeLevel)
      if (!allowed) return res.status(403).json({ message: 'Forbidden: You may only submit results for your assigned classes.' })
    }

    const result = await prisma.result.create({
      data: {
        studentId: parseInt(studentId),
        gradeLevel,
        academicYear,
        term,
        scores,
        remarks,
        submittedBy,
        status: 'pending'
      },
      include: { student: true }
    })
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update result
const updateResult = async (req, res) => {
  const { id } = req.params
  const { scores, remarks, status } = req.body
  try {
    const existing = await prisma.result.findUnique({ where: { id: parseInt(id) } })
    if (req.user && req.user.role === 'teacher') {
      const allowed = await isTeacherAllowedForStudent(req, existing.studentId, existing.gradeLevel)
      if (!allowed && existing.submittedBy !== req.user.name) {
        return res.status(403).json({ message: 'Forbidden: You may only update results for your assigned classes.' })
      }
    }

    const result = await prisma.result.update({
      where: { id: parseInt(id) },
      data: { scores, remarks, status },
      include: { student: true }
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete result (teacher only — admin results are protected on frontend)
const deleteResult = async (req, res) => {
  const { id } = req.params
  try {
    const existing = await prisma.result.findUnique({ where: { id: parseInt(id) } })
    if (req.user && req.user.role === 'teacher') {
      const allowed = await isTeacherAllowedForStudent(req, existing.studentId, existing.gradeLevel)
      if (!allowed && existing.submittedBy !== req.user.name) {
        return res.status(403).json({ message: 'Forbidden: You may only delete results for your assigned classes.' })
      }
    }
    await prisma.result.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Result deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getResults, getResultsByStudent, createResult, updateResult, deleteResult }