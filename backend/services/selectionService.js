const Booking = require('../models/Booking');
const Student = require('../models/Student');
const Cycle = require('../models/Cycle');
const { isSunday, isHoliday } = require('./dateService');

/* =========================
   UTILS
========================= */
function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* =========================
   UPDATE COUNTERS (FIXED)
========================= */
async function updateCountersForClass(classId, cycle) {
  if (!cycle) return;

  const students = await Student.find({ classId });
  const selectedCount = cycle.selectedStudentIds.length;
  const totalStudents = students.length;

  const remaining = totalStudents - selectedCount;

  const bulkOps = students.map(student => ({
    updateOne: {
      filter: { _id: student._id },
      update: {
        currentCounter: student.isSelectedInCurrentCycle
          ? remaining
          : 0
      }
    }
  }));

  if (bulkOps.length > 0) {
    await Student.bulkWrite(bulkOps);
  }
}

/* =========================
   CORE SELECTION ENGINE
========================= */
async function runDailySelectionForClass(classId) {
  const todayStr = getTodayStr();
  const todayDate = new Date();

  /* 0️⃣ Sunday / Holiday check */
  if (isSunday(todayDate)) return { status: 'SUNDAY_SKIP' };
  if (await isHoliday(todayStr, classId)) return { status: 'HOLIDAY_SKIP' };

  /* 1️⃣ Prevent duplicate selection */
  const alreadySelected = await Booking.findOne({
    classId,
    date: todayStr,
    isWinner: true
  });

  if (alreadySelected) {
    return { status: 'ALREADY_SELECTED' };
  }

  /* 2️⃣ Get or create active cycle */
  let cycle = await Cycle.findOne({ classId, status: 'active' });

  if (!cycle) {
    cycle = await Cycle.create({
      classId,
      startDate: new Date(),
      selectedStudentIds: []
    });
  }

  /* 3️⃣ Get today's bookings */
  const bookings = await Booking.find({
    classId,
    date: todayStr
  }).populate('studentId');

  /* 4️⃣ Eligible students */
  const eligibleStudents = bookings
    .map(b => b.studentId)
    .filter(s => s && !s.isSelectedInCurrentCycle);

  if (eligibleStudents.length === 0) {
    return { status: 'NO_ELIGIBLE_STUDENTS' };
  }

  /* 5️⃣ Pick winner */
  const winner = pickRandom(eligibleStudents);

  /* 6️⃣ Update winner */
  await Student.findByIdAndUpdate(winner._id, {
    isSelectedInCurrentCycle: true,
    lastSelectedDate: new Date()
  });

  /* 7️⃣ Mark booking as winner */
  await Booking.findOneAndUpdate(
    { studentId: winner._id, date: todayStr },
    { isWinner: true }
  );

  /* 8️⃣ Update cycle */
  cycle.selectedStudentIds.push(winner._id);
  await cycle.save();

  /* 9️⃣ Update counters (FIXED) */
  await updateCountersForClass(classId, cycle);

  /* 🔟 Check cycle completion */
  const totalStudents = await Student.countDocuments({ classId });

  if (cycle.selectedStudentIds.length === totalStudents) {
    await Cycle.findByIdAndUpdate(cycle._id, {
      status: 'completed',
      endDate: new Date()
    });

    await Student.updateMany(
      { classId },
      {
        isSelectedInCurrentCycle: false,
        lastSelectedDate: null,
        currentCounter: 0
      }
    );
  }

  return {
    status: 'SELECTED',
    studentId: winner._id,
    name: winner.name
  };
}

module.exports = {
  runDailySelectionForClass
};
