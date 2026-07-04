const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Student = require('../models/Student');
const Cycle = require('../models/Cycle');
const { isSunday, isHoliday } = require('./dateService');
const { sendPushNotification } = require('./notificationService');

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

  // 2. Get active cycle
  let cycle = await Cycle.findOne({ classId, status: 'active' });
  if (!cycle) {
    cycle = await Cycle.create({
      classId,
      startDate: new Date(),
      selectedStudentIds: []
    });
  }

  // 3. ROTATE THE PIPELINE & RECORD HISTORY
  if (cycle.primaryId) {
    await Student.findByIdAndUpdate(cycle.primaryId, { 
      isSelectedInCurrentCycle: true,
      lastSelectedDate: new Date()
    });
    cycle.selectedStudentIds.push(cycle.primaryId);

    // 🔥 FIX: Find today's presentation booking for the Primary student and mark them as the Winner
    const primaryBooking = await Booking.findOne({
      studentId: cycle.primaryId,
      date: todayStr
    });

    if (primaryBooking) {
      primaryBooking.isWinner = true;
      await primaryBooking.save();
    } else {
      // If they didn't book a topic (Forced Selection), create a history record anyway
      await Booking.create({
        studentId: cycle.primaryId,
        classId,
        topic: "Forced Selection (No topic entered)",
        date: todayStr,
        isWinner: true
      });
    }
  }

  cycle.primaryId = cycle.backup1Id;
  cycle.backup1Id = cycle.backup2Id;

  // 4. SELECT NEW BACKUP 2
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
    selectedBackup2 = pickRandom(eligibleBookers);
  } else {
    const nonBookers = await Student.find({
      classId,
      isSelectedInCurrentCycle: false,
      isLongAbsent: false,
      _id: { $nin: [cycle.primaryId, cycle.backup1Id] }
    });

    if (nonBookers.length > 0) {
      selectedBackup2 = pickRandom(nonBookers);
      await Student.findByIdAndUpdate(selectedBackup2._id, { isManualSelection: true });
    }
  }

  cycle.backup2Id = selectedBackup2 ? selectedBackup2._id : null;
  await cycle.save();

  /* ========================================================
     NOTIFICATION LOGIC
  ======================================================== */
  if (selectedBackup2) {
    const studentToNotify = await Student.findById(selectedBackup2._id);
    if (studentToNotify && studentToNotify.pushSubscription) {
      await sendPushNotification(
        studentToNotify, 
        "You're in the Pipeline! 🎤", 
        "You have been selected as Backup 2. Your turn is in 2 days!"
      );
    }
  }

  // 6. CYCLE COMPLETION CHECK
  const totalStudents = await Student.countDocuments({ classId });
  
  if (cycle.selectedStudentIds.length >= totalStudents) {
    await Cycle.findByIdAndUpdate(cycle._id, {
      status: 'completed',
      endDate: new Date()
    });

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

module.exports = { 
  runDailySelectionForClass,
  initializePipelineForClass
};