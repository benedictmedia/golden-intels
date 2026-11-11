const express = require('express')
const router = express.Router()
const { getUsers, updateUser, resetUserPassword, resetUserPasswords, deactivateUser, reactivateUser, deleteUser, getAccountAudits } = require('../controllers/userController')
const protect = require('../middleware/authMiddleware')
const { uploadStaff } = require('../middleware/cloudinaryUpload')
const { requireAdminPermission } = require('../middleware/adminPermissions')

// ✅ Specific named routes FIRST — before any /:id wildcards
router.get('/', protect, requireAdminPermission('accounts'), getUsers)
router.get('/audits', protect, requireAdminPermission('accounts'), getAccountAudits)
router.post('/deactivate', protect, requireAdminPermission('accounts'), deactivateUser)
router.post('/reactivate', protect, requireAdminPermission('accounts'), reactivateUser)
router.post('/reset-passwords', protect, requireAdminPermission('accounts'), resetUserPasswords)

// ✅ Wildcard /:id routes LAST
router.post('/:id/reset-password', protect, requireAdminPermission('accounts'), resetUserPassword)
router.put('/:id', protect, requireAdminPermission('accounts'), uploadStaff.single('photo'), updateUser)
router.delete('/:id', protect, requireAdminPermission('accounts'), deleteUser)

module.exports = router
