const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

/*
POST /api/auth/login
Student Login
*/
router.post('/login', async (req, res) => {
  const { regNo, password } = req.body;

  try {
    /* =========================
       0. BASIC VALIDATION
    ========================= */
    if (!regNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Register number and password are required'
      });
    }

    /* =========================
       1. FIND STUDENT
    ========================= */
    const student = await Student.findOne({
      regNo: regNo.trim()
    }).populate('classId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    /* =========================
       2. PASSWORD CHECK
       (Last 4 digits of phone)
    ========================= */
    const lastFour = student.phone.slice(-4);

    if (password !== lastFour) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    /* =========================
       3. GENERATE JWT
    ========================= */
    const token = jwt.sign(
      {
        id: student._id,
        role: 'STUDENT',
        classId: student.classId._id
      },
      process.env.JWT_SECRET
    );

    /* =========================
       4. RESPONSE
    ========================= */
    return res.json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        regNo: student.regNo,
        classId: student.classId._id,
        className: student.classId.name,
        counter: student.currentCounter
      }
    });

  } catch (err) {
    console.error('Student login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
