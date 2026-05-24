import React, { createContext, useContext, useState, useEffect } from 'react';

const SecurityContext = createContext(null);

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
  const [otpPending, setOtpPending] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cyber_settings');
    return saved ? JSON.parse(saved) : {
      mfaEnabled: true,
      sessionTimeout: 15, // in minutes
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      blockSuspiciousIps: true,
      strictDeviceFingerprinting: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('cyber_settings', JSON.stringify(settings));
  }, [settings]);

  // Mock Active Devices
  const [devices, setDevices] = useState([
    {
      id: 'dev-1',
      name: 'MacBook Pro 16"',
      os: 'macOS Sonoma',
      browser: 'Chrome 124.0.0',
      ip: '192.168.1.45',
      location: 'San Francisco, USA',
      lastActive: 'Active Now',
      isCurrent: true,
      fingerprint: 'fp_mac_8a3f9e2b1d6c8e9',
      riskScore: 12,
      trustedAt: '2026-05-20'
    },
    {
      id: 'dev-2',
      name: 'Windows Workstation',
      os: 'Windows 11',
      browser: 'Firefox 125.2.1',
      ip: '108.162.2.19',
      location: 'London, United Kingdom',
      lastActive: '2 hours ago',
      isCurrent: false,
      fingerprint: 'fp_win_4f2a7d6e8c0b1a9',
      riskScore: 28,
      trustedAt: '2026-04-15'
    },
    {
      id: 'dev-3',
      name: 'iPhone 15 Pro Max',
      os: 'iOS 17.4',
      browser: 'Safari Mobile',
      ip: '172.56.21.89',
      location: 'Tokyo, Japan',
      lastActive: 'Yesterday',
      isCurrent: false,
      fingerprint: 'fp_ios_3d8e9f2a7b1c4e6',
      riskScore: 8,
      trustedAt: '2026-05-18'
    },
    {
      id: 'dev-4',
      name: 'Ubuntu Server',
      os: 'Linux Enterprise 22.04',
      browser: 'Brave 1.65.1',
      ip: '82.102.23.4',
      location: 'Frankfurt, Germany',
      lastActive: '5 days ago',
      isCurrent: false,
      fingerprint: 'fp_lin_9d2f4a7c8e6b1d3',
      riskScore: 45,
      trustedAt: '2026-03-01'
    }
  ]);

  // Security Activity Logs
  const [logs, setLogs] = useState([
    {
      id: 'log-1',
      time: '2026-05-24 15:05:22',
      ip: '192.168.1.45',
      browser: 'Chrome 124.0.0',
      os: 'macOS Sonoma',
      location: 'San Francisco, USA',
      riskScore: 12,
      riskLevel: 'Low',
      status: 'Approved',
      details: 'Successful login. MFA verified.'
    },
    {
      id: 'log-2',
      time: '2026-05-24 14:12:08',
      ip: '185.220.101.4',
      browser: 'Tor Browser',
      os: 'Linux x86_64',
      location: 'Frankfurt, Germany (Tor Node)',
      riskScore: 92,
      riskLevel: 'High',
      status: 'Denied',
      details: 'Connection blocked due to high risk reputation (Tor Exit Node detected).'
    },
    {
      id: 'log-3',
      time: '2026-05-24 11:45:12',
      ip: '172.56.21.89',
      browser: 'Safari Mobile',
      os: 'iOS 17.4',
      location: 'Tokyo, Japan',
      riskScore: 8,
      riskLevel: 'Low',
      status: 'Approved',
      details: 'Automatic token refresh. Device matches trusted fingerprint.'
    },
    {
      id: 'log-4',
      time: '2026-05-24 08:33:41',
      ip: '108.162.2.19',
      browser: 'Firefox 125.2.1',
      os: 'Windows 11',
      location: 'London, United Kingdom',
      riskScore: 28,
      riskLevel: 'Low',
      status: 'Approved',
      details: 'Successful password-only login. Trusted location exception.'
    },
    {
      id: 'log-5',
      time: '2026-05-23 23:19:54',
      ip: '91.200.12.87',
      browser: 'Chrome 123.0.0',
      os: 'Windows 10',
      location: 'Kiev, Ukraine',
      riskScore: 78,
      riskLevel: 'High',
      status: 'OTP Challenged',
      details: 'First time device in region. Triggered secondary authentication challenge. Challenge expired.'
    },
    {
      id: 'log-6',
      time: '2026-05-23 18:40:02',
      ip: '82.102.23.4',
      browser: 'Brave 1.65.1',
      os: 'Linux Enterprise 22.04',
      location: 'Frankfurt, Germany',
      riskScore: 45,
      riskLevel: 'Medium',
      status: 'Approved',
      details: 'MFA verified after anomalous browser signature detection.'
    },
    {
      id: 'log-7',
      time: '2026-05-23 14:15:30',
      ip: '192.168.1.103',
      browser: 'Edge 123.0.1',
      os: 'Windows 11',
      location: 'San Francisco, USA',
      riskScore: 54,
      riskLevel: 'Medium',
      status: 'Denied',
      details: 'Multiple rapid password failures. IP locked for 15 minutes.'
    },
    {
      id: 'log-8',
      time: '2026-05-22 09:12:11',
      ip: '198.51.100.72',
      browser: 'Chrome 124.0.0',
      os: 'macOS Sonoma',
      location: 'Seattle, USA (VPN)',
      riskScore: 65,
      riskLevel: 'Medium',
      status: 'Approved',
      details: 'MFA required. VPN proxy detected but successfully authenticated.'
    }
  ]);

  // Live Threat Events (Real-time Simulation)
  const [threats, setThreats] = useState([
    {
      id: 'threat-1',
      type: 'Brute Force Attack',
      severity: 'High',
      source: '185.220.101.9',
      location: 'Amsterdam, Netherlands (Tor)',
      time: 'Just now',
      target: 'admin@enterprise.com',
      status: 'Active',
      description: '14 failed login attempts detected in 45 seconds.'
    },
    {
      id: 'threat-2',
      type: 'Impossible Travel Alert',
      severity: 'High',
      source: '198.51.100.12',
      location: 'Sydney, Australia',
      time: '4 mins ago',
      target: 'developer@enterprise.com',
      status: 'Active',
      description: 'Login attempt from Sydney 12 minutes after active session in London.'
    },
    {
      id: 'threat-3',
      type: 'Device Fingerprint Mismatch',
      severity: 'Medium',
      source: '172.56.22.41',
      location: 'New York, USA',
      time: '15 mins ago',
      target: 'marketing@enterprise.com',
      status: 'Mitigated',
      description: 'User Agent header reports Safari but JS canvas fingerprint returns Chrome engine.'
    }
  ]);

  // Dynamic threat simulator loop
  useEffect(() => {
    if (!user) return; // Only simulate threat activity if logged in

    const interval = setInterval(() => {
      const chance = Math.random();
      if (chance > 0.82) { // 18% chance of triggering a live alert every 30s
        const types = [
          { name: 'Suspicious IP Blocked', severity: 'Medium', desc: 'IP on threat intel feed attempted access.' },
          { name: 'Concurrent Session Alert', severity: 'High', desc: 'Simultaneous active sessions in different geographic nodes.' },
          { name: 'VPN Detection Challenge', severity: 'Medium', desc: 'Access request over a residential proxy network detected.' },
          { name: 'Credential Stuffing Defended', severity: 'High', desc: 'Automated login signatures identified and rate-limited.' }
        ];
        
        const ips = ['198.162.45.2', '82.102.4.99', '185.220.101.44', '203.0.113.88'];
        const locations = ['Moscow, Russia', 'Beijing, China', 'Paris, France', 'Toronto, Canada'];
        const targets = ['it-ops@enterprise.com', 'billing@enterprise.com', 'admin@enterprise.com', 'ciso@enterprise.com'];

        const selectedType = types[Math.floor(Math.random() * types.length)];
        const newThreat = {
          id: 'threat-' + Date.now(),
          type: selectedType.name,
          severity: selectedType.severity,
          source: ips[Math.floor(Math.random() * ips.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          time: 'Just now',
          target: targets[Math.floor(Math.random() * targets.length)],
          status: 'Active',
          description: selectedType.desc
        };

        setThreats(prev => [newThreat, ...prev.slice(0, 7)]);
        showToast(`SECURITY ALERT: ${newThreat.type} detected from ${newThreat.location}`, newThreat.severity === 'High' ? 'error' : 'warning');
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [user]);

  // Auth Operations
  const login = async (email, password, isVpn = false, isNewDevice = false) => {
    // Return promise simulating network delays
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Admin credentials
        if (email === 'admin@security.io' || email.includes('@enterprise.com') || (email.length > 3 && password.length >= 6)) {
          const userObj = {
            id: 'usr-100',
            email: email,
            name: email.split('@')[0].toUpperCase(),
            role: email === 'admin@security.io' ? 'Admin' : 'SecOps Specialist',
            lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
            riskScore: isVpn ? 72 : isNewDevice ? 48 : 12,
            vpnSuspected: isVpn,
            newDevice: isNewDevice
          };

          if (settings.mfaEnabled || isVpn || isNewDevice) {
            setOtpPending(true);
            setTempUser(userObj);
            showToast('Password verified. Secondary MFA authentication required.', 'warning');
            resolve({ otpRequired: true, user: userObj });
          } else {
            setUser(userObj);
            localStorage.setItem('cyber_user', JSON.stringify(userObj));
            
            // Add a new log entry
            const newLog = {
              id: 'log-' + Date.now(),
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              ip: isVpn ? '198.51.100.72' : '192.168.1.45',
              browser: 'Chrome 124.0.0',
              os: 'macOS Sonoma',
              location: isVpn ? 'Seattle, USA (VPN)' : 'San Francisco, USA',
              riskScore: userObj.riskScore,
              riskLevel: userObj.riskScore > 70 ? 'High' : userObj.riskScore > 30 ? 'Medium' : 'Low',
              status: 'Approved',
              details: 'Successful standard password login.'
            };
            setLogs(prev => [newLog, ...prev]);
            showToast('Successfully logged in!', 'success');
            resolve({ otpRequired: false, user: userObj });
          }
        } else {
          showToast('Invalid security credentials. Access denied.', 'error');
          reject(new Error('Invalid email or password'));
        }
      }, 1500);
    });
  };

  const verifyOtp = (otp) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456' || otp === '654321') {
          if (tempUser) {
            setUser(tempUser);
            localStorage.setItem('cyber_user', JSON.stringify(tempUser));
            
            // Add approved log
            const newLog = {
              id: 'log-' + Date.now(),
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              ip: tempUser.vpnSuspected ? '198.51.100.72' : '192.168.1.45',
              browser: 'Chrome 124.0.0',
              os: 'macOS Sonoma',
              location: tempUser.vpnSuspected ? 'Seattle, USA (VPN)' : 'San Francisco, USA',
              riskScore: tempUser.riskScore,
              riskLevel: tempUser.riskScore > 70 ? 'High' : tempUser.riskScore > 30 ? 'Medium' : 'Low',
              status: 'Approved',
              details: `MFA verification successful. Access granted under ${tempUser.riskScore}% risk profile.`
            };
            setLogs(prev => [newLog, ...prev]);
            setOtpPending(false);
            setTempUser(null);
            showToast('OTP Verification Complete. Access Approved.', 'success');
            resolve(tempUser);
          } else {
            reject(new Error('Session expired. Try logging in again.'));
          }
        } else {
          showToast('Invalid 6-digit passcode. Attempt recorded.', 'error');
          reject(new Error('Incorrect OTP. Try "123456" for demo.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setOtpPending(false);
    setTempUser(null);
    localStorage.removeItem('cyber_user');
    showToast('Securely logged out of Identity Session.', 'info');
  };

  const revokeDevice = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    
    // Add event log of revocation
    const newLog = {
      id: 'log-' + Date.now(),
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip: device.ip,
      browser: device.browser,
      os: device.os,
      location: device.location,
      riskScore: 10,
      riskLevel: 'Low',
      status: 'Denied',
      details: `Device revoked by user session. Future attempts from fp fingerprint token (${device.fingerprint}) will trigger immediate blocks.`
    };
    
    setLogs(prev => [newLog, ...prev]);
    showToast(`Access revoked for ${device.name}`, 'warning');
  };

  const addDeviceToTrusted = (deviceObj) => {
    setDevices(prev => [...prev, deviceObj]);
    showToast(`Device ${deviceObj.name} added to trusted identities`, 'success');
  };

  const logoutAllDevices = () => {
    // Keep only active current device
    setDevices(prev => prev.filter(d => d.isCurrent));
    
    const newLog = {
      id: 'log-' + Date.now(),
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip: '192.168.1.45',
      browser: 'Chrome 124.0.0',
      os: 'macOS Sonoma',
      location: 'San Francisco, USA',
      riskScore: 5,
      riskLevel: 'Low',
      status: 'Approved',
      details: 'Broadcasted Global Killswitch. Terminated all parallel session tokens.'
    };
    setLogs(prev => [newLog, ...prev]);
    showToast('Terminated all remote user sessions successfully.', 'success');
  };

  const changePassword = (currentPassword, newPassword) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLog = {
          id: 'log-' + Date.now(),
          time: new Date().toISOString().replace('T', ' ').substring(0, 19),
          ip: '192.168.1.45',
          browser: 'Chrome 124.0.0',
          os: 'macOS Sonoma',
          location: 'San Francisco, USA',
          riskScore: 15,
          riskLevel: 'Low',
          status: 'Approved',
          details: 'User password changed. Reset cryptographic session tokens.'
        };
        setLogs(prev => [newLog, ...prev]);
        showToast('Password changed successfully. Active token updated.', 'success');
        resolve(true);
      }, 1000);
    });
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    showToast(`Security policy updated: ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} is now ${value ? 'active' : 'inactive'}.`, 'info');
  };

  const mitigateThreat = (threatId) => {
    setThreats(prev => prev.map(t => {
      if (t.id === threatId) {
        // Log mitigation
        const newLog = {
          id: 'log-' + Date.now(),
          time: new Date().toISOString().replace('T', ' ').substring(0, 19),
          ip: t.source,
          browser: 'System SecOps',
          os: 'Mitigation Service',
          location: t.location,
          riskScore: 99,
          riskLevel: 'High',
          status: 'Denied',
          details: `Manual admin trigger: Mitigated ${t.type}. Target IP ${t.source} was added to high-reputation network block list.`
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
        showToast(`Threat '${t.type}' isolated and blocked successfully!`, 'success');
        return { ...t, status: 'Mitigated' };
      }
      return t;
    }));
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
      addDeviceToTrusted,
      logoutAllDevices,
      changePassword,
      updateSettings,
      mitigateThreat,
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
