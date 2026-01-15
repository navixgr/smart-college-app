  const mongoose = require('mongoose');

  const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // plain or hashed (see note below)
    role: {
      type: String,
      enum: ['CC', 'SUPER'],
      required: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null // null for SUPER admin
    }
  }, { timestamps: true });

  module.exports = mongoose.model('Admin', adminSchema);
