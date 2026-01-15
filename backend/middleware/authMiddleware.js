const jwt = require('jsonwebtoken');

/*
Auth middleware
- Supports Authorization header
- Supports token via query (?token=)
- Used by Student + Admin
*/
const protect = (req, res, next) => {
  try {
    let token = null;

    /* =========================
       1. GET TOKEN
    ========================= */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Excel export / file download support
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    /* =========================
       2. VERIFY TOKEN
    ========================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    /* =========================
       3. ATTACH USER
    ========================= */
    req.user = {
      id: decoded.id,
      role: decoded.role,
      classId: decoded.classId || null
    };

    next();

  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

module.exports = protect;
