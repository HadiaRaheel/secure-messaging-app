const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ciphertext: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  nonce: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sequenceNumber: {
    type: Number,
    required: true
  }
});

// Index for replay attack protection
messageSchema.index({ sender: 1, recipient: 1, sequenceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Message', messageSchema);