import React, { useState } from 'react';
import {
  Users,
  Award,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { Club, User, StudentRecord } from '../../types';
import { CLUBS } from '../../data/seedData';
import { ActiveTab } from '../Navigation';

interface ClubsViewProps {
  currentUser: User | null;
  activeStudent: StudentRecord;
  onNavigate: (tab: ActiveTab) => void;
  onJoinClub: (clubId: string, studentName: string) => void;
}

export const ClubsView: React.FC<ClubsViewProps> = ({
  currentUser,
  activeStudent,
  onNavigate,
  onJoinClub,
}) => {
  const [clubs, setClubs] = useState<Club[]>(CLUBS);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // Sign up modal state
  const [signingUpClub, setSigningUpClub] = useState<Club | null>(null);
  const [parentConsent, setParentConsent] = useState(true);
  const [statement, setStatement] = useState('Eager to represent Mpatamatu Secondary School in regional competitions.');

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingUpClub) return;

    setClubs((prev) =>
      prev.map((c) =>
        c.id === signingUpClub.id
          ? { ...c, isEnrolled: true, membersCount: c.membersCount + 1 }
          : c
      )
    );

    onJoinClub(signingUpClub.id, activeStudent.fullName);
    setSigningUpClub(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Extracurricular Societies &amp; Co-Curricular Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
            Clubs Directory &amp; Sign-Up Portal
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-1 max-w-2xl">
            Enrich your school life with science innovations, national debate championships, coding, and sports leagues. Joining a club automatically enrolls you into its WhatsApp Group Chat!
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('chat')}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center gap-1.5 self-start md:self-auto"
        >
          <MessageSquare className="w-4 h-4 text-amber-300" />
          <span>Go to Clubs Group Chats</span>
        </button>
      </div>

      {/* Clubs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => {
          const isEnrolled = club.isEnrolled || activeStudent.clubs.includes(club.id);
          return (
            <div
              key={club.id}
              className="rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={club.coverImage}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950">
                    {club.category}
                  </span>

                  {isEnrolled && (
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Enrolled</span>
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-extrabold text-base text-white">
                      {club.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    {club.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-emerald-900/90 dark:text-emerald-200/90 font-medium">
                    <div className="flex items-center gap-1.5">
                      {club.patronName.includes('Rodney Bwale') ? (
                        <img
                          src="/assets/aistudio/Facebook_creation_AE93975F-52CB-4968-9BE3-83580C365A42_c565d725.jpeg"
                          alt="Mr. Rodney Bwale"
                          className="w-4 h-4 rounded-full object-cover ring-1 ring-amber-400"
                        />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>Patron: {club.patronName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{club.meetingDay} &bull; {club.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{club.venue}</span>
                    </div>
                  </div>

                  {/* Achievements Snippet */}
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                    <span className="font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Key Achievement:
                    </span>
                    <p className="mt-0.5">{club.achievements[0]}</p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-0 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400 font-semibold">
                  {club.membersCount} / {club.maxCapacity} Members
                </span>

                {isEnrolled ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('chat')}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Club GC</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSigningUpClub(club)}
                    className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-sm flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Sign Up Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sign-Up Modal */}
      {signingUpClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <span>Join {signingUpClub.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSigningUpClub(null)}
                className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-100">
                <div><span className="font-bold">Student:</span> {activeStudent.fullName}</div>
                <div><span className="font-bold">Grade &amp; Stream:</span> Grade {activeStudent.stream} ({activeStudent.level})</div>
                <div><span className="font-bold">Patron:</span> {signingUpClub.patronName}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Why do you wish to join this club?
                </label>
                <textarea
                  rows={3}
                  required
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={parentConsent}
                  onChange={(e) => setParentConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="consent" className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Parent / Guardian ({activeStudent.parentName}) has approved extracurricular participation.
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSigningUpClub(null)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!parentConsent}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Enrollment &amp; Join GC</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
