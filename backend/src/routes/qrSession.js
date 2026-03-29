import express from 'express';
import { randomUUID } from 'crypto';
import QRSession from '../models/QRSession.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create QR session (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { location, expiresIn = 3600 } = req.body;

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const session = new QRSession({
      sessionId,
      createdBy: req.user.id,
      location,
      expiresAt,
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active sessions
router.get('/', authenticate, async (req, res) => {
  try {
    const sessions = await QRSession.find({
      expiresAt: { $gt: new Date() },
    }).populate('createdBy', 'name email');

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const session = await QRSession.findOne({ sessionId: req.params.id }).populate('createdBy', 'name email');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark session as used
router.patch('/:id/use', authenticate, async (req, res) => {
  try {
    const session = await QRSession.findOneAndUpdate(
      { sessionId: req.params.id },
      { used: true },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
