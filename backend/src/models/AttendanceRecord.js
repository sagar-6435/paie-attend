import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRSession',
    required: false, // Optional for manual records
  },
  date: {
    type: String,
    required: true,
  },
  workDone: {
    type: String,
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  isManual: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
attendanceRecordSchema.index({ studentId: 1, date: 1 });
attendanceRecordSchema.index({ sessionId: 1 });

export default mongoose.model('AttendanceRecord', attendanceRecordSchema);
