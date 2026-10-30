import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Star,
  Users,
  Sparkles,
  BookOpen,
  GraduationCap,
  Lock,
  Palette
} from 'lucide-react';
import { StudentRecord, AssignmentTask, Badge } from '../../types';
import { calculateGamificationLevel, buildSubjectLeaderboard } from '../../utils/gradeCalculations';
import { INITIAL_ASSIGNMENTS } from '../../data/seedData';
import { AVATAR_TIERS, isTierUnlocked, getAvatarTierForLevel } from '../../utils/avatarSystem';

interface GamifiedLearningViewProps {
  students: StudentRecord[];
  activeStudent: StudentRecord;
  onCompleteAssignment: (studentId: string, assignmentId: string, xpReward: number) => void;
  onOpenAvatarCustomizer?: () => void;
}

export const GamifiedLearningView: React.FC<GamifiedLearningViewProps> = ({
  students,
  activeStudent,
  onCompleteAssignment,
  onOpenAvatarCustomizer,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [assignments, setAssignments] = useState<AssignmentTask[]>(INITIAL_ASSIGNMENTS);

  const profile = activeStudent.gamification || {
    totalXp: 1800,
    level: 4,
    title: 'Active Explorer',
    streakDays: 6,
    assignmentsCompleted: 10,
    badges: [],
  };

  const levelInfo = calculateGamificationLevel(profile.totalXp);
  const leaderboard = buildSubjectLeaderboard(students, selectedSubject, 10);
  const currentTier = getAvatarTierForLevel(levelInfo.level);

  const handleTaskCheck = (taskId: string, xpReward: number) => {
    setAssignments((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
    onCompleteAssignment(activeStudent.id, taskId, xpReward);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Gamification Level Banner with AI Student Avatar Evolution */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            
            {/* Student Avatar with Aura Glow */}
            <div
              className={`relative cursor-pointer group flex-shrink-0 ${onOpenAvatarCustomizer ? '' : ''}`}
              onClick={onOpenAvatarCustomizer}
              title="Click to customize AI Avatar & view level evolution"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-amber-300 shadow-md group-hover:scale-105 transition-transform bg-emerald-950">
                <img
                  src={activeStudent.avatar || currentTier.imagePath}
                  alt={activeStudent.fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-2 -right-2 bg-emerald-950 text-amber-300 text-xs font-black px-2 py-0.5 rounded-full ring-2 ring-amber-400">
                Lv. {levelInfo.level}
              </div>

              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-amber-100">
                  {currentTier.tierName}
                </span>
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-300 animate-pulse" />
                  {profile.streakDays} Day Study Streak
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                {activeStudent.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
                  Earn XP from homework, ECZ distinctions, and academic achievements.
                </p>
                {onOpenAvatarCustomizer && (
                  <button
                    type="button"
                    onClick={onOpenAvatarCustomizer}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all shadow-sm ring-1 ring-white/30"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Avatar Studio &amp; Evolution</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full md:w-72 bg-emerald-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="flex items-center justify-between text-xs font-black mb-1.5">
              <span>{profile.totalXp} XP</span>
              <span className="text-amber-200">{levelInfo.nextLevelXp} XP (Next Level)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-amber-100/80 text-right mt-1 font-semibold">
              {100 - levelInfo.progressPercent}% XP to Level {levelInfo.level + 1} &bull; Next Evolution at Lv {Math.floor(levelInfo.level / 2) * 2 + 3}
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Assignments Task & Badges */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Assignments & Homework Tasks */}
          <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                  Weekly Homework &amp; Revision Tasks
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
                +{assignments.filter((a) => !a.completed).reduce((s, a) => s + a.xpReward, 0)} XP Available
              </span>
            </div>

            <div className="divide-y divide-emerald-100 dark:divide-emerald-800/60 mt-2">
              {assignments.map((task) => (
                <div
                  key={task.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      disabled={task.completed}
                      onClick={() => handleTaskCheck(task.id, task.xpReward)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-600 dark:hover:border-emerald-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                          {task.title}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                          {task.subject}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-0.5">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                        <span>Due: {task.dueDate}</span>
                        <span>&bull;</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">+{task.xpReward} XP</span>
                      </div>
                    </div>
                  </div>

                  {!task.completed ? (
                    <button
                      type="button"
                      onClick={() => handleTaskCheck(task.id, task.xpReward)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 flex-shrink-0 shadow-sm transition-all flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Submit &amp; Claim XP</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 self-start sm:self-auto">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Academic Milestone Badges Showcase */}
          <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                  Academic Milestones &amp; Unlocked Badges
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {profile.badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3.5 rounded-xl border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-start gap-3 shadow-sm hover:scale-[1.02] transition-transform"
                >
                  <div className="text-2xl p-2 rounded-xl bg-white dark:bg-emerald-900 shadow-sm flex-shrink-0">
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      {badge.title}
                    </h4>
                    <p className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70 mt-0.5 leading-snug">
                      {badge.description}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-black text-amber-700 dark:text-amber-400">
                      +{badge.xpValue} XP Awarded
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Avatar Level Evolution Showcase Card */}
          <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                    AI Student Avatar Evolution Path
                  </h3>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                    Your avatar automatically transforms into unique AI-generated tiers as your academic level rises
                  </p>
                </div>
              </div>

              {onOpenAvatarCustomizer && (
                <button
                  type="button"
                  onClick={onOpenAvatarCustomizer}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-300" />
                  <span>Customize Aura &amp; Insignia</span>
                </button>
              )}
            </div>

            {/* 5 Avatar Tiers Progression Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {AVATAR_TIERS.map((tier) => {
                const unlocked = isTierUnlocked(levelInfo.level, tier.minLevel);
                const isCurrent = currentTier.minLevel === tier.minLevel;

                return (
                  <div
                    key={tier.minLevel}
                    className={`relative p-2.5 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400 shadow-md'
                        : unlocked
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-gray-50 dark:bg-emerald-950/30 border-gray-200 dark:border-emerald-900/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-xs">
                        <img
                          src={tier.imagePath}
                          alt={tier.tierName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {!unlocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                            <Lock className="w-5 h-5 text-amber-400" />
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-emerald-950 font-black text-[9px] shadow-sm">
                            EQUIPPED
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] font-extrabold text-emerald-950 dark:text-emerald-100 leading-tight">
                        {tier.tierName}
                      </div>
                      <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-medium mt-0.5">
                        {tier.titleBadge}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-bold">
                      {isCurrent ? (
                        <span className="text-amber-600 dark:text-amber-400 font-black">Active Tier</span>
                      ) : unlocked ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Unlocked</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Unlocks Lv {tier.minLevel}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Leaderboard */}
        <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                Top Student Leaderboard
              </h3>
            </div>
          </div>

          {/* Subject Filter for Leaderboard */}
          <div>
            <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
              Filter by Subject / Overall XP
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 font-semibold"
            >
              <option value="all">🌟 Overall Academic XP</option>
              <option value="Physics">⚛️ Physics (5054)</option>
              <option value="Chemistry">🧪 Chemistry (5070)</option>
              <option value="Mathematics">📐 Mathematics (4024)</option>
              <option value="Computer Studies">💻 Computer Studies</option>
              <option value="English">📖 English Language</option>
            </select>
          </div>

          {/* Leaderboard Roster */}
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.studentId === activeStudent.id;
              return (
                <div
                  key={entry.studentId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrentUser
                      ? 'bg-amber-100/90 dark:bg-amber-900/50 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/50'
                      : 'bg-white dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-emerald-950 shadow-sm'
                        : entry.rank === 2
                        ? 'bg-gray-300 text-gray-900'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                    }`}>
                      {entry.rank}
                    </div>

                    <img
                      src={entry.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={entry.studentName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-300 dark:ring-emerald-700 flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate">
                        {entry.studentName} {isCurrentUser && '(You)'}
                      </div>
                      <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-medium">
                        Grade {entry.stream}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                      {selectedSubject === 'all' ? `${entry.scoreOrXp} XP` : `${entry.scoreOrXp}%`}
                    </span>
                    <div className="text-[9px] text-emerald-600 dark:text-emerald-400">
                      {entry.badgesCount} badges
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
