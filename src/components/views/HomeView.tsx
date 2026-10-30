import React from 'react';
import {
  School,
  Award,
  Users,
  BookOpen,
  CalendarCheck,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from '../Navigation';
import { OFFICIAL_CONTACT } from '../../data/seedData';
import { User } from '../../types';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  currentUser,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner with Zambian Copperbelt Institutional Styling */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/40">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Excellence in Copperbelt Secondary Education Since 1968</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Welcome to <span className="text-amber-300">Mpatamatu</span> Secondary School
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            Nurturing Zambia's brightest minds in Luanshya. Featuring integrated real-time grade updates, WhatsApp-style group communication for clubs and parents, an interactive digital library, and comprehensive academic portals.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('portal')}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <span>Access Student Portal &amp; Grades</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('ecz')}
              className="px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm border border-amber-400/50 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>ECZ Results Portal &amp; e-Statement</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gamification')}
              className="px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-600 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Gamified Learning &amp; XP</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="px-5 py-3 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm border border-teal-600 transition-all flex items-center gap-2"
            >
              <span>Mpatamatu WhatsApp Chat</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="mt-8 pt-6 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">500+</div>
            <div className="text-xs text-emerald-200/80 font-medium">Enrolled Students</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">93.4%</div>
            <div className="text-xs text-emerald-200/80 font-medium">Senior ECZ Pass Rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">1st Place</div>
            <div className="text-xs text-emerald-200/80 font-medium">Copperbelt JETS Champions</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">34</div>
            <div className="text-xs text-emerald-200/80 font-medium">Dedicated Faculty</div>
          </div>
        </div>
      </section>

      {/* Junior & Senior Level Distinction Highlight */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold mb-3">
              <span>Junior Secondary (Grades 8 - 9)</span>
            </div>
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
              Foundation &amp; Junior Certificate (JSLE)
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
              Tailored curriculum focusing on Integrated Science, Mathematics, English, Social Studies, Business Studies, Computer Studies, and Zambian Languages (Icibemba). Intensive preparation for national Grade 9 qualifying exams.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('portal')}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100"
          >
            <span>Explore Junior Records &amp; Syllabus</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold mb-3">
              <span>Senior Secondary (Grades 10 - 12)</span>
            </div>
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
              Specialized Streams &amp; ECZ School Certificate
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
              Rigorous Natural Sciences (Physics 5054, Chemistry 5070, Biology 5090), Commercial, and Arts streams with ECZ Best-6 Point tracking, laboratory practicals, and university entry preparation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('portal')}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200"
          >
            <span>Explore Senior Records &amp; ECZ Prep</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Feature Exploration Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950 dark:text-emerald-50">
              Integrated School Features
            </h2>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
              Everything students, parents, and faculty need in one unified app
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div
            onClick={() => onNavigate('portal')}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Real-time Grade Updates
            </h4>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">
              Continuous Assessment (CA /40) + Exam (/60), ECZ Best 6 calculation, printable term reports, and push alerts.
            </p>
          </div>

          <div
            onClick={() => onNavigate('gamification')}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Gamified Learning &amp; Leaderboards
            </h4>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">
              Earn XP for homework submissions and distinctions, climb subject leaderboards, and unlock academic badges.
            </p>
          </div>

          <div
            onClick={() => onNavigate('conferences')}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Parent-Teacher Conferences
            </h4>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">
              Book time slots directly with subject teachers, select in-person or WhatsApp video, and receive automated reminders.
            </p>
          </div>

          <div
            onClick={() => onNavigate('library')}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Digital Library &amp; Offline Hub
            </h4>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">
              Download ECZ past papers and revision notes for offline studying with teacher classroom recommendations.
            </p>
          </div>

          <div
            onClick={() => onNavigate('chat')}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Mpatamatu WhatsApp Chat
            </h4>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">
              Club Group Chats (JETS, Debate, ICT), Parent-Teacher Forums, and instant teacher-student messaging.
            </p>
          </div>

          <div
            onClick={() => onNavigate('clubs')}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Clubs Directory &amp; Sign-Up
            </h4>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">
              Explore 6 active extracurricular societies with instant registration that connects directly to the club GC.
            </p>
          </div>

        </div>
      </section>

      {/* School Leadership & Administration Spotlight */}
      <section className="p-6 sm:p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
        <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 dark:text-emerald-50 mb-1">
          School Leadership &amp; Faculty Administration
        </h3>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mb-6">
          Guiding Mpatamatu Secondary School to national academic distinction
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <img
              src="/assets/aistudio/1793265206273_1566b81b.jpg"
              alt="Mrs. Kajimoto R. C. - Headteacher"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm flex-shrink-0"
            />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Mrs. Kajimoto R. C.
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                Headteacher / Principal
              </p>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                Administration &amp; Oversight
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
              alt="Mrs. Christine Mwansa"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Mrs. Christine Mwansa
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                Deputy Headteacher
              </p>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                Academics &amp; Discipline
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <img
              src="/assets/aistudio/Facebook_creation_AE93975F-52CB-4968-9BE3-83580C365A42_c565d725.jpeg"
              alt="Rodney Bwale - Systems Admin & ICT"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md flex-shrink-0"
            />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {OFFICIAL_CONTACT.name}
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                Systems Admin &amp; ICT
              </p>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                {OFFICIAL_CONTACT.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Contact Callout */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-base text-amber-300">
            Have questions or need assistance?
          </h4>
          <p className="text-xs text-emerald-100 mt-1">
            Contact Rodney Bwale directly via email ({OFFICIAL_CONTACT.email}) or phone ({OFFICIAL_CONTACT.phone}).
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('contact')}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs whitespace-nowrap shadow-md transition-all flex items-center gap-1.5"
        >
          <Mail className="w-4 h-4" />
          <span>Open Inquiry &amp; Feedback Form</span>
        </button>
      </section>

    </div>
  );
};
