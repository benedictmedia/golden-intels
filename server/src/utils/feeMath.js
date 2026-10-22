const calculateFeeBalance = (termFee, previousTermArrears, amountPaid) => (
  Math.max(0, Number(termFee) + Number(previousTermArrears) - Number(amountPaid))
)

const getFeeStatus = (balance, amountPaid) => (
  balance <= 0 ? 'paid' : Number(amountPaid) > 0 ? 'partial' : 'unpaid'
)

module.exports = { calculateFeeBalance, getFeeStatus }