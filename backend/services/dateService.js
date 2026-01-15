const Holiday = require('../models/Holiday');

/* =========================
   CHECK SUNDAY
========================= */
function isSunday(date = new Date()) {
  return date.getDay() === 0;
}

/* =========================
   CHECK HOLIDAY (GLOBAL / CLASS)
========================= */
async function isHoliday(dateStr, classId) {
  try {
    if (!dateStr) return false;

    // Single optimized query
    const holiday = await Holiday.findOne({
      date: dateStr,
      $or: [
        { classId: null },          // Global holiday
        { classId: classId || null } // Class-specific
      ]
    }).lean(); // 🔥 faster, no mongoose doc overhead

    return !!holiday;
  } catch (err) {
    console.error('❌ Holiday check failed:', err.message);
    // Fail-safe: do NOT block system if DB has a hiccup
    return false;
  }
}

module.exports = {
  isSunday,
  isHoliday
};
