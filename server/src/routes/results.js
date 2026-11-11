const express = require('express')
const router = express.Router()
const {
  getResults,
  getResultsByStudent,
  createResult,
  updateResult,
  deleteResult
} = require('../controllers/resultController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/', protect, requireAdminPermission('performance:view'), getResults)
router.get('/student/:studentId', protect, requireAdminPermission('performance:view'), getResultsByStudent)
router.post('/', protect, requireAdminPermission('performance:edit'), createResult)
router.put('/:id', protect, requireAdminPermission('performance:view'), updateResult)
router.delete('/:id', protect, requireAdminPermission('performance:delete'), deleteResult)

module.exports = router