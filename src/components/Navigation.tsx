import React from 'react';
import {
  School,
  GraduationCap,
  Trophy,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  Mail,
  QrCode,
  Award,
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab =
  | 'home'
  | 'portal'
  | 'attendance'
  | 'ecz'
  | 'gamification'
  | 'conferences'
  | 'library'
  | 'chat'
  | 'clubs'
  | 'calendar'
  | 'admin'
  | 'settings'
  | 'contact';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole?: UserRole;
  unreadChatCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  userRole,
  unreadChatCount = 0,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'School Info', icon: School },
    { id: 'portal' as ActiveTab, label: 'Grades & Portal', icon: GraduationCap },
    {
      id: 'attendance' as ActiveTab,
      label: 'QR Roll Call',
      icon: QrCode,
      badgeText: 'Live',
    },
    {
      id: 'ecz' as ActiveTab,
      label: 'ECZ Results Portal',
      icon: Award,
      badgeText: 'e-Statement',
    },
    { id: 'gamification' as ActiveTab, label: 'Gamified Hub', icon: Trophy, badgeText: 'XP' },
    { id: 'conferences' as ActiveTab, label: 'Parent-Teacher', icon: CalendarCheck },
    { id: 'library' as ActiveTab, label: 'Digital Library', icon: BookOpen },
    { id: 'chat' as ActiveTab, label: 'Mpatamatu Chat', icon: MessageSquare, badgeCount: unreadChatCount },
    { id: 'clubs' as ActiveTab, label: 'Clubs & JETS', icon: Users },
    { id: 'calendar' as ActiveTab, label: 'Calendar', icon: CalendarDays },
    {
      id: 'admin' as ActiveTab,
      label: 'Admin Metrics',
      icon: BarChart3,
      restrictedToAdmin: true,
    },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
    { id: 'contact' as ActiveTab, label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="w-full bg-white/95 dark:bg-emerald-950/95 border-b border-emerald-900/10 dark:border-emerald-800/60 sticky top-[61px] sm:top-[69px] z-30 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            if (item.restrictedToAdmin && userRole !== 'admin' && userRole !== 'teacher') {
              return null;
            }

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20'
                    : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 hover:text-emerald-950 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-700 dark:text-emerald-400'}`} />
                <span>{item.label}</span>

                {item.badgeText && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-amber-400 text-emerald-950' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}>
                    {item.badgeText}
                  </span>
                )}

                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-red-600 text-white rounded-full">
                    {item.badgeCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
