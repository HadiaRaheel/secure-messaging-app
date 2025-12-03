// backend/utils/Logger.js
const Log = require('../models/Log');

class Logger {
  // Generic log method
  static async log(type, userId, username, details, severity = 'INFO', additionalData = {}) {
    try {
      const logEntry = new Log({
        type,
        userId: userId || null,
        username: username || 'System',
        details,
        severity,
        ipAddress: additionalData.ipAddress || null,
        userAgent: additionalData.userAgent || null
      });
      
      await logEntry.save();
      
      // Also log to console for debugging
      const timestamp = new Date().toISOString();
      const severitySymbol = {
        'INFO': 'ℹ',
        'WARNING': '⚠',
        'ERROR': '❌',
        'CRITICAL': '🚨'
      }[severity] || 'ℹ';
      
      console.log(`[${timestamp}] ${severitySymbol} ${type} - ${username}: ${details}`);
      
      return logEntry;
    } catch (error) {
      console.error('Failed to create log entry:', error.message);
      // Don't throw error - logging should never break the app
      return null;
    }
  }
  
  // Authentication methods
  static async authSuccess(userId, username, details = 'User logged in successfully') {
    return this.log('AUTH_SUCCESS', userId, username, details, 'INFO');
  }
  
  static async authFailure(username, details = 'Login attempt failed', ipAddress = null) {
    return this.log('AUTH_FAILURE', null, username, details, 'WARNING', { ipAddress });
  }
  
  static async authFailed(username, details = 'Authentication failed', ipAddress = null) {
    // Alias for authFailure
    return this.authFailure(username, details, ipAddress);
  }
  
  // Security event methods
  static async replayAttackDetected(userId, username, details) {
    return this.log(
      'REPLAY_ATTACK_DETECTED',
      userId,
      username,
      details,
      'CRITICAL'
    );
  }
  
  static async keyExchangeInitiated(userId, username, recipientUsername) {
    return this.log(
      'KEY_EXCHANGE_INITIATED',
      userId,
      username,
      `Key exchange initiated with ${recipientUsername}`,
      'INFO'
    );
  }
  
  static async keyExchangeCompleted(userId, username, recipientUsername) {
    return this.log(
      'KEY_EXCHANGE_COMPLETED',
      userId,
      username,
      `Key exchange completed with ${recipientUsername}`,
      'INFO'
    );
  }
  
  static async keyExchangeFailed(userId, username, reason) {
    return this.log(
      'KEY_EXCHANGE_FAILED',
      userId,
      username,
      `Key exchange failed: ${reason}`,
      'ERROR'
    );
  }
  
  static async decryptionFailed(userId, username, details) {
    return this.log(
      'DECRYPTION_FAILED',
      userId,
      username,
      details,
      'WARNING'
    );
  }
  
  static async invalidSignature(userId, username, details) {
    return this.log(
      'INVALID_SIGNATURE',
      userId,
      username,
      details,
      'CRITICAL'
    );
  }
  
  static async messageSent(userId, username, recipientId, sequenceNumber) {
    return this.log(
      'MESSAGE_SENT',
      userId,
      username,
      `Message sent to ${recipientId} (seq: ${sequenceNumber})`,
      'INFO'
    );
  }
  
  static async fileUpload(userId, username, fileName, recipientId) {
    return this.log(
      'FILE_UPLOAD',
      userId,
      username,
      `Uploaded file "${fileName}" to ${recipientId}`,
      'INFO'
    );
  }
  
  static async fileDownload(userId, username, fileName) {
    return this.log(
      'FILE_DOWNLOAD',
      userId,
      username,
      `Downloaded file "${fileName}"`,
      'INFO'
    );
  }
  
  static async metadataAccess(userId, username, details) {
    return this.log(
      'METADATA_ACCESS',
      userId,
      username,
      details,
      'INFO'
    );
  }
  
  static async serverError(userId, username, error) {
    return this.log(
      'SERVER_ERROR',
      userId,
      username,
      `Server error: ${error.message}`,
      'ERROR'
    );
  }
}

module.exports = Logger;