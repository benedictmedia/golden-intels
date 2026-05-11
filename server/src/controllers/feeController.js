const { PrismaClient } = require('@prisma/client')
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
    const payments = await prisma.feePayment.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getStudentFeePayments = async (req, res) => {
  const { studentId } = req.params
  try {
    const payments = await prisma.feePayment.findMany({
      where: { studentId: parseInt(studentId) },
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
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
        paidAt: paid > 0 ? new Date() : null
      },
      include: { student: true }
    })
    res.json(payment)
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

module.exports = { getFeeStructures, upsertFeeStructure, getFeePayments, getStudentFeePayments, createFeePayment, updateFeePayment, deleteFeePayment }