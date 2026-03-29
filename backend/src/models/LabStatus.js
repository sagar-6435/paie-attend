import mongoose from 'mongoose';

const labStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'holiday'],
    default: 'active'
  },
  message: {
    type: String,
    default: ''
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

const LabStatus = mongoose.model('LabStatus', labStatusSchema);

export default LabStatus;
