const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  selectedStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Cycle', cycleSchema);
