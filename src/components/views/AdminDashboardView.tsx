import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Send,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  Clock,
  Printer,
  QrCode
} from 'lucide-react';
import { StudentRecord, User, SchoolPerformanceMetrics } from '../../types';
import { SCHOOL_METRICS } from '../../data/seedData';
import { formatZMW } from '../../utils/gradeCalculations';
import { StudentQrCardModal } from '../StudentQrCardModal';

interface AdminDashboardViewProps {
  currentUser: User | null;
  students: StudentRecord[];
  onSelectStudent: (student: StudentRecord) => void;
  onBroadcastAnnouncement: (title: string, message: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  students,
  onSelectStudent,
  onBroadcastAnnouncement,
  onNavigateTab,
}) => {
  const [modalStudent, setModalStudent] = useState<StudentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'junior' | 'senior'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Broadcast Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Scalable filtered list of students
  const filteredStudents = students.filter((s) => {
    if (levelFilter !== 'all' && s.level !== levelFilter) return false;
    if (gradeFilter !== 'all' && s.grade.toString() !== gradeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.eczExamNumber.toLowerCase().includes(q) ||
        s.stream.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;
    onBroadcastAnnouncement(announcementTitle.trim(), announcementBody.trim());
    setShowBroadcastModal(false);
    setAnnouncementTitle('');
    setAnnouncementBody('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Executive Oversight Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-bold mb-2">
            <School className="w-3.5 h-3.5 text-amber-600" />
            <span>Headteacher &amp; Administration Executive Dashboard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
            Institutional Oversight &amp; Student Registry ({students.length} Students)
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-1 max-w-2xl">
            Real-time analytics for Headteacher Mrs. Kajimoto R. C., Deputy Head Mrs. Christine Mwansa, and department chairs to monitor ECZ pass metrics and school operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-600 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>Contactless QR Roll Call Gate</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-md flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast School Push Alert</span>
          </button>
        </div>
      </div>

      {/* High-Level Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Total Enrollment</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-50 mt-2">
            {SCHOOL_METRICS.totalStudents}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Junior: {SCHOOL_METRICS.juniorStudents} &bull; Senior: {SCHOOL_METRICS.seniorStudents}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Senior Pass Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-50 mt-2">
            {SCHOOL_METRICS.seniorPassRate}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            ECZ Certificate Qualifying benchmark
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Junior Pass Rate (JSLE)</span>
            <GraduationCap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-50 mt-2">
            {SCHOOL_METRICS.juniorPassRate}%
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
            Grade 9 national qualification trial
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Attendance Today</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-50 mt-2">
            {SCHOOL_METRICS.averageAttendanceToday}%
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            34 Faculty &amp; Staff Present
          </div>
        </div>
      </div>

      {/* Grade Distribution & Top Subjects Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ECZ Grade Distribution */}
        <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50 flex items-center justify-between">
            <span>ECZ Grade Distribution Across All Streams</span>
            <span className="text-xs text-emerald-600 font-normal">Term 3 Assessment</span>
          </h3>

          <div className="space-y-2.5 pt-2">
            {SCHOOL_METRICS.gradeDistribution.map((item) => (
              <div key={item.grade}>
                <div className="flex items-center justify-between text-xs font-bold mb-1 text-emerald-900 dark:text-emerald-200">
                  <span>{item.grade}</span>
                  <span>{item.count} students ({Math.round((item.count / 522) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.grade.includes('Distinction')
                        ? 'bg-amber-400'
                        : item.grade.includes('Merit')
                        ? 'bg-emerald-600'
                        : item.grade.includes('Credit')
                        ? 'bg-blue-600'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${(item.count / 220) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Subjects */}
        <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50 flex items-center justify-between">
            <span>Top Performing Academic Departments</span>
            <span className="text-xs text-amber-600 font-bold">ECZ Distinctions</span>
          </h3>

          <div className="divide-y divide-emerald-100 dark:divide-emerald-800/60 pt-1">
            {SCHOOL_METRICS.topPerformingSubjects.map((sub, idx) => (
              <div key={sub.subject} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                      {sub.subject}
                    </h4>
                    <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                      Average: {sub.average}%
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {sub.distinctions} Distinctions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Scalable Student Record Directory (500+ records) */}
      <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Student Records Database ({filteredStudents.length} results)
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
              Click any student row to inspect their report card, ECZ points, and attendance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, ECZ #, stream..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100"
              />
            </div>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 font-semibold"
            >
              <option value="all">All Levels</option>
              <option value="junior">Junior (8-9)</option>
              <option value="senior">Senior (10-12)</option>
            </select>

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 font-semibold"
            >
              <option value="all">All Grades</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
        </div>

        {/* Scalable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-emerald-50/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-extrabold border-b border-emerald-200 dark:border-emerald-800">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">Level &amp; Stream</th>
                <th className="py-3 px-3 font-mono">ECZ Candidate #</th>
                <th className="py-3 px-3 text-center">Attendance</th>
                <th className="py-3 px-3">Parent / Guardian</th>
                <th className="py-3 px-3 text-center">Fees Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60 font-medium">
              {paginatedStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2.5">
                    <img
                      src={student.avatar}
                      alt={student.fullName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-400"
                    />
                    <span>{student.fullName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      student.level === 'senior'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
                        : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
                    }`}>
                      {student.stream}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-emerald-800 dark:text-emerald-300">
                    {student.eczExamNumber}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    <span className={`${student.attendanceRate >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {student.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    {student.parentName}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {student.termFeesPaid ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        Paid
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalStudent(student);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                        title="View Student QR ID Card Pass"
                      >
                        <QrCode className="w-3 h-3 text-emerald-700 dark:text-emerald-300" />
                        <span>QR Pass</span>
                      </button>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline">
                        Inspect &rarr;
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 sm:p-4 border-t border-emerald-100 dark:border-emerald-800 flex items-center justify-between text-xs">
          <span className="text-emerald-700/80 dark:text-emerald-400">
            Page {currentPage} of {totalPages} &bull; Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Broadcast Push Announcement */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-5 sm:p-6 overflow-hidden">
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-500" />
              <span>Broadcast School Push Announcement</span>
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Dispatches an immediate high-priority push notification to all 500+ registered parents and students.
            </p>

            <form onSubmit={handleBroadcastSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Announcement Headline
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. ECZ Final Examination Hall Allocations"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="Detail instructions, dates, requirements..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Push</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student QR Card Modal */}
      {modalStudent && (
        <StudentQrCardModal
          isOpen={!!modalStudent}
          onClose={() => setModalStudent(null)}
          student={modalStudent}
          students={students}
          onSelectStudent={(st) => setModalStudent(st)}
        />
      )}

    </div>
  );
};
