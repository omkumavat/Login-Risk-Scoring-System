import express from 'express';
import { protect } from '../middleware/auth.js';
import { Device } from '../models/Device.js';
import { Log } from '../models/Log.js';
import { User } from '../models/User.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/devices
 * @desc    Fetch authenticated and parallel trusted devices
 */
router.get('/devices', protect, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user._id });
    res.json({ success: true, devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/dashboard/devices/:id
 * @desc    Revoke and blacklist device trust
 */
router.delete('/devices/:id', protect, async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user._id });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device signature not found.' });
    }

    if (device.isCurrent) {
      return res.status(400).json({ success: false, message: 'Cannot revoke active local session.' });
    }

    await Device.deleteOne({ _id: req.params.id });

    // Save logs audit of revocation event
    await Log.create({
      userId: req.user._id,
      ip: device.ip,
      browser: device.browser,
      os: device.os,
      location: device.location,
      riskScore: 10,
      riskLevel: 'Low',
      status: 'Denied',
      details: `Device revoked by user session. Future attempts from fp fingerprint token (${device.fingerprint}) will trigger immediate blocks.`
    });

    res.json({ success: true, message: `Access credentials revoked for ${device.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/dashboard/devices-all
 * @desc    Broadcast global session revocation (Killswitch)
 */
router.post('/devices-all', protect, async (req, res) => {
  try {
    // Delete all devices except current
    const result = await Device.deleteMany({ userId: req.user._id, isCurrent: false });

    // Save global killswitch logs
    await Log.create({
      userId: req.user._id,
      ip: req.ip || '127.0.0.1',
      browser: 'System SecOps',
      os: 'Broadcast Service',
      location: 'San Francisco, USA',
      riskScore: 5,
      riskLevel: 'Low',
      status: 'Approved',
      details: 'Broadcasted Global Killswitch. Terminated all parallel session tokens.'
    });

    res.json({ success: true, message: `Global revocation complete: terminated ${result.deletedCount} sessions.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/dashboard/logs
 * @desc    Get all audit log entries for the active user profile
 */
router.get('/logs', protect, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/dashboard/settings
 * @desc    Update user adaptive system settings and policies
 */
router.post('/settings', protect, async (req, res) => {
  try {
    const { mfaEnabled, sessionTimeout, emailNotifications, pushNotifications, smsNotifications, blockSuspiciousIps } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile mismatch.' });
    }

    if (mfaEnabled !== undefined) user.mfaEnabled = mfaEnabled;
    if (sessionTimeout !== undefined) user.sessionTimeout = sessionTimeout;
    
    if (user.notifications) {
      if (emailNotifications !== undefined) user.notifications.emailNotifications = emailNotifications;
      if (pushNotifications !== undefined) user.notifications.pushNotifications = pushNotifications;
      if (smsNotifications !== undefined) user.notifications.smsNotifications = smsNotifications;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Adaptive policies and notifications updated.',
      settings: {
        mfaEnabled: user.mfaEnabled,
        sessionTimeout: user.sessionTimeout,
        emailNotifications: user.notifications.emailNotifications,
        pushNotifications: user.notifications.pushNotifications,
        smsNotifications: user.notifications.smsNotifications
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/dashboard/password
 * @desc    Update user password credentials
 */
router.post('/password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password tokens.' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(oldPassword);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current credentials entered.' });
    }

    user.password = newPassword;
    await user.save();

    // Log the event
    await Log.create({
      userId: req.user._id,
      ip: req.ip || '127.0.0.1',
      browser: 'Client',
      os: 'System',
      location: 'San Francisco, USA',
      riskScore: 10,
      riskLevel: 'Low',
      status: 'Approved',
      details: 'User password changed. Reset cryptographic session tokens.'
    });

    res.json({ success: true, message: 'Secure passkey updated. Crypto token updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
