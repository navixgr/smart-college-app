const express = require('express');
const router = express.Router();

const Class = require('../models/Class');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

/*
GET /api/classes
Public – list all classes
*/
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find({}).sort({ name: 1 });
    return res.json({ success: true, classes });
  } catch (err) {
    console.error('Get classes error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/*
POST /api/classes
SUPER ADMIN ONLY – seed classes (one-time)
*/
router.post(
  '/',
  protect,
  adminOnly(['SUPER']),
  async (req, res) => {
    try {
      const classes = [
        { name: '3rd Year CSE A', code: 'CSE3A' },
        { name: '3rd Year CSE B', code: 'CSE3B' },
        { name: '2nd Year CSE A', code: 'CSE2A' },
        { name: '2nd Year CSE B', code: 'CSE2B' },
        { name: '2nd Year CSE C', code: 'CSE2C' }
      ];

      let createdCount = 0;

      for (const cls of classes) {
        const exists = await Class.findOne({ code: cls.code });
        if (!exists) {
          await Class.create(cls);
          createdCount++;
        }
      }

      return res.json({
        success: true,
        message: `${createdCount} classes created (duplicates skipped)`
      });

    } catch (err) {
      console.error('Create classes error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
