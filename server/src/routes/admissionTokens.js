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
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.post('/verify', verifyToken)
router.post('/mark-used', markTokenUsed)
router.get('/', protect, requireAdminPermission('admission-tokens'), getTokens)
router.post('/', protect, requireAdminPermission('admission-tokens'), createToken)
router.delete('/:id', protect, requireAdminPermission('admission-tokens'), deleteToken)

module.exports = router