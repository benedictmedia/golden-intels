const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async (userId, title, message, type = "general") => {
  try {
    return await prisma.notification.create({
      data: { userId, title, message, type }
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const markAsRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

module.exports = { createNotification, getNotifications, markAsRead };