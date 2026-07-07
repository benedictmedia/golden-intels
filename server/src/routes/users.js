const express = require('express')
const router = express.Router()
const { getUsers, updateUser, resetUserPassword, deactivateUser, reactivateUser, deleteUser, getAccountAudits } = require('../controllers/userController')
const protect = require('../middleware/authMiddleware')
const { uploadStaff } = require('../middleware/cloudinaryUpload')

// ✅ Specific named routes FIRST — before any /:id wildcards
router.get('/', protect, getUsers)
router.get('/audits', protect, getAccountAudits)        // ← must be before /:id
router.post('/deactivate', protect, deactivateUser)     // ← must be before /:id
router.post('/reactivate', protect, reactivateUser)     // ← must be before /:id

// ✅ Wildcard /:id routes LAST
router.post('/:id/reset-password', protect, resetUserPassword)
router.put('/:id', protect, uploadStaff.single('photo'), updateUser)
router.delete('/:id', protect, deleteUser)

module.exports = router
