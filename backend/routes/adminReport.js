const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const mongoose = require('mongoose'); // Added mongoose for ObjectId casting

const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const Booking = require('../models/Booking');
const Fine = require('../models/Fine');

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

module.exports = router;