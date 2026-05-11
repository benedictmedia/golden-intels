const express = require('express')
const router = express.Router()
const {
  createToken,
  getTokens,
  verifyToken,
  markTokenUsed,
  deleteToken
} = require('../controllers/admissionTokenController')
const protect = require('../middleware/authMiddleware')

router.post('/verify', verifyToken)
router.post('/mark-used', markTokenUsed)
router.get('/', protect, getTokens)
router.post('/', protect, createToken)
router.delete('/:id', protect, deleteToken)

module.exports = router