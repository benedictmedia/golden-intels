const { PrismaClient } = require('@prisma/client')
const {
  getMissingSubjects,
  isScoresCompleteForSubjects,
  normalizeSubject,
  normalizeSubjectList,
  sanitizeTeacherScores,
  validateTeacherScores
} = require('../utils/resultSubjectHelpers')

const prisma = new PrismaClient()

const normalizeClassName = (value) => String(value ?? '').trim().toLowerCase()
const normalizeClassList = (classes = []) => (classes || []).map(normalizeClassName).filter(Boolean)

const buildTeacherAssignments = async (email) => {
  const staff = await prisma.staff.findFirst({ where: { email } })
  if (!staff) {
    return { classes: [], classTeacherClasses: [], subjects: [] }
  }

  const subjects = normalizeSubjectList(staff.subjects)
  if (!subjects.length && staff.subject) {
    subjects.push(normalizeSubject(staff.subject))
  }

  return {
    classes: normalizeClassList(staff.classes),
    classTeacherClasses: normalizeClassList(staff.classTeacherClasses),
    subjects
  }
}

const getExpectedSubjectsForClass = async (gradeLevel) => {
  const teachers = await prisma.staff.findMany()
  const expectedSubjects = teachers
    .filter((teacher) => normalizeClassList(teacher.classes).includes(normalizeClassName(gradeLevel)))
    .flatMap((teacher) => [
      ...normalizeSubjectList(teacher.subjects),
      ...(teacher.subject ? [normalizeSubject(teacher.subject)] : [])
    ])

  return Array.from(new Set(expectedSubjects))
}

const isClassTeacherForClass = (teacherClasses = [], gradeLevel = '') =>
  teacherClasses.includes(normalizeClassName(gradeLevel))

const getResultByScope = async (studentId, gradeLevel, academicYear, term) => {
  return prisma.result.findFirst({
    where: {
      studentId: parseInt(studentId),
      gradeLevel,
      academicYear,
      term
    },
    orderBy: { createdAt: 'desc' }
  })
}

const isTeacherAllowedForStudent = async (req, studentId, gradeLevel = null) => {
  if (!req.user || req.user.role !== 'teacher') return true

  const teacherAssignments = await buildTeacherAssignments(req.user.email)
  const allowedTeacherClasses = Array.from(new Set([
    ...teacherAssignments.classes,
    ...teacherAssignments.classTeacherClasses
  ]))
  if (!allowedTeacherClasses.length) return false

  const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
  if (!student) return false

  const allowedClass = allowedTeacherClasses.includes(normalizeClassName(student.gradeLevel))
  const allowedGradeLevel = gradeLevel == null
    ? true
    : allowedTeacherClasses.includes(normalizeClassName(gradeLevel))

  return allowedClass && allowedGradeLevel
}

const getTeacherResultPayload = async (req, body) => {
  const teacherAssignments = await buildTeacherAssignments(req.user.email)
  const { scores = {}, remarks, gradeLevel } = body
  const isClassTeacherForSelectedClass = teacherAssignments.classTeacherClasses.includes(normalizeClassName(gradeLevel))

  if (isClassTeacherForSelectedClass) {
    const sanitizedScores = typeof scores === 'object' && scores !== null ? scores : {}
    if (!Object.keys(sanitizedScores).length) {
      return { error: { ok: false, message: 'You must provide scores for at least one subject.' } }
    }

    return {
      scores: sanitizedScores,
      remarks,
      teacherAssignments
    }
  }

  const validation = validateTeacherScores(scores, teacherAssignments.subjects)
  if (!validation.ok) {
    return { error: validation }
  }

  const sanitizedScores = sanitizeTeacherScores(scores, teacherAssignments.subjects)
  if (!Object.keys(sanitizedScores).length) {
    return { error: { ok: false, message: 'You must provide scores for at least one assigned subject.' } }
  }

  return {
    scores: sanitizedScores,
    remarks,
    teacherAssignments
  }
}

const filterApprovedResults = (results = []) => results.filter((result) => result.status === 'approved')

// Get all results
const getResults = async (req, res) => {
  try {
    if (req.user && req.user.role === 'parent') {
      const email = req.user.email
      const children = await prisma.student.findMany({ where: { parentEmail: email }, select: { id: true } })
      const ids = children.map((child) => child.id)
      const results = await prisma.result.findMany({ where: { studentId: { in: ids } }, include: { student: true }, orderBy: { createdAt: 'desc' } })
      return res.json(filterApprovedResults(results))
    }

    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const teacherClasses = Array.from(new Set([
        ...normalizeClassList(staff?.classes),
        ...normalizeClassList(staff?.classTeacherClasses)
      ]))
      const results = await prisma.result.findMany({ include: { student: true }, orderBy: { createdAt: 'desc' } })
      const filteredResults = teacherClasses.length
        ? results.filter((result) => teacherClasses.includes(normalizeClassName(result.gradeLevel)) || result.submittedBy === req.user.name)
        : staff?.department
          ? results.filter((result) => normalizeClassName(result.gradeLevel) === normalizeClassName(staff.department) || result.submittedBy === req.user.name)
          : results.filter((result) => result.submittedBy === req.user.name)
      return res.json(filteredResults)
    }

    const results = await prisma.result.findMany({ include: { student: true }, orderBy: { createdAt: 'desc' } })
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get results by student
const getResultsByStudent = async (req, res) => {
  const { studentId } = req.params
  try {
    if (req.user && req.user.role === 'parent') {
      const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
      if (!student || student.parentEmail !== req.user.email) return res.status(403).json({ message: 'Forbidden' })
    }

    if (req.user && req.user.role === 'teacher') {
      const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const teacherClasses = Array.from(new Set([
        ...normalizeClassList(staff?.classes),
        ...normalizeClassList(staff?.classTeacherClasses)
      ]))
      const allowedByClass = teacherClasses.length
        ? teacherClasses.includes(normalizeClassName(student?.gradeLevel))
        : normalizeClassName(staff?.department) === normalizeClassName(student?.gradeLevel)
      if (!allowedByClass) return res.status(403).json({ message: 'Forbidden' })
    }

    const results = await prisma.result.findMany({ where: { studentId: parseInt(studentId) }, include: { student: true }, orderBy: { createdAt: 'desc' } })
    if (req.user && req.user.role === 'parent') {
      return res.json(filterApprovedResults(results))
    }
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
      if (!allowed) {
        return res.status(403).json({ message: 'Forbidden: You may only submit results for your assigned classes.' })
      }

      const payload = await getTeacherResultPayload(req, req.body)
      if (payload.error) {
        return res.status(400).json({ message: payload.error.message })
      }

      const teacherAssignments = payload.teacherAssignments
      const canEditRemarks = isClassTeacherForClass(teacherAssignments.classTeacherClasses, gradeLevel)
      const existingResult = await getResultByScope(studentId, gradeLevel, academicYear, term)
      const mergedScores = existingResult ? { ...(existingResult.scores || {}), ...payload.scores } : payload.scores
      const nextRemarks = canEditRemarks ? (remarks || existingResult?.remarks || '') : (existingResult?.remarks || '')

      const result = existingResult
        ? await prisma.result.update({
            where: { id: existingResult.id },
            data: {
              scores: mergedScores,
              remarks: nextRemarks,
              submittedBy,
              status: 'pending'
            },
            include: { student: true }
          })
        : await prisma.result.create({
            data: {
              studentId: parseInt(studentId),
              gradeLevel,
              academicYear,
              term,
              scores: payload.scores,
              remarks: nextRemarks,
              submittedBy,
              status: 'pending'
            },
            include: { student: true }
          })

      // === NOTIFY PARENT ===
      if (result.student?.parentEmail) {
        const parent = await prisma.user.findUnique({
          where: { email: result.student.parentEmail }
        });
        if (parent) {
          const { createNotification } = require('./notificationController');
          await createNotification(
            parent.id,
            "New Academic Result",
            `A new result has been posted for ${result.student.firstName} ${result.student.lastName} (${result.term} ${result.academicYear})`,
            "result"
          );
        }
      }

      return res.status(existingResult ? 200 : 201).json(result)
    }

    // Non-teacher case
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

    // === NOTIFY PARENT ===
    if (result.student?.parentEmail) {
      const parent = await prisma.user.findUnique({
        where: { email: result.student.parentEmail }
      });
      if (parent) {
        const { createNotification } = require('./notificationController');
        await createNotification(
          parent.id,
          "New Academic Result",
          `A new result has been posted for ${result.student.firstName} ${result.student.lastName} (${result.term} ${result.academicYear})`,
          "result"
        );
      }
    }

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
    if (!existing) {
      return res.status(404).json({ message: 'Result not found' })
    }

    if (req.user && req.user.role === 'teacher') {
      const allowed = await isTeacherAllowedForStudent(req, existing.studentId, existing.gradeLevel)
      if (!allowed) {
        return res.status(403).json({ message: 'Forbidden: You may only update results for your assigned classes.' })
      }

      const payload = await getTeacherResultPayload(req, { ...req.body, gradeLevel: existing.gradeLevel })
      if (payload.error) {
        return res.status(400).json({ message: payload.error.message })
      }

      const teacherAssignments = payload.teacherAssignments
      const canEditRemarks = isClassTeacherForClass(teacherAssignments.classTeacherClasses, existing.gradeLevel)
      const mergedScores = { ...(existing.scores || {}), ...payload.scores }
      const nextRemarks = canEditRemarks ? (remarks || existing.remarks || '') : (existing.remarks || '')

      const result = await prisma.result.update({
        where: { id: parseInt(id) },
        data: {
          scores: mergedScores,
          remarks: nextRemarks,
          status: 'pending'
        },
        include: { student: true }
      })

      return res.json(result)
    }

    const nextScores = scores === undefined ? existing.scores : scores
    const nextRemarksValue = remarks === undefined ? existing.remarks : remarks
    const nextStatus = status === undefined ? existing.status : status

    if (nextStatus === 'approved') {
      const requiredSubjects = await getExpectedSubjectsForClass(existing.gradeLevel)
      if (!isScoresCompleteForSubjects(nextScores || {}, requiredSubjects)) {
        const missingSubjects = getMissingSubjects(nextScores || {}, requiredSubjects)
        const missingMessage = missingSubjects.length
          ? `Cannot approve until all subject teachers have submitted their scores. Missing: ${missingSubjects.join(', ')}`
          : 'Cannot approve until all subject teachers have submitted their scores.'

        return res.status(400).json({ message: missingMessage })
      }
    }

    const result = await prisma.result.update({
      where: { id: parseInt(id) },
      data: { scores: nextScores, remarks: nextRemarksValue, status: nextStatus },
      include: { student: true }
    })

    // === NOTIFY PARENT WHEN APPROVED ===
        if (nextStatus === 'approved' && result.student?.parentEmail) {
      const parent = await prisma.user.findUnique({
        where: { email: result.student.parentEmail }
      });
      if (parent) {
        const { createNotification } = require('./notificationController');
        await createNotification(
          parent.id,
          "Result Approved",
          `Your child's result for ${result.term} ${result.academicYear} has been released.`,
          "result"
        );
      }
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete result
const deleteResult = async (req, res) => {
  const { id } = req.params
  try {
    if (req.user && req.user.role === 'teacher') {
      return res.status(403).json({ message: 'Teachers cannot delete shared results. Please contact admin.' })
    }

    await prisma.result.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Result deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getResults, getResultsByStudent, createResult, updateResult, deleteResult }