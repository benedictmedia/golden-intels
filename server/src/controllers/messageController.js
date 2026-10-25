const { PrismaClient } = require('@prisma/client')
const { getIO } = require('../socket')
const prisma = new PrismaClient()

// Get all messages in one conversation (conversationUserId = parent's user ID)
const getConversation = async (req, res) => {
  const { conversationUserId } = req.params
  const parsedConversationUserId = Number.parseInt(conversationUserId, 10)
  if (!Number.isInteger(parsedConversationUserId)) {
    return res.status(400).json({ message: 'Invalid conversation.' })
  }
  if (req.user.role !== 'admin' && (req.user.role !== 'parent' || parsedConversationUserId !== req.user.id)) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationUserId: parsedConversationUserId,
        ...(req.user.role === 'admin' ? { hiddenForAdmin: false } : { hiddenForParent: false })
      },
      orderBy: { createdAt: 'asc' }
    })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all conversations grouped by parent (admin only)
const getConversations = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  try {
    const allMessages = await prisma.message.findMany({
      where: { hiddenForAdmin: false },
      orderBy: { createdAt: 'desc' }
    })

    // Keep only the latest message per conversation
    const conversationMap = {}
    allMessages.forEach(msg => {
      if (!conversationMap[msg.conversationUserId]) {
        conversationMap[msg.conversationUserId] = msg
      }
    })

    // Count unread messages from parents
    const unreadCounts = await prisma.message.groupBy({
      by: ['conversationUserId'],
      where: { senderRole: 'parent', read: false, hiddenForAdmin: false },
      _count: { id: true }
    })
    const unreadMap = {}
    unreadCounts.forEach(u => { unreadMap[u.conversationUserId] = u._count.id })

    // Look up parent names so we always display the correct parent name
    const parentIds = Object.keys(conversationMap).map(id => parseInt(id))
    const parents = await prisma.user.findMany({
      where: { id: { in: parentIds } },
      select: { id: true, name: true, email: true }
    })
    const parentMap = {}
    parents.forEach(p => { parentMap[p.id] = p })

    const conversations = Object.values(conversationMap).map(msg => ({
      ...msg,
      parentName: parentMap[msg.conversationUserId]?.name || msg.senderName || 'Parent',
      parentEmail: parentMap[msg.conversationUserId]?.email || '',
      unreadCount: unreadMap[msg.conversationUserId] || 0
    }))

    conversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(conversations)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Send a message
const sendMessage = async (req, res) => {
  const { content, conversationUserId } = req.body;
  const sender = req.user;

  if (!content?.trim() || !conversationUserId) {
    return res.status(400).json({ message: 'Content and conversationUserId are required' });
  }

  try {
    const isAdmin = sender.role === 'admin';
    const parsedConversationUserId = Number.parseInt(conversationUserId, 10)
    if (!Number.isInteger(parsedConversationUserId) || (isAdmin ? parsedConversationUserId <= 0 : sender.role !== 'parent' || parsedConversationUserId !== sender.id)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    if (isAdmin) {
      const parent = await prisma.user.findFirst({ where: { id: parsedConversationUserId, role: 'parent' }, select: { id: true } })
      if (!parent) return res.status(404).json({ message: 'Parent conversation not found.' })
    }
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        receiverId: isAdmin ? parsedConversationUserId : 0,
        conversationUserId: parsedConversationUserId,
        read: false
      }
    });

    // === CREATE NOTIFICATION ===
    const { createNotification, createNotificationsForRole } = require('./notificationController');
    const notificationMessage = `${sender.name}: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`;

    if (isAdmin) {
      await createNotification(
        conversationUserId,
        "New Message from Admin",
        notificationMessage,
        "message"
      );
    } else {
      await createNotificationsForRole(
        'admin',
        "New Message from Parent",
        notificationMessage,
        "message"
      );
    }

    // Socket emission (keep your existing code)
    const io = getIO();
    if (io) {
      if (isAdmin) {
        io.to(`user_${conversationUserId}`).emit('receive_message', message);
      } else {
        io.to('admin_room').emit('receive_message', message);
      }
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages in a conversation as read
const markAsRead = async (req, res) => {
  const { conversationUserId } = req.params
  const parsedConversationUserId = Number.parseInt(conversationUserId, 10)
  const reader = req.user
  if (!Number.isInteger(parsedConversationUserId) || !['admin', 'parent'].includes(reader.role)) {
    return res.status(400).json({ message: 'Invalid conversation.' })
  }
  if (reader.role === 'parent' && parsedConversationUserId !== reader.id) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    await prisma.message.updateMany({
      where: {
        conversationUserId: parsedConversationUserId,
        // Admin reading → mark parent messages read; parent reading → mark admin messages read
        senderRole: reader.role === 'admin' ? 'parent' : 'admin',
        ...(reader.role === 'admin' ? { hiddenForAdmin: false } : { hiddenForParent: false }),
        read: false
      },
      data: { read: true }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteMessageForCurrentPortal = async (req, res) => {
  const messageId = Number.parseInt(req.params.id, 10)
  if (!Number.isInteger(messageId) || !['admin', 'parent'].includes(req.user.role)) {
    return res.status(400).json({ message: 'Invalid message request.' })
  }

  try {
    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message) return res.status(404).json({ message: 'Message not found.' })
    if (req.user.role === 'parent' && message.conversationUserId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await prisma.message.update({
      where: { id: messageId },
      data: req.user.role === 'admin' ? { hiddenForAdmin: true } : { hiddenForParent: true }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getConversation, getConversations, sendMessage, markAsRead, deleteMessageForCurrentPortal }
