const express = require('express')
const router = express.Router()
const { getUsers, updateUser, deactivateUser, reactivateUser, deleteUser, getAccountAudits } = require('../controllers/userController')
const protect = require('../middleware/authMiddleware')

router.get('/', protect, getUsers)
router.put('/:id', protect, updateUser)
router.post('/deactivate', protect, deactivateUser)
router.post('/reactivate', protect, reactivateUser)
router.delete('/:id', protect, deleteUser)
router.get('/audits', protect, getAccountAudits)

module.exports = router
