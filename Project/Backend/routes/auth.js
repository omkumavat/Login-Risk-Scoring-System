import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Device } from '../models/Device.js';
import { Log } from '../models/Log.js';
import { analyzeRisk } from '../middleware/riskAnalyzer.js';

const router = express.Router();

// Light-weight in-memory cache to hold pending MFA OTP sessions
export const pendingSessions = new Map();

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Seed or Register a new SecOps Identity Profile
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Identity profile already registered.' });
    }

    const user = await User.create({
      email,
      password,
      role: role || 'SecOps Specialist'
    });

    res.status(201).json({
      success: true,
      message: 'Secure profile seeded successfully.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Adaptive login request utilizing Risk Analyzer
 */
router.post('/login', analyzeRisk, async (req, res) => {
  try {
    const { email, password, fingerprint, ip, os, browser, location } = req.body;
    
    // Locate registered profile
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Access denied: Invalid profile credentials.' });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Record failed attempts in DB Logs for Admin charts
      await Log.create({
        userId: user._id,
        ip: ip || '127.0.0.1',
        browser: browser || 'Unknown Client',
        os: os || 'Unknown System',
        location: location || 'Unknown Location',
        riskScore: 65,
        riskLevel: 'Medium',
        status: 'Denied',
        details: `Login failure: Incorrect password entered for account ${email}.`
      });

      return res.status(401).json({ success: false, message: 'Access denied: Invalid profile credentials.' });
    }

    // Retrieve risk scoring parameters compiled by riskAnalyzer middleware
    const { score, level, warnings } = req.riskProfile;

    // Check if OTP Challenge is required: MFA policy is active OR calculated risk is suspicious
    const mfaRequired = user.mfaEnabled || level === 'High' || level === 'Medium';

    if (mfaRequired) {
      // Generate 6 digit OTP (static '123456' for demo verification ease or dynamic)
      const otp = '123456'; 
      const sessionKey = 'session_' + Math.random().toString(36).substr(2, 9);
      
      // Cache the session data
      pendingSessions.set(sessionKey, {
        userId: user._id,
        email: user.email,
        role: user.role,
        otp,
        deviceDetails: {
          name: `${os.split(' ')[0]} Workstation`,
          os,
          browser,
          ip: ip || '127.0.0.1',
          location: location || 'San Francisco, USA',
          fingerprint: fingerprint || 'fp_' + Math.random().toString(36).substr(2, 12),
          riskScore: score
        },
        warnings,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes validity
      });

      // Write OTP Challenged warning log to database
      await Log.create({
        userId: user._id,
        ip: ip || '127.0.0.1',
        browser: browser || 'Unknown Client',
        os: os || 'Unknown System',
        location: location || 'Unknown Location',
        riskScore: score,
        riskLevel: level,
        status: 'OTP Challenged',
        details: `Adaptive gate challenged: OTP required due to risk profile index of ${score}% (${warnings.join(', ') || 'Enforced MFA Policy'}).`
      });

      return res.json({
        success: true,
        otpRequired: true,
        sessionKey,
        warnings,
        message: 'Secondary multi-factor authentication passcode required.'
      });
    }

    // Standard Direct Login bypass (Low Risk, no MFA active)
    user.lastLogin = Date.now();
    await user.save();

    // Mark current active device
    await Device.updateMany({ userId: user._id }, { isCurrent: false });
    
    const deviceName = `${os.split(' ')[0]} Workstation`;
    let device = await Device.findOne({ userId: user._id, fingerprint });
    
    if (!device) {
      device = await Device.create({
        userId: user._id,
        name: deviceName,
        os,
        browser,
        ip: ip || '127.0.0.1',
        location: location || 'San Francisco, USA',
        isCurrent: true,
        fingerprint: fingerprint || 'fp_' + Math.random().toString(36).substr(2, 12),
        riskScore: score
      });
    } else {
      device.isCurrent = true;
      device.lastActive = 'Active Now';
      device.ip = ip || device.ip;
      device.location = location || device.location;
      device.riskScore = score;
      await device.save();
    }

    // Save login log in DB
    await Log.create({
      userId: user._id,
      ip: ip || '127.0.0.1',
      browser: browser || 'Unknown Client',
      os: os || 'Unknown System',
      location: location || 'Unknown Location',
      riskScore: score,
      riskLevel: level,
      status: 'Approved',
      details: 'Direct authorization approved. Low-risk profile matched.'
    });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      otpRequired: false,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.email.split('@')[0].toUpperCase(),
        role: user.role,
        lastLogin: user.lastLogin,
        riskScore: score
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify 6-digit passcode and complete login sequence
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { sessionKey, otp } = req.body;

    if (!sessionKey || !otp) {
      return res.status(400).json({ success: false, message: 'Invalid token handshake.' });
    }

    const session = pendingSessions.get(sessionKey);
    if (!session) {
      return res.status(400).json({ success: false, message: 'Auth session expired. Please restart logon.' });
    }

    if (Date.now() > session.expires) {
      pendingSessions.delete(sessionKey);
      return res.status(400).json({ success: false, message: 'Passcode expired. Request a new token.' });
    }

    // Verify code: accepts 123456 or 654321 for demo ease, or matched cached value
    if (otp !== session.otp && otp !== '123456' && otp !== '654321') {
      return res.status(401).json({ success: false, message: 'Invalid 6-digit passcode token. Access rejected.' });
    }

    // Verification Success: create trusted/current device, create approved log, send JWT token
    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Identity record not found.' });
    }

    user.lastLogin = Date.now();
    await user.save();

    // Reset current device flags
    await Device.updateMany({ userId: user._id }, { isCurrent: false });

    // Save/Update device signature
    const devDetails = session.deviceDetails;
    let device = await Device.findOne({ userId: user._id, fingerprint: devDetails.fingerprint });

    if (!device) {
      device = await Device.create({
        userId: user._id,
        name: devDetails.name,
        os: devDetails.os,
        browser: devDetails.browser,
        ip: devDetails.ip,
        location: devDetails.location,
        isCurrent: true,
        fingerprint: devDetails.fingerprint,
        riskScore: devDetails.riskScore
      });
    } else {
      device.isCurrent = true;
      device.lastActive = 'Active Now';
      device.ip = devDetails.ip;
      device.location = devDetails.location;
      device.riskScore = devDetails.riskScore;
      await device.save();
    }

    // Write Approved log in database
    await Log.create({
      userId: user._id,
      ip: devDetails.ip,
      browser: devDetails.browser,
      os: devDetails.os,
      location: devDetails.location,
      riskScore: devDetails.riskScore,
      riskLevel: devDetails.riskScore > 70 ? 'High' : devDetails.riskScore > 30 ? 'Medium' : 'Low',
      status: 'Approved',
      details: `MFA verification successful. Access granted under ${devDetails.riskScore}% risk profile.`
    });

    const token = generateToken(user._id);

    // Delete session from cache
    pendingSessions.delete(sessionKey);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.email.split('@')[0].toUpperCase(),
        role: user.role,
        lastLogin: user.lastLogin,
        riskScore: devDetails.riskScore
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
