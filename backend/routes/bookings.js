const express = require('express');
const router = express.Router();

const Booking = require('../models/Booking');
const Student = require('../models/Student');

const protect = require('../middleware/authMiddleware');
const { isSunday, isHoliday } = require('../services/dateService');

/*
POST /api/bookings/book
Student booking (Concept of the Day)
*/
router.post('/book', protect, async (req, res) => {
  const { topic } = req.body;

  try {
    /* =========================
       0. ROLE CHECK
    ========================= */
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only students can book'
      });
    }

    /* =========================
       1. TOPIC VALIDATION
    ========================= */
    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    /* =========================
       2. SUNDAY CHECK
    ========================= */
    if (isSunday(now)) {
      return res.status(403).json({
        success: false,
        message: 'Booking is not available on Sunday'
      });
    }

    /* =========================
       3. HOLIDAY CHECK
    ========================= */
    const holiday = await isHoliday(todayStr, req.user.classId);
    if (holiday) {
      return res.status(403).json({
        success: false,
        message: 'Today is marked as a holiday'
      });
    }

    /* =========================
       4. TIME-LOCK CHECK
       (12:45 PM – 1:30 PM)
    ========================= */
    const currentTime =
      now.getHours() * 60 + now.getMinutes();

    const start = 12 * 60 + 45;
    const end = 13 * 60 + 30;

    if (currentTime < start || currentTime > end) {
      return res.status(403).json({
        success: false,
        message: 'Portal is only open between 12:45 PM and 1:30 PM'
      });
    }

    /* =========================
       5. STUDENT CHECK
    ========================= */
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.isSelectedInCurrentCycle) {
      return res.status(403).json({
        success: false,
        message: 'You are already selected in this cycle'
      });
    }

    /* =========================
       6. DOUBLE BOOKING CHECK
    ========================= */
    const existingBooking = await Booking.findOne({
      studentId: req.user.id,
      date: todayStr
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked today'
      });
    }

    /* =========================
       7. CREATE BOOKING
    ========================= */
    await Booking.create({
      studentId: req.user.id,
      classId: req.user.classId,
      topic: topic.trim(),
      date: todayStr
    });

    return res.json({
      success: true,
      message: 'Booking successful'
    });

  } catch (err) {
    console.error('Booking error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
