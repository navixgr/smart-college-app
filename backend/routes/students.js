const express = require('express');
const router = express.Router();

const Student = require('../models/Student');
const Class = require('../models/Class');

const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

/*
GET /api/students/:classId
CC → own class
SUPER → any class
*/
router.get(
  '/:classId',
  protect,
  adminOnly(['CC', 'SUPER']),
  async (req, res) => {
    try {
      const { classId } = req.params;

      // CC can access only own class
      if (
        req.user.role === 'CC' &&
        req.user.classId !== classId
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const students = await Student.find({ classId })
        .sort({ name: 1 });

      return res.json({
        success: true,
        count: students.length,
        students
      });

    } catch (err) {
      console.error('Fetch students error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/*
POST /api/students/bulk
CC → own class only
SUPER → any class
*/
router.post(
  '/bulk',
  protect,
  adminOnly(['CC', 'SUPER']),
  async (req, res) => {
    try {
      let { students, classId } = req.body;

      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Students array is required'
        });
      }

      // CC cannot spoof class
      if (req.user.role === 'CC') {
        classId = req.user.classId;
      }

      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: 'Class not found'
        });
      }

      const preparedStudents = students
        .filter(s => s.regNo && s.name && s.email && s.phone)
        .map(s => ({
          regNo: s.regNo.trim(),
          name: s.name.trim(),
          email: s.email.trim(),
          phone: s.phone.trim(),
          classId
        }));

      if (preparedStudents.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid student records found'
        });
      }

      const result = await Student.insertMany(
        preparedStudents,
        { ordered: false }
      );

      return res.json({
        success: true,
        inserted: result.length,
        message: 'Bulk upload completed (duplicates skipped)'
      });

    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Some students already exist (duplicate regNo)'
        });
      }

      console.error('Bulk upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
