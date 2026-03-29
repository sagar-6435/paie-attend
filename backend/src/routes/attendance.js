import express from 'express';
import AttendanceRecord from '../models/AttendanceRecord.js';
import QRSession from '../models/QRSession.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Record attendance
router.post('/', authenticate, async (req, res) => {
  try {
    const { sessionId, workDone, location } = req.body;

    const session = await QRSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (new Date() > session.expiresAt) {
      return res.status(400).json({ error: 'Session expired' });
    }

    const user = await User.findById(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    const record = new AttendanceRecord({
      studentId: req.user.id,
      studentName: user.name,
      sessionId: session._id,
      date: today,
      workDone,
      location,
    });

    await record.save();
    await QRSession.findOneAndUpdate({ sessionId }, { $inc: { attendanceCount: 1 } });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student's attendance records
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const records = await AttendanceRecord.find({
      studentId: req.params.studentId,
    }).sort({ timestamp: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all attendance records (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { studentId, date } = req.query;
    let query = {};

    if (studentId) query.studentId = studentId;
    if (date) query.date = date;

    const records = await AttendanceRecord.find(query)
      .populate('studentId', 'name email rollNumber')
      .sort({ timestamp: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance statistics
router.get('/stats/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    const totalSessions = await QRSession.countDocuments();

    const stats = await Promise.all(
      students.map(async (student) => {
        const attended = await AttendanceRecord.countDocuments({
          studentId: student._id,
        });

        const lastRecord = await AttendanceRecord.findOne({
          studentId: student._id,
        }).sort({ timestamp: -1 });

        return {
          id: student._id,
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          attended,
          percentage: totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0,
          lastWork: lastRecord?.workDone || 'N/A',
        };
      })
    );

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
