const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  selectedStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  
  // New Pipeline Fields
  primaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  backup1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  backup2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Cycle', cycleSchema);
