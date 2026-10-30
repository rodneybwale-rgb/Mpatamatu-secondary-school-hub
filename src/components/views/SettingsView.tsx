import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Smartphone,
  HardDrive,
  CheckCircle2,
  Volume2,
  Trash2,
  Lock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { User } from '../../types';

interface SettingsViewProps {
  currentUser: User | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  deviceView: 'responsive' | 'ios' | 'android';
  onChangeDeviceView: (mode: 'responsive' | 'ios' | 'android') => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  isDarkMode,
  onToggleDarkMode,
  deviceView,
  onChangeDeviceView,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  // Push Notification Customization Toggles
  const [notifyGrades, setNotifyGrades] = useState(true);
  const [notifyAttendance, setNotifyAttendance] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyChat, setNotifyChat] = useState(true);
  const [notifySound, setNotifySound] = useState(true);
  const [notifyVibration, setNotifyVibration] = useState(true);
  const [quietHours, setQuietHours] = useState(false);

  // Cache cleared indicator
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
              System Settings &amp; Preferences
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80">
              Fine-tune push notifications, dark mode, offline cache, and mobile view
            </p>
          </div>
        </div>
      </div>

      {/* Push Notification Customization Section */}
      <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Push Notification Preferences
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Real-time Enabled
          </span>
        </div>

        <div className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
          
          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Grade &amp; Continuous Assessment Alerts
              </h4>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
                Instant alert whenever teachers publish a new CA mark or term examination score.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyGrades}
              onChange={(e) => setNotifyGrades(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Morning Attendance &amp; Check-In Alerts
              </h4>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
                Notify parent and student immediately when morning roll call is registered (Present / Late).
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyAttendance}
              onChange={(e) => setNotifyAttendance(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                ECZ Examinations &amp; School Event Reminders
              </h4>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
                Timetable releases, mock exam announcements, and sports gala notifications.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyEvents}
              onChange={(e) => setNotifyEvents(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Mpatamatu WhatsApp Group Chat Messages
              </h4>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
                Push alerts when new assignments or announcements are shared in Club or PTA GCs.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyChat}
              onChange={(e) => setNotifyChat(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Notification Sound Chime &amp; Vibration
              </h4>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
                Play pleasant Web Audio chime sound when an alert arrives.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifySound}
              onChange={(e) => setNotifySound(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

        </div>
      </div>

      {/* Display & Device Frame Preview */}
      <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <span>Device Simulation &amp; Appearance</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Dark Mode Card */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Dark Mode Theme
              </div>
              <div className="text-xs text-emerald-700/80 dark:text-emerald-400">
                {isDarkMode ? 'Dark theme active' : 'Light theme active'}
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              <span>Toggle Theme</span>
            </button>
          </div>

          {/* Device Frame View */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                App Shell Simulation
              </div>
              <div className="text-xs text-emerald-700/80 dark:text-emerald-400 uppercase font-bold text-[10px]">
                Current: {deviceView}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChangeDeviceView('responsive')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  deviceView === 'responsive' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                Web
              </button>
              <button
                type="button"
                onClick={() => onChangeDeviceView('ios')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  deviceView === 'ios' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                iOS
              </button>
              <button
                type="button"
                onClick={() => onChangeDeviceView('android')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  deviceView === 'android' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                Android
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Offline Storage & Security */}
      <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-teal-600" />
          <span>Offline Cache Storage &amp; Security</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20">
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
              Multi-Factor Authentication (MFA)
            </span>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-1">
              Status: <span className="text-emerald-600 font-bold">Enabled &bull; SMS 2FA Active</span>
            </p>
            <div className="mt-2 text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-mono">
              Phone: {currentUser?.phone || '+260973485009'}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                Offline Course Materials Cache
              </span>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-1">
                Allocated: <span className="font-bold">24.5 MB</span> (ECZ Papers &amp; Notes cached)
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              {cacheCleared ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Cache Purged!
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Offline Cache</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
