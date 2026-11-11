const express = require('express')
const router = express.Router()
const {
  getFeeStructures, upsertFeeStructure,
  getFeePayments, getStudentFeePayments,
  createFeePayment, updateFeePayment, respondToFeeUpdate, deleteFeePayment,
  getUnseenFeeAlerts
} = require('../controllers/feeController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/structures', protect, requireAdminPermission('finance'), getFeeStructures)
router.post('/structures', protect, requireAdminPermission('finance'), upsertFeeStructure)
router.get('/payments', protect, requireAdminPermission('finance'), getFeePayments)
router.get('/payments/student/:studentId', protect, requireAdminPermission('finance'), getStudentFeePayments)
router.get('/unseen-alerts', protect, requireAdminPermission('finance'), getUnseenFeeAlerts)
router.post('/payments', protect, requireAdminPermission('finance'), createFeePayment)
router.put('/payments/:id', protect, requireAdminPermission('finance'), updateFeePayment)
router.post('/payments/:id/response', protect, requireAdminPermission('finance'), respondToFeeUpdate)
router.delete('/payments/:id', protect, requireAdminPermission('finance'), deleteFeePayment)

module.exports = router
