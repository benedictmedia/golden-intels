const express = require('express')
const router = express.Router()
const {
  getFeeStructures, upsertFeeStructure,
  getFeePayments, getStudentFeePayments,
  createFeePayment, updateFeePayment, respondToFeeUpdate, deleteFeePayment,
  getUnseenFeeAlerts
} = require('../controllers/feeController')
const protect = require('../middleware/authMiddleware')

router.get('/structures', protect, getFeeStructures)
router.post('/structures', protect, upsertFeeStructure)
router.get('/payments', protect, getFeePayments)
router.get('/payments/student/:studentId', protect, getStudentFeePayments)
router.get('/unseen-alerts', protect, getUnseenFeeAlerts)
router.post('/payments', protect, createFeePayment)
router.put('/payments/:id', protect, updateFeePayment)
router.post('/payments/:id/response', protect, respondToFeeUpdate)
router.delete('/payments/:id', protect, deleteFeePayment)

module.exports = router
