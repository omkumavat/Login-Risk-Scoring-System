import React, { createContext, useContext, useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const SecurityContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export const SecurityProvider = ({ children }) => {
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cyber_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('cyber_token') || null;
  });
  const [otpPending, setOtpPending] = useState(false);
  const [sessionKey, setSessionKey] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    mfaEnabled: true,
    sessionTimeout: 15,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    blockSuspiciousIps: true,
    strictDeviceFingerprinting: false,
  });

  // DB Sync States (Devices, Logs, Threats, Admin Metrics)
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [threats, setThreats] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState({
    totalLoginAttempts: 0,
    failedLogins: 0,
    highRiskLogins: 0,
    activeBans: 0,
    userCount: 0,
    activeSessions: 0
  });
  const [riskDistribution, setRiskDistribution] = useState([]);

  // Load user data on startup
  useEffect(() => {
    if (user && token) {
      fetchData();
    }
  }, [user, token]);

  // Dynamic system telemetry fetch
  const fetchData = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || localStorage.getItem('cyber_token')}`
      };

      // 1. Fetch settings (we can extract from user profile or standard settings response)
      // Since it's stored in User schema, standard settings sync
      if (user?.role === 'Admin') {
        // Fetch Admin Telemetry Metrics
        const metricsRes = await fetch(`${API_URL}/admin/metrics`, { headers });
        const metricsData = await metricsRes.json();
        
        if (metricsData.success) {
          setAdminMetrics(metricsData.metrics);
          setThreats(metricsData.threats);
          setLogs(metricsData.logs);
        }
        
        // Also fetch admin devices
        const devRes = await fetch(`${API_URL}/dashboard/devices`, { headers });
        const devData = await devRes.json();
        if (devData.success) {
          setDevices(devData.devices);
        }
      } else {
        // Fetch standard User devices
        const devRes = await fetch(`${API_URL}/dashboard/devices`, { headers });
        const devData = await devRes.json();
        if (devData.success) setDevices(devData.devices);

        // Fetch User Logs
        const logsRes = await fetch(`${API_URL}/dashboard/logs`, { headers });
        const logsData = await logsRes.json();
        if (logsData.success) setLogs(logsData.logs);
      }
    } catch (err) {
      console.error('Telemetry Synchronization Failure:', err.message);
    }
  };

  // Sync state loops to pull threats and logs periodically in background
  useEffect(() => {
    if (!user || !token) return;

    const interval = setInterval(() => {
      fetchData();
    }, 15000); // Poll database metrics every 15 seconds

    return () => clearInterval(interval);
  }, [user, token]);

  // helper to guess OS & Browser signature
  const getClientContext = () => {
    const ua = navigator.userAgent;
    let os = 'Linux Workstation';
    if (ua.includes('Windows')) os = 'Windows Workstation';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'MacBook Pro Workstation';
    else if (ua.includes('iPhone')) os = 'iPhone Mobile';
    else if (ua.includes('Android')) os = 'Android Mobile';

    let browser = 'Chrome Browser';
    if (ua.includes('Firefox')) browser = 'Firefox Web Client';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari Web Client';
    else if (ua.includes('Edge')) browser = 'Edge Web Client';

    return { os, browser };
  };

  // Register Operation
  const register = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      // Auto-login after successful registration
      showToast('Account created. Proceeding to login...', 'success');
      // Reuse login method defined later (will be hoisted)
      return await login(email, password);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auth Operations
  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      // Generate browser fingerprint using FingerprintJS
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      const fingerprint = result.visitorId;

      const { os, browser } = getClientContext();
      // Simple IP fetch (fallback to placeholder if failed)
      let ip = '127.0.0.1';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip || ip;
      } catch (e) {
        // ignore, keep default
      }
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fingerprint, os, browser, ip })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      if (data.otpRequired) {
        setOtpPending(true);
        setSessionKey(data.sessionKey);
        setTempUser({ email, riskScore: data.devOtpPreview ? 70 : 15 });
        
        // Show OTP code helper alert in development console for convenience
        if (data.devOtpPreview) {
          showToast(`Adaptive Gate Triggered: Verification Email dispatched (Dev preview code: ${data.devOtpPreview})`, 'warning', 6000);
        } else {
          showToast('Adaptive Gate Triggered: Multi-Factor passcode dispatched to mailbox.', 'warning');
        }
        return { otpRequired: true };
      }

      // Direct low-risk authentication success
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('cyber_token', data.token);
      localStorage.setItem('cyber_user', JSON.stringify(data.user));

      showToast(`Welcome back, ${data.user.name}. SOC session loaded.`, 'success');
      return { otpRequired: false, user: data.user };

    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionKey, otp })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(data.message || 'OTP verification failed.', 'error');
        throw new Error(data.message || 'Invalid passcode');
      }

      // Success
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('cyber_token', data.token);
      localStorage.setItem('cyber_user', JSON.stringify(data.user));

      setOtpPending(false);
      setSessionKey(null);
      setTempUser(null);

      showToast('OTP verified successfully. Access granted.', 'success');
      return data.user;

    } catch (error) {
      console.error('OTP verification exception:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOtpPending(false);
    setTempUser(null);
    setSessionKey(null);
    localStorage.removeItem('cyber_user');
    localStorage.removeItem('cyber_token');
    showToast('SOC connection closed. Session terminated.', 'info');
  };

  const revokeDevice = async (deviceId) => {
    try {
      const response = await fetch(`${API_URL}/dashboard/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showToast(data.message || 'Device authorization revoked.', 'warning');
        fetchData(); // Refetch updated devices list
      } else {
        showToast(data.message || 'Failed to revoke device.', 'error');
      }
    } catch (error) {
      console.error('Device revocation exception:', error);
    }
  };

  const logoutAllDevices = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/devices-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showToast(data.message || 'Remote active devices terminated.', 'success');
        fetchData(); // Refetch updated devices
      } else {
        showToast(data.message || 'Failed to trigger global killswitch.', 'error');
      }
    } catch (error) {
      console.error('Global killswitch exception:', error);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/dashboard/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Password update failed');
      }

      showToast('Master passcode updated successfully.', 'success');
      fetchData();
      return true;
    } catch (error) {
      showToast(error.message || 'Failed to update credentials.', 'error');
      throw error;
    }
  };

  const updateSettings = async (key, value) => {
    try {
      // Optimistic state toggle
      const nextSettings = { ...settings, [key]: value };
      setSettings(nextSettings);

      const response = await fetch(`${API_URL}/dashboard/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nextSettings)
      });

      const data = await response.json();
      if (data.success) {
        showToast(`Policy updated: ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} set to ${value ? 'ACTIVE' : 'INACTIVE'}`, 'info');
        fetchData();
      }
    } catch (error) {
      console.error('Settings synchronization error:', error);
    }
  };

  const mitigateThreat = async (threatId) => {
    try {
      const response = await fetch(`${API_URL}/admin/threats/mitigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ threatId })
      });

      const data = await response.json();
      if (data.success) {
        showToast(data.message || 'Threat isolated successfully.', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Failed to isolate threat.', 'error');
      }
    } catch (error) {
      console.error('Threat mitigation exception:', error);
    }
  };

  // Manual Trigger to simulate a SOC intrusion exploit
  const simulateExploit = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/threats/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'Credential Stuffing Defended',
          severity: 'High',
          source: '185.220.101.99',
          location: 'Amsterdam, Netherlands (Tor Exit)',
          target: 'ciso@securemesh.io',
          description: 'Automated rapid session query brute-force detected.'
        })
      });

      const data = await response.json();
      if (data.success) {
        showToast(`INTRUSION EXPLOIT DETECTED: Mitigating attack vector at ${data.threat.source}`, 'error');
        fetchData();
      }
    } catch (error) {
      console.error('Threat simulation request exception:', error);
    }
  };

  return (
    <SecurityContext.Provider value={{
      user,
      otpPending,
      setOtpPending,
      tempUser,
      settings,
      devices,
      logs,
      threats,
      toasts,
      login,
      verifyOtp,
      logout,
      revokeDevice,
      logoutAllDevices,
      changePassword,
      updateSettings,
      mitigateThreat,
      simulateExploit,
      adminMetrics,
      register,
      showToast,
      removeToast
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
