const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async (userId, title, message, type = "general") => {
  try {
    return await prisma.notification.create({
      data: { 
        userId: parseInt(userId), 
        title: title.trim(), 
        message: message.trim(), 
        type 
      }
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};

const createNotificationsForRole = async (role, title, message, type = "general") => {
  try {
    const users = await prisma.user.findMany({
      where: { role, active: true },
      select: { id: true }
    });

    if (!users.length) return [];

    return await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title: title.trim(),
        message: message.trim(),
        type
      }))
    });
  } catch (error) {
    console.error(`Failed to create ${role} notifications:`, error);
    return null;
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(req.user.id) },
      orderBy: { createdAt: 'desc' },
      take: 30
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: Number.parseInt(req.user.id, 10) },
      select: { id: true }
    })
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    await prisma.notification.update({
      where: { id: notification.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: Number.parseInt(req.user.id, 10) },
      select: { id: true }
    })
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    await prisma.notification.delete({ where: { id: notification.id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' })
  }
};

module.exports = { createNotification, createNotificationsForRole, getNotifications, markAsRead, deleteNotification };
