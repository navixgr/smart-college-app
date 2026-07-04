const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const protect = require('../middleware/authMiddleware');

const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Fine = require('../models/Fine');
const Cycle = require('../models/Cycle'); 
const { isSunday, isHoliday } = require('../services/dateService');

router.get('/dashboard', protect, async (req, res) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const studentId = req.user.id;
    const classId = req.user.classId;
    const now = new Date();
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    const student = await Student.findById(studentId).populate('classId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const activeCycle = await Cycle.findOne({ classId, status: 'active' })
      .populate('primaryId', 'name')
      .populate('backup1Id', 'name')
      .populate('backup2Id', 'name');

    const remainingCount = await Student.countDocuments({ 
      classId, 
      isSelectedInCurrentCycle: false 
    });
    const isRedZone = remainingCount <= 10;

    const pipelineIds = [
      activeCycle?.primaryId?._id,
      activeCycle?.backup1Id?._id,
      activeCycle?.backup2Id?._id
    ].filter(id => id != null);

    const pipelineBookings = await Booking.find({
      classId,
      date: todayStr,
      studentId: { $in: pipelineIds }
    });

    const getTopic = (id) => {
      if (!id) return "Assigning...";
      const booking = pipelineBookings.find(b => b.studentId.toString() === id.toString());
      return booking ? booking.topic : "Topic not entered yet";
    };

    const todayBooking = await Booking.findOne({
      classId,
      date: todayStr,
      isWinner: true
    }).populate('studentId', 'name');

    const today = todayBooking
      ? {
          studentName: todayBooking.studentId?.name || "Unknown Student",
          topic: todayBooking.topic
        }
      : null;

    /* =========================
       4. HISTORY (FIXED REMOVED-STUDENT CRASHES)
    ========================= */
    const historyBookings = await Booking.find({ classId, isWinner: true })
      .populate('studentId', 'name')
      .sort({ date: -1 })
      .limit(30);

    const history = historyBookings
      .filter(b => b.studentId != null) // ✅ Prevents rendering exceptions if a student profile is missing
      .map(b => ({
        date: b.date,
        studentName: b.studentId.name,
        topic: b.topic
      }));

    const fineAgg = await Fine.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: null, totalFine: { $sum: '$amount' }, missedDays: { $sum: 1 } } }
    ]);

    const missedDays = fineAgg[0]?.missedDays || 0;
    const totalFine = fineAgg[0]?.totalFine || 0;

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
      if (!isRedZone) {
        bookingStatus = { canBook: false, reason: 'Booking time closed (12:45 – 1:30)' };
      }
    }

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
      pipeline: {
        primary: {
          name: activeCycle?.primaryId?.name || "Assigning...",
          topic: getTopic(activeCycle?.primaryId?._id)
        },
        backup1: {
          name: activeCycle?.backup1Id?.name || "Assigning...",
          topic: getTopic(activeCycle?.backup1Id?._id)
        },
        backup2: {
          name: activeCycle?.backup2Id?.name || "Assigning...",
          topic: getTopic(activeCycle?.backup2Id?._id)
        }
      },
      isRedZone, 
      remainingCount,
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