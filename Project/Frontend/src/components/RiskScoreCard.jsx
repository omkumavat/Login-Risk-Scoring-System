import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Cpu, Network, Map, Flame, KeyRound } from 'lucide-react';

export const RiskScoreCard = ({ score }) => {
  // Determine risk assessment and aesthetics
  const getRiskStatus = (val) => {
    if (val > 70) return { label: 'CRITICAL', color: 'text-rose-500 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]', ringColor: 'stroke-rose-500', icon: ShieldAlert, textColor: 'text-rose-400' };
    if (val > 30) return { label: 'SUSPICIOUS', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]', ringColor: 'stroke-amber-500', icon: ShieldAlert, textColor: 'text-amber-400' };
    return { label: 'SECURE', color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]', ringColor: 'stroke-emerald-500', icon: ShieldCheck, textColor: 'text-emerald-400' };
  };

  const risk = getRiskStatus(score);
  const IconComponent = risk.icon;

  // Calculate SVG circle properties for concentric ring gauge
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Static Risk Assessment parameters
  const riskFactors = [
    { name: 'Device Fingerprint Signature', status: score > 40 ? 'Suspicious Mismatch' : 'Valid Signature Match', isSafe: score <= 40, icon: Cpu },
    { name: 'Network Route Rep (VPN)', status: score > 60 ? 'Anomalous Proxy Verified' : 'Standard ISP / Residential', isSafe: score <= 60, icon: Network },
    { name: 'Velocity Analysis', status: 'Impossible Speed Exceptions: 0', isSafe: true, icon: Map },
    { name: 'Login Velocity & Thresholds', status: score > 30 ? 'Concurrent Token Challenge' : 'Standard Frequency Rate', isSafe: score <= 30, icon: KeyRound }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-md font-bold tracking-tight text-white font-display m-0">
          Risk Assessment profile
        </h3>
        <span className={`text-[10px] tracking-widest font-extrabold uppercase px-2.5 py-1 rounded-full border ${risk.color}`}>
          {risk.label}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 flex-1">
        {/* Ring Gauge SVG */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-gray-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active animated risk level ring */}
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              className={`${risk.ringColor} transition-all duration-1000 ease-out`}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Inner details */}
          <div className="absolute text-center flex flex-col justify-center items-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold leading-none mb-1">
              RISK INDEX
            </span>
            <span className="text-3xl font-bold text-white font-display tracking-tight leading-none mb-1">
              {score}%
            </span>
            <IconComponent className={`w-4 h-4 ${risk.textColor}`} />
          </div>
        </div>

        {/* Dynamic risk factors breakdown */}
        <div className="flex-1 space-y-4 w-full">
          <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
            DETAILED AUDIT VECTORS
          </div>
          {riskFactors.map((factor, idx) => {
            const FactorIcon = factor.icon;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${factor.isSafe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  <FactorIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-300 truncate m-0 pr-2">
                      {factor.name}
                    </p>
                    <span className={`text-[10px] font-mono font-bold ${factor.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {factor.isSafe ? 'PASS' : 'RISK'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate m-0 mt-0.5 font-medium">
                    {factor.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning/Security Banner */}
      {score > 30 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-center">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
          <p className="text-[11px] text-amber-300 font-medium m-0 leading-relaxed">
            Suspicious identity credentials detected. Cryptographic credentials challenged with mandatory multi-factor auth request.
          </p>
        </div>
      )}
    </div>
  );
};
