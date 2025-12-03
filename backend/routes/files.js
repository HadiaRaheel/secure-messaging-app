// backend/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const File = require('../models/File');

/**
 * Upload an encrypted file
 * POST /api/files/upload
 */
router.post('/upload', authMiddleware, async (req, res) => {
  try {
    const { recipientId, filename, originalSize, mimeType, encryptedChunks } = req.body;

    // Basic validation
    if (!recipientId || !filename || !originalSize || !mimeType || !encryptedChunks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // File size validation (10MB max)
    if (originalSize > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 10MB.' });
    }

    // Validate chunks
    if (!Array.isArray(encryptedChunks) || encryptedChunks.length === 0) {
      return res.status(400).json({ error: 'Invalid encrypted chunks' });
    }

    for (const chunk of encryptedChunks) {
      if (chunk.chunkIndex === undefined || !chunk.data || !chunk.iv) {
        return res.status(400).json({ error: 'Invalid chunk structure' });
      }
    }

    // Check chunk sequence
    const chunkIndices = encryptedChunks.map(c => c.chunkIndex).sort((a, b) => a - b);
    for (let i = 0; i < chunkIndices.length; i++) {
      if (chunkIndices[i] !== i) {
        return res.status(400).json({ error: 'Missing or duplicate chunks' });
      }
    }

    // Save file document
    const file = new File({
      sender: req.userId,
      recipient: recipientId,
      filename,
      originalSize,
      mimeType,
      totalChunks: encryptedChunks.length,
      encryptedChunks,
      uploadDate: new Date()
    });

    await file.save();

    res.status(201).json({
      fileId: file._id,
      message: 'File uploaded successfully',
      filename: file.filename,
      size: file.originalSize
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

/**
 * Download encrypted file
 * GET /api/files/download/:fileId
 */
router.get('/download/:fileId', authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId)
      .populate('sender', 'username')
      .populate('recipient', 'username');

    if (!file) return res.status(404).json({ error: 'File not found' });

    // Authorization check
    if (file.sender._id.toString() !== req.userId && file.recipient._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({
      fileId: file._id,
      filename: file.filename,
      originalSize: file.originalSize,
      mimeType: file.mimeType,
      totalChunks: file.totalChunks,
      encryptedChunks: file.encryptedChunks,
      uploadDate: file.uploadDate,
      sender: { _id: file.sender._id, username: file.sender.username },
      recipient: { _id: file.recipient._id, username: file.recipient.username }
    });

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Failed to download file', details: error.message });
  }
});

/**
 * Get all files for a conversation (without chunks)
 * GET /api/files/conversation/:userId
 */
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.userId;

    const files = await File.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .sort({ uploadDate: -1 })
    .select('-encryptedChunks'); // exclude chunks in list view

    res.json(files);
  } catch (error) {
    console.error('Conversation files fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch files', details: error.message });
  }
});

/**
 * Delete a file
 * DELETE /api/files/:fileId
 */
router.delete('/:fileId', authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) return res.status(404).json({ error: 'File not found' });

    if (file.sender.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only sender can delete files' });
    }

    await File.findByIdAndDelete(req.params.fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file', details: error.message });
  }
});

module.exports = router;
