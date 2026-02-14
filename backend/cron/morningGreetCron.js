const cron = require('node-cron');
const Cycle = require('../models/Cycle');
const Student = require('../models/Student');
const { sendPushNotification } = require('../services/notificationService');

// 0 7 * * * = Exactly 7:00 AM every day
cron.schedule('0 7 * * *', async () => {
  console.log("Processing 7 AM Greetings...");
  try {
    const activeCycles = await Cycle.find({ status: 'active' }).populate('primaryId');

    for (const cycle of activeCycles) {
      if (cycle.primaryId && cycle.primaryId.pushSubscription) {
        await sendPushNotification(
          cycle.primaryId,
          `Good Morning, ${cycle.primaryId.name}! ☀️`,
          "You are today's speaker. Don't forget to prepare your session!"
        );
      }
    }
  } catch (err) {
    console.error("Morning Greet Error:", err);
  }
}, { timezone: "Asia/Kolkata" });