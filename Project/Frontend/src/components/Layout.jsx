import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSecurity } from '../context/SecurityContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Activity, 
  Laptop, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Terminal, 
  Bell, 
  AlertTriangle,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = ({ children }) => {
  const { user, logout, threats, showToast } = useSecurity();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Security Activity', path: '/activity', icon: Activity },
    { name: 'Trusted Devices', path: '/devices', icon: Laptop },
    { name: 'Security Settings', path: '/settings', icon: Settings },
    { name: 'Admin Operations', path: '/admin', icon: ShieldCheck, adminOnly: true }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const triggerMockThreat = () => {
    // Dispatch a manual mock high-severity incident to demo dynamic frontend responsiveness
    const eventTypes = [
      { type: 'SQL Injection Defended', desc: 'WAF blocked database inspection attempt on user profile API.' },
      { type: 'Anomalous User Agent', desc: 'Access attempt blocked due to spoofed Windows screen bounds and Safari Headers.' },
      { type: 'Privileged Access Bypass', desc: 'Denied administrative write command from unauthorized country node.' }
    ];
    const chosen = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    showToast(`TEST ALERT: ${chosen.type} was isolated by Secure-Mesh Engine!`, 'error');
  };

  const currentPath = location.pathname;
  const currentTitle = menuItems.find(item => item.path === currentPath)?.name || 'Security Panel';

  // Count active threats
  const activeThreatsCount = threats.filter(t => t.status === 'Active').length;

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col md:flex-row relative">
      {/* Dynamic scan line animation for cyber SOC aesthetic */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-15">
        <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-cyber-scan" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col glass-panel border-r border-white/5 z-20 shrink-0">
        {/* Brand Logo */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <ShieldAlert className="w-6 h-6 text-blue-400 animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white font-display m-0 leading-none">
              SECURE<span className="text-blue-500">MESH</span>
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              Identity Guardian v2.4
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            // Skip admin links if user is not Admin
            if (item.adminOnly && user?.role !== 'Admin') return null;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 relative overflow-hidden group ${
                  isActive 
                    ? 'text-white font-medium bg-blue-500/10 border border-blue-500/30 shadow-[inset_0_0_12px_rgba(59,130,246,0.05)]' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-glow"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-md"
                  />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400 transition-colors'}`} />
                <span className="text-sm font-sans tracking-wide">{item.name}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-extrabold shadow-[0_0_8px_rgba(139,92,246,0.1)]">
                    SEC
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Settings */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Quick Simulation Trigger */}
          <button
            onClick={triggerMockThreat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 text-xs font-bold font-sans transition-all duration-200 shadow-[0_0_10px_rgba(244,63,94,0.05)] cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            SIMULATE EXPLOIT
          </button>

          {/* User Details */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold font-display shadow-md">
              {user ? user.name[0] : <User className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-200 truncate m-0 leading-none mb-1">
                {user ? user.name : 'ANONYMOUS'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold m-0 leading-none">
                {user ? user.role : 'GUEST'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Header & Mobile Navigation */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 glass-panel flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            {/* Hamburger Trigger for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold tracking-tight text-white font-display hidden md:block m-0">
              {currentTitle}
            </h2>
            <div className="md:hidden flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              <span className="font-bold font-display text-white text-sm">SECURE<span className="text-blue-500">MESH</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Threat indicator bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeThreatsCount > 0 ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${activeThreatsCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">
                {activeThreatsCount > 0 ? `${activeThreatsCount} INCIDENTS ACTIVE` : 'THREAT SHIELD ACTIVE'}
              </span>
            </div>

            {/* Quick stats indicator */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  <span className="font-bold">Session Risk:</span>
                  <span className={`font-mono font-bold ${user.riskScore > 60 ? 'text-rose-400' : user.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {user.riskScore}%
                  </span>
                </div>
              )}

              {/* Notification bell */}
              <div className="relative">
                <button 
                  onClick={() => navigate('/activity')}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {activeThreatsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 border border-cyber-dark text-[9px] font-extrabold text-white rounded-full flex items-center justify-center animate-bounce">
                      {activeThreatsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto z-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation (AnimatePresence) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-filter backdrop-blur-sm"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 bottom-0 left-0 w-80 bg-cyber-dark border-r border-white/5 flex flex-col z-50 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-blue-400" />
                  <span className="font-bold font-display text-white text-lg">SECURE<span className="text-blue-500">MESH</span></span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;

                  if (item.adminOnly && user?.role !== 'Admin') return null;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'text-white bg-blue-500/10 border border-blue-500/30' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-sans font-medium">{item.name}</span>
                      {item.adminOnly && (
                        <span className="ml-auto text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-extrabold">
                          SEC
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Simulation switch & user profile */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerMockThreat();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 text-xs font-bold font-sans transition-all duration-200"
                >
                  <Terminal className="w-4 h-4" />
                  SIMULATE SYSTEM EXPLOIT
                </button>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold font-display shadow-md">
                    {user ? user.name[0] : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-200 truncate m-0 mb-0.5">
                      {user ? user.name : 'ANONYMOUS'}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold m-0">
                      {user ? user.role : 'GUEST'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-gray-400 hover:text-rose-400 transition-colors p-2"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
