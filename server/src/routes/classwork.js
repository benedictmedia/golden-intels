const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  getClasswork, createClasswork, syncLegacyClasswork, updateClasswork,
  deleteClasswork, submitClasswork, markSubmission
} = require('../controllers/classworkController')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/', protect, requireAdminPermission('learners'), getClasswork)
router.post('/sync-legacy', protect, requireAdminPermission('learners'), syncLegacyClasswork)
router.post('/', protect, requireAdminPermission('learners'), createClasswork)
router.post('/:id/submissions', protect, requireAdminPermission('learners'), submitClasswork)
router.put('/submissions/:submissionId/mark', protect, requireAdminPermission('learners'), markSubmission)
router.put('/:id', protect, requireAdminPermission('learners'), updateClasswork)
router.delete('/:id', protect, requireAdminPermission('learners'), deleteClasswork)

module.exports = router