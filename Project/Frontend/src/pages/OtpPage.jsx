import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../context/SecurityContext';
import { ShieldCheck, ShieldAlert, ArrowLeft, Key, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const OtpPage = () => {
  const { verifyOtp, tempUser, showToast, setOtpPending } = useSecurity();
  const navigate = useNavigate();

  // 6 digit states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Timer States
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer loop
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus helper
  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Allow numeric only

    const newOtp = [...otp];
    // Take only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      // Clear current cell
      newOtp[index] = '';
      setOtp(newOtp);

      // Auto-focus previous input
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) {
      setError('Please paste a valid 6-digit numeric code.');
      return;
    }

    const newOtp = pasteData.split('');
    setOtp(newOtp);
    inputRefs.current[5].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    
    if (fullOtp.length !== 6) {
      setError('Please enter a complete 6-digit passcode.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verifyOtp(fullOtp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'OTP authentication rejected. Access denied.');
      // Clear OTP digits on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    
    // Simulate sending new token
    setTimer(60);
    setCanResend(false);
    showToast('New multi-factor token dispatched to secure channels.', 'success');
  };

  const handleBack = () => {
    setOtpPending(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex items-center justify-center p-6 relative">
      {/* Decorative Radial Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-xl">
        {/* Navigation back */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold mb-6 uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to authorization page
        </button>

        {/* Outer frame */}
        <div className="grid md:grid-cols-12 rounded-2xl glass-panel border border-white/5 overflow-hidden shadow-2xl">
          {/* Main MFA Challenge column */}
          <div className="md:col-span-12 p-8 relative flex flex-col justify-center">
            {/* Top Indicator */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500" />
            
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-4 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-float">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white font-display m-0 leading-none">
                Secondary MFA Verification
              </h2>
              <p className="text-xs text-gray-500 m-0 mt-2 font-medium leading-relaxed max-w-sm mx-auto">
                A 6-digit passcode has been generated for your user account: <span className="text-gray-300 font-bold">{tempUser ? tempUser.email : 'user@enterprise.com'}</span>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Digit Cells */}
              <div className="flex gap-2 sm:gap-3 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    ref={(el) => (inputRefs.current[idx] = el)}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center font-display text-2xl font-bold text-white bg-cyber-gray-900/80 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all font-mono"
                    maxLength={1}
                    required
                  />
                ))}
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm tracking-wider uppercase font-sans transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>VERIFYING SECURE KEY...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFY & ACCESS CORE</span>
                  </>
                )}
              </button>
            </form>

            {/* Timer and Resend section */}
            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-5 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                <MessageSquare className="w-4 h-4" />
                {timer > 0 ? (
                  <span>Code expires in <span className="font-mono text-gray-300 font-bold">{timer}s</span></span>
                ) : (
                  <span className="text-rose-400 font-semibold">Security token expired</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={`flex items-center gap-1.5 font-bold uppercase tracking-wider font-sans transition-colors cursor-pointer ${
                  canResend ? 'text-blue-400 hover:text-blue-300' : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${!canResend ? '' : 'animate-spin'}`} />
                Resend Passcode
              </button>
            </div>

            {/* Illustrative instruction details */}
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-center text-[10.5px] leading-relaxed text-gray-500 font-medium">
              Demo Helper: To simulate standard bypass parameters, input <span className="text-purple-400 font-bold font-mono bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded ml-1">123456</span> or <span className="text-purple-400 font-bold font-mono bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">654321</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
