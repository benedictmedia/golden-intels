const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { getArchives, restoreArchive, permanentlyDeleteArchive } = require('../controllers/archiveController')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/', protect, requireAdminPermission('archives'), getArchives)
router.post('/:id/restore', protect, requireAdminPermission('archives'), restoreArchive)
router.delete('/:id/permanent', protect, requireAdminPermission('archives'), permanentlyDeleteArchive)

module.exports = router