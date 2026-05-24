import mongoose from 'mongoose';

const ThreatSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['High', 'Medium'],
    required: true
  },
  source: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: 'Just now'
  },
  target: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Mitigated'],
    default: 'Active'
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Threat = mongoose.model('Threat', ThreatSchema);
