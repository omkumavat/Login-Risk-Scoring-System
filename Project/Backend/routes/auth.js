import express from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
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

// NodeMailer dynamic SMTP Dispatcher
const sendOtpEmail = async (email, otp) => {
  try {
    let transporter;

    // Check if user set custom SMTP credentials in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Sandbox Fallback: Create dynamic Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    const info = await transporter.sendMail({
      from: '"SECUREMESH SecOps" <secops@securemesh.io>',
      to: email,
      subject: '🔐 SECUREMESH: Multi-Factor Authentication Challenge Code',
      html: `
        <div style="background-color: #030712; color: #f3f4f6; padding: 32px; font-family: system-ui, sans-serif; border-radius: 12px; border: 1px solid #1f2937; max-width: 500px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #3b82f6; font-size: 24px; margin: 0; font-weight: bold; letter-spacing: -0.5px;">SECURE<span style="color: #ffffff;">MESH</span></h2>
            <span style="color: #6b7280; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Adaptive Guardian v2.4</span>
          </div>
          <p style="font-size: 14px; color: #9ca3af; margin: 0 0 16px; line-height: 1.5;">An authentication request triggered a dynamic secondary MFA challenge for your user account.</p>
          <div style="background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="color: #6b7280; font-size: 11px; display: block; margin-bottom: 8px; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px;">ONE-TIME PASSCODE CHALLENGE</span>
            <strong style="color: #3b82f6; font-size: 32px; font-family: monospace; letter-spacing: 4px; display: block;">${otp}</strong>
          </div>
          <p style="font-size: 11px; color: #6b7280; margin: 0; line-height: 1.6;">This passcode is valid for 5 minutes (300 seconds). If you did not initiate this authentication request, isolate your credentials or trigger the Global Revocation Killswitch immediately.</p>
        </div>
      `
    });

    console.log('\x1b[36m%s\x1b[0m', `✉️  OTP Email sent successfully to: ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\x1b[36m%s\x1b[0m', `🔗 Ethereal Sandbox Mail Preview: ${previewUrl}`);
    }
  } catch (error) {
    console.error('Nodemailer SMTP dispatch failed:', error.message);
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Seed or Register a new SecOps Identity Profile
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Optional: Log registration attempts for analytics
    // console.log('\x1b[36m%s\x1b[0m', `🔐 Registration attempt: ${email} (${role || 'User'})`);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Identity profile already registered.' });
    }

    // console.log('\x1b[36m%s\x1b[0m', `🔐 Registration attempt: ${email} (${role || 'User'})`);

    const user = await User.create({
      email,
      password,
      role: role || 'SecOps Specialist'
    });

    // console.log('\x1b[36m%s\x1b[0m', `🔐 Registration attempt: ${email} (${role || 'User'})`);
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
    // const mfaRequired = user.mfaEnabled || level === 'High' || level === 'Medium';
    const requireOtp =
      level === 'Medium' ||
      user.mfaEnabled;

    const blockLogin =
      level === 'High';

    if (blockLogin) {

      await Log.create({
        userId: user._id,
        ip: ip || '127.0.0.1',
        browser: browser || 'Unknown Client',
        os: os || 'Unknown System',
        location: location || 'Unknown Location',
        riskScore: score,
        riskLevel: level,
        status: 'Blocked',
        details:
          'Critical adaptive risk threshold exceeded. Authentication blocked.'
      });

      return res.status(403).json({
        success: false,
        blocked: true,
        riskLevel: level,
        riskScore: score,
        warnings,
        message:
          'Authentication blocked due to high-risk behavior.'
      });
    }

    if (requireOtp) {
      // Generate 6 digit OTP using Speakeasy
      const mfaSecret = speakeasy.generateSecret({ length: 20 });
      const otp = speakeasy.totp({
        secret: mfaSecret.base32,
        encoding: 'base32',
        step: 300 // 5 minutes step interval
      });

      const sessionKey = 'session_' + Math.random().toString(36).substr(2, 9);

      // Cache the session data
      pendingSessions.set(sessionKey, {
        userId: user._id,
        email: user.email,
        role: user.role,
        otpSecret: mfaSecret.base32,
        deviceDetails: {
          name: os ? `${os.split(' ')[0]} Workstation` : 'Client Workstation',
          os: os || 'Unknown OS',
          browser: browser || 'Unknown Browser',
          ip: ip || '127.0.0.1',
          location: location || 'Unknown Location',
          fingerprint: fingerprint || 'fp_' + Math.random().toString(36).substr(2, 12),
          riskScore: score
        },
        warnings,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes validity
      });

      // Async send OTP email
      await sendOtpEmail(user.email, otp);

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
        devOtpPreview: otp, // Send back OTP directly in development JSON for visual convenience
        message: 'Secondary multi-factor authentication passcode required.'
      });
    }

    // Standard Direct Login bypass (Low Risk, no MFA active)
    user.lastLogin = Date.now();
    await user.save();

    // Mark current active device
    await Device.updateMany({ userId: user._id }, { isCurrent: false });

    const deviceName = os ? `${os.split(' ')[0]} Workstation` : 'Client Workstation';
    let device = await Device.findOne({ userId: user._id, fingerprint });

    if (!device) {
      device = await Device.create({
        userId: user._id,
        name: deviceName,
        os: os || 'Unknown OS',
        browser: browser || 'Unknown Browser',
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

    // Verify OTP using Speakeasy
    const verified = speakeasy.totp.verify({
      secret: session.otpSecret,
      encoding: 'base32',
      token: otp,
      step: 300,
      window: 2 // Allow 2 steps tolerance for network sync drift
    });

    // Support static '123456' or '654321' fallbacks for demo accessibility
    const isMockBypass = otp === '123456' || otp === '654321';

    if (!verified && !isMockBypass) {
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
