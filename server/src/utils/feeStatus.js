const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Mirrors the frontend's isFeeClearedForTerm logic: a student with no fee
// records at all is given the benefit of the doubt (cleared). A student is
// only considered "not cleared" if they have at least one fee payment
// record with an outstanding balance.
const isStudentFeeCleared = async (studentId) => {
  const payments = await prisma.feePayment.findMany({
    where: { studentId: Number(studentId) },
    select: { balance: true }
  })
  if (payments.length === 0) return true
  return !payments.some((p) => Number(p.balance) > 0)
}

module.exports = { isStudentFeeCleared }