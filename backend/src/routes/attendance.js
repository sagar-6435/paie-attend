import express from 'express';
import AttendanceRecord from '../models/AttendanceRecord.js';
import QRSession from '../models/QRSession.js';
import User from '../models/User.js';
import LabDay from '../models/LabDay.js';
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

    // Check if user already submitted for today
    const existingSubmission = await AttendanceRecord.findOne({
      studentId: req.user.id,
      date: today
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        error: 'You have already submitted your attendance for today. Only one submission is allowed per day.' 
      });
    }

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

// Manual attendance (admin only)
router.post('/manual', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { studentId, date, workDone } = req.body;

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Check if user already submitted for this date
    const existingSubmission = await AttendanceRecord.findOne({
      studentId,
      date
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        error: 'Attendance already exists for this student on this date.' 
      });
    }

    const record = new AttendanceRecord({
      studentId,
      studentName: student.name,
      date,
      workDone: workDone || "Marked manually by Admin",
      location: { lat: 0, lng: 0 }, // Manual entry location
      isManual: true, // Flag for manual entries
    });

    await record.save();
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
    
    // Total Labs = Number of days marked as 'active'
    const totalLabs = await LabDay.countDocuments({ status: 'active' });

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
          percentage: totalLabs > 0 ? Math.min(Math.round((attended / totalLabs) * 100), 100) : 0,
          totalLabs,
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
