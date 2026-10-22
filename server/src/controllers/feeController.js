const { PrismaClient } = require('@prisma/client')
const { createNotification, createNotificationsForRole } = require('./notificationController')
const { archive } = require('../utils/archive')
const { calculateFeeBalance, getFeeStatus } = require('../utils/feeMath')
const prisma = new PrismaClient()

// Fee Structure
const getFeeStructures = async (req, res) => {
  try {
    const where = {
      ...(req.query.academicYear ? { academicYear: String(req.query.academicYear) } : {}),
      ...(req.query.term ? { term: String(req.query.term) } : {})
    }
    const fees = await prisma.feeStructure.findMany({ where, orderBy: { gradeLevel: 'asc' } })
    res.json(fees)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const upsertFeeStructure = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Only administrators can set term fees.' })
  const { gradeLevel, academicYear, term, termFee } = req.body
  const parsedFee = Number(termFee)
  if (!gradeLevel || !/^\d{4}\/\d{4}$/.test(academicYear || '') || !['Term 1', 'Term 2', 'Term 3'].includes(term) || !Number.isFinite(parsedFee) || parsedFee < 0) {
    return res.status(400).json({ message: 'Class, academic year, term, and a valid term fee are required.' })
  }
  try {
    const fee = await prisma.feeStructure.upsert({
      where: { gradeLevel_academicYear_term: { gradeLevel, academicYear, term } },
      update: { termFee: parsedFee },
      create: { gradeLevel, academicYear, term, termFee: parsedFee }
    })
    res.json(fee)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Fee Payments
const getFeePayments = async (req, res) => {
  try {
    // Parents should only see payments for their children
    if (req.user && req.user.role === 'parent') {
      const email = req.user.email
      const children = await prisma.student.findMany({
        where: { archivedAt: null, OR: [{ parentEmail: email }, { parentId: req.user.id }] },
        select: { id: true }
      })
      const ids = children.map(c => c.id)
      const payments = await prisma.feePayment.findMany({ where: { studentId: { in: ids } }, include: { student: true }, orderBy: { createdAt: 'desc' } })
      return res.json(payments)
    }
    const payments = await prisma.feePayment.findMany({ include: { student: true }, orderBy: { createdAt: 'desc' } })
    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getStudentFeePayments = async (req, res) => {
  const { studentId } = req.params
  try {
    // If parent, ensure the requested student belongs to them
    if (req.user && req.user.role === 'parent') {
      const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } })
      if (!student || student.archivedAt || (student.parentEmail !== req.user.email && student.parentId !== req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
      }
    }
    const payments = await prisma.feePayment.findMany({ where: { studentId: parseInt(studentId) }, include: { student: true }, orderBy: { createdAt: 'desc' } })
    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createFeePayment = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Only administrators can create fee statements.' })
  const { studentId, academicYear, term, amountDue, previousTermArrears = 0, amountPaid = 0, notes } = req.body
  const due = Number(amountDue)
  const arrears = Number(previousTermArrears)
  const paid = Number(amountPaid)
  if (!studentId || !academicYear || !term || !Number.isFinite(due) || due < 0 || !Number.isFinite(arrears) || arrears < 0 || !Number.isFinite(paid) || paid < 0) {
    return res.status(400).json({ message: 'Learner, academic year, term, term fee, arrears, and amount paid must be valid.' })
  }
  if (!/^\d{4}\/\d{4}$/.test(academicYear) || !['Term 1', 'Term 2', 'Term 3'].includes(term)) {
    return res.status(400).json({ message: 'Choose a valid academic year and term.' })
  }
  try {
    const existing = await prisma.feePayment.findUnique({
      where: { studentId_academicYear_term: { studentId: parseInt(studentId), academicYear, term } }
    })
    if (existing) return res.status(409).json({ message: 'A fee statement already exists for this learner and term. Edit the existing statement instead.' })
    const balance = calculateFeeBalance(due, arrears, paid)
    const status = getFeeStatus(balance, paid)

    const payment = await prisma.feePayment.create({
      data: {
        studentId: parseInt(studentId),
        month: null,
        year: academicYear,
        academicYear,
        term,
        amountDue: due,
        previousTermArrears: arrears,
        amountPaid: paid,
        balance,
        status,
        notes,
        paidAt: paid > 0 ? new Date() : null
      },
      include: { student: true }
    })
    res.status(201).json(payment)

        // After creating/updating payment
    if (payment.student?.parentEmail) {
      const parent = await prisma.user.findUnique({
        where: { email: payment.student.parentEmail }
      });
      if (parent) {
        const periodLabel = `${payment.term || 'Legacy monthly'} ${payment.academicYear || payment.year || ''}`.trim()
        await createNotification(
          parent.id,
          "Fee Payment Update",
          `Payment of GH₵ ${payment.amountPaid} recorded for ${payment.student.firstName} ${payment.student.lastName} (${periodLabel}).`,
          "fee"
        );
      }
    }

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateFeePayment = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Only administrators can update fee statements.' })
  const { id } = req.params
  const { amountPaid, notes } = req.body
  try {
    const existing = await prisma.feePayment.findUnique({ where: { id: parseInt(id) } })
    if (!existing) return res.status(404).json({ message: 'Fee statement not found.' })
    const paid = amountPaid === undefined ? existing.amountPaid : Number(amountPaid)
    const arrears = req.body.previousTermArrears === undefined ? existing.previousTermArrears : Number(req.body.previousTermArrears)
    const due = req.body.amountDue === undefined ? existing.amountDue : Number(req.body.amountDue)
    if (![paid, arrears, due].every(Number.isFinite) || paid < 0 || arrears < 0 || due < 0) {
      return res.status(400).json({ message: 'Term fee, previous-term arrears, and amount paid must be valid non-negative amounts.' })
    }
    const balance = calculateFeeBalance(due, arrears, paid)
    const status = getFeeStatus(balance, paid)

    const payment = await prisma.feePayment.update({
      where: { id: parseInt(id) },
      data: {
        amountDue: due,
        previousTermArrears: arrears,
        amountPaid: paid,
        balance,
        status,
        notes,
        paidAt: paid > 0 ? new Date() : null,
        // Reset alert flag when admin updates fee so parent sees it on next login
        feePaymentAlertSeen: status === 'paid' ? true : false
      },
      include: { student: true }
    })
    res.json(payment)

        // After creating/updating payment
    if (payment.student?.parentEmail) {
      const parent = await prisma.user.findUnique({
        where: { email: payment.student.parentEmail }
      });
      if (parent) {
        const periodLabel = `${payment.term || payment.month || 'Fee'} ${payment.academicYear || payment.year || ''}`.trim()
        await createNotification(
          parent.id,
          "Fee Payment Update",
          `Payment of GH₵ ${payment.amountPaid} recorded for ${payment.student.firstName} ${payment.student.lastName} (${periodLabel}).`,
          "fee"
        );
      }
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteFeePayment = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Only administrators can archive fee payments.' })
  const { id } = req.params
  try {
    const payment = await prisma.feePayment.findUnique({ where: { id: parseInt(id) } })
    if (!payment) return res.status(404).json({ message: 'Fee payment not found.' })
    await prisma.$transaction(async tx => {
      await archive(tx, {
        entityType: 'feePayment', entityId: payment.id, studentId: payment.studentId,
        title: `Fee payment: ${payment.term ? `${payment.term} ${payment.academicYear}` : `${payment.month} ${payment.year}`}`,
        academicYear: payment.academicYear || payment.year, term: payment.term, reason: 'admin-deleted-fee-payment',
        payload: JSON.parse(JSON.stringify(payment)),
        archivedBy: req.user.name || req.user.email
      })
      await tx.feePayment.delete({ where: { id: payment.id } })
    })
    res.json({ message: 'Fee payment moved to the archive.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const respondToFeeUpdate = async (req, res) => {
  const { id } = req.params
  const { responseType } = req.body
  const allowedResponses = ['paid-part-or-full']

  if (!allowedResponses.includes(responseType)) {
    return res.status(400).json({ message: 'Invalid fee response.' })
  }

  try {
    const payment = await prisma.feePayment.findUnique({
      where: { id: parseInt(id) },
      include: { student: true }
    })

    if (!payment) return res.status(404).json({ message: 'Fee update not found.' })

    if (req.user.role !== 'parent' || (payment.student?.parentEmail !== req.user.email && payment.student?.parentId !== req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const learnerName = `${payment.student.firstName} ${payment.student.lastName}`.trim()
    const actionText = responseType === 'paid-part-or-full'
      ? 'says they have paid part or all of the outstanding fee'
      : 'says they will make payment soon'

    await createNotificationsForRole(
      'admin',
      'Parent Fee Response',
      `${req.user.name} ${actionText} for ${learnerName} (${payment.term || payment.month} ${payment.academicYear || payment.year}).`,
      'fee-response'
    )

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getUnseenFeeAlerts = async (req, res) => {
  try {
    // Only parents can access their own unpaid/partial fee alerts
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const email = req.user.email
    const children = await prisma.student.findMany({
      where: { archivedAt: null, OR: [{ parentEmail: email }, { parentId: req.user.id }] },
      select: { id: true }
    })
    const studentIds = children.map(c => c.id)

    // Show alerts for all unpaid/partial fees - will show every login until paid
    const unseenAlerts = await prisma.feePayment.findMany({
      where: {
        studentId: { in: studentIds },
        status: { in: ['partial', 'unpaid'] }
      },
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json(unseenAlerts)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getFeeStructures, upsertFeeStructure, getFeePayments, getStudentFeePayments, createFeePayment, updateFeePayment, respondToFeeUpdate, deleteFeePayment, getUnseenFeeAlerts }