import mongoose from 'mongoose';

const labDaySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'holiday'],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const LabDay = mongoose.model('LabDay', labDaySchema);

export default LabDay;
