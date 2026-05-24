import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  os: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  lastActive: {
    type: String,
    default: 'Active Now'
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  fingerprint: {
    type: String,
    required: true,
    index: true
  },
  riskScore: {
    type: Number,
    default: 12
  },
  trustedAt: {
    type: Date,
    default: Date.now
  }
});

export const Device = mongoose.model('Device', DeviceSchema);
