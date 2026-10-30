import React from 'react';
import {
  X,
  Bell,
  GraduationCap,
  Clock,
  Calendar,
  MessageSquare,
  Trophy,
  CheckCheck,
  Trash2,
  Sparkles
} from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onItemClick: (link?: string) => void;
  onSimulate: (type: 'grade' | 'attendance' | 'event') => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onItemClick,
  onSimulate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                Push Notification Center
              </h3>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                Real-time school alerts, grade updates &amp; attendance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
            aria-label="Close notification modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Simulator Bar */}
        <div className="px-4 py-2 bg-emerald-50/80 dark:bg-emerald-900/30 border-b border-emerald-100 dark:border-emerald-800 flex items-center justify-between text-xs">
          <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Simulate Alert:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSimulate('grade')}
              className="px-2 py-1 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-bold hover:bg-amber-300"
            >
              Grade
            </button>
            <button
              type="button"
              onClick={() => onSimulate('attendance')}
              className="px-2 py-1 rounded bg-emerald-200 dark:bg-emerald-800/60 text-emerald-950 dark:text-emerald-200 font-bold hover:bg-emerald-300"
            >
              Attendance
            </button>
            <button
              type="button"
              onClick={() => onSimulate('event')}
              className="px-2 py-1 rounded bg-blue-200 dark:bg-blue-900/60 text-blue-950 dark:text-blue-200 font-bold hover:bg-blue-300"
            >
              Event
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-emerald-700/60 dark:text-emerald-400/60">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No notifications right now.</p>
              <p className="text-xs">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onItemClick(item.linkAction);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.read
                    ? 'bg-white dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/60 opacity-80'
                    : 'bg-emerald-50/70 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 shadow-sm'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 flex-shrink-0 mt-0.5">
                  {item.type === 'grade' ? (
                    <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : item.type === 'attendance' ? (
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : item.type === 'gamification' ? (
                    <Trophy className="w-4 h-4 text-amber-500" />
                  ) : item.type === 'event' ? (
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap ml-2">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                    {item.body}
                  </p>
                  {item.linkAction && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 underline">
                      View details &rarr;
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-emerald-100 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-200 hover:underline"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark all read</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 font-bold text-red-600 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>

      </div>
    </div>
  );
};
