// backend/routes/KeyExchange.js - FIXED VERSION
const express = require('express');
const KeyExchange = require('../models/KeyExchange');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Logger = require('../utils/Logger');

const router = express.Router();

// Initiate key exchange
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { recipientUsername, ecdhPublicKey, signature, nonce } = req.body;
    
    // Find recipient
    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create key exchange record
    const keyExchange = new KeyExchange({
      initiator: req.userId,
      recipient: recipient._id,
      initiatorECDHPublicKey: ecdhPublicKey,
      initiatorSignature: signature,
      nonce: nonce,
      status: 'pending'
    });
    
    await keyExchange.save();
    
    await Logger.log('KEY_EXCHANGE_INITIATED', req.userId, req.username,
      `Key exchange initiated with ${recipientUsername}`, 'INFO');
    
    res.json({
      message: 'Key exchange initiated',
      keyExchangeId: keyExchange._id,
      recipientPublicKey: recipient.publicKey
    });
  } catch (error) {
    console.error('Key exchange initiation error:', error);
    await Logger.log('KEY_EXCHANGE_FAILED', req.userId, req.username,
      `Failed to initiate key exchange: ${error.message}`, 'ERROR');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Respond to key exchange - FIXED VERSION
router.post('/respond/:keyExchangeId', authMiddleware, async (req, res) => {
  try {
    const { ecdhPublicKey, signature } = req.body;
    
    console.log('=== KEY EXCHANGE RESPONSE ===');
    console.log('Key Exchange ID:', req.params.keyExchangeId);
    console.log('Recipient User ID:', req.userId);
    
    const keyExchange = await KeyExchange.findById(req.params.keyExchangeId);
    if (!keyExchange) {
      return res.status(404).json({ message: 'Key exchange not found' });
    }
    
    if (keyExchange.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // CRITICAL FIX: Update all three fields
    keyExchange.recipientECDHPublicKey = ecdhPublicKey;
    keyExchange.recipientSignature = signature;
    keyExchange.status = 'responded';  // ← THIS WAS MISSING!
    
    await keyExchange.save();
    
    console.log('✓ Key exchange updated:');
    console.log('  - recipientECDHPublicKey:', ecdhPublicKey ? 'SET' : 'MISSING');
    console.log('  - recipientSignature:', signature ? 'SET' : 'MISSING');
    console.log('  - status:', keyExchange.status);
    
    const initiator = await User.findById(keyExchange.initiator);
    
    await Logger.log('KEY_EXCHANGE_RESPONDED', req.userId, req.username,
      `Responded to key exchange from ${initiator.username}`, 'INFO');
    
    res.json({
      message: 'Key exchange response sent',
      initiatorPublicKey: initiator.publicKey,
      initiatorECDHPublicKey: keyExchange.initiatorECDHPublicKey,
      initiatorSignature: keyExchange.initiatorSignature,
      nonce: keyExchange.nonce
    });
  } catch (error) {
    console.error('Key exchange response error:', error);
    await Logger.log('KEY_EXCHANGE_FAILED', req.userId, req.username,
      `Failed to respond to key exchange: ${error.message}`, 'ERROR');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Confirm key exchange
router.post('/confirm/:keyExchangeId', authMiddleware, async (req, res) => {
  try {
    const { keyConfirmation } = req.body;
    
    const keyExchange = await KeyExchange.findById(req.params.keyExchangeId);
    if (!keyExchange) {
      return res.status(404).json({ message: 'Key exchange not found' });
    }
    
    keyExchange.keyConfirmation = keyConfirmation;
    keyExchange.status = 'completed';
    await keyExchange.save();
    
    await Logger.log('KEY_EXCHANGE_COMPLETED', req.userId, req.username,
      `Key exchange confirmed`, 'INFO');
    
    res.json({ message: 'Key exchange completed' });
  } catch (error) {
    console.error('Key exchange confirmation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending key exchanges (for current user as recipient)
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const pending = await KeyExchange.find({
      recipient: req.userId,
      status: 'pending',
      recipientECDHPublicKey: { $exists: false }
    }).populate('initiator', 'username publicKey');
    
    res.json(pending);
  } catch (error) {
    console.error('Get pending key exchanges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get key exchange status
router.get('/status/:keyExchangeId', authMiddleware, async (req, res) => {
  try {
    const keyExchange = await KeyExchange.findById(req.params.keyExchangeId)
      .populate('initiator', 'username publicKey')
      .populate('recipient', 'username publicKey');
      
    if (!keyExchange) {
      return res.status(404).json({ message: 'Key exchange not found' });
    }
    
    // Check if user is part of this exchange
    if (keyExchange.initiator._id.toString() !== req.userId && 
        keyExchange.recipient._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.json({
      status: keyExchange.status,
      initiatorPublicKey: keyExchange.initiator.publicKey,
      recipientPublicKey: keyExchange.recipient.publicKey,
      initiatorECDHPublicKey: keyExchange.initiatorECDHPublicKey,
      recipientECDHPublicKey: keyExchange.recipientECDHPublicKey,
      initiatorSignature: keyExchange.initiatorSignature,
      recipientSignature: keyExchange.recipientSignature,
      nonce: keyExchange.nonce
    });
  } catch (error) {
    console.error('Get key exchange status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;