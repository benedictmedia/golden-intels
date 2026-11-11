const express = require('express')
const router = express.Router()
const { register, login, getMe, changePassword, forgotPassword, resetPassword } = require('../controllers/authController')
const protect = require('../middleware/authMiddleware')
const passwordResetRateLimit = require('../middleware/passwordResetRateLimit')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.post('/register', protect, requireAdminPermission('accounts'), register)
router.post('/login', login)
router.post('/forgot-password', passwordResetRateLimit, forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/me', protect, getMe)
router.put('/change-password', protect, changePassword)

module.exports = router
