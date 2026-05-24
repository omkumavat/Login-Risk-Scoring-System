import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecurity } from '../context/SecurityContext';
import { AlertOctagon, ShieldCheck, MapPin, Target, Clock, ShieldAlert, Cpu } from 'lucide-react';

export const ThreatActivityPanel = () => {
  const { threats, mitigateThreat } = useSecurity();

  const getSeverityStyles = (sev) => {
    switch (sev) {
      case 'High':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
      case 'Medium':
      default:
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-md font-bold tracking-tight text-white font-display m-0 leading-none">
            Live Threat Stream
          </h3>
          <p className="text-xs text-gray-500 m-0 mt-1">
            Real-time incident detection & security isolated buffers
          </p>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      </div>

      {/* Threat stream checklist */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[460px] min-h-[300px]">
        <AnimatePresence initial={false}>
          {threats.map((threat) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                threat.status === 'Mitigated'
                  ? 'border-emerald-500/15 bg-emerald-950/5'
                  : 'border-white/5 bg-white/5 hover:bg-white/8 hover:border-white/10'
              }`}
            >
              {/* Scan overlay for active threats */}
              {threat.status === 'Active' && (
                <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-rose-500 opacity-60 animate-pulse" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    threat.status === 'Mitigated'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : threat.severity === 'High'
                      ? 'bg-rose-500/10 text-rose-400 animate-pulse'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {threat.status === 'Mitigated' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <AlertOctagon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-200">
                        {threat.type}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${getSeverityStyles(threat.severity)}`}>
                        {threat.severity}
                      </span>
                      {threat.status === 'Mitigated' && (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                          MITIGATED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 m-0 mt-1 font-medium leading-relaxed">
                      {threat.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Geo/Device Parameters */}
              <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">{threat.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                  <Target className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">{threat.target}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                  <Cpu className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">{threat.source}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span>{threat.time}</span>
                </div>
              </div>

              {/* Action buttons for admin */}
              {threat.status === 'Active' && (
                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => mitigateThreat(threat.id)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase tracking-widest font-sans transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:shadow-[0_0_18px_rgba(244,63,94,0.5)]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    ISOLATE & MITIGATE
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {threats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400/30 mb-3 animate-pulse" />
            <p className="text-gray-400 text-sm font-semibold m-0">
              Identity Network Safe
            </p>
            <p className="text-xs text-gray-600 m-0 mt-1">
              Zero active intrusion events detected
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
