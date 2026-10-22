const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const requireAdmin = (req, res) => {
  if (req.user?.role === 'admin') return true
  res.status(403).json({ message: 'Only administrators can manage archived records.' })
  return false
}

const restoreDates = (data, fields) => {
  const restored = { ...data }
  for (const field of fields) {
    if (restored[field]) restored[field] = new Date(restored[field])
  }
  return restored
}

const getArchives = async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const records = await prisma.archiveRecord.findMany({
      select: {
        id: true, entityType: true, entityId: true, studentId: true, title: true,
        academicYear: true, term: true, reason: true, archivedBy: true,
        archivedAt: true, restoredBy: true, restoredAt: true
      },
      orderBy: { archivedAt: 'desc' }
    })
    res.json(records)
  } catch (error) {
    console.error('Get archives error:', error)
    res.status(500).json({ message: 'Could not load the archive.' })
  }
}

const restoreArchive = async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const archiveId = Number(req.params.id)
    const record = await prisma.archiveRecord.findUnique({ where: { id: archiveId } })
    if (!record) return res.status(404).json({ message: 'Archived record not found.' })
    if (record.restoredAt) return res.status(409).json({ message: 'This record has already been restored.' })

    const payload = record.payload
    const entityMap = {
      result: 'result', feePayment: 'feePayment',
      attendanceRecord: 'attendanceRecord', manualExercise: 'manualExercise'
    }
    if (record.entityType !== 'student' && record.entityType !== 'classwork-item' && !entityMap[record.entityType]) {
      return res.status(400).json({ message: 'This archived record type cannot be restored automatically.' })
    }

    const restored = await prisma.$transaction(async tx => {
      if (record.entityType === 'student') {
        const student = await tx.student.findUnique({ where: { id: record.entityId } })
        if (!student) throw new Error('The archived learner record no longer exists.')
        const parent = payload.student?.parentId
          ? await tx.user.findUnique({ where: { id: payload.student.parentId }, select: { id: true } })
          : null
        await tx.student.update({
          where: { id: student.id },
          data: {
            archivedAt: null,
            status: payload.previousStatus || 'active',
            parentId: parent?.id || null,
            parentEmail: payload.student?.parentEmail || null
          }
        })
      } else if (record.entityType === 'classwork-item') {
        const { item, submissions = [] } = payload
        await tx.classworkItem.create({ data: restoreDates(item, ['createdAt', 'updatedAt']) })
        if (submissions.length) {
          await tx.classworkSubmission.createMany({ data: submissions.map(submission => restoreDates(submission, ['startedAt', 'submittedAt', 'markedAt', 'createdAt', 'updatedAt'])) })
        }
      } else {
        const dateFields = {
          result: ['approvedAt', 'createdAt', 'updatedAt'],
          feePayment: ['paidAt', 'createdAt', 'updatedAt'],
          attendanceRecord: ['createdAt', 'updatedAt'],
          manualExercise: ['markedAt', 'createdAt', 'updatedAt']
        }
        await tx[entityMap[record.entityType]].create({ data: restoreDates(payload, dateFields[record.entityType]) })
      }
      return tx.archiveRecord.update({
        where: { id: archiveId },
        data: { restoredAt: new Date(), restoredBy: req.user.name || req.user.email }
      })
    })
    res.json(restored)
  } catch (error) {
    console.error('Restore archive error:', error)
    res.status(400).json({ message: error.message || 'Could not restore this record.' })
  }
}

const permanentlyDeleteArchive = async (req, res) => {
  if (!requireAdmin(req, res)) return
  if (req.body.confirm !== 'DELETE') {
    return res.status(400).json({ message: 'Explicit DELETE confirmation is required.' })
  }

  try {
    const archiveId = Number(req.params.id)
    const record = await prisma.archiveRecord.findUnique({ where: { id: archiveId } })
    if (!record) return res.status(404).json({ message: 'Archived record not found.' })
    if (record.restoredAt) return res.status(409).json({ message: 'Restore this record before managing its active data.' })

    await prisma.$transaction(async tx => {
      if (record.entityType === 'student') {
        const student = await tx.student.findUnique({ where: { id: record.entityId } })
        if (student) {
          const studentId = student.id
          const admissionApplicationId = student.admissionApplicationId
          const learnerUserId = student.learnerUserId
          await tx.classworkSubmission.deleteMany({ where: { studentId } })
          await tx.result.deleteMany({ where: { studentId } })
          await tx.feePayment.deleteMany({ where: { studentId } })
          await tx.attendanceRecord.deleteMany({ where: { studentId } })
          await tx.manualExercise.deleteMany({ where: { studentId } })
          await tx.message.deleteMany({ where: { conversationUserId: studentId } })
          await tx.student.delete({ where: { id: studentId } })
          if (admissionApplicationId) {
            await tx.admissionApplication.deleteMany({ where: { id: admissionApplicationId } })
          }
          if (learnerUserId) {
            await tx.accountAudit.deleteMany({ where: { userId: learnerUserId } })
            const linkedLearner = await tx.user.findFirst({
              where: { id: learnerUserId, role: 'learner' },
              select: { id: true }
            })
            if (linkedLearner) await tx.user.delete({ where: { id: linkedLearner.id } })
          }
        }
        const classworkArchives = await tx.archiveRecord.findMany({ where: { entityType: 'classwork-item' } })
        for (const archivedClasswork of classworkArchives) {
          const payload = archivedClasswork.payload
          const submissions = Array.isArray(payload?.submissions) ? payload.submissions : []
          const retained = submissions.filter(submission => submission.studentId !== record.entityId)
          if (retained.length !== submissions.length) {
            await tx.archiveRecord.update({
              where: { id: archivedClasswork.id },
              data: { payload: { ...payload, submissions: retained } }
            })
          }
        }
        await tx.archiveRecord.deleteMany({
          where: { OR: [{ studentId: record.entityId }, { entityType: 'student', entityId: record.entityId }] }
        })
      } else {
        await tx.archiveRecord.delete({ where: { id: archiveId } })
      }
    })
    res.json({ message: 'Archived data permanently deleted.' })
  } catch (error) {
    console.error('Permanent archive deletion error:', error)
    res.status(400).json({ message: error.message || 'Could not permanently delete this archive entry.' })
  }
}

module.exports = { getArchives, restoreArchive, permanentlyDeleteArchive }