import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { RiskScoreCard } from '../components/RiskScoreCard';
import { DeviceFingerprint } from '../components/DeviceFingerprint';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  HelpCircle, 
  Compass, 
  Laptop, 
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Fingerprint,
  ChevronRight,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const { user, logs, devices } = useSecurity();

  // Pick the active current device
  const currentDevice = devices.find(d => d.isCurrent) || devices[0];

  // Pick other trusted devices
  const trustedDevices = devices.filter(d => !d.isCurrent);

  // Generate analytics mock graph data from recent logs
  const analyticsData = [
    { day: 'Mon', attempts: 12, avgRisk: 14, blocked: 0 },
    { day: 'Tue', attempts: 18, avgRisk: 22, blocked: 1 },
    { day: 'Wed', attempts: 15, avgRisk: 12, blocked: 0 },
    { day: 'Thu', attempts: 24, avgRisk: 42, blocked: 3 },
    { day: 'Fri', attempts: 21, avgRisk: 18, blocked: 0 },
    { day: 'Sat', attempts: 9, avgRisk: 28, blocked: 1 },
    { day: 'Sun', attempts: 14, avgRisk: user?.riskScore || 12, blocked: user?.riskScore > 50 ? 1 : 0 },
  ];

  // Filter out recent suspicious log items (risk score > 30)
  const suspiciousLogs = logs.filter(log => log.riskScore > 30).slice(0, 4);

  // Custom styling for charts tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-xl border border-white/10 bg-cyber-dark/95 backdrop-blur-md shadow-xl text-xs font-sans">
          <p className="font-bold text-gray-200 uppercase tracking-wider mb-2">{label} Analytics</p>
          {payload.map((p, idx) => (
            <div key={idx} className="flex justify-between gap-6 py-0.5">
              <span className="text-gray-500 font-semibold">{p.name}:</span>
              <span className="font-bold font-mono" style={{ color: p.color || '#fff' }}>
                {p.value} {p.name.includes('Risk') ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Node connection established
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-display m-0 leading-none">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user ? user.name : 'SecOps'}</span>
          </h2>
          <p className="text-xs text-gray-500 m-0 mt-2 font-medium">
            System status normal. Cryptographic threat models actively protecting 4 authenticated devices.
          </p>
        </div>

        {/* Date / Time Card */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 font-medium shrink-0 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Session Sync: 2026-05-24 15:09</span>
        </div>
      </div>

      {/* Security Quick Status Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Concentric Risk Score Card */}
        <div className="lg:col-span-7">
          <RiskScoreCard score={user ? user.riskScore : 12} />
        </div>

        {/* Current Fingerprint Information */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0">
                Active Client Fingerprint
              </h3>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                verified signature
              </span>
            </div>

            {/* Render details */}
            {currentDevice && (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Laptop className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200 m-0">
                      {currentDevice.name}
                    </h4>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">
                      {currentDevice.os} • {currentDevice.browser}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-gray-400 py-1.5 border-b border-white/5">
                    <span className="font-medium">Origin IP:</span>
                    <span className="text-gray-200 font-mono font-bold">{currentDevice.ip}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400 py-1.5 border-b border-white/5">
                    <span className="font-medium">Region:</span>
                    <span className="text-gray-200 font-semibold">{currentDevice.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400 py-1.5 border-b border-white/5">
                    <span className="font-medium">Device Token:</span>
                    <code className="text-[10px] font-mono text-gray-300 font-bold bg-white/5 px-2 py-0.5 rounded">
                      {currentDevice.fingerprint}
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-gray-400 py-1.5">
                    <span className="font-medium">Last Login:</span>
                    <span className="text-gray-200 font-semibold">{user?.lastLogin || 'Just now'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Analytics Graph */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-md font-bold tracking-tight text-white font-display m-0">
              Identity Analytics Graph
            </h3>
            <p className="text-xs text-gray-500 m-0 mt-1">
              Historical view of authentication attempts and assessed risk patterns
            </p>
          </div>
          
          <div className="flex gap-4 text-xs font-semibold self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded"></span>
              <span>Attempts</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded"></span>
              <span>Risk Avg</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded"></span>
              <span>Blocks</span>
            </div>
          </div>
        </div>

        {/* Responsive Area Chart */}
        <div className="w-full h-80 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={11} 
                tickLine={false}
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                name="Logins" 
                dataKey="attempts" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAttempts)" 
              />
              <Area 
                type="monotone" 
                name="Risk Index" 
                dataKey="avgRisk" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRisk)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trusted Devices & Recent Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trusted Devices Section */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0">
                Trusted Parallel Devices
              </h3>
              <p className="text-xs text-gray-500 m-0 mt-1">
                Authorizations bypass standard OTP checks
              </p>
            </div>
            <Link 
              to="/devices" 
              className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              Manage
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustedDevices.slice(0, 2).map((dev) => (
              <DeviceFingerprint key={dev.id} device={dev} />
            ))}
            {trustedDevices.length === 0 && (
              <div className="col-span-2 py-6 text-center border border-dashed border-white/10 rounded-xl">
                <Laptop className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-xs font-semibold m-0">No parallel trusted nodes</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Suspicious Warnings / Alerts */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-bold tracking-tight text-white font-display m-0">
                Flagged Audit Warnings
              </h3>
              <p className="text-xs text-gray-500 m-0 mt-1">
                Recent access logs flagged above threshold bounds
              </p>
            </div>
            <Link 
              to="/activity" 
              className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              All Logs
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {suspiciousLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl border border-white/5 bg-white/5 flex gap-3 items-center hover:bg-white/8 transition-colors">
                <div className={`p-2 rounded-lg shrink-0 ${
                  log.riskScore > 70 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  <AlertTriangle className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-300 truncate m-0">
                      {log.location}
                    </p>
                    <span className="text-[10px] font-mono text-gray-500">{log.time.split(' ')[1]}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate m-0 mt-0.5 font-medium leading-none">
                    IP: {log.ip} • OS: {log.os}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-mono font-extrabold block ${
                    log.riskScore > 70 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {log.riskScore}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">
                    RISK
                  </span>
                </div>
              </div>
            ))}
            {suspiciousLogs.length === 0 && (
              <div className="py-6 text-center border border-dashed border-white/10 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-emerald-400/30 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-400 text-xs font-semibold m-0">No active login blocks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
