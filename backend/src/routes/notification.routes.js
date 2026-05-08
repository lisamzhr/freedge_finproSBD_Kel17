const express = require('express');
const router = express.Router();
const n = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', n.getNotifications);
router.patch('/read-all', n.markAllAsRead);
router.patch('/:id/read', n.markAsRead);

module.exports = router;