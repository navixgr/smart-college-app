const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add at top

const Holiday = require('../models/Holiday');
const protect = require('../middleware/authMiddleware');

/*
GET /api/holidays
List holidays (SUPER = all, CC = own class + global)
*/
router.get('/', protect, async (req, res) => {
  try {
    if (!['CC', 'SUPER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

const query = req.user.role === 'SUPER' ? {} : {
  $or: [
    { classId: null },
    { classId: new mongoose.Types.ObjectId(req.user.classId) } // Fix here
  ]
};

    const holidays = await Holiday.find(query).sort({ date: 1 });

    return res.json({ success: true, data: holidays });
  } catch (err) {
    console.error('Fetch holidays error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/*
POST /api/holidays
SUPER → global holiday
CC → class-specific holiday
*/
router.post('/', protect, async (req, res) => {
  try {
    if (!['CC', 'SUPER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required (YYYY-MM-DD)'
      });
    }

    const holidayData =
      req.user.role === 'SUPER'
        ? {
            date,
            classId: null,
            createdBy: 'SUPER'
          }
        : {
            date,
            classId: req.user.classId,
            createdBy: 'CC'
          };

    try {
      await Holiday.create(holidayData);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Holiday already exists'
        });
      }
      throw err;
    }

    return res.json({
      success: true,
      message: 'Holiday added successfully'
    });

  } catch (err) {
    console.error('Create holiday error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
