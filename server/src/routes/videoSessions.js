const express = require('express')
const router = express.Router()
const { getSessions, createSession, updateSession, deleteSession } = require('../controllers/videoSessionController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/', protect, requireAdminPermission('messages'), getSessions)
router.post('/', protect, requireAdminPermission('messages'), createSession)
router.put('/:id', protect, requireAdminPermission('messages'), updateSession)
router.delete('/:id', protect, requireAdminPermission('messages'), deleteSession)

module.exports = router