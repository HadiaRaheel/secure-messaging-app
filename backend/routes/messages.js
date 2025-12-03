// backend/routes/messages.js - FIXED CONVERSATION FILTERING
const express = require('express');
const Message = require('../models/messages');
const authMiddleware = require('../middleware/auth');
const Logger = require('../utils/Logger');
const mongoose = require('mongoose');

const router = express.Router();

// In-memory store for sequence numbers (should be Redis/DB in production)
const receivedSequenceNumbers = new Map();

// Send encrypted message with replay protection
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { recipientId, ciphertext, iv, nonce, sequenceNumber } = req.body;
    
    // Validate required fields
    if (!recipientId || !ciphertext || !iv || !nonce || sequenceNumber === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const senderId = req.userId;
    
    // Prevent sending messages to self
    if (senderId === recipientId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }
    
    // Create direction-specific key for sequence tracking
    const directionKey = `${senderId}_to_${recipientId}`;
    
    // REPLAY PROTECTION 1: Check sequence number
    const lastSeq = receivedSequenceNumbers.get(directionKey) || 0;
    if (sequenceNumber <= lastSeq) {
      await Logger.log('REPLAY_ATTACK_DETECTED', senderId, req.username,
        `Duplicate sequence number detected: ${sequenceNumber} (expected > ${lastSeq})`,
        'WARNING');
      return res.status(400).json({ 
        error: 'Replay attack detected: Sequence number already used' 
      });
    }
    
    // Update last sequence number
    receivedSequenceNumbers.set(directionKey, sequenceNumber);
    
    // REPLAY PROTECTION 2: Validate timestamp (nonce)
    const messageTimestamp = parseInt(nonce);
    const currentTime = Date.now();
    const maxAgeMinutes = 5;
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    
    // Check if message is too old
    if (messageTimestamp < currentTime - maxAgeMs) {
      const ageMinutes = ((currentTime - messageTimestamp) / (1000 * 60)).toFixed(2);
      await Logger.log('REPLAY_ATTACK_DETECTED', senderId, req.username,
        `Message timestamp too old: ${ageMinutes} minutes (max: ${maxAgeMinutes} minutes)`,
        'WARNING');
      return res.status(400).json({ 
        error: `Message timestamp too old (${ageMinutes} minutes old, max ${maxAgeMinutes} minutes)` 
      });
    }
    
    // Check if message is from the future (clock skew attack)
    const allowedFutureSkewMinutes = 1;
    const maxFutureMs = allowedFutureSkewMinutes * 60 * 1000;
    if (messageTimestamp > currentTime + maxFutureMs) {
      const futureMinutes = ((messageTimestamp - currentTime) / (1000 * 60)).toFixed(2);
      await Logger.log('REPLAY_ATTACK_DETECTED', senderId, req.username,
        `Message timestamp in future: ${futureMinutes} minutes ahead`,
        'WARNING');
      return res.status(400).json({ 
        error: `Invalid timestamp: message is ${futureMinutes} minutes in the future` 
      });
    }
    
    // Store encrypted message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      ciphertext: ciphertext,
      iv: iv,
      nonce: nonce,
      sequenceNumber: sequenceNumber,
      timestamp: new Date()
    });
    
    await message.save();
    
    await Logger.log('MESSAGE_SENT', senderId, req.username,
      `Message sent to recipient ${recipientId} (seq: ${sequenceNumber})`, 'INFO');
    
    res.json({ 
      message: 'Message sent successfully',
      messageId: message._id
    });
    
  } catch (error) {
    // Handle duplicate key error (replay attack via database)
    if (error.code === 11000) {
      await Logger.log('REPLAY_ATTACK_DETECTED', req.userId, req.username,
        `Database duplicate key violation - Replay attack attempt blocked`, 'CRITICAL');
      
      return res.status(400).json({ 
        error: 'Replay attack detected: Duplicate message',
        type: 'DATABASE_DUPLICATE'
      });
    }
    
    console.error('Send message error:', error);
    await Logger.log('MESSAGE_SEND_FAILED', req.userId, req.username,
      `Failed to send message: ${error.message}`, 'ERROR');
    
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// Get conversation messages - CRITICAL FIX WITH EXPLICIT FILTERING
router.get('/conversation/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.userId;
    
    console.log('========================================');
    console.log('📥 FETCHING CONVERSATION MESSAGES');
    console.log('Current User ID:', userId);
    console.log('Current User ID Type:', typeof userId);
    console.log('Current Username:', req.username);
    console.log('Other User ID:', otherUserId);
    console.log('Other User ID Type:', typeof otherUserId);
    console.log('========================================');
    
    // Validate otherUserId
    if (!otherUserId || otherUserId === 'undefined' || otherUserId === 'null') {
      console.error('❌ Invalid otherUserId:', otherUserId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Prevent fetching messages with self
    if (userId === otherUserId || userId.toString() === otherUserId.toString()) {
      console.error('❌ User trying to fetch messages with themselves');
      return res.status(400).json({ error: 'Cannot fetch messages with yourself' });
    }
    
    // CRITICAL FIX: Simple and explicit query - messages between ONLY these two users
    const messages = await Message.find({
      $or: [
        { 
          sender: userId, 
          recipient: otherUserId 
        },
        { 
          sender: otherUserId, 
          recipient: userId 
        }
      ]
    })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .sort({ timestamp: 1 }); // Oldest first
    
    console.log(`✅ Raw query found ${messages.length} messages`);
    
    // Additional safety check: Verify each message
    const validMessages = messages.filter(msg => {
      const senderId = msg.sender._id.toString();
      const recipientId = msg.recipient._id.toString();
      const userIdStr = userId.toString();
      const otherUserIdStr = otherUserId.toString();
      
      const isValid = (
        (senderId === userIdStr && recipientId === otherUserIdStr) ||
        (senderId === otherUserIdStr && recipientId === userIdStr)
      );
      
      if (!isValid) {
        console.error('⚠️ FILTERED OUT INVALID MESSAGE:');
        console.error('  Message sender:', senderId, msg.sender.username);
        console.error('  Message recipient:', recipientId, msg.recipient.username);
        console.error('  Expected users:', userIdStr, otherUserIdStr);
      }
      
      return isValid;
    });
    
    if (validMessages.length !== messages.length) {
      console.error(`⚠️ SECURITY WARNING: Filtered out ${messages.length - validMessages.length} invalid messages!`);
    }
    
    // Detailed logging for debugging
    if (validMessages.length > 0) {
      console.log('✅ Valid messages in this conversation:');
      validMessages.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. ${msg.sender.username} → ${msg.recipient.username} at ${msg.timestamp}`);
      });
    } else {
      console.log('No messages found in this conversation');
    }
    
    console.log('========================================');
    
    await Logger.log('METADATA_ACCESS', userId, req.username,
      `Accessed conversation with user ${otherUserId} (${validMessages.length} messages)`, 'INFO');
    
    res.json(validMessages);
    
  } catch (error) {
    console.error('❌ Get conversation error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log('📋 Fetching all conversations for user:', userId);
    
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .sort({ timestamp: -1 });
    
    // Extract unique conversation partners
    const conversationPartners = new Map();
    messages.forEach(msg => {
      const partnerId = msg.sender._id.toString() === userId ? 
        msg.recipient._id.toString() : msg.sender._id.toString();
      
      if (!conversationPartners.has(partnerId)) {
        const partner = msg.sender._id.toString() === userId ? 
          msg.recipient : msg.sender;
        conversationPartners.set(partnerId, {
          user: partner,
          lastMessage: msg.timestamp
        });
      }
    });
    
    console.log(`✅ Found ${conversationPartners.size} conversations`);
    
    res.json(Array.from(conversationPartners.values()));
    
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete message (sender only)
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Only sender can delete their own messages
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own messages' });
    }
    
    await message.deleteOne();
    
    await Logger.log('MESSAGE_DELETED', userId, req.username,
      `Deleted message ${messageId}`, 'INFO');
    
    res.json({ message: 'Message deleted successfully' });
    
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// TEMPORARY: Clear all messages (REMOVE AFTER TESTING)
router.delete('/clear-all-messages/confirm', authMiddleware, async (req, res) => {
  try {
    console.log('⚠️  CLEARING ALL MESSAGES - User:', req.username);
    
    const result = await Message.deleteMany({});
    
    // Clear sequence numbers
    receivedSequenceNumbers.clear();
    
    await Logger.log('MESSAGES_CLEARED', req.userId, req.username,
      `Cleared ${result.deletedCount} messages from database`, 'WARNING');
    
    console.log(`✅ Deleted ${result.deletedCount} messages`);
    
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} messages`,
      count: result.deletedCount 
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({ error: 'Failed to clear messages', details: error.message });
  }
});

// Get message statistics (for debugging)
router.get('/stats/all', authMiddleware, async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const userMessages = await Message.countDocuments({
      $or: [
        { sender: req.userId },
        { recipient: req.userId }
      ]
    });
    
    res.json({
      totalMessages,
      userMessages,
      userId: req.userId,
      username: req.username
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;