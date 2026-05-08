const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

const { getUserNotifications, markAsRead } = require('../controllers/notificationController');

// All users can get notifications (customer, storeOwner, admin)
router.get('/:userId', authenticate, getUserNotifications);      // UC-22: Receive Notification
router.patch('/:notifId/read', authenticate, markAsRead);        // Mark notification as read

module.exports = router;