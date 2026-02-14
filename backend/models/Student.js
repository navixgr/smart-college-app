const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },        // "620124104001"
  name: { type: String, required: true },
  email: { type: String, required: true },                     // "alice@gmail.com"
  phone: { type: String, required: true },                     // "9876545678"
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  currentCounter: { type: Number, default: 0 },
  isSelectedInCurrentCycle: { type: Boolean, default: false },
  lastSelectedDate: { type: Date, default: null },
  // Add this to your existing studentSchema
  isLongAbsent: { type: Boolean, default: false },
  isManualSelection: { type: Boolean, default: false },// To track if they were forced
  pushSubscription: {
    type: Object,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
