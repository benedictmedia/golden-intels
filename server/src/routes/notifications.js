const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

// Make sure protect is correctly imported as middleware
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;