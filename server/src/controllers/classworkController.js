const { PrismaClient } = require('@prisma/client')
const { archive, isPreviousAcademicPeriod } = require('../utils/archive')

const prisma = new PrismaClient()
const CLASSWORK_TYPES = new Set(['assignment', 'quiz', 'lesson'])
const MANUAL_QUESTION_TYPES = new Set(['short-answer', 'paragraph', 'fill-in'])

const normalizeClass = (value) => String(value ?? '').trim().toLowerCase()
  .replace(/\s*\(babies\)\s*$/i, '').replace(/\s+/g, ' ')

const getLearner = async (user) => prisma.student.findFirst({
  where: {
    archivedAt: null,
    OR: [
      { learnerUserId: user.id },
      { email: user.email }
    ]
  }
})

const getTeacherClasses = async (email) => {
  const staff = await prisma.staff.findFirst({ where: { email } })
  return new Set([
    ...(staff?.classes || []),
    ...(staff?.classTeacherClasses || [])
  ].map(normalizeClass).filter(Boolean))
}

const getActiveAcademicContext = async () => {
  const context = await prisma.academicContext.findFirst({ orderBy: { updatedAt: 'desc' } })
  const year = Number(String(context?.academicYear || '').match(/^(\d{4})/)?.[1])
  if (!context || !Number.isFinite(year) || year < 2026) return { academicYear: '2026/2027', term: 'Term 1' }
  return context
}

const isAcademicPeriodAllowed = async (user, academicYear, term) => {
  if (user.role === 'admin') return true
  const current = await getActiveAcademicContext()
  const currentYear = Number(current.academicYear.slice(0, 4))
  const requestedYear = Number(String(academicYear || current.academicYear).slice(0, 4))
  const currentTerm = Number(current.term.match(/\d+/)?.[0] || 1)
  const requestedTerm = Number(String(term || current.term).match(/\d+/)?.[0] || 0)
  return requestedYear >= 2026 && requestedYear <= currentYear && (requestedYear < currentYear || requestedTerm <= currentTerm)
}

const toSubmissionRecord = (submission) => {
  const item = submission.classworkItem
  const questions = Array.isArray(submission.questions) ? submission.questions : []
  return {
    ...submission,
    type: item.type,
    itemId: item.id,
    title: item.title,
    subject: item.subject,
    gradeLevel: item.gradeLevel,
    dueDate: item.dueDate,
    academicYear: item.academicYear,
    term: item.term,
    questions
  }
}

const getClasswork = async (req, res) => {
  try {
    const { academicYear, term, studentId } = req.query
    const contextFilter = {
      ...(academicYear ? { academicYear: String(academicYear) } : {}),
      ...(term ? { term: String(term) } : {})
    }
    if (!await isAcademicPeriodAllowed(req.user, academicYear, term)) {
      return res.status(403).json({ message: 'Upcoming academic periods are visible to administrators only.' })
    }

    if (req.user.role === 'teacher') {
      const items = await prisma.classworkItem.findMany({
        where: { teacherEmail: req.user.email, ...contextFilter },
        include: { submissions: { include: { classworkItem: true } } },
        orderBy: { createdAt: 'desc' }
      })
      return res.json({
        items,
        submissions: items.flatMap(item => item.submissions.map(toSubmissionRecord))
      })
    }

    if (req.user.role === 'learner') {
      const learner = await getLearner(req.user)
      if (!learner) return res.json({ items: [], submissions: [] })

      const [items, submissions] = await Promise.all([
        prisma.classworkItem.findMany({
          where: { published: true, ...contextFilter },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.classworkSubmission.findMany({
          where: { studentId: learner.id, classworkItem: contextFilter }
        })
      ])
      const submissionByItemId = new Map(submissions.map(submission => [submission.classworkItemId, submission]))
      const learnerItems = items
        .filter(item => normalizeClass(item.gradeLevel) === normalizeClass(learner.gradeLevel))
        .map(item => {
          const submission = submissionByItemId.get(item.id)
          const questions = Array.isArray(item.questions) ? item.questions : []
          return {
            ...item,
            questions: item.type !== 'quiz' ? questions : questions.map(({ answer, ...question }) => (
              submission?.marked ? { ...question, answer } : question
            )),
            submission: submission ? {
              id: submission.id,
              answer: submission.questions?.[0]?.selected || '',
              answers: Object.fromEntries((submission.questions || []).map((question, index) => [index, question.selected || ''])),
              score: submission.score,
              totalQuestions: submission.totalQuestions,
              submittedAt: submission.submittedAt,
              marked: submission.marked,
              feedback: submission.feedback
            } : null
          }
        })
      return res.json({ items: learnerItems, submissions: [] })
    }

    if (req.user.role === 'parent') {
      if (!studentId) return res.json({ items: [], submissions: [] })
      const child = await prisma.student.findFirst({
        where: {
          id: Number(studentId),
          archivedAt: null,
          OR: [{ parentId: req.user.id }, { parentEmail: req.user.email }]
        }
      })
      if (!child) return res.status(403).json({ message: 'You cannot view this learner’s assessment records.' })

      const submissions = await prisma.classworkSubmission.findMany({
        where: { studentId: child.id, marked: true, classworkItem: contextFilter },
        include: { classworkItem: true },
        orderBy: { submittedAt: 'desc' }
      })
      return res.json({ items: [], submissions: submissions.map(toSubmissionRecord) })
    }

    return res.status(403).json({ message: 'This account cannot access classwork.' })
  } catch (error) {
    console.error('Get classwork error:', error)
    return res.status(500).json({ message: 'Could not load classwork.' })
  }
}

const createClasswork = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can create classwork.' })
    const { type, title, subject, gradeLevel, description, content, dueDate, durationMinutes, questions, academicYear, term } = req.body
    if (!CLASSWORK_TYPES.has(type) || !title || !subject || !gradeLevel || !academicYear || !term) {
      return res.status(400).json({ message: 'Type, title, subject, class, academic year, and term are required.' })
    }
    const teacherClasses = await getTeacherClasses(req.user.email)
    if (!teacherClasses.has(normalizeClass(gradeLevel))) {
      return res.status(403).json({ message: 'You can only create classwork for classes assigned to you.' })
    }
    if (!await isAcademicPeriodAllowed(req.user, academicYear, term)) {
      return res.status(403).json({ message: 'You cannot create classwork for an upcoming academic period.' })
    }
    if (await isPreviousAcademicPeriod(prisma, academicYear, term)) {
      return res.status(403).json({ message: 'Teachers cannot create classwork in a previous academic period.' })
    }

    const item = await prisma.classworkItem.create({
      data: {
        type, title: String(title).trim(), subject, gradeLevel,
        description: description || null, content: content || null,
        dueDate: dueDate || null,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        questions: type === 'quiz' ? (questions || []) : undefined,
        published: Boolean(req.body.published),
        teacherEmail: req.user.email,
        teacherName: req.user.name || req.user.email,
        academicYear, term
      }
    })
    res.status(201).json(item)
  } catch (error) {
    console.error('Create classwork error:', error)
    res.status(400).json({ message: error.message || 'Could not create classwork.' })
  }
}

const syncLegacyClasswork = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can sync classwork.' })
    if (!Array.isArray(req.body.items)) return res.status(400).json({ message: 'Classwork items are required.' })
    const teacherClasses = await getTeacherClasses(req.user.email)
    const syncedItems = []

    for (const item of req.body.items) {
      if (!CLASSWORK_TYPES.has(item.type) || !item.id || !item.title || !item.subject || !item.gradeLevel) continue
      if (!teacherClasses.has(normalizeClass(item.gradeLevel))) continue
      const legacyId = String(item.id)
      const academicYear = String(item.academicYear || '2026/2027')
      const term = String(item.term || 'Term 1')
      if (!await isAcademicPeriodAllowed(req.user, academicYear, term)) continue
      const data = {
        type: item.type, title: item.title, subject: item.subject, gradeLevel: item.gradeLevel,
        description: item.description || null, content: item.content || null,
        dueDate: item.dueDate || null,
        durationMinutes: item.durationMinutes ? Number(item.durationMinutes) : null,
        questions: item.type === 'quiz' ? (item.questions || []) : undefined,
        published: Boolean(item.published), teacherEmail: req.user.email,
        teacherName: req.user.name || item.teacherName || req.user.email,
        academicYear, term
      }
      const saved = await prisma.classworkItem.upsert({
        where: { teacherEmail_type_legacyId: { teacherEmail: req.user.email, type: item.type, legacyId } },
        create: { ...data, legacyId },
        update: data
      })
      syncedItems.push(saved)
    }

    for (const record of req.body.submissions || []) {
      if (!['assignment', 'quiz'].includes(record.type) || !record.itemId) continue
      const item = await prisma.classworkItem.findFirst({
        where: { teacherEmail: req.user.email, type: record.type, legacyId: String(record.itemId) }
      })
      if (!item) continue
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            ...(record.learnerEmail ? [{ email: record.learnerEmail }] : []),
            ...(record.studentId ? [{ studentId: String(record.studentId) }] : [])
          ]
        }
      })
      if (!student || normalizeClass(student.gradeLevel) !== normalizeClass(item.gradeLevel)) continue

      const submittedAt = record.submittedAt ? new Date(record.submittedAt) : new Date()
      const score = record.score === '' || record.score == null ? null : Number(record.score)
      await prisma.classworkSubmission.upsert({
        where: { classworkItemId_studentId: { classworkItemId: item.id, studentId: student.id } },
        create: {
          classworkItemId: item.id, studentId: student.id,
          learnerName: record.learnerName || `${student.firstName} ${student.lastName}`.trim(),
          learnerEmail: record.learnerEmail || student.email || '',
          device: record.device || null,
          startedAt: record.startedAt ? new Date(record.startedAt) : null,
          submittedAt,
          timeUsedSeconds: Number.isFinite(Number(record.timeUsedSeconds)) ? Number(record.timeUsedSeconds) : null,
          questions: Array.isArray(record.questions) ? record.questions : [],
          score: Number.isFinite(score) ? score : null,
          totalQuestions: Number.isInteger(Number(record.totalQuestions)) ? Number(record.totalQuestions) : null,
          marked: Boolean(record.marked),
          markedAt: record.markedAt ? new Date(record.markedAt) : null,
          markedBy: record.markedBy || null,
          feedback: record.feedback || null
        },
        update: {}
      })
    }
    res.json({ items: syncedItems })
  } catch (error) {
    console.error('Sync legacy classwork error:', error)
    res.status(500).json({ message: 'Could not sync existing classwork.' })
  }
}

const updateClasswork = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can update classwork.' })
    const id = Number(req.params.id)
    const existing = await prisma.classworkItem.findFirst({ where: { id, teacherEmail: req.user.email } })
    if (!existing) return res.status(404).json({ message: 'Classwork not found.' })

    const teacherClasses = await getTeacherClasses(req.user.email)
    const gradeLevel = req.body.gradeLevel ?? existing.gradeLevel
    if (!teacherClasses.has(normalizeClass(gradeLevel))) {
      return res.status(403).json({ message: 'You can only use classes assigned to you.' })
    }
    if (!await isAcademicPeriodAllowed(req.user, req.body.academicYear ?? existing.academicYear, req.body.term ?? existing.term)) {
      return res.status(403).json({ message: 'You cannot update classwork for an upcoming academic period.' })
    }
    if (await isPreviousAcademicPeriod(prisma, existing.academicYear, existing.term)) {
      return res.status(403).json({ message: 'Previous-term classwork is read-only.' })
    }
    const data = {}
    for (const field of ['title', 'subject', 'gradeLevel', 'description', 'content', 'dueDate', 'durationMinutes', 'published', 'academicYear', 'term', 'questions']) {
      if (req.body[field] !== undefined) data[field] = req.body[field]
    }
    const item = await prisma.classworkItem.update({ where: { id }, data })
    res.json(item)
  } catch (error) {
    console.error('Update classwork error:', error)
    res.status(400).json({ message: error.message || 'Could not update classwork.' })
  }
}

const deleteClasswork = async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Only teachers and administrators can archive classwork.' })
    const id = Number(req.params.id)
    const item = await prisma.classworkItem.findFirst({
      where: { id, ...(req.user.role === 'teacher' ? { teacherEmail: req.user.email } : {}) },
      include: { submissions: true }
    })
    if (!item) return res.status(404).json({ message: 'Classwork not found.' })
    if (req.user.role === 'teacher' && await isPreviousAcademicPeriod(prisma, item.academicYear, item.term)) {
      return res.status(403).json({ message: 'Previous-term classwork cannot be deleted by a teacher.' })
    }
    await prisma.$transaction(async tx => {
      const { submissions, ...itemData } = item
      await archive(tx, {
        entityType: 'classwork-item', entityId: item.id, title: `${item.type}: ${item.title}`,
        academicYear: item.academicYear, term: item.term, reason: `${req.user.role}-deleted-classwork`,
        payload: JSON.parse(JSON.stringify({ item: itemData, submissions })),
        archivedBy: req.user.name || req.user.email
      })
      await tx.classworkItem.delete({ where: { id } })
    })
    res.json({ message: 'Classwork and submissions moved to the archive.' })
  } catch (error) {
    console.error('Delete classwork error:', error)
    res.status(500).json({ message: 'Could not delete classwork.' })
  }
}

const submitClasswork = async (req, res) => {
  try {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Only learners can submit classwork.' })
    const learner = await getLearner(req.user)
    if (!learner) return res.status(404).json({ message: 'Learner profile not found.' })
    const item = await prisma.classworkItem.findFirst({ where: { id: Number(req.params.id), published: true } })
    if (!item || normalizeClass(item.gradeLevel) !== normalizeClass(learner.gradeLevel)) {
      return res.status(404).json({ message: 'This classwork is not available to your class.' })
    }
    if (await isPreviousAcademicPeriod(prisma, item.academicYear, item.term)) {
      return res.status(403).json({ message: 'Previous-term classwork is read-only.' })
    }
    const existing = await prisma.classworkSubmission.findUnique({
      where: { classworkItemId_studentId: { classworkItemId: item.id, studentId: learner.id } }
    })
    if (existing) return res.status(409).json({ message: 'You have already submitted this item.' })

    const submittedAt = new Date()
    const suppliedAnswers = req.body.answers || {}
    const questions = item.type === 'quiz'
      ? (Array.isArray(item.questions) ? item.questions : []).map((question, index) => ({
          prompt: question.prompt,
          type: question.type,
          selected: String(suppliedAnswers[index] ?? 'No answer'),
          answer: question.answer
        }))
      : [{ prompt: item.description || item.title, selected: String(req.body.answer || ''), answer: 'Student response' }]
    const hasManualQuestions = item.type === 'quiz' && questions.some(question => MANUAL_QUESTION_TYPES.has(question.type))
    const correctCount = item.type === 'quiz'
      ? questions.reduce((sum, question) => sum + (!MANUAL_QUESTION_TYPES.has(question.type) && question.selected.trim().toLowerCase() === String(question.answer ?? '').trim().toLowerCase() ? 1 : 0), 0)
      : null
    const submission = await prisma.classworkSubmission.create({
      data: {
        classworkItemId: item.id, studentId: learner.id,
        learnerName: `${learner.firstName} ${learner.lastName}`.trim(),
        learnerEmail: req.user.email,
        device: req.body.device || null,
        startedAt: req.body.startedAt ? new Date(req.body.startedAt) : null,
        submittedAt,
        timeUsedSeconds: Number.isFinite(Number(req.body.timeUsedSeconds)) ? Number(req.body.timeUsedSeconds) : null,
        questions,
        score: correctCount,
        totalQuestions: item.type === 'quiz' ? questions.length : null,
        marked: item.type === 'quiz' && !hasManualQuestions,
        markedAt: item.type === 'quiz' && !hasManualQuestions ? submittedAt : null,
        markedBy: item.type === 'quiz' && !hasManualQuestions ? 'Auto-marked' : null
      }
    })
    res.status(201).json({
      id: submission.id,
      type: item.type,
      itemId: item.id,
      title: item.title,
      submittedAt: submission.submittedAt,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      marked: submission.marked,
      feedback: submission.feedback,
      questions: questions.map(({ answer, ...question }) => (
        submission.marked ? { ...question, answer } : question
      ))
    })
  } catch (error) {
    console.error('Submit classwork error:', error)
    res.status(400).json({ message: error.message || 'Could not submit classwork.' })
  }
}

const markSubmission = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can mark submissions.' })
    const submission = await prisma.classworkSubmission.findFirst({
      where: { id: Number(req.params.submissionId), classworkItem: { teacherEmail: req.user.email } },
      include: { classworkItem: true }
    })
    if (!submission) return res.status(404).json({ message: 'Submission not found.' })
    if (await isPreviousAcademicPeriod(prisma, submission.classworkItem.academicYear, submission.classworkItem.term)) {
      return res.status(403).json({ message: 'Previous-term submissions are read-only.' })
    }
    const score = req.body.score === '' || req.body.score == null ? null : Number(req.body.score)
    if (score !== null && !Number.isFinite(score)) return res.status(400).json({ message: 'Score must be a number.' })
    const updated = await prisma.classworkSubmission.update({
      where: { id: submission.id },
      data: {
        score,
        feedback: String(req.body.feedback || ''),
        marked: true,
        markedAt: new Date(),
        markedBy: req.user.name || req.user.email
      },
      include: { classworkItem: true }
    })
    res.json(toSubmissionRecord(updated))
  } catch (error) {
    console.error('Mark classwork submission error:', error)
    res.status(400).json({ message: error.message || 'Could not save mark.' })
  }
}

module.exports = { getClasswork, createClasswork, syncLegacyClasswork, updateClasswork, deleteClasswork, submitClasswork, markSubmission }