const Notification = require('../models/Notification');

exports.createNotificationIfNeeded = async (item, type) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // jangan double notif di hari yang sama
  const existing = await Notification.findOne({
    fridgeItemId: item._id,
    type,
    createdAt: { $gte: todayStart },
  });
  if (existing) return null;

  const nearestBatch = item.batches.sort(
    (a, b) => new Date(a.expireDate) - new Date(b.expireDate)
  )[0];

  const daysLeft = Math.ceil(
    (new Date(nearestBatch.expireDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const message = type === 'expiring_soon'
    ? `${item.displayName} akan kedaluwarsa dalam ${daysLeft} hari! Masih ada ${item.totalQuantity}${item.unit}.`
    : `${item.displayName} sudah kedaluwarsa. Segera periksa.`;

  return await Notification.create({
    userId: item.userId,
    fridgeItemId: item._id,
    type,
    message,
  });
};