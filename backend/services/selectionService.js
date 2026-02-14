const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Student = require('../models/Student');
const Cycle = require('../models/Cycle');
const { isSunday, isHoliday } = require('./dateService');

/* =========================
   UTILS
========================= */
function getTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* =========================
   CORE PIPELINE ENGINE
========================= */
async function runDailySelectionForClass(classId) {
  const todayStr = getTodayStr();
  const todayDate = new Date();

  // 1. Sunday / Holiday check
  if (isSunday(todayDate)) return { status: 'SUNDAY_SKIP' };
  if (await isHoliday(todayStr, classId)) return { status: 'HOLIDAY_SKIP' };

  // 2. Get active cycle (or create if missing)
  let cycle = await Cycle.findOne({ classId, status: 'active' });
  if (!cycle) {
    cycle = await Cycle.create({
      classId,
      startDate: new Date(),
      selectedStudentIds: []
    });
  }

  /* =========================
     3. ROTATE THE PIPELINE
  ========================= */
  // The current Primary is now "Finished"
  if (cycle.primaryId) {
    await Student.findByIdAndUpdate(cycle.primaryId, { 
      isSelectedInCurrentCycle: true,
      lastSelectedDate: new Date()
    });
    cycle.selectedStudentIds.push(cycle.primaryId);
  }

  // Slide the queue: Backup1 becomes Primary, Backup2 becomes Backup1
  cycle.primaryId = cycle.backup1Id;
  cycle.backup1Id = cycle.backup2Id;

  /* =========================
     4. SELECT NEW BACKUP 2
  ========================= */
  // A. Check today's bookings first
  const bookings = await Booking.find({ classId, date: todayStr }).populate('studentId');
  
  let eligibleBookers = bookings
    .map(b => b.studentId)
    .filter(s => s && 
                 !s.isSelectedInCurrentCycle && 
                 s._id.toString() !== cycle.primaryId?.toString() &&
                 s._id.toString() !== cycle.backup1Id?.toString()
    );

  let selectedBackup2 = null;

  if (eligibleBookers.length > 0) {
    // Pick from those who booked
    selectedBackup2 = pickRandom(eligibleBookers);
  } else {
    // B. FORCED SELECTION: No one booked, pick from remaining students
    const nonBookers = await Student.find({
      classId,
      isSelectedInCurrentCycle: false,
      isLongAbsent: false,
      _id: { $nin: [cycle.primaryId, cycle.backup1Id] }
    });

    if (nonBookers.length > 0) {
      selectedBackup2 = pickRandom(nonBookers);
      // Mark as forced in the database
      await Student.findByIdAndUpdate(selectedBackup2._id, { isManualSelection: true });
    }
  }

  // 5. Assign the new Backup 2 and Save Cycle
  cycle.backup2Id = selectedBackup2 ? selectedBackup2._id : null;
  await cycle.save();

  /* =========================
     6. CYCLE COMPLETION CHECK
  ========================= */
  const totalStudents = await Student.countDocuments({ classId });
  
  if (cycle.selectedStudentIds.length >= totalStudents) {
    await Cycle.findByIdAndUpdate(cycle._id, {
      status: 'completed',
      endDate: new Date()
    });

    // Reset all students for a fresh cycle
    await Student.updateMany(
      { classId },
      {
        isSelectedInCurrentCycle: false,
        lastSelectedDate: null,
        currentCounter: 0,
        isManualSelection: false
      }
    );
  }

  return {
    status: 'ROTATED',
    primary: cycle.primaryId,
    backup1: cycle.backup1Id,
    backup2: cycle.backup2Id
  };
}

/* =========================
   INITIALIZE PIPELINE (ONE-TIME)
========================= */
async function initializePipelineForClass(classId) {
  // Use mongoose.Types.ObjectId to ensure the ID matches correctly
  const targetClassId = new mongoose.Types.ObjectId(classId);

  let cycle = await Cycle.findOne({ classId: targetClassId, status: 'active' });
  
  if (!cycle) {
    cycle = await Cycle.create({
      classId: targetClassId,
      startDate: new Date(),
      selectedStudentIds: []
    });
  }

  if (!cycle.primaryId || !cycle.backup1Id || !cycle.backup2Id) {
    const eligible = await Student.find({
      classId: targetClassId,
      isSelectedInCurrentCycle: false,
      // This query finds students where the field is false OR doesn't exist yet
      $or: [
        { isLongAbsent: false },
        { isLongAbsent: { $exists: false } }
      ]
    });

    if (eligible.length < 3) return { status: 'ERROR', message: `Only ${eligible.length} students found. Need 3.` };

    const shuffled = eligible.sort(() => 0.5 - Math.random());
    
    cycle.primaryId = shuffled[0]._id;
    cycle.backup1Id = shuffled[1]._id;
    cycle.backup2Id = shuffled[2]._id;

    await cycle.save();
  }

  return {
    status: 'INITIALIZED',
    primary: cycle.primaryId,
    backup1: cycle.backup1Id,
    backup2: cycle.backup2Id
  };
}

module.exports = { runDailySelectionForClass ,
  initializePipelineForClass
};