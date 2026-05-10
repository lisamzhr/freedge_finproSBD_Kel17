const cron = require('node-cron');
const FridgeItem = require('../models/FridgeItem');
const { createNotificationIfNeeded } = require('../services/notification.service');

exports.startExpiryJob = () => {
  cron.schedule('0 7 * * *', async () => {
    console.log('Running expiry check...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      const allActive = await FridgeItem.find({ status: 'active' });

      for (const item of allActive) {
        const nearest = item.batches.sort(
          (a, b) => new Date(a.expireDate) - new Date(b.expireDate)
        )[0];
        if (!nearest) continue;

        const exp = new Date(nearest.expireDate);

        if (exp < today) {
          item.status = 'expired';
          await item.save();
          await createNotificationIfNeeded(item, 'expired');
        } else if (exp <= threeDaysLater) {
          await createNotificationIfNeeded(item, 'expiring_soon');
        }
      }

      console.log('Expiry check done');
    } catch (err) {
      console.error('Expiry job error:', err.message);
    }
  });

  console.log('Cron job scheduled: daily 07:00');
};