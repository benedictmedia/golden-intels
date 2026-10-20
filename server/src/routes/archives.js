const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { getArchives, restoreArchive } = require('../controllers/archiveController')

router.get('/', protect, getArchives)
router.post('/:id/restore', protect, restoreArchive)

module.exports = router