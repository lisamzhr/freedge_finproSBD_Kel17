const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('fridgeItemId', 'displayName category totalQuantity unit')
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id, isRead: false
    });

    res.json({ success: true, data: { unreadCount, notifications } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};