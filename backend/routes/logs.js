// backend/routes/logs.js
const express = require('express');
const Log = require('../models/Log');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ---------------------------------------------------------
   Helper: safeQuery(options)
   Ensures no undefined fields are passed into Mongo queries.
--------------------------------------------------------- */
const safeQuery = (options = {}) => {
  return Object.fromEntries(
    Object.entries(options).filter(([_, v]) => v !== undefined)
  );
};

/* ---------------------------------------------------------
   GET /recent
   Fetch recent logs, optionally filtered by type
--------------------------------------------------------- */
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const query = safeQuery({
      type: req.query.type
    });

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'username');

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: 'Server error in /recent',
      error: error.message
    });
  }
});

/* ---------------------------------------------------------
   GET /type/:type
   Fetch logs by log type
--------------------------------------------------------- */
router.get('/type/:type', authMiddleware, async (req, res) => {
  try {
    const logs = await Log.find({ type: req.params.type })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'username');

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: 'Server error in /type/:type',
      error: error.message
    });
  }
});

/* ---------------------------------------------------------
   GET /user/:userId
   Fetch logs only for the authorized user
--------------------------------------------------------- */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Restrict to owner or future admin role
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access to logs' });
    }

    const logs = await Log.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: 'Server error in /user/:userId',
      error: error.message
    });
  }
});

/* ---------------------------------------------------------
   GET /replay-attacks
   Fetch replay attack logs
--------------------------------------------------------- */
router.get('/replay-attacks', authMiddleware, async (req, res) => {
  try {
    const logs = await Log.find({ type: 'REPLAY_ATTACK_DETECTED' })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'username');

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: 'Server error in /replay-attacks',
      error: error.message
    });
  }
});

/* ---------------------------------------------------------
   GET /stats
   Security analytics
--------------------------------------------------------- */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const logsByType = await Log.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const replayAttacksLast24h = await Log.countDocuments({
      type: 'REPLAY_ATTACK_DETECTED',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({ logsByType, replayAttacksLast24h });
  } catch (error) {
    res.status(500).json({
      message: 'Server error in /stats',
      error: error.message
    });
  }
});

module.exports = router;
