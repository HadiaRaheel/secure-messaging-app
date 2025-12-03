// backend/models/File.js
const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  filename: { 
    type: String, 
    required: true 
  },
  originalSize: { 
    type: Number, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  totalChunks: {
    type: Number,
    required: true
  },
  encryptedChunks: [{
    chunkIndex: { type: Number, required: true },
    data: { type: String, required: true }, // Base64 ciphertext
    iv: { type: String, required: true }    // Hex IV
  }],
  uploadDate: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Compound index for conversation queries
FileSchema.index({ sender: 1, recipient: 1, uploadDate: -1 });

// Virtual for formatted file size
FileSchema.virtual('formattedSize').get(function() {
  if (this.originalSize < 1024) return this.originalSize + ' B';
  if (this.originalSize < 1024 * 1024) return (this.originalSize / 1024).toFixed(2) + ' KB';
  return (this.originalSize / (1024 * 1024)).toFixed(2) + ' MB';
});

// Ensure virtuals are included in JSON
FileSchema.set('toJSON', { virtuals: true });
FileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', FileSchema);
