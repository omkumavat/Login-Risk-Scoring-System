import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../context/SecurityContext';
import { ShieldAlert, Eye, EyeOff, Lock, Mail, Terminal, AlertTriangle, Cpu, Network } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage = () => {
  const { login } = useSecurity();
  const navigate = useNavigate();
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Interactive warnings simulation (to showcase features requested)
  const [simulatedVpn, setSimulatedVpn] = useState(false);
  const [simulatedNewDevice, setSimulatedNewDevice] = useState(false);
  const [simulatedHighRisk, setSimulatedHighRisk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all security fields.');
      return;
    }
    if (password.length < 6) {
      setError('Credentials must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Pass simulation variables to context login
      const result = await login(
        email, 
        password, 
        simulatedVpn || email === 'vpn@security.io', 
        simulatedNewDevice || email === 'newdevice@security.io'
      );
      
      if (result.otpRequired) {
        navigate('/otp');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication rejected by security policy.');
    } finally {
      setLoading(false);
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@security.io');
    setPassword('security2026');
    setSimulatedVpn(false);
    setSimulatedNewDevice(false);
    setSimulatedHighRisk(false);
  };

  const triggerVpnSim = () => {
    setEmail('vpn-user@enterprise.com');
    setPassword('security2026');
    setSimulatedVpn(true);
    setSimulatedNewDevice(false);
    setSimulatedHighRisk(true);
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex items-center justify-center p-6 relative">
      {/* Background Decorative Neons */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="w-full max-w-lg">
        {/* Logo and Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] mb-4">
            <ShieldAlert className="w-8 h-8 text-blue-400 animate-pulse-glow" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display m-0 leading-none">
            SECURE<span className="text-blue-500">MESH</span>
          </h1>
          <p className="text-sm text-gray-500 m-0 mt-2 font-medium">
            Adaptive Identity SecOps & Threat Intelligence
          </p>
        </div>

        {/* Dynamic Threat Risk Warnings */}
        <div className="space-y-3 mb-6">
          {simulatedVpn && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
            >
              <Network className="w-5 h-5 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-amber-400 m-0 leading-none mb-1">
                  VPN SUSPECTED
                </p>
                <p className="text-[10.5px] text-gray-400 m-0 font-medium leading-relaxed">
                  Residential proxy routing detected. Multi-factor challenge is mandatory for this identity.
                </p>
              </div>
            </motion.div>
          )}

          {simulatedNewDevice && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3 shadow-[0_0_15px_rgba(59,130,246,0.08)]"
            >
              <Cpu className="w-5 h-5 text-blue-400 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-blue-400 m-0 leading-none mb-1">
                  NEW DEVICE DETECTED
                </p>
                <p className="text-[10.5px] text-gray-400 m-0 font-medium leading-relaxed">
                  Cryptographic browser hash signature unknown. Access restricted until MFA verification.
                </p>
              </div>
            </motion.div>
          )}

          {simulatedHighRisk && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.08)]"
            >
              <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-rose-400 m-0 leading-none mb-1">
                  HIGH-RISK LOGIN ATTEMPT
                </p>
                <p className="text-[10.5px] text-gray-400 m-0 font-medium leading-relaxed">
                  Risk score evaluates at 88%. Advanced monitoring policies active. OTP credential challenge enforced.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Card */}
        <div className="glass-panel border-white/5 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Top light indicator line */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500" />

          <h2 className="text-xl font-bold tracking-tight text-white mb-6 font-display">
            Verify Identity Credentials
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block font-sans">
                Enterprise Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@security.io"
                  className="w-full pl-10 pr-4 py-3 bg-cyber-gray-900/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block font-sans">
                Access Token Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-cyber-gray-900/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-cyber-gray-900 text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span>Remember identity node</span>
              </label>
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-medium">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm tracking-wider uppercase font-sans transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AUDITING SECURITY PARAMS...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>AUTHENTICATE IDENT</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Simulation Help Section */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold m-0 leading-none">
              DEMO SIMULATION PLATFORM
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={autofillAdmin}
                className="py-2 px-3 text-[10px] font-sans font-bold border border-white/5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Autofill Clean Admin
              </button>
              <button
                type="button"
                onClick={triggerVpnSim}
                className="py-2 px-3 text-[10px] font-sans font-bold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors cursor-pointer"
              >
                Simulate VPN Threat
              </button>
            </div>
            <div className="flex gap-2 flex-wrap pt-1.5 justify-center">
              <button
                onClick={() => setSimulatedNewDevice(!simulatedNewDevice)}
                className={`px-2 py-1 text-[9px] uppercase tracking-wider rounded border ${
                  simulatedNewDevice ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10'
                }`}
              >
                Toggle New Device
              </button>
              <button
                onClick={() => setSimulatedHighRisk(!simulatedHighRisk)}
                className={`px-2 py-1 text-[9px] uppercase tracking-wider rounded border ${
                  simulatedHighRisk ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10'
                }`}
              >
                Toggle High-Risk Warn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
