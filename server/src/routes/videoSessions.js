const express = require('express')
const router = express.Router()
const { getSessions, createSession, updateSession, deleteSession } = require('../controllers/videoSessionController')
const protect = require('../middleware/authMiddleware')

router.get('/', protect, getSessions)
router.post('/', protect, createSession)
router.put('/:id', protect, updateSession)
router.delete('/:id', protect, deleteSession)

module.exports = router