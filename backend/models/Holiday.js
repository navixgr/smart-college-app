const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null // null = global holiday
  },
  createdBy: {
    type: String,
    enum: ['CC', 'SUPER'],
    required: true
  }
}, { timestamps: true });

holidaySchema.index({ date: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
