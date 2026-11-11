const express = require('express')
const router = express.Router()
const { createManualExercise, getManualExercises } = require('../controllers/manualExerciseController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/', protect, requireAdminPermission('learners'), getManualExercises)
router.post('/', protect, requireAdminPermission('learners'), createManualExercise)

module.exports = router
