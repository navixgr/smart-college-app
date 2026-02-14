const cron = require('node-cron');
const Cycle = require('../models/Cycle');
const Student = require('../models/Student');
const Booking = require('../models/Booking');
const { sendPushNotification } = require('../services/notificationService');

// Run every day at 1:33 PM (Post-rotation summary)
cron.schedule('33 13 * * *', async () => {
  console.log("Initiating 1:33 PM Class-wide Broadcast...");
  try {
    const activeCycles = await Cycle.find({ status: 'active' })
      .populate('primaryId')
      .populate('backup1Id')
      .populate('backup2Id');

    for (const cycle of activeCycles) {
      // Find today's booking to get the topic for the Primary speaker
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const booking = await Booking.findOne({ 
        studentId: cycle.primaryId?._id, 
        date: todayStr 
      });

      const topic = booking ? booking.topic : "Topic not yet updated";
      const primaryName = cycle.primaryId?.name || "TBA";
      
      const title = `COTD Update: ${primaryName} 🎤`;
      const body = `Topic: ${topic}\n\nPipeline:\n1. ${primaryName}\n2. ${cycle.backup1Id?.name}\n3. ${cycle.backup2Id?.name}`;

      // Send to every student in this class
      const classStudents = await Student.find({ classId: cycle.classId });
      
      for (const student of classStudents) {
        if (student.pushSubscription) {
          await sendPushNotification(student, title, body);
        }
      }
    }
  } catch (err) {
    console.error("Broadcast Error:", err);
  }
}, { timezone: "Asia/Kolkata" });