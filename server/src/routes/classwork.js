const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  getClasswork, createClasswork, syncLegacyClasswork, updateClasswork,
  deleteClasswork, submitClasswork, markSubmission
} = require('../controllers/classworkController')

router.get('/', protect, getClasswork)
router.post('/sync-legacy', protect, syncLegacyClasswork)
router.post('/', protect, createClasswork)
router.post('/:id/submissions', protect, submitClasswork)
router.put('/submissions/:submissionId/mark', protect, markSubmission)
router.put('/:id', protect, updateClasswork)
router.delete('/:id', protect, deleteClasswork)

module.exports = router