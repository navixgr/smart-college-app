const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const protect = require('../middleware/authMiddleware');

const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Fine = require('../models/Fine');
const Cycle = require('../models/Cycle'); // ✅ Added for pipeline
const { isSunday, isHoliday } = require('../services/dateService');

/*
GET /api/student/dashboard
Student Dashboard (Enhanced with Pipeline & Red Zone)
*/
router.get('/dashboard', protect, async (req, res) => {
  try {
    /* =========================
       0. ROLE CHECK
    ========================= */
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const studentId = req.user.id;
    const classId = req.user.classId;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    /* =========================
       1. STUDENT PROFILE & PIPELINE
    ========================= */
    const student = await Student.findById(studentId).populate('classId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch active cycle and populate student names for the pipeline
    const activeCycle = await Cycle.findOne({ classId, status: 'active' })
      .populate('primaryId', 'name')
      .populate('backup1Id', 'name')
      .populate('backup2Id', 'name');

    // RED ZONE LOGIC: Check how many students are left
    const remainingCount = await Student.countDocuments({ 
      classId, 
      isSelectedInCurrentCycle: false 
    });
    const isRedZone = remainingCount <= 10;

    /* =========================
       2. TODAY RESULT (KEEP EXISTING)
    ========================= */
    const todayBooking = await Booking.findOne({
      classId,
      date: todayStr,
      isWinner: true
    }).populate('studentId', 'name');

    const today = todayBooking
      ? {
          studentName: todayBooking.studentId.name,
          topic: todayBooking.topic
        }
      : null;

    /* =========================
       3. HISTORY (KEEP EXISTING)
    ========================= */
    const historyBookings = await Booking.find({ classId, isWinner: true })
      .populate('studentId', 'name')
      .sort({ date: -1 })
      .limit(30);

    const history = historyBookings.map(b => ({
      date: b.date,
      studentName: b.studentId.name,
      topic: b.topic
    }));

    /* =========================
       4. FINE SUMMARY
    ========================= */
    const fineAgg = await Fine.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: null, totalFine: { $sum: '$amount' }, missedDays: { $sum: 1 } } }
    ]);

    const missedDays = fineAgg[0]?.missedDays || 0;
    const totalFine = fineAgg[0]?.totalFine || 0;

    /* =========================
       5. BOOKING STATUS (IST)
    ========================= */
    const indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    const nowIST = new Date(indiaTime);
    const currentTime = nowIST.getHours() * 60 + nowIST.getMinutes();

    const start = 12 * 60 + 45; // 12:45 PM
    const end = 13 * 60 + 30;   // 1:30 PM

    let bookingStatus = { canBook: true, reason: '' };
    if (isSunday(now)) {
      bookingStatus = { canBook: false, reason: 'Sunday' };
    } else if (await isHoliday(todayStr, classId)) {
      bookingStatus = { canBook: false, reason: 'Holiday' };
    } else if (student.isSelectedInCurrentCycle) {
      bookingStatus = { canBook: false, reason: 'Already selected in this cycle' };
    } else if (currentTime < start || currentTime > end) {
      bookingStatus = { canBook: false, reason: 'Booking time closed (12:45 – 1:30)' };
    }

    /* =========================
       6. RESPONSE (MERGED OLD + NEW)
    ========================= */
    return res.json({
      success: true,
      user: {
        id: student._id,
        name: student.name,
        className: student.classId.name,
        counter: student.isSelectedInCurrentCycle ? student.currentCounter : null,
        missedDays,
        totalFine
      },
      // New Pipeline Data
      pipeline: {
        primary: activeCycle?.primaryId?.name || "Assigning...",
        backup1: activeCycle?.backup1Id?.name || "Assigning...",
        backup2: activeCycle?.backup2Id?.name || "Assigning..."
      },
      isRedZone, // Signal for frontend to change color
      remainingCount,
      // Legacy Data (keeps original frontend working)
      today,
      history,
      bookingStatus
    });

  } catch (err) {
    console.error('Student dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;