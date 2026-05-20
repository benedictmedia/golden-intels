const express = require('express')
const router = express.Router()
const { getAttendance, getStudentAttendance, saveAttendance, getAttendanceSummary } = require('../controllers/attendanceController')
const protect = require('../middleware/authMiddleware')

router.get('/', protect, getAttendance)
router.get('/student/:studentId', protect, getStudentAttendance)
router.get('/summary/:studentId', protect, getAttendanceSummary)
router.post('/', protect, saveAttendance)

module.exports = router
