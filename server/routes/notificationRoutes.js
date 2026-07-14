const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
