// backend/models/KeyExchange.js - FIXED VERSION
const mongoose = require('mongoose');

const keyExchangeSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initiatorECDHPublicKey: String,
  initiatorSignature: String,
  recipientECDHPublicKey: String,
  recipientSignature: String,
  keyConfirmation: String,
  status: {
    type: String,
    enum: ['pending', 'responded', 'completed', 'failed'],  // ← ADDED 'responded'
    default: 'pending'
  },
  nonce: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('KeyExchange', keyExchangeSchema);