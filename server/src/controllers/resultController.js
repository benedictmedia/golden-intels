const { PrismaClient } = require('@prisma/client')
const {
  getMissingSubjects,
  isScoresCompleteForSubjects,
  normalizeSubject,
  normalizeSubjectList,
  sanitizeTeacherScores,
  validateTeacherScores
} = require('../utils/resultSubjectHelpers')
const { createNotificationsForRole } = require('./notificationController')
const { isStudentFeeCleared } = require('../utils/feeStatus')
const { archive, isPreviousAcademicPeriod } = require('../utils/archive')
const { canonicalStudentClassName, normalizeStudentClassName, studentClassNameVariants } = require('../utils/studentClasses')

const prisma = new PrismaClient()

const normalizeClassName = normalizeStudentClassName
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
      gradeLevel: { in: studentClassNameVariants(gradeLevel), mode: 'insensitive' },
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
  if (!student || student.archivedAt) return false

  const allowedClass = allowedTeacherClasses.includes(normalizeClassName(student.gradeLevel))
  const allowedGradeLevel = gradeLevel == null
    ? true
    : allowedTeacherClasses.includes(normalizeClassName(gradeLevel))

  return allowedClass && allowedGradeLevel
}

const getTeacherResultPayload = async (req, body) => {
  const teacherAssignments = await buildTeacherAssignments(req.user.email)
  const { scores = {}, remarks } = body

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

const filterVisibleAcademicPeriods = async (user, results = []) => {
  if (user?.role === 'admin') return results
  const storedContext = await prisma.academicContext.findFirst({ orderBy: { updatedAt: 'desc' } })
  const storedYear = Number(String(storedContext?.academicYear || '').match(/^(\d{4})/)?.[1])
  const activeYear = Number.isFinite(storedYear) && storedYear >= 2026 ? storedYear : 2026
  const currentTerm = Number(String(storedContext?.term || 'Term 1').match(/\d+/)?.[0] || 1)

  return results.filter(result => {
    const year = Number(String(result.academicYear || '').match(/^(\d{4})/)?.[1])
    const term = Number(String(result.term || '').match(/\d+/)?.[0] || 0)
    return year >= 2026 && year <= activeYear && (year < activeYear || term <= currentTerm)
  })
}

// Withholds the actual scores for any result belonging to a student with an
// outstanding fee balance. The result record (and its "approved" status)
// still comes through so the parent knows a result exists, but the scores
// payload itself is stripped so it never reaches the browser.
const redactLockedResults = async (results = []) => {
  const clearedCache = new Map()
  const checkCleared = async (studentId) => {
    if (!clearedCache.has(studentId)) {
      clearedCache.set(studentId, await isStudentFeeCleared(studentId))
    }
    return clearedCache.get(studentId)
  }

  return Promise.all(results.map(async (result) => {
    const cleared = await checkCleared(result.studentId)
    if (cleared) return { ...result, feeLocked: false }
    return { ...result, scores: {}, remarks: '', headmasterSignature: null, feeLocked: true }
  }))
}

// Get all results
const getResults = async (req, res) => {
  try {
    if (req.user && req.user.role === 'parent') {
      const email = req.user.email
      const children = await prisma.student.findMany({
        where: { archivedAt: null, OR: [{ parentEmail: email }, { parentId: req.user.id }] },
        select: { id: true }
      })
      const ids = children.map((child) => child.id)
      const results = await prisma.result.findMany({ where: { studentId: { in: ids } }, include: { student: true }, orderBy: { createdAt: 'desc' } })
      const approved = filterApprovedResults(results)
      return res.json(await redactLockedResults(await filterVisibleAcademicPeriods(req.user, approved)))
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
      return res.json(await filterVisibleAcademicPeriods(req.user, filteredResults))
    }

    if (req.user && req.user.role === 'learner') {
      const learner = await prisma.student.findFirst({
        where: { OR: [{ learnerUserId: req.user.id }, { email: req.user.email }] }
      })
      if (!learner) return res.json([])
      const results = await prisma.result.findMany({ where: { studentId: learner.id }, include: { student: true }, orderBy: { createdAt: 'desc' } })
      return res.json(await filterVisibleAcademicPeriods(req.user, results))
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
      if (!student || student.archivedAt || (student.parentEmail !== req.user.email && student.parentId !== req.user.id)) return res.status(403).json({ message: 'Forbidden' })
    }

    if (req.user && req.user.role === 'learner') {
      const student = await prisma.student.findFirst({
        where: {
          id: parseInt(studentId),
          archivedAt: null,
          OR: [{ learnerUserId: req.user.id }, { email: req.user.email }]
        }
      })
      if (!student) return res.status(403).json({ message: 'Forbidden' })
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

    let results = await prisma.result.findMany({ where: { studentId: parseInt(studentId) }, include: { student: true }, orderBy: { createdAt: 'desc' } })
    results = await filterVisibleAcademicPeriods(req.user, results)
    if (req.user && req.user.role === 'parent') {
      return res.json(await redactLockedResults(filterApprovedResults(results)))
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
      if (existingResult?.status === 'approved') {
        return res.status(403).json({ message: 'Approved results are read-only for teachers. Contact an administrator if a correction is needed.' })
      }
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
              gradeLevel: canonicalStudentClassName(gradeLevel),
              academicYear,
              term,
              scores: payload.scores,
              remarks: nextRemarks,
              submittedBy,
              status: 'pending'
            },
            include: { student: true }
          })

      await createNotificationsForRole(
        'admin',
        existingResult ? 'Result Updated by Teacher' : 'Result Submitted by Teacher',
        `${submittedBy || req.user.name} submitted ${result.student?.firstName || 'a learner'} ${result.student?.lastName || ''}'s ${term} ${academicYear} result for review.`,
        'result-review'
      )

      return res.status(existingResult ? 200 : 201).json(result)
    }

    // Non-teacher case
    const scoreValidation = validateTeacherScores(scores || {}, Object.keys(scores || {}))
    if (!scoreValidation.ok) return res.status(400).json({ message: scoreValidation.message })

    const result = await prisma.result.create({
      data: {
        studentId: parseInt(studentId),
        gradeLevel: canonicalStudentClassName(gradeLevel),
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
  if (!['admin', 'teacher'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Only teachers and administrators can update results.' })
  }

  try {
    const existing = await prisma.result.findUnique({ where: { id: parseInt(id) } })
    if (!existing) {
      return res.status(404).json({ message: 'Result not found' })
    }

    if (req.user && req.user.role === 'teacher') {
      if (existing.status === 'approved') {
        return res.status(403).json({ message: 'Approved results are read-only for teachers. Contact an administrator if a correction is needed.' })
      }
      if (await isPreviousAcademicPeriod(prisma, existing.academicYear, existing.term)) {
        return res.status(403).json({ message: 'Previous-term results are read-only.' })
      }
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
          status: existing.status === 'approved' ? 'approved' : 'pending'
        },
        include: { student: true }
      })

      return res.json(result)
    }

    const nextScores = scores === undefined ? existing.scores : scores
    const scoreValidation = validateTeacherScores(nextScores || {}, Object.keys(nextScores || {}))
    if (!scoreValidation.ok) return res.status(400).json({ message: scoreValidation.message })
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

    const updateData = {
      scores: nextScores,
      remarks: nextRemarksValue,
      status: nextStatus
    }

    // When approving, capture signature + timestamp automatically
    if (nextStatus === 'approved') {
      updateData.approvedAt = new Date()
      updateData.approvedBy = req.user?.name || 'Admin'
      // Fetch the actual stored signature URL from settings
const { PrismaClient: PrismaClient2 } = require('@prisma/client')
const prisma2 = new PrismaClient2()
const sigSetting = await prisma2.setting.findUnique({
  where: { key: 'headmaster_signature_url' }
})
if (sigSetting?.value) {
  updateData.headmasterSignature = sigSetting.value
}
    }

    const result = await prisma.result.update({
      where: { id: parseInt(id) },
      data: updateData,
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
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can archive results.' })
  }
  const { id } = req.params
  try {
    const result = await prisma.result.findUnique({ where: { id: parseInt(id) } })
    if (!result) return res.status(404).json({ message: 'Result not found.' })
    await prisma.$transaction(async tx => {
      await archive(tx, {
        entityType: 'result', entityId: result.id, studentId: result.studentId,
        title: `Result: ${result.gradeLevel} ${result.term} ${result.academicYear}`,
        academicYear: result.academicYear, term: result.term,
        reason: 'admin-deleted-result', payload: JSON.parse(JSON.stringify(result)),
        archivedBy: req.user.name || req.user.email
      })
      await tx.result.delete({ where: { id: result.id } })
    })
    res.json({ message: 'Result moved to the archive.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getResults, getResultsByStudent, createResult, updateResult, deleteResult }