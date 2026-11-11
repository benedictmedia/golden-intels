const express = require('express')
const router = express.Router()
const {
  getConversation,
  getConversations,
  sendMessage,
  markAsRead,
  deleteMessageForCurrentPortal
} = require('../controllers/messageController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/conversations', protect, requireAdminPermission('messages'), getConversations)
router.get('/:conversationUserId', protect, requireAdminPermission('messages'), getConversation)
router.post('/', protect, requireAdminPermission('messages'), sendMessage)
router.put('/read/:conversationUserId', protect, requireAdminPermission('messages'), markAsRead)
router.delete('/:id', protect, requireAdminPermission('messages'), deleteMessageForCurrentPortal)

module.exports = router