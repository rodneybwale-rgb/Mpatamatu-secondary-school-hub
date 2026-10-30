import React, { useState, useEffect } from 'react';
import {
  Header
} from './components/Header';
import {
  Navigation,
  ActiveTab
} from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { NotificationToast } from './components/NotificationToast';
import { NotificationModal } from './components/NotificationModal';
import { HomeView } from './components/views/HomeView';
import { StudentPortalView } from './components/views/StudentPortalView';
import { GamifiedLearningView } from './components/views/GamifiedLearningView';
import { ConferencesView } from './components/views/ConferencesView';
import { DigitalLibraryView } from './components/views/DigitalLibraryView';
import { ChatView } from './components/views/ChatView';
import { ClubsView } from './components/views/ClubsView';
import { CalendarView } from './components/views/CalendarView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { SettingsView } from './components/views/SettingsView';
import { ContactView } from './components/views/ContactView';
import { AttendanceView } from './components/views/AttendanceView';
import { EczPortalView } from './components/views/EczPortalView';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';

import {
  User,
  StudentRecord,
  PushNotification,
  SubjectGrade,
  ConferenceBooking
} from './types';
import {
  DEMO_USERS,
  generateAllStudents,
  INITIAL_PUSH_NOTIFICATIONS,
  OFFICIAL_CONTACT
} from './data/seedData';
import { playNotificationSound } from './utils/audio';
import { calculateXpFromGrade, calculateGamificationLevel } from './utils/gradeCalculations';
import { getAvatarTierForLevel, getAvatarImageForLevel } from './utils/avatarSystem';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Device view mode: 'responsive' | 'ios' | 'android'
  const [deviceView, setDeviceView] = useState<'responsive' | 'ios' | 'android'>('responsive');

  // Offline simulation
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Current logged in user (Default to Natasha Musonda Grade 12 Senior Student)
  const [currentUser, setCurrentUser] = useState<User | null>(
    () => DEMO_USERS.find((u) => u.name === 'Natasha Musonda') || DEMO_USERS[0]
  );

  // Scalable list of 520+ students
  const [students, setStudents] = useState<StudentRecord[]>(() => generateAllStudents());

  // Active student in portal view
  const [activeStudentId, setActiveStudentId] = useState<string>('std_senior_1');

  // Push notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_PUSH_NOTIFICATIONS);
  const [latestToast, setLatestToast] = useState<PushNotification | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

  // Unread chat counter for badge
  const [unreadChatCount, setUnreadChatCount] = useState<number>(3);

  // Apply dark mode class to root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const activeStudent =
    students.find((s) => s.id === activeStudentId) || students[0];

  // Helper to trigger real-time push notification with sound
  const triggerNotification = (notif: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: PushNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setLatestToast(newNotif);
    playNotificationSound();

    // Auto dismiss toast after 6 seconds
    setTimeout(() => {
      setLatestToast((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 6000);
  };

  // Quick push notification simulator
  const handleSimulateNotification = (type?: 'grade' | 'attendance' | 'event') => {
    if (type === 'grade') {
      triggerNotification({
        title: 'Real-time Grade Posted: Physics 5054',
        body: `${activeStudent.fullName} received 89% (Distinction 1) in Term 3 Mid-term Physics. +250 XP earned!`,
        type: 'grade',
        linkAction: 'portal',
        priority: 'high',
      });
    } else if (type === 'attendance') {
      triggerNotification({
        title: 'Morning Roll Call Confirmation',
        body: `${activeStudent.fullName} (${activeStudent.stream}) marked Present at 07:15 AM today.`,
        type: 'attendance',
        linkAction: 'portal',
        priority: 'normal',
      });
    } else {
      triggerNotification({
        title: 'ECZ Examination Alert: Mock Timetable',
        body: 'Junior JSLE and Senior G12 Trial examinations commencement notice has been published.',
        type: 'event',
        linkAction: 'calendar',
        priority: 'high',
      });
    }
  };

  // Grade update handler
  const handleUpdateGrade = (studentId: string, updatedSubject: SubjectGrade) => {
    const xpReward = calculateXpFromGrade(updatedSubject.eczGrade);
    let levelUpInfo: { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string } | null = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const exists = s.grades.some((g) => g.subjectId === updatedSubject.subjectId);
        const newGrades = exists
          ? s.grades.map((g) => (g.subjectId === updatedSubject.subjectId ? updatedSubject : g))
          : [updatedSubject, ...s.grades];

        const prevXp = s.gamification?.totalXp || 1000;
        const oldLvl = s.gamification?.level || 1;
        const newXp = prevXp + xpReward;
        const newLvl = calculateGamificationLevel(newXp).level;

        let avatarPath = s.avatar;
        let avatarTierName = s.avatarTierName;

        if (newLvl > oldLvl) {
          const evolvedTier = getAvatarTierForLevel(newLvl);
          avatarPath = evolvedTier.imagePath;
          avatarTierName = evolvedTier.tierName;
          levelUpInfo = { newLvl, evolvedTier, studentName: s.fullName };
        }

        return {
          ...s,
          avatar: avatarPath,
          avatarTierName,
          grades: newGrades,
          gamification: {
            ...s.gamification,
            totalXp: newXp,
            level: newLvl,
            title: s.gamification?.title || 'Scholar',
            streakDays: s.gamification?.streakDays || 5,
            assignmentsCompleted: s.gamification?.assignmentsCompleted || 10,
            badges: s.gamification?.badges || [],
          },
        };
      })
    );

    triggerNotification({
      title: `Grade Update: ${updatedSubject.subjectName}`,
      body: `${activeStudent.fullName} scored ${updatedSubject.total}% (${updatedSubject.eczGrade} - ${updatedSubject.division}). +${xpReward} XP awarded!`,
      type: 'grade',
      linkAction: 'portal',
      priority: 'high',
    });

    if (levelUpInfo) {
      const targetLvl = (levelUpInfo as { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string }).newLvl;
      const targetTier = (levelUpInfo as { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string }).evolvedTier;
      const targetName = (levelUpInfo as { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string }).studentName;

      if (currentUser && currentUser.id === studentId) {
        setCurrentUser((curr) => (curr ? { ...curr, avatar: targetTier.imagePath } : null));
      }
      setTimeout(() => {
        triggerNotification({
          title: `🌟 Avatar Evolved! Level ${targetLvl} Unlocked`,
          body: `Congratulations ${targetName}! Your academic avatar has automatically evolved to "${targetTier.tierName}". Check it out in the Avatar Studio!`,
          type: 'gamification',
          linkAction: 'gamification',
          priority: 'high',
        });
      }, 700);
    }
  };

  // Record Attendance handler
  const handleRecordAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const today = new Date().toISOString().split('T')[0];
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newHistory = [{ date: today, status }, ...s.attendanceHistory.slice(0, 15)];
        const rate = Math.round(
          (newHistory.filter((h) => h.status === 'present').length / newHistory.length) * 100
        );
        return {
          ...s,
          attendanceRate: rate,
          attendanceHistory: newHistory,
        };
      })
    );

    triggerNotification({
      title: 'Attendance Register Updated',
      body: `${activeStudent.fullName} marked as "${status.toUpperCase()}" for ${today}.`,
      type: 'attendance',
      linkAction: 'portal',
      priority: 'normal',
    });
  };

  // Gamified assignment completion with automatic avatar evolution
  const handleCompleteAssignment = (studentId: string, taskId: string, xpReward: number) => {
    let levelUpInfo: { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string } | null = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const currentXp = s.gamification?.totalXp || 1200;
        const oldLvl = s.gamification?.level || 1;
        const newXp = currentXp + xpReward;
        const newLevelInfo = calculateGamificationLevel(newXp);
        const newLvl = newLevelInfo.level;

        let avatarPath = s.avatar;
        let avatarTierName = s.avatarTierName;

        if (newLvl > oldLvl) {
          const evolvedTier = getAvatarTierForLevel(newLvl);
          avatarPath = evolvedTier.imagePath;
          avatarTierName = evolvedTier.tierName;
          levelUpInfo = { newLvl, evolvedTier, studentName: s.fullName };
        }

        return {
          ...s,
          avatar: avatarPath,
          avatarTierName,
          gamification: {
            ...s.gamification,
            totalXp: newXp,
            level: newLvl,
            title: newLevelInfo.title,
            streakDays: (s.gamification?.streakDays || 5) + 1,
            assignmentsCompleted: (s.gamification?.assignmentsCompleted || 0) + 1,
            badges: s.gamification?.badges || [],
          },
        };
      })
    );

    triggerNotification({
      title: 'Assignment Submitted & XP Claimed!',
      body: `Well done, ${activeStudent.fullName}! You earned +${xpReward} XP points toward Level Up.`,
      type: 'gamification',
      linkAction: 'gamification',
      priority: 'normal',
    });

    if (levelUpInfo) {
      const targetLvl = (levelUpInfo as { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string }).newLvl;
      const targetTier = (levelUpInfo as { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string }).evolvedTier;
      const targetName = (levelUpInfo as { newLvl: number; evolvedTier: ReturnType<typeof getAvatarTierForLevel>; studentName: string }).studentName;

      if (currentUser && currentUser.id === studentId) {
        setCurrentUser((curr) => (curr ? { ...curr, avatar: targetTier.imagePath } : null));
      }
      setTimeout(() => {
        triggerNotification({
          title: `🌟 Avatar Evolved! Level ${targetLvl} Unlocked`,
          body: `Congratulations ${targetName}! Your academic avatar has automatically evolved to "${targetTier.tierName}". Check it out in the Avatar Studio!`,
          type: 'gamification',
          linkAction: 'gamification',
          priority: 'high',
        });
      }, 700);
    }
  };

  // Custom Avatar Save Handler
  const handleSaveCustomAvatar = (
    updatedAvatar: string,
    aura: string,
    accessory: string,
    tierName: string
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          avatar: updatedAvatar,
          avatarAura: aura,
          avatarBadgeAccessory: accessory,
          avatarTierName: tierName,
        };
      })
    );

    if (currentUser && currentUser.id === activeStudent.id) {
      setCurrentUser((curr) =>
        curr ? { ...curr, avatar: updatedAvatar } : null
      );
    }

    triggerNotification({
      title: 'AI Avatar Customized & Equipped!',
      body: `${activeStudent.fullName} equipped "${tierName}" with ${aura} halo and ${accessory}.`,
      type: 'gamification',
      linkAction: 'gamification',
      priority: 'normal',
    });
  };


  // Parent-Teacher Conference booking
  const handleBookConference = (booking: ConferenceBooking) => {
    triggerNotification({
      title: 'Conference Appointment Confirmed',
      body: `Meeting with ${booking.teacherName} reserved for ${booking.date} at ${booking.timeSlot} (${booking.meetingMode}).`,
      type: 'conference',
      linkAction: 'conferences',
      priority: 'high',
    });
  };

  // Automated reminder trigger
  const handleTriggerConferenceReminder = (bookingId: string) => {
    triggerNotification({
      title: 'Parent-Teacher Conference Reminder',
      body: `Reminder: Consultation scheduled with faculty tomorrow. Please arrive on time or prepare your WhatsApp video link.`,
      type: 'conference',
      linkAction: 'conferences',
      priority: 'high',
    });
  };

  // Broadcast School Push Announcement
  const handleBroadcastAnnouncement = (title: string, body: string) => {
    triggerNotification({
      title: `School Announcement: ${title}`,
      body,
      type: 'event',
      linkAction: 'calendar',
      priority: 'high',
    });
  };

  // Download digital library item offline
  const handleDownloadResource = (resourceId: string) => {
    triggerNotification({
      title: 'Offline Cache Synchronized',
      body: 'Course material successfully saved to device offline storage. Ready for offline revision!',
      type: 'library',
      linkAction: 'library',
      priority: 'normal',
    });
  };

  // Chat message send handler
  const handleSendMessage = (groupId: string, text: string) => {
    setUnreadChatCount((c) => Math.max(0, c - 1));
  };

  // Join Club handler
  const handleJoinClub = (clubId: string, studentName: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === activeStudent.id
          ? { ...s, clubs: [...new Set([...s.clubs, clubId])] }
          : s
      )
    );

    triggerNotification({
      title: 'Club Enrollment Confirmed',
      body: `${studentName} was registered into the club and automatically added to the WhatsApp Group Chat.`,
      type: 'chat',
      linkAction: 'chat',
      priority: 'high',
    });
  };

  // Render view router based on activeTab
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        );
      case 'portal':
        return (
          <StudentPortalView
            currentUser={currentUser}
            students={students}
            activeStudent={activeStudent}
            onSelectStudent={(std) => setActiveStudentId(std.id)}
            onUpdateGrade={handleUpdateGrade}
            onRecordAttendance={handleRecordAttendance}
            onOpenAvatarCustomizer={() => setIsAvatarModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'attendance':
        return (
          <AttendanceView
            currentUser={currentUser}
            students={students}
            onUpdateStudents={(updated) => setStudents(updated)}
            onSelectStudent={(std) => {
              setActiveStudentId(std.id);
              setActiveTab('portal');
            }}
            onTriggerNotification={(notif) => triggerNotification(notif)}
          />
        );
      case 'ecz':
        return (
          <EczPortalView
            currentUser={currentUser}
            students={students}
            activeStudent={activeStudent}
            onSelectStudent={(std) => setActiveStudentId(std.id)}
            onTriggerNotification={(notif) => triggerNotification(notif)}
          />
        );
      case 'gamification':
        return (
          <GamifiedLearningView
            students={students}
            activeStudent={activeStudent}
            onCompleteAssignment={handleCompleteAssignment}
            onOpenAvatarCustomizer={() => setIsAvatarModalOpen(true)}
          />
        );
      case 'conferences':
        return (
          <ConferencesView
            currentUser={currentUser}
            activeStudent={activeStudent}
            onBookConference={handleBookConference}
            onTriggerReminder={handleTriggerConferenceReminder}
          />
        );
      case 'library':
        return (
          <DigitalLibraryView
            currentUser={currentUser}
            onDownloadResource={handleDownloadResource}
            isOfflineMode={isOfflineMode}
          />
        );
      case 'chat':
        return (
          <ChatView
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
          />
        );
      case 'clubs':
        return (
          <ClubsView
            currentUser={currentUser}
            activeStudent={activeStudent}
            onNavigate={(tab) => setActiveTab(tab)}
            onJoinClub={handleJoinClub}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            currentUser={currentUser}
            onSetReminder={(id, title) =>
              triggerNotification({
                title: 'Event Reminder Set',
                body: `Push notification reminder activated for "${title}".`,
                type: 'event',
                linkAction: 'calendar',
                priority: 'normal',
              })
            }
          />
        );
      case 'admin':
        return (
          <AdminDashboardView
            currentUser={currentUser}
            students={students}
            onSelectStudent={(std) => {
              setActiveStudentId(std.id);
              setActiveTab('portal');
            }}
            onBroadcastAnnouncement={handleBroadcastAnnouncement}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'settings':
        return (
          <SettingsView
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            deviceView={deviceView}
            onChangeDeviceView={(mode) => setDeviceView(mode)}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={() => {
              const next = !isOfflineMode;
              setIsOfflineMode(next);
              triggerNotification({
                title: next ? 'Offline Mode Active' : 'Online Sync Restored',
                body: next
                  ? 'Simulating disconnected environment. Only cached resources are accessible.'
                  : 'Reconnected to Mpatamatu cloud database server.',
                type: 'event',
                linkAction: 'library',
                priority: 'normal',
              });
            }}
          />
        );
      case 'contact':
        return <ContactView />;
      default:
        return (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        );
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'dark bg-emerald-950 text-emerald-50' : 'bg-slate-50 text-emerald-950'}`}>
      
      {/* Toast Notification Banner */}
      <NotificationToast
        notification={latestToast}
        onClose={() => setLatestToast(null)}
        onActionClick={(link) => {
          if (link) setActiveTab(link as ActiveTab);
          setLatestToast(null);
        }}
      />

      {/* Main Container / Mobile Device Simulator Frame */}
      {deviceView === 'responsive' ? (
        /* Standard Responsive Desktop & Mobile View */
        <div className="flex flex-col min-h-screen">
          <Header
            currentUser={currentUser}
            onSelectUser={(usr) => {
              setCurrentUser(usr);
              if (usr.role === 'student' && usr.studentLevel === 'junior') {
                setActiveStudentId('std_junior_1');
              } else if (usr.role === 'student') {
                setActiveStudentId('std_senior_1');
              }
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={() => setCurrentUser(null)}
            unreadNotifCount={unreadNotifsCount}
            onOpenNotifications={() => setIsNotifModalOpen(true)}
            onSimulateNotification={handleSimulateNotification}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            deviceView={deviceView}
            onChangeDeviceView={(mode) => setDeviceView(mode)}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
          />

          <Navigation
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            userRole={currentUser?.role}
            unreadChatCount={unreadChatCount}
          />

          <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
            {renderCurrentView()}
          </main>

          {/* Footer */}
          <footer className="border-t border-emerald-900/10 dark:border-emerald-800/40 bg-white/50 dark:bg-emerald-950/50 py-6 px-4 text-center text-xs text-emerald-800/80 dark:text-emerald-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-950 dark:text-emerald-100">
                  Mpatamatu Secondary School
                </span>
                <span>&bull; Luanshya, Copperbelt Province, Zambia</span>
              </div>
              <div>
                Inquiries: <a href="mailto:rodneybwale@gmail.com" className="font-bold underline hover:text-emerald-900 dark:hover:text-white">rodneybwale@gmail.com</a> | Tel: <a href="tel:+260973485009" className="font-bold underline hover:text-emerald-900 dark:hover:text-white">+260973485009</a>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* Mobile Device Frame Simulator (Apple iOS or Google Android) */
        <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
          
          {/* Top Device Bar & Switcher */}
          <div className="mb-4 flex items-center gap-3 bg-white/10 p-2 rounded-2xl text-white text-xs">
            <span className="font-bold text-amber-300">
              {deviceView === 'ios' ? '📱 Apple iPhone 15 Pro Frame' : '🤖 Samsung Galaxy S24 Android Frame'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDeviceView('ios')}
                className={`px-2 py-1 rounded-lg font-bold ${deviceView === 'ios' ? 'bg-amber-400 text-emerald-950' : 'bg-white/20'}`}
              >
                iOS
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('android')}
                className={`px-2 py-1 rounded-lg font-bold ${deviceView === 'android' ? 'bg-amber-400 text-emerald-950' : 'bg-white/20'}`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('responsive')}
                className="px-2 py-1 rounded-lg font-bold bg-white/20 hover:bg-white/30"
              >
                Exit to Web
              </button>
            </div>
          </div>

          {/* Physical Device Shell */}
          <div className={`relative w-full max-w-[420px] h-[860px] rounded-[50px] shadow-2xl border-[12px] overflow-hidden flex flex-col bg-white dark:bg-emerald-950 ${
            deviceView === 'ios'
              ? 'border-slate-800 ring-4 ring-slate-700/50'
              : 'border-neutral-900 ring-4 ring-neutral-800'
          }`}>
            
            {/* Status Bar & Camera Island / Punch Hole */}
            <div className="h-8 bg-emerald-950 text-white flex items-center justify-between px-6 z-50 text-[11px] font-bold select-none">
              <span>09:41</span>
              {deviceView === 'ios' ? (
                <div className="w-24 h-4 rounded-full bg-black mx-auto ring-1 ring-white/10 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 mr-1" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-black mx-auto ring-1 ring-white/20" />
              )}
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Scrollable App View Inside Phone */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              <Header
                currentUser={currentUser}
                onSelectUser={(usr) => {
                  setCurrentUser(usr);
                  if (usr.role === 'student' && usr.studentLevel === 'junior') {
                    setActiveStudentId('std_junior_1');
                  } else if (usr.role === 'student') {
                    setActiveStudentId('std_senior_1');
                  }
                }}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onLogout={() => setCurrentUser(null)}
                unreadNotifCount={unreadNotifsCount}
                onOpenNotifications={() => setIsNotifModalOpen(true)}
                onSimulateNotification={handleSimulateNotification}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                deviceView={deviceView}
                onChangeDeviceView={(mode) => setDeviceView(mode)}
                isOfflineMode={isOfflineMode}
                onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
              />

              <Navigation
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
                userRole={currentUser?.role}
                unreadChatCount={unreadChatCount}
              />

              <div className="flex-1 p-3">
                {renderCurrentView()}
              </div>
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="h-5 bg-white dark:bg-emerald-950 flex items-center justify-center z-50">
              <div className={`h-1 rounded-full ${deviceView === 'ios' ? 'w-32 bg-slate-400 dark:bg-slate-600' : 'w-20 bg-neutral-400'}`} />
            </div>

          </div>
        </div>
      )}

      {/* Auth Modal (Login / Register / MFA) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          triggerNotification({
            title: `Welcome, ${user.name}!`,
            body: `Successfully signed in as ${user.role.toUpperCase()} with Multi-Factor Verification.`,
            type: 'event',
            priority: 'normal',
          });
        }}
      />

      {/* Push Notification Center Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
        onItemClick={(link) => {
          if (link) setActiveTab(link as ActiveTab);
        }}
        onSimulate={handleSimulateNotification}
      />

      {/* AI Avatar Customization & Evolution Modal */}
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        student={activeStudent}
        onSaveAvatar={handleSaveCustomAvatar}
      />

    </div>
  );
}
