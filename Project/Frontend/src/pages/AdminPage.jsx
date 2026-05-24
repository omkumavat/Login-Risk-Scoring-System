import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { ThreatActivityPanel } from '../components/ThreatActivityPanel';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Ban, 
  Eye, 
  Activity, 
  Globe, 
  Fingerprint, 
  MapPin, 
  Cpu, 
  Clock 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export const AdminPage = () => {
  const { adminMetrics, logs, threats, devices, user } = useSecurity();

  // Use real metrics from backend
  const {
    totalLoginAttempts,
    failedLogins,
    highRiskLogins,
    activeBans,
    userCount,
    activeSessions,
    riskDistribution: adminRiskDistribution
  } = adminMetrics;

  // Metrics calculation using real data
  const totalAttempts = totalLoginAttempts;
  const failedAttempts = failedLogins;
  const highRiskAttempts = highRiskLogins;
  const activeBansCount = activeBans;

  // Metrics calculation


  // Stats Card Layout data
  const statItems = [
    { title: 'Total Auth Attempts', value: totalAttempts, change: '+12.4% vs last hr', icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { title: 'Failed Handshakes', value: failedAttempts, change: '14 anomalous IPs', icon: ShieldAlert, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { title: 'High-Risk Signatures', value: highRiskAttempts, change: 'Enforced MFA gates', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse-glow' },
    { title: 'Active Network Bans', value: activeBans, change: 'Syncing Tor intel feeds', icon: Ban, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  ];

  // Graph Data: User Risk Distribution
  // Use risk distribution from adminMetrics
  const riskDistribution = adminRiskDistribution || [
    { name: 'Low (0-29%)', count: 0, color: '#10b981' },
    { name: 'Medium (30-59%)', count: 0, color: '#f59e0b' },
    { name: 'High (60-89%)', count: 0, color: '#f43f5e' },
    { name: 'Blocked (90%+)', count: 0, color: '#be123c' }
  ];

  // Custom tooltips
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl border border-white/10 bg-cyber-dark/95 shadow-xl text-xs font-sans">
          <p className="font-bold text-gray-200">{payload[0].name}</p>
          <p className="font-extrabold text-blue-400 font-mono mt-1">
            {payload[0].value} Active User Profiles
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white font-display m-0 leading-none">
          SecOps Center Monitoring
        </h2>
        <p className="text-xs text-gray-500 m-0 mt-2 font-medium">
          Global threat landscape, cryptographic rate barriers, user risk profiles, and telemetry control
        </p>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, idx) => {
          const ItemIcon = item.icon;
          return (
            <div key={idx} className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-sans">
                  {item.title}
                </span>
                <span className="text-2xl font-extrabold text-white font-display block leading-none">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 font-medium block">
                  {item.change}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${item.color} shrink-0`}>
                <ItemIcon className="w-5.5 h-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main SecOps Stream & Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Live Threat Ticker Panel (loads ThreatActivityPanel) */}
        <div className="lg:col-span-6">
          <ThreatActivityPanel />
        </div>

        {/* Charts & active session nodes list */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* User Risk Distribution Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5">
            <h3 className="text-md font-bold tracking-tight text-white font-display m-0 mb-1 leading-none">
              Client Profile Risk Distribution
            </h3>
            <p className="text-xs text-gray-500 m-0 mb-6 font-medium">
              Categorization of active identity signatures in current telemetry window
            </p>

            <div className="w-full h-64 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {riskDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} fillOpacity={0.7} stroke={entry.color} strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Sessions Monitoring */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0 mb-1 leading-none">
                Active Client Heartbeats
              </h3>
              <p className="text-xs text-gray-500 m-0 mb-5 font-medium">
                Live socket tunnels matching active cryptographic tokens
              </p>
            </div>

            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-200 truncate m-0 leading-none">
                          {device.name}
                        </p>
                        {device.isCurrent && (
                          <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            LOCAL
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 m-0 mt-1 font-medium leading-none">
                        IP: {device.ip} • OS: {device.os}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <Globe className="w-3 h-3 text-gray-500" />
                      <span>{device.location.split(',')[0]}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 block mt-1 font-mono">
                      TUNNEL OK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
