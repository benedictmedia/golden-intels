const express = require('express')
const router = express.Router()
const { getUsers, updateUser, deactivateUser, reactivateUser, deleteUser, getAccountAudits } = require('../controllers/userController')
const protect = require('../middleware/authMiddleware')
const { uploadStaff } = require('../middleware/cloudinaryUpload')

router.get('/', protect, getUsers)
router.put('/:id', protect, uploadStaff.single('photo'), updateUser)
router.post('/deactivate', protect, deactivateUser)
router.post('/reactivate', protect, reactivateUser)
router.delete('/:id', protect, deleteUser)
router.get('/audits', protect, getAccountAudits)

module.exports = router
