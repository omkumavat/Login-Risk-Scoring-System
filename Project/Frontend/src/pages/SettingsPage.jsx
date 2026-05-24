import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  ShieldCheck, 
  Clock, 
  Lock, 
  Bell, 
  Smartphone, 
  Mail, 
  Power,
  ShieldAlert,
  Save,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const SettingsPage = () => {
  const { settings, updateSettings, changePassword, logoutAllDevices, showToast } = useSecurity();

  // Change Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Toggles for password visibility
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Master security credentials updated.', 'success');
    } catch (err) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white font-display m-0 leading-none">
          Adaptive Policies & Settings
        </h2>
        <p className="text-xs text-gray-500 m-0 mt-2 font-medium">
          Modify multi-factor triggers, session timeouts, notification criteria, and master credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Adaptive Policies & Notifications */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Adaptive MFA Policy Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg shrink-0">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0 leading-none">
                Adaptive Authentication Policy
              </h3>
            </div>

            {/* MFA Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-xs font-bold text-gray-200 m-0">
                  Enforce Multi-Factor MFA
                </p>
                <p className="text-[10px] text-gray-500 m-0 mt-1 font-medium max-w-sm">
                  Require 6-digit cryptographic verification on every new session request.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.mfaEnabled}
                  onChange={(e) => updateSettings('mfaEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
              </label>
            </div>

            {/* IP Block Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-xs font-bold text-gray-200 m-0">
                  Block Flagged Network Nodes
                </p>
                <p className="text-[10px] text-gray-500 m-0 mt-1 font-medium max-w-sm">
                  Automatically isolate and drop logins initiated from verified Tor exit nodes or proxy lists.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.blockSuspiciousIps}
                  onChange={(e) => updateSettings('blockSuspiciousIps', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
              </label>
            </div>

            {/* Session Expiry Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-200 m-0">
                    Session Timeout Threshold
                  </p>
                  <p className="text-[10px] text-gray-500 m-0 mt-1 font-medium">
                    Automatically terminate session cookies after periods of client inactivity.
                  </p>
                </div>
                <span className="font-mono text-blue-400 font-extrabold text-xs shrink-0 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {settings.sessionTimeout} min
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={settings.sessionTimeout}
                onChange={(e) => updateSettings('sessionTimeout', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Security Alert Notifications */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg shrink-0">
                <Bell className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0 leading-none">
                Real-Time Alarm Notification Channels
              </h3>
            </div>

            {/* Email Alerts */}
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-200 m-0">Email Notifications</p>
                  <p className="text-[10px] text-gray-500 m-0">Dispatches security digests & verification flags.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSettings('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
              </label>
            </div>

            {/* Push Alerts */}
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-200 m-0">Push Alerts</p>
                  <p className="text-[10px] text-gray-500 m-0">Delivers push notifications to authenticated machines.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => updateSettings('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
              </label>
            </div>

            {/* SMS Alerts */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-200 m-0">SMS Mobile Alerts</p>
                  <p className="text-[10px] text-gray-500 m-0">Dispatches critical escalation alerts directly to device.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => updateSettings('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password & Global Killswitch */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Cryptographic password change card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg shrink-0">
                <Lock className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0 leading-none">
                Update Identity Passcode
              </h3>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              
              {/* Old Pass */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-sans block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-cyber-gray-900/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-xs transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Pass */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-sans block">
                  New Passcode Token
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-cyber-gray-900/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-xs transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Pass */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-sans block">
                  Confirm New Passcode
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-cyber-gray-900/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-xs transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit password trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider font-sans transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>RESETTING CRYPTO SHA...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SAVE IDENTITY SECRET</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Global Killswitch Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg shrink-0">
                <Power className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0 leading-none">
                Emergency System Access Tunnels
              </h3>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed m-0 font-medium">
              In case of suspicious active remote accesses, click below to terminate all active sessions, reset keys, and enforce immediate logouts globally except for this single current browser session.
            </p>

            <button
              onClick={logoutAllDevices}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 font-bold text-xs uppercase tracking-wider font-sans transition-all duration-200 cursor-pointer"
            >
              <Power className="w-4 h-4" />
              REVOKE REMOTE ACTIVE TOKENS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
