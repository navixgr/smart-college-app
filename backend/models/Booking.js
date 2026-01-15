  const mongoose = require('mongoose');

  const bookingSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    topic: { type: String, required: true },
    date: { type: String, required: true }, // Format: "YYYY-MM-DD" for easy daily grouping
    isWinner: { type: Boolean, default: false }
  }, { timestamps: true });

  module.exports = mongoose.model('Booking', bookingSchema);