import React from 'react';
import {
  Bell,
  X,
  GraduationCap,
  Clock,
  Calendar,
  MessageSquare,
  Sparkles,
  Trophy,
  BookOpen
} from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationToastProps {
  notification: PushNotification | null;
  onClose: () => void;
  onActionClick: (link?: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onActionClick,
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'grade':
        return <GraduationCap className="w-5 h-5 text-amber-500" />;
      case 'attendance':
        return <Clock className="w-5 h-5 text-emerald-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'gamification':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'library':
        return <BookOpen className="w-5 h-5 text-teal-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="fixed top-16 right-4 sm:right-8 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div className="rounded-2xl p-4 bg-emerald-950 text-white shadow-2xl border-2 border-amber-400/80 backdrop-blur-lg flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-white/10 flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onActionClick(notification.linkAction)}>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-1.5 py-0.2 rounded bg-amber-400/20">
              Live Push Alert
            </span>
            <span className="text-[10px] text-emerald-300 opacity-80">{notification.timestamp}</span>
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-white mt-1 leading-snug">
            {notification.title}
          </h4>
          <p className="text-xs text-emerald-100/90 mt-0.5 leading-normal">
            {notification.body}
          </p>

          <div className="mt-2 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline">
            Tap to view in portal &rarr;
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 flex-shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
