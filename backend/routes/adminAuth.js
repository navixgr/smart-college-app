const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/*
POST /api/admin/auth/login
Admin Login (CC / SUPER)
*/
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    /* =========================
       0. BASIC VALIDATION
    ========================= */
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    /* =========================
       1. FIND ADMIN
    ========================= */
    const admin = await Admin.findOne({ username: username.trim() })
      .populate('classId');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    /* =========================
       2. PASSWORD CHECK
       (Plain text as per current system)
    ========================= */
    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    /* =========================
       3. GENERATE JWT
       (No expiry – internal system)
    ========================= */
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role, // CC | SUPER
        classId: admin.classId ? admin.classId._id : null
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
        id: admin._id,
        name: admin.name,
        role: admin.role,
        classId: admin.classId ? admin.classId._id : null,
        className: admin.classId ? admin.classId.name : 'ALL'
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
