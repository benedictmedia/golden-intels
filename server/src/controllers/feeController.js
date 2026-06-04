const { PrismaClient } = require('@prisma/client')
const { createNotification, createNotificationsForRole } = require('./notificationController')
const prisma = new PrismaClient()

// Fee Structure
const getFeeStructures = async (req, res) => {
  try {
    const fees = await prisma.feeStructure.findMany({ orderBy: { gradeLevel: 'asc' } })
    res.json(fees)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const upsertFeeStructure = async (req, res) => {
  const { gradeLevel, monthlyFee } = req.body
  try {
    const fee = await prisma.feeStructure.upsert({
      where: { gradeLevel },
      update: { monthlyFee: parseFloat(monthlyFee) },
      create: { gradeLevel, monthlyFee: parseFloat(monthlyFee) }
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
      const children = await prisma.student.findMany({ where: { parentEmail: email }, select: { id: true } })
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
      if (!student || student.parentEmail !== req.user.email) {
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
  const { studentId, month, year, amountDue, amountPaid, notes } = req.body
  try {
    const paid = parseFloat(amountPaid)
    const due = parseFloat(amountDue)
    const balance = due - paid
    const status = balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid'

    const payment = await prisma.feePayment.create({
      data: {
        studentId: parseInt(studentId),
        month,
        year,
        amountDue: due,
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
        await createNotification(
          parent.id,
          "Fee Payment Update",
          `Payment of GH₵ ${payment.amountPaid} recorded for ${payment.student.firstName} ${payment.student.lastName}`,
          "fee"
        );
      }
    }

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateFeePayment = async (req, res) => {
  const { id } = req.params
  const { amountPaid, notes } = req.body
  try {
    const existing = await prisma.feePayment.findUnique({ where: { id: parseInt(id) } })
    const paid = parseFloat(amountPaid)
    const balance = existing.amountDue - paid
    const status = balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid'

    const payment = await prisma.feePayment.update({
      where: { id: parseInt(id) },
      data: {
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
        await createNotification(
          parent.id,
          "Fee Payment Update",
          `Payment of GH₵ ${payment.amountPaid} recorded for ${payment.student.firstName} ${payment.student.lastName}`,
          "fee"
        );
      }
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteFeePayment = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.feePayment.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Fee payment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const respondToFeeUpdate = async (req, res) => {
  const { id } = req.params
  const { responseType } = req.body
  const allowedResponses = ['paid-part-or-full', 'will-soon-pay']

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
      `${req.user.name} ${actionText} for ${learnerName} (${payment.month} ${payment.year}).`,
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
      where: { parentEmail: email },
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
