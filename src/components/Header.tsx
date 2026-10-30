import React, { useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Smartphone,
  Monitor,
  UserCheck,
  ChevronDown,
  Wifi,
  WifiOff,
  Sparkles,
  School,
  Lock
} from 'lucide-react';
import { User } from '../types';
import { DEMO_USERS, OFFICIAL_CONTACT } from '../data/seedData';

interface HeaderProps {
  currentUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onSimulateNotification: (type?: 'grade' | 'attendance' | 'event') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  deviceView: 'responsive' | 'ios' | 'android';
  onChangeDeviceView: (mode: 'responsive' | 'ios' | 'android') => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  onOpenAuthModal,
  onLogout,
  unreadNotifCount,
  onOpenNotifications,
  onSimulateNotification,
  isDarkMode,
  onToggleDarkMode,
  deviceView,
  onChangeDeviceView,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors bg-white/95 border-emerald-900/10 dark:bg-emerald-950/95 dark:border-emerald-800/40">
      {/* Top Zambian flag accent ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & Crest */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-950/20 ring-2 ring-amber-400/50 flex-shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[9px] font-black px-1 rounded text-emerald-950 uppercase tracking-tighter">
                MSS
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-emerald-950 dark:text-emerald-50 leading-tight">
                  Mpatamatu Secondary School
                </h1>
                <span className="hidden md:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                  Luanshya, Zambia • Est. 1968
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 hidden sm:block font-medium">
                Official School Portal & Mobile App • Knowledge is Power & Integrity
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Device Frame View Switcher (iOS / Android / Responsive Desktop) */}
            <div className="hidden lg:flex items-center bg-emerald-100/70 dark:bg-emerald-900/40 p-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <button
                type="button"
                onClick={() => onChangeDeviceView('responsive')}
                title="Full Responsive View"
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceView === 'responsive'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Web</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeDeviceView('ios')}
                title="iOS iPhone App Frame"
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceView === 'ios'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                <span>iOS</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeDeviceView('android')}
                title="Android App Frame"
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceView === 'android'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Android</span>
              </button>
            </div>

            {/* Offline Mode Toggle Button */}
            <button
              type="button"
              onClick={onToggleOfflineMode}
              title={isOfflineMode ? 'Switch to Online Mode' : 'Simulate Offline Mode (Cache only)'}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                isOfflineMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-600" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
              <span className="hidden xl:inline text-[11px] font-bold">
                {isOfflineMode ? 'Offline Active' : 'Online Sync'}
              </span>
            </button>

            {/* Real-time Push Notification Simulation dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                title="Trigger simulated real-time push alert"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-400/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Push Test</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showSimulateMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-emerald-950 rounded-xl shadow-xl border border-emerald-200 dark:border-emerald-800 p-2 z-50">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 px-2 py-1">
                    Simulate Real-time Alert
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateNotification('grade');
                      setShowSimulateMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 flex items-center justify-between text-emerald-950 dark:text-emerald-100"
                  >
                    <span>📊 New Grade Posted</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Physics 89%</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateNotification('attendance');
                      setShowSimulateMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 flex items-center justify-between text-emerald-950 dark:text-emerald-100"
                  >
                    <span>⏱️ Attendance Check-in</span>
                    <span className="text-[10px] text-emerald-600 font-bold">07:15 AM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateNotification('event');
                      setShowSimulateMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 flex items-center justify-between text-emerald-950 dark:text-emerald-100"
                  >
                    <span>📅 ECZ Examination Alert</span>
                    <span className="text-[10px] text-amber-600 font-bold">Mock Trial</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="Push Notification Center"
              aria-label="Push notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-600 rounded-full ring-2 ring-white dark:ring-emerald-950 animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-emerald-700" />}
            </button>

            {/* User Account / Role Switcher */}
            <div className="relative">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-900/40 hover:bg-emerald-100/80 transition-all text-left"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 line-clamp-1">
                        {currentUser.name}
                      </span>
                      {currentUser.mfaVerified && (
                        <span title="MFA Verified" className="inline-flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                      {currentUser.role === 'admin'
                        ? 'Admin'
                        : currentUser.role === 'teacher'
                        ? 'Teacher'
                        : currentUser.role === 'student'
                        ? `${currentUser.studentLevel} (Gr ${currentUser.grade})`
                        : 'Parent'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Secure Login</span>
                </button>
              )}

              {/* Demo Account Switcher Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 p-2.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1.5 border-b border-emerald-100 dark:border-emerald-800/80 mb-2">
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      Switch Role / Demo Account
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Testing multi-role access (Students, Teachers, Headteacher, Parents)
                    </div>
                  </div>

                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {DEMO_USERS.map((usr) => (
                      <button
                        key={usr.id}
                        type="button"
                        onClick={() => {
                          onSelectUser(usr);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                          currentUser?.id === usr.id
                            ? 'bg-emerald-100/90 dark:bg-emerald-800/60 font-semibold'
                            : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                        }`}
                      >
                        <img
                          src={usr.avatar}
                          alt={usr.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-300 dark:ring-emerald-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate">
                              {usr.name}
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-black bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                              {usr.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 truncate">
                            {usr.designation || (usr.studentLevel ? `${usr.studentLevel.toUpperCase()} • ${usr.section}` : `Parent of Natasha`)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-emerald-100 dark:border-emerald-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuthModal();
                      }}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Custom Registration</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
