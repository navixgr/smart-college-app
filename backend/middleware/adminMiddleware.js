/*
Admin-only middleware
Usage:
adminOnly(['CC', 'SUPER'])
*/
const adminOnly = (roles = ['CC', 'SUPER']) => {
  return (req, res, next) => {
    /* =========================
       1. AUTH GUARD
    ========================= */
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    /* =========================
       2. ROLE CHECK
    ========================= */
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  };
};

module.exports = adminOnly;
