const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },        // "3rd CSE A"
  code: { type: String, required: true, unique: true } // "CSE3A"
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
