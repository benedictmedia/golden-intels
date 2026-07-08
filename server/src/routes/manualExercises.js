const express = require('express')
const router = express.Router()
const { createManualExercise, getManualExercises } = require('../controllers/manualExerciseController')
const protect = require('../middleware/authMiddleware')

router.get('/', protect, getManualExercises)
router.post('/', protect, createManualExercise)

module.exports = router
