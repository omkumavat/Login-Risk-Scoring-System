import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Laptop, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  Globe,
  Terminal,
  Database
} from 'lucide-react';
import { getBrowserIcon, getOsIcon } from '../components/DeviceFingerprint';

export const ActivityPage = () => {
  const { logs } = useSecurity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.os.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRisk === 'ALL' || log.riskLevel.toUpperCase() === selectedRisk;
    const matchesStatus = selectedStatus === 'ALL' || log.status.toUpperCase() === selectedStatus.replace(' ', '_');

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const getRiskBadge = (level) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />;
      case 'Denied':
        return <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />;
      case 'OTP Challenged':
      default:
        return <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white font-display m-0 leading-none">
          Security Incident Audits
        </h2>
        <p className="text-xs text-gray-500 m-0 mt-2 font-medium">
          Comprehensive database records of client authentication queries and dynamic decisions
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none w-4.5 h-4.5 my-auto" />
          <input
            type="text"
            placeholder="Search by IP, browser, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cyber-gray-900/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-xs transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Risk Filter */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl shrink-0">
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Risk Level:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-300 focus:outline-none cursor-pointer pr-4"
            >
              <option value="ALL">All Categories</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl shrink-0">
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Decision:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-300 focus:outline-none cursor-pointer pr-4"
            >
              <option value="ALL">All Decisions</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
              <option value="OTP CHALLENGED">OTP Challenged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl glass-panel border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-400">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Client Ident & Time</th>
                <th className="px-6 py-4">Origin IP</th>
                <th className="px-6 py-4">Fingerprint OS / User Agent</th>
                <th className="px-6 py-4">Assessed Risk</th>
                <th className="px-6 py-4">Dynamic Decision</th>
                <th className="px-6 py-4">Audit Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => {
                const OsIcon = getOsIcon(log.os);
                const BrowserIcon = getBrowserIcon(log.browser);
                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    {/* Time / Location */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-blue-500/20 text-gray-400 shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-200 m-0">
                            {log.location}
                          </p>
                          <p className="text-[10px] text-gray-500 m-0 mt-0.5 font-medium">
                            {log.time}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* IP */}
                    <td className="px-6 py-4.5 whitespace-nowrap font-mono font-bold text-gray-300">
                      {log.ip}
                    </td>

                    {/* Browser & OS */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <OsIcon className="w-4.5 h-4.5 text-gray-500 shrink-0" />
                        <span className="font-medium text-gray-300">
                          {log.os} ({log.browser})
                        </span>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${getRiskBadge(log.riskLevel)}`}>
                          {log.riskLevel} ({log.riskScore}%)
                        </span>
                      </div>
                    </td>

                    {/* Login Status */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-200 font-semibold">
                        {getStatusIcon(log.status)}
                        <span>{log.status}</span>
                      </div>
                    </td>

                    {/* Audit Details */}
                    <td className="px-6 py-4.5 min-w-[240px]">
                      <p className="text-gray-400 font-medium leading-relaxed m-0 text-[11.5px]">
                        {log.details}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Database className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-semibold m-0">No matching security records</p>
                    <p className="text-xs text-gray-600 m-0 mt-1">Adjust search parameters or status filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
