const express = require('express')
const router = express.Router()
const {
  getConversation,
  getConversations,
  sendMessage,
  markAsRead
} = require('../controllers/messageController')
const protect = require('../middleware/authMiddleware')

router.get('/conversations', protect, getConversations)   // admin: all parent conversations
router.get('/:conversationUserId', protect, getConversation) // load one conversation
router.post('/', protect, sendMessage)                    // send a message
router.put('/read/:conversationUserId', protect, markAsRead) // mark as read

module.exports = router