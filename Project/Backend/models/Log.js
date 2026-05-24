import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Can be null if malicious unauthorized logins are denied
    index: true
  },
  time: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19)
  },
  ip: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  os: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  riskScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  status: {
    type: String,
    enum: ['Approved', 'Denied', 'OTP Challenged'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Automatically expire log entries after 30 days
  }
});

export const Log = mongoose.model('Log', LogSchema);
