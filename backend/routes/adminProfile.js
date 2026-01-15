const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const Admin = require('../models/Admin');

/*
GET /api/admin/profile
Returns logged-in admin profile (CC / SUPER)
*/
router.get('/profile', protect, async (req, res) => {
  try {
    /* =========================
       0. ROLE SAFETY CHECK
    ========================= */
    if (!req.user || !['CC', 'SUPER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    /* =========================
       1. FETCH ADMIN
    ========================= */
    const admin = await Admin.findById(req.user.id).populate('classId');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    /* =========================
       2. RESPONSE
    ========================= */
    return res.json({
      success: true,
      user: {
        id: admin._id,
        name: admin.name,
        role: admin.role,
        classId: admin.classId ? admin.classId._id : null,
        className: admin.classId ? admin.classId.name : 'ALL'
      }
    });

  } catch (err) {
    console.error('Admin profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
