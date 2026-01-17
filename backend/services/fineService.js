const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Fine = require('../models/Fine');
const { isSunday, isHoliday } = require('./dateService');

function getTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

async function generateDailyFineForClass(classId) {
  const today = new Date();
  const todayStr = getTodayStr();

  // 1️⃣ Skip Sunday
  if (isSunday(today)) return;

  // 2️⃣ Skip Holiday
  if (await isHoliday(todayStr, classId)) return;

  // 3️⃣ Get ONLY students who are ELIGIBLE to book (not yet selected)
  const eligibleStudents = await Student.find({ 
    classId, 
    isSelectedInCurrentCycle: false // ✅ Added this filter
  }).select('_id');

  if (!eligibleStudents.length) return;

  // 4️⃣ Get today's bookings
  const bookedIds = await Booking.find({
    classId,
    date: todayStr
  }).distinct('studentId');

  const bookedSet = new Set(bookedIds.map(id => id.toString()));

  // 5️⃣ Fine ONLY eligible students who did NOT book today
  for (const student of eligibleStudents) {
    if (!bookedSet.has(student._id.toString())) {
      try {
        await Fine.create({
          studentId: student._id,
          classId,
          date: todayStr,
          amount: 10,
          reason: 'Not booked'
        });
      } catch (err) {
        // Duplicate fine — ignore
      }
    }
  }
}

module.exports = { generateDailyFineForClass };
