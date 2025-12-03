// backend/models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'AUTH_SUCCESS',
      'AUTH_FAILURE',
      'KEY_EXCHANGE_INITIATED',
      'KEY_EXCHANGE_COMPLETED',
      'KEY_EXCHANGE_FAILED',
      'MESSAGE_SENT',
      'MESSAGE_SEND_ERROR',
      'MESSAGE_SEND_FAILED',
      'FILE_UPLOAD',
      'FILE_DOWNLOAD',
      'METADATA_ACCESS',
      'CONVERSATIONS_ACCESS',
      'REPLAY_ATTACK_DETECTED',
      'DECRYPTION_FAILED',
      'INVALID_SIGNATURE',
      'INVALID_NONCE',
      'SERVER_ERROR'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  username: {
    type: String,
    required: false
  },
  details: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    default: 'INFO'
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
logSchema.index({ type: 1, timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);