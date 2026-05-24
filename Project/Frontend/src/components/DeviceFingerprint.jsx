import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Monitor, 
  HelpCircle, 
  Compass, 
  ShieldAlert, 
  CheckCircle2, 
  Fingerprint,
  Activity,
  Globe
} from 'lucide-react';

export const getOsIcon = (osString) => {
  const os = osString.toLowerCase();
  if (os.includes('mac') || os.includes('ios')) return Laptop;
  if (os.includes('win')) return Monitor;
  if (os.includes('linux') || os.includes('ubuntu')) return CpuIcon; // Wait, let's use Laptop or Monitor if Cpu isn't available
  return Laptop;
};

const CpuIcon = Laptop; // We can use Laptop or general system indicators

export const getBrowserIcon = (browserString) => {
  const browser = browserString.toLowerCase();
  if (browser.includes('chrome')) return Globe;
  if (browser.includes('firefox')) return Globe;
  if (browser.includes('safari')) return Compass;
  if (browser.includes('tor')) return ShieldAlert;
  return HelpCircle;
};

export const DeviceFingerprint = ({ device }) => {
  const OsIcon = getOsIcon(device.os);
  const BrowserIcon = getBrowserIcon(device.browser);

  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-cyber-gray-900/40 hover:bg-cyber-gray-900/60 transition-all duration-200 relative group overflow-hidden">
      {/* Dynamic decorative backdrop radial glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 blur-xl transition-all duration-300 pointer-events-none" />

      {/* Main OS & name segment */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 shrink-0 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
          <OsIcon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-100 truncate m-0 group-hover:text-white">
              {device.name}
            </h4>
            {device.isCurrent && (
              <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 shrink-0">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 m-0 mt-1 font-medium">
            {device.os} • {device.browser}
          </p>
        </div>
      </div>

      {/* Fingerprint metrics & detail listings */}
      <div className="mt-5 space-y-2.5 pt-4 border-t border-white/5 text-[11px] font-sans">
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>ID Fingerprint</span>
          </div>
          <code className="text-[10px] font-mono text-gray-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {device.fingerprint ? device.fingerprint.substring(0, 15) + '...' : 'fp_anom_9x2b...'}
          </code>
        </div>

        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>IP Location</span>
          </div>
          <span className="text-gray-300 font-semibold truncate max-w-[180px]">
            {device.location} ({device.ip})
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>Risk Vector</span>
          </div>
          <span className={`font-mono font-bold ${
            device.riskScore > 50 ? 'text-rose-400' : device.riskScore > 20 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {device.riskScore}% Risk Factor
          </span>
        </div>
      </div>
    </div>
  );
};
