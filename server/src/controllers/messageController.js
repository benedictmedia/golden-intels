const { PrismaClient } = require('@prisma/client')
const { getIO } = require('../socket')
const prisma = new PrismaClient()

// Get all messages in one conversation (conversationUserId = parent's user ID)
const getConversation = async (req, res) => {
  const { conversationUserId } = req.params
  try {
    const messages = await prisma.message.findMany({
      where: { conversationUserId: parseInt(conversationUserId) },
      orderBy: { createdAt: 'asc' }
    })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all conversations grouped by parent (admin only)
const getConversations = async (req, res) => {
  try {
    const allMessages = await prisma.message.findMany({
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
      where: { senderRole: 'parent', read: false },
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
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        receiverId: isAdmin ? parseInt(conversationUserId) : 0,
        conversationUserId: parseInt(conversationUserId),
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
  const reader = req.user
  try {
    await prisma.message.updateMany({
      where: {
        conversationUserId: parseInt(conversationUserId),
        // Admin reading → mark parent messages read; parent reading → mark admin messages read
        senderRole: reader.role === 'admin' ? 'parent' : 'admin',
        read: false
      },
      data: { read: true }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getConversation, getConversations, sendMessage, markAsRead }
