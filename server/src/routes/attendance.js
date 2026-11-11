const express = require('express')
const router = express.Router()
const { getAttendance, getStudentAttendance, saveAttendance, getAttendanceSummary } = require('../controllers/attendanceController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission, requireAnyAdminPermission } = require('../middleware/adminPermissions')

router.get('/', protect, requireAdminPermission('attendance'), getAttendance)
router.get('/student/:studentId', protect, requireAdminPermission('attendance'), getStudentAttendance)
router.get('/summary/:studentId', protect, requireAnyAdminPermission(['attendance', 'performance:view']), getAttendanceSummary)
router.post('/', protect, requireAdminPermission('attendance'), saveAttendance)

module.exports = router
