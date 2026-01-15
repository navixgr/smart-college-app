const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  amount: {
    type: Number,
    default: 10
  },
  reason: {
    type: String,
    default: 'Not Booked'
  }
}, { timestamps: true });

fineSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Fine', fineSchema);
