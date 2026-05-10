const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fridgeItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FridgeItem', required: true },
  type: { type: String, enum: ['expiring_soon', 'expired'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);