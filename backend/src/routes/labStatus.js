import express from 'express';
import LabStatus from '../models/LabStatus.js';
import LabDay from '../models/LabDay.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get lab status
router.get('/', async (req, res) => {
  try {
    let status = await LabStatus.findOne();
    if (!status) {
      status = await LabStatus.create({ status: 'active' });
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lab status (admin only)
router.patch('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, message } = req.body;
    let labStatus = await LabStatus.findOne();
    
    if (!labStatus) {
      labStatus = new LabStatus({ status, message, updatedBy: req.user.id });
    } else {
      labStatus.status = status;
      labStatus.message = message;
      labStatus.updatedBy = req.user.id;
      labStatus.updatedAt = Date.now();
    }

    await labStatus.save();

    // Update LabDay history
    const today = new Date().toISOString().split('T')[0];
    await LabDay.findOneAndUpdate(
      { date: today },
      { 
        status, 
        updatedBy: req.user.id,
        updatedAt: Date.now() 
      },
      { upsert: true, new: true }
    );

    res.json(labStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
