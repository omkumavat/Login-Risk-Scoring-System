import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  Laptop, 
  Trash2, 
  ShieldCheck, 
  Info, 
  Fingerprint, 
  ShieldAlert, 
  Lock, 
  Smartphone, 
  MapPin, 
  Globe 
} from 'lucide-react';
import { getBrowserIcon, getOsIcon } from '../components/DeviceFingerprint';

export const DevicesPage = () => {
  const { devices, revokeDevice } = useSecurity();

  const currentDevice = devices.find(d => d.isCurrent);
  const otherDevices = devices.filter(d => !d.isCurrent);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white font-display m-0 leading-none">
          Trusted Parallel Nodes
        </h2>
        <p className="text-xs text-gray-500 m-0 mt-2 font-medium">
          Authorized browser credentials that bypass OTP validation triggers. Revoke old nodes immediately if compromised.
        </p>
      </div>

      {/* Warning Notice */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3.5 items-start">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-400 m-0 mb-1 leading-none">
            DEVICE RECOGNITION POLICY
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed m-0 font-medium">
            Devices are matched based on cryptographic fingerprint keys calculated from screen bounds, GPU canvas capabilities, and OS variables. When a signature changes or a device is revoked, future authentications require mandatory MFA OTP cycles.
          </p>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Active Session Node */}
        <div className="xl:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-widest m-0">
            CURRENT USER SESSION
          </h3>

          {currentDevice ? (
            <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.06)] relative overflow-hidden group">
              {/* Neon accent corner */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-300 pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-0.5 bg-blue-500" />

              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0">
                  {React.createElement(getOsIcon(currentDevice.os), { className: "w-6 h-6 animate-pulse" })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-200 truncate m-0">
                      {currentDevice.name}
                    </h4>
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      ACTIVE SESSION
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 m-0 mt-1 font-medium">
                    {currentDevice.os} • {currentDevice.browser}
                  </p>
                </div>
              </div>

              {/* Technical fingerprint info */}
              <div className="mt-6 pt-5 border-t border-white/5 space-y-3.5 text-xs text-gray-400 font-sans">
                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Cryptographic Hash</span>
                  </div>
                  <code className="text-[10px] font-mono text-gray-300 font-bold bg-white/5 px-2.5 py-0.5 rounded border border-white/5">
                    {currentDevice.fingerprint}
                  </code>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Origin Address</span>
                  </div>
                  <span className="text-gray-300 font-mono font-bold">{currentDevice.ip}</span>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Geo Region</span>
                  </div>
                  <span className="text-gray-300 font-semibold">{currentDevice.location}</span>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>SecOps Risk rating</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">
                    {currentDevice.riskScore}% (Secure)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-rose-400/30 mx-auto mb-2" />
              <p className="text-gray-400 text-xs font-semibold m-0">No active local identity found</p>
            </div>
          )}
        </div>

        {/* Secondary Authorized Nodes */}
        <div className="xl:col-span-7 space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-widest m-0">
            AUTHORIZED REMOTE NODES ({otherDevices.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherDevices.map((dev) => {
              const DeviceOsIcon = getOsIcon(dev.os);
              const DeviceBrowserIcon = getBrowserIcon(dev.browser);

              return (
                <div key={dev.id} className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/8 transition-all duration-200 relative group flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 group-hover:border-blue-500/20 group-hover:text-blue-400 transition-colors">
                        <DeviceOsIcon className="w-5.5 h-5.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-200 truncate m-0 group-hover:text-white">
                          {dev.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 m-0 mt-0.5 truncate max-w-[170px]">
                          {dev.os} • {dev.browser}
                        </p>
                      </div>
                    </div>

                    {/* Trash revoke */}
                    <button
                      onClick={() => revokeDevice(dev.id)}
                      className="text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-all duration-150 cursor-pointer shrink-0 border border-transparent hover:border-rose-500/20"
                      title="Revoke and ban device identity"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Details parameters */}
                  <div className="mt-5 space-y-2 pt-4 border-t border-white/5 text-[11px] font-sans text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Fingerprint:</span>
                      <code className="text-[9.5px] font-mono text-gray-300 font-bold bg-white/5 px-2 py-0.5 rounded">
                        {dev.fingerprint.substring(0, 14)}...
                      </code>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>IP Address:</span>
                      <span className="text-gray-300 font-mono font-bold">{dev.ip}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Geo Location:</span>
                      <span className="text-gray-300 font-semibold truncate max-w-[140px]">{dev.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Authorized Date:</span>
                      <span className="text-gray-500">{dev.trustedAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {otherDevices.length === 0 && (
              <div className="col-span-2 py-10 text-center border border-dashed border-white/10 rounded-2xl">
                <Laptop className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-semibold m-0">No other devices found</p>
                <p className="text-xs text-gray-600 m-0 mt-1">Parallel authentication sessions are terminated</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
