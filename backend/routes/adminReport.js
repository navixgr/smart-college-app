const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const mongoose = require('mongoose'); // Added mongoose for ObjectId casting

const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const Booking = require('../models/Booking');
const Fine = require('../models/Fine');

const Cycle = require('../models/Cycle');
const Student = require('../models/Student');


/* =========================
   HELPER
========================= */
function isJson(req) {
  return req.query.json === 'true';
}

/* =========================
   API 1: SELECTED HISTORY
========================= */
router.get(
  '/selected-history',
  protect,
  adminOnly(['CC', 'SUPER']),
  async (req, res) => {
    try {
      const query =
        req.user.role === 'SUPER'
          ? { isWinner: true }
          : { isWinner: true, classId: req.user.classId };

      const bookings = await Booking.find(query)
        .populate('studentId', 'name')
        .populate('classId', 'name')
        .sort({ date: -1 });

      if (isJson(req)) {
        return res.json({
          success: true,
          data: bookings.map(b => ({
            date: b.date,
            className: b.classId.name,
            studentName: b.studentId.name,
            topic: b.topic
          }))
        });
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Selected History');

      sheet.columns = [
        { header: 'Date', key: 'date' },
        { header: 'Class', key: 'className' },
        { header: 'Student Name', key: 'studentName' },
        { header: 'Topic', key: 'topic' }
      ];

      bookings.forEach(b =>
        sheet.addRow({
          date: b.date,
          className: b.classId.name,
          studentName: b.studentId.name,
          topic: b.topic
        })
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=selected_history.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (err) {
      console.error('Selected history error:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/* =========================
   API 2: FINE REPORT
========================= */
router.get(
  '/fine-report',
  protect,
  adminOnly(['CC', 'SUPER']),
  async (req, res) => {
    try {
      /* FIX: Aggregation does not auto-cast strings to ObjectIds.
         We must manually wrap req.user.classId in mongoose.Types.ObjectId()
      */
      const matchStage =
        req.user.role === 'CC'
          ? { classId: new mongoose.Types.ObjectId(req.user.classId) } // Fixed Line
          : {};

      const report = await Fine.aggregate([
        { $match: matchStage },

        {
          $group: {
            _id: '$studentId',
            totalFine: { $sum: '$amount' },
            daysMissed: { $sum: 1 }
          }
        },

        {
          $lookup: {
            from: 'students', // Ensure your collection name is 'students' in MongoDB
            localField: '_id',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },

        {
          $lookup: {
            from: 'classes', // Ensure your collection name is 'classes' in MongoDB
            localField: 'student.classId',
            foreignField: '_id',
            as: 'class'
          }
        },
        { $unwind: '$class' },

        {
          $project: {
            studentName: '$student.name',
            className: '$class.name',
            daysMissed: 1,
            totalFine: 1
          }
        },

        {
          $sort: {
            totalFine: -1,
            studentName: 1
          }
        }
      ]);

      /* =========================
         RESPONSE FORMATTING
      ========================= */

      // CC -> FLAT ARRAY
      if (req.user.role === 'CC') {
        return res.json({
          success: true,
          data: report
        });
      }

      // SUPER -> GROUP BY CLASS
      const grouped = {};
      for (const row of report) {
        if (!grouped[row.className]) {
          grouped[row.className] = [];
        }
        grouped[row.className].push(row);
      }

      return res.json({
        success: true,
        data: grouped
      });

    } catch (err) {
      console.error('Fine report error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);


/*
GET /api/admin/reports/pipeline/:classId
Admin view of the live selection pipeline
*/
router.get('/pipeline/:classId', protect, adminOnly(['CC', 'SUPER']), async (req, res) => {
  try {
    const { classId } = req.params;
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    // 1. Fetch Cycle and populate student names
    const activeCycle = await Cycle.findOne({ classId, status: 'active' })
      .populate('primaryId', 'name')
      .populate('backup1Id', 'name')
      .populate('backup2Id', 'name');

    if (!activeCycle) {
      return res.status(404).json({ success: false, message: "No active cycle found" });
    }

    // 2. Fetch today's topics for the pipeline students
    const pipelineIds = [
      activeCycle.primaryId?._id,
      activeCycle.backup1Id?._id,
      activeCycle.backup2Id?._id
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

    // 3. Red Zone Logic
    const remainingCount = await Student.countDocuments({ 
      classId, 
      isSelectedInCurrentCycle: false 
    });

    res.json({
      success: true,
      pipeline: {
        primary: { 
          name: activeCycle.primaryId?.name || "Assigning...", 
          topic: getTopic(activeCycle.primaryId?._id) 
        },
        backup1: { 
          name: activeCycle.backup1Id?.name || "Assigning...", 
          topic: getTopic(activeCycle.backup1Id?._id) 
        },
        backup2: { 
          name: activeCycle.backup2Id?.name || "Assigning...", 
          topic: getTopic(activeCycle.backup2Id?._id) 
        }
      },
      isRedZone: remainingCount <= 10,
      remainingCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;