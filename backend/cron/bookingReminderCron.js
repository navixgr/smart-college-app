const cron = require('node-cron');
const Cycle = require('../models/Cycle');
const Student = require('../models/Student');
const { sendPushNotification } = require('../services/notificationService');

// 45 12 * * * = Exactly 12:45 PM every day
cron.schedule('45 12 * * *', async () => {
  console.log("Processing 12:45 PM Reminders...");
  try {
    const activeCycles = await Cycle.find({ status: 'active' }).populate('backup2Id');

    for (const cycle of activeCycles) {
      const b2 = cycle.backup2Id;
      if (b2 && b2.pushSubscription) {
        await sendPushNotification(
          b2,
          "Booking Reminder! ⏰",
          "It's 12:45 PM! You have 45 minutes left to book your topic."
        );
      }
    }
  } catch (err) {
    console.error("Reminder Error:", err);
  }
}, { timezone: "Asia/Kolkata" });