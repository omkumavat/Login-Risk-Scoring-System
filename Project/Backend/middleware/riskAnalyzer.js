import { Device } from '../models/Device.js';
import { Log } from '../models/Log.js';

export const analyzeRisk = async (req, res, next) => {
  try {
    const { email, fingerprint, ip, os, browser, location, vpnSuspected, newDevice } = req.body;
    
    // Default fallback risk profile parameters
    let score = 8; // Baseline clean score
    let warnings = [];
    let isUnknownFingerprint = false;
    let isVpnDetected = false;
    let isImpossibleTravel = false;

    // 1. VPN Detection check
    if (vpnSuspected || (ip && (ip.startsWith('185.220') || ip.startsWith('82.102') || ip.includes('Tor')))) {
      score += 45;
      isVpnDetected = true;
      warnings.push('VPN suspected: Secure residential proxy routing identified.');
    }

    // 2. Client Device Fingerprint Matching
    if (fingerprint) {
      // Find matches in registered devices for this fingerprint (across users)
      const existingDevices = await Device.find({ fingerprint });
      
      if (existingDevices.length === 0 || newDevice) {
        score += 25;
        isUnknownFingerprint = true;
        warnings.push('New device signature: Cryptographic browser fingerprint unregistered.');
      } else {
        // If fingerprint exists but matches another country or network velocity mismatch
        const matchingDevice = existingDevices[0];
        if (location && matchingDevice.location !== location) {
          score += 15;
          warnings.push('Location shift: Known hardware device accessed from anomalous geocoordinates.');
        }
      }
    } else {
      score += 15;
      warnings.push('Fingerprint missing: No browser hardware details provided.');
    }

    // 3. Impossible Travel velocity check (based on last login logs)
    if (email) {
      const lastLogs = await Log.find({ details: { $regex: email, $options: 'i' } })
        .sort({ createdAt: -1 })
        .limit(1);

      if (lastLogs.length > 0 && location) {
        const lastLog = lastLogs[0];
        if (lastLog.location !== location && !isVpnDetected) {
          // Simplistic geodistance mockup velocity warning
          score += 35;
          isImpossibleTravel = true;
          warnings.push('Impossible travel: Account accessed from two geographic regions within travel threshold.');
        }
      }
    }

    // Ensure score doesn't exceed 100 or drop below 5
    score = Math.min(100, Math.max(5, score));

    // Determine risk categorization level
    let level = 'Low';
    if (score > 70) {
      level = 'High';
    } else if (score > 30) {
      level = 'Medium';
    }

    // Attach computed risk telemetry to request payload
    req.riskProfile = {
      score,
      level,
      warnings,
      isVpnDetected,
      isUnknownFingerprint,
      isImpossibleTravel
    };

    next();
  } catch (error) {
    console.error('Adaptive Risk Scoring Engine Exception:', error.message);
    // Proceed with baseline defaults on system error to avoid auth lockouts
    req.riskProfile = {
      score: 15,
      level: 'Low',
      warnings: ['Security audit failed: Fallback to baseline default engine.']
    };
    next();
  }
};
