const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Fine = require('../models/Fine');
const { isSunday, isHoliday } = require('../services/dateService');

/*
GET /api/student/dashboard
Student Dashboard
*/
router.get('/dashboard', protect, async (req, res) => {
  try {
    /* =========================
       0. ROLE CHECK
    ========================= */
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const studentId = req.user.id;
    const classId = req.user.classId;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    /* =========================
       1. STUDENT PROFILE
    ========================= */
    const student = await Student.findById(studentId).populate('classId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    /* =========================
       2. TODAY RESULT
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
       3. HISTORY (CLASS ONLY)
    ========================= */
    const historyBookings = await Booking.find({
      classId,
      isWinner: true
    })
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
      { $match: { studentId } },
      {
        $group: {
          _id: null,
          totalFine: { $sum: '$amount' },
          missedDays: { $sum: 1 }
        }
      }
    ]);

    const missedDays = fineAgg[0]?.missedDays || 0;
    const totalFine = fineAgg[0]?.totalFine || 0;

    /* =========================
       5. BOOKING STATUS
    ========================= */
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const start = 12 * 60 + 45;
    const end = 13 * 60 + 30;

    let bookingStatus = {
      canBook: true,
      reason: ''
    };

    if (isSunday(now)) {
      bookingStatus = { canBook: false, reason: 'Sunday' };
    } else if (await isHoliday(todayStr, classId)) {
      bookingStatus = { canBook: false, reason: 'Holiday' };
    } else if (student.isSelectedInCurrentCycle) {
      bookingStatus = {
        canBook: false,
        reason: 'Already selected in this cycle'
      };
    } else if (currentTime < start || currentTime > end) {
      bookingStatus = {
        canBook: false,
        reason: 'Booking time closed (12:45 – 1:30)'
      };
    }

    /* =========================
       6. RESPONSE (FIXED)
    ========================= */
    return res.json({
      success: true,
      user: {
        id: student._id,
        name: student.name,
        className: student.classId.name,

        // ✅ ONLY SELECTED STUDENTS GET COUNTER
        counter: student.isSelectedInCurrentCycle
          ? student.currentCounter
          : null,

        missedDays,
        totalFine
      },
      today,
      history,
      bookingStatus
    });

  } catch (err) {
    console.error('Student dashboard error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
