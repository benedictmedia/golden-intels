const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { getArchives, restoreArchive, permanentlyDeleteArchive } = require('../controllers/archiveController')

router.get('/', protect, getArchives)
router.post('/:id/restore', protect, restoreArchive)
router.delete('/:id/permanent', protect, permanentlyDeleteArchive)

module.exports = router