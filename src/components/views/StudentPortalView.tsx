import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Calendar,
  Clock,
  FileText,
  Printer,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Download,
  ShieldCheck,
  Zap,
  QrCode
} from 'lucide-react';
import { StudentRecord, User, SubjectGrade } from '../../types';
import { calculateBestSixPoints, evaluateJuniorStatus, calculateEczGrade, calculateXpFromGrade, formatZMW } from '../../utils/gradeCalculations';
import { StudentQrCardModal } from '../StudentQrCardModal';
import { generateStudentQrPayload, generateQrDataUrl } from '../../utils/qrAttendanceSystem';

interface StudentPortalViewProps {
  currentUser: User | null;
  students: StudentRecord[];
  activeStudent: StudentRecord;
  onSelectStudent: (student: StudentRecord) => void;
  onUpdateGrade: (studentId: string, updatedSubject: SubjectGrade) => void;
  onRecordAttendance: (studentId: string, status: 'present' | 'absent' | 'late') => void;
  onOpenAvatarCustomizer?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  students,
  activeStudent,
  onSelectStudent,
  onUpdateGrade,
  onRecordAttendance,
  onOpenAvatarCustomizer,
  onNavigateTab,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'junior' | 'senior'>(
    activeStudent.level
  );
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'reportCard'>('grades');
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [inlineQrUrl, setInlineQrUrl] = useState('');

  useEffect(() => {
    let active = true;
    const payload = generateStudentQrPayload(activeStudent);
    generateQrDataUrl(payload, { width: 240, margin: 1, darkColor: '#064e3b' })
      .then((url) => {
        if (active) setInlineQrUrl(url);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [activeStudent]);

  // Form for posting grade update (Teachers & Admins)
  const [formSubject, setFormSubject] = useState('');
  const [formCa, setFormCa] = useState(35);
  const [formExam, setFormExam] = useState(50);
  const [formRemarks, setFormRemarks] = useState('Consistent laboratory participation and analytical skills.');

  const isJunior = activeStudent.level === 'junior';
  const bestSix = !isJunior ? calculateBestSixPoints(activeStudent.grades) : null;
  const juniorStatus = isJunior ? evaluateJuniorStatus(activeStudent.grades) : null;

  // Filter students by selected level
  const filteredStudents = students.filter((s) => {
    if (levelFilter === 'all') return true;
    return s.level === levelFilter;
  });

  const handlePostGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = formCa + formExam;
    const { eczGrade, division } = calculateEczGrade(total);

    const updatedSub: SubjectGrade = {
      subjectId: `sub_${Date.now()}`,
      subjectName: formSubject.trim() || 'New Assessment',
      continuousAssessment: formCa,
      finalExam: formExam,
      total,
      eczGrade,
      division,
      teacherRemarks: formRemarks,
      teacherName: currentUser?.name || 'Mpatamatu Faculty',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateGrade(activeStudent.id, updatedSub);
    setShowAddGradeModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner / Student Selector Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Active Student Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group cursor-pointer" onClick={onOpenAvatarCustomizer}>
              <img
                src={activeStudent.avatar}
                alt={activeStudent.fullName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/30 group-hover:ring-amber-400 transition-all"
              />
              <span className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${
                activeStudent.level === 'senior' ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {activeStudent.level}
              </span>
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
                  {activeStudent.fullName}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Grade {activeStudent.stream}
                </span>
                {onOpenAvatarCustomizer && (
                  <button
                    type="button"
                    onClick={onOpenAvatarCustomizer}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 hover:bg-amber-400/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Avatar Studio</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-all"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-300" />
                  <span>Student QR Pass</span>
                </button>
              </div>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-0.5 font-mono">
                ECZ Exam No: <span className="font-bold">{activeStudent.eczExamNumber}</span> &bull; Parent: {activeStudent.parentName}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Attendance: {activeStudent.attendanceRate}%</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>XP: {activeStudent.gamification?.totalXp || 0} pts (Lv. {activeStudent.gamification?.level || 1})</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Conduct: {activeStudent.conduct}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Student Quick Switcher & Level Filter */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
            
            {/* Level Filter Tabs */}
            <div className="flex items-center p-1 bg-emerald-100/70 dark:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLevelFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  levelFilter === 'all'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-sm'
                    : 'text-emerald-800 dark:text-emerald-300'
                }`}
              >
                All (500+)
              </button>
              <button
                type="button"
                onClick={() => setLevelFilter('junior')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  levelFilter === 'junior'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-sm'
                    : 'text-emerald-800 dark:text-emerald-300'
                }`}
              >
                Junior (8-9)
              </button>
              <button
                type="button"
                onClick={() => setLevelFilter('senior')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  levelFilter === 'senior'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-sm'
                    : 'text-emerald-800 dark:text-emerald-300'
                }`}
              >
                Senior (10-12)
              </button>
            </div>

            {/* Switch to Flagship Junior / Senior demo fast buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">Quick View:</span>
              <button
                type="button"
                onClick={() => {
                  const s = students.find((x) => x.id === 'std_senior_1') || students[0];
                  onSelectStudent(s);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] ${
                  activeStudent.id === 'std_senior_1'
                    ? 'bg-amber-500 text-emerald-950 border-amber-600'
                    : 'bg-white dark:bg-emerald-900 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                Natasha (Senior 12A)
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = students.find((x) => x.id === 'std_junior_1') || students[1];
                  onSelectStudent(s);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] ${
                  activeStudent.id === 'std_junior_1'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white dark:bg-emerald-900 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                Chileshe (Junior 9B)
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Tabs navigation: Grades / Attendance / Printable Report Card */}
      <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'grades'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Grades &amp; ECZ Marks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'attendance'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reportCard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'reportCard'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Official Report Card</span>
          </button>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('ecz')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-sm transition-all"
            >
              <Award className="w-4 h-4 text-emerald-950" />
              <span>Official ECZ e-Statement</span>
            </button>
          )}
        </div>

        {/* Action Button: Post Grade Update (Teachers / Admins) */}
        <button
          type="button"
          onClick={() => setShowAddGradeModal(true)}
          className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Grade Update</span>
        </button>
      </div>

      {/* Tab 1: Academic Grades */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          
          {/* Zambian ECZ Performance Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Aggregate Score / Points */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                {isJunior ? 'Junior Secondary Division' : 'Senior ECZ Aggregate (Best 6)'}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-300">
                  {isJunior ? `${juniorStatus?.average}%` : `${bestSix?.points} pts`}
                </span>
                <span className="text-xs text-emerald-200 font-semibold">
                  {isJunior ? juniorStatus?.divisionRemarks : bestSix?.status}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mt-2">
                {isJunior
                  ? 'Calculated from continuous assessments and JSLE trial benchmarks.'
                  : 'ECZ scale: lower aggregate points represent superior academic distinction.'}
              </p>
            </div>

            {/* Attendance Rate */}
            <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                  Classroom Attendance Rate
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
                    {activeStudent.attendanceRate}%
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {activeStudent.attendanceRate >= 95 ? 'Outstanding' : 'Regular'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-emerald-100 dark:border-emerald-800/80">
                <button
                  type="button"
                  onClick={() => onRecordAttendance(activeStudent.id, 'present')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200"
                >
                  Mark Present Today
                </button>
                <button
                  type="button"
                  onClick={() => onRecordAttendance(activeStudent.id, 'late')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-200"
                >
                  Mark Late
                </button>
              </div>
            </div>

            {/* Term Fees & Financial Status */}
            <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                  Term 3 Tuition &amp; Exam Clearance
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {activeStudent.termFeesPaid ? (
                    <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cleared for ECZ Exams</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Balance: {formatZMW(activeStudent.balanceZMW)}</span>
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-2">
                Official receipts verified through Mpatamatu Secondary School Accounts.
              </p>
            </div>

          </div>

          {/* Subject Grades Table */}
          <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                  Term 3 Continuous Assessment &amp; Final Trial Scores
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Grades calibrated according to Zambian Examinations Council (ECZ) divisions (Distinction 1-2, Merit 3-4, Credit 5-6, Satisfactory 7-8)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-emerald-50/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-extrabold border-b border-emerald-200 dark:border-emerald-800">
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-3 text-center">CA (/40)</th>
                    <th className="py-3 px-3 text-center">Exam (/60)</th>
                    <th className="py-3 px-3 text-center">Total (%)</th>
                    <th className="py-3 px-3 text-center">ECZ Grade</th>
                    <th className="py-3 px-3 text-center">Division</th>
                    <th className="py-3 px-4 hidden md:table-cell">Teacher Remarks</th>
                    <th className="py-3 px-3 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60 font-medium">
                  {activeStudent.grades.map((grade) => (
                    <tr key={grade.subjectId} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-950 dark:text-emerald-100">
                        {grade.subjectName}
                        <div className="text-[10px] font-normal text-emerald-700/70 dark:text-emerald-400">
                          Teacher: {grade.teacherName}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-900 dark:text-emerald-200">
                        {grade.continuousAssessment}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-900 dark:text-emerald-200">
                        {grade.finalExam}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold font-mono text-emerald-950 dark:text-emerald-50">
                        {grade.total}%
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                          grade.eczGrade === '1'
                            ? 'bg-amber-400 text-emerald-950 shadow-sm'
                            : grade.eczGrade === '2'
                            ? 'bg-emerald-600 text-white'
                            : Number(grade.eczGrade) <= 4
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
                        }`}>
                          {grade.eczGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          grade.division === 'Distinction'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300'
                            : grade.division === 'Merit'
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200'
                            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
                        }`}>
                          {grade.division}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-emerald-800/80 dark:text-emerald-300/80 max-w-xs truncate">
                        "{grade.teacherRemarks}"
                      </td>
                      <td className="py-3.5 px-3 text-right text-[11px] text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {grade.lastUpdated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Attendance History & QR Pass */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          
          {/* Contactless QR Roll Call Pass Showcase Card */}
          <div className="bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/60 dark:from-emerald-950 dark:via-emerald-900/40 dark:to-emerald-950 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
              
              <div className="flex items-center gap-4">
                {/* Inline High-Contrast QR Code */}
                <div className="relative group p-2 bg-white rounded-2xl border-2 border-emerald-300 dark:border-emerald-600 shadow-inner flex-shrink-0 cursor-pointer" onClick={() => setShowQrModal(true)}>
                  {inlineQrUrl ? (
                    <img
                      src={inlineQrUrl}
                      alt="Student Attendance QR Pass"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-xs font-bold text-emerald-700">
                      Generating...
                    </div>
                  )}
                  <div className="absolute inset-0 bg-emerald-950/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-[10px] font-bold">
                    Click to Enlarge
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-600">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                    <span>Official Attendance QR Pass</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-50">
                    {activeStudent.fullName} &bull; {activeStudent.stream}
                  </h4>
                  <p className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                    ECZ Exam: <strong>{activeStudent.eczExamNumber}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 max-w-md">
                    Present this contactless badge to the camera scanner at morning gate arrival or homeroom roll call to earn +15 XP!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>Open Full Digital ID Pass</span>
                </button>

                {inlineQrUrl && (
                  <a
                    href={inlineQrUrl}
                    download={`QR_Pass_${activeStudent.fullName.replace(/\s+/g, '_')}.png`}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download QR</span>
                  </a>
                )}
              </div>

            </div>
          </div>

          <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <div>
                <h3 className="font-extrabold text-base text-emerald-950 dark:text-emerald-50">
                  Attendance Register &amp; Daily Morning Roll Call
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Every student check-in is logged with timestamp for parental transparency
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  {activeStudent.attendanceRate}%
                </div>
                <div className="text-[10px] uppercase font-bold text-emerald-600">Overall Attendance</div>
              </div>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeStudent.attendanceHistory.map((day, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                    {day.date}
                  </div>
                  {day.periodRemarks && (
                    <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400">
                      {day.periodRemarks}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  day.status === 'present'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                    : day.status === 'late'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {day.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Tab 3: Official Printable Report Card Modal / Preview */}
      {activeTab === 'reportCard' && (
        <div className="bg-white text-emerald-950 rounded-2xl border border-emerald-300 p-6 sm:p-10 shadow-xl space-y-6 max-w-4xl mx-auto">
          
          {/* Institutional Header with crest */}
          <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-md ring-2 ring-amber-400">
                MSS
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-emerald-950">
                  Mpatamatu Secondary School
                </h2>
                <p className="text-xs font-bold text-emerald-800">
                  Ministry of Education &bull; Luanshya District, Copperbelt Province, Zambia
                </p>
                <p className="text-[11px] text-emerald-700">
                  Official Continuous Assessment &amp; Term Examination Report
                </p>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                TERM 3, 2026
              </span>
            </div>
          </div>

          {/* Student Profile Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
            <div>
              <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Student Name:</span>
              <span className="font-extrabold text-emerald-950 text-sm">{activeStudent.fullName}</span>
            </div>
            <div>
              <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Grade &amp; Stream:</span>
              <span className="font-extrabold text-emerald-950 text-sm">Grade {activeStudent.stream}</span>
            </div>
            <div>
              <span className="text-emerald-700 font-semibold block text-[10px] uppercase">ECZ Exam Number:</span>
              <span className="font-extrabold font-mono text-emerald-950 text-sm">{activeStudent.eczExamNumber}</span>
            </div>
            <div>
              <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Attendance:</span>
              <span className="font-extrabold text-emerald-950 text-sm">{activeStudent.attendanceRate}%</span>
            </div>
          </div>

          {/* Report Card Marks Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-800 text-white font-bold">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-2 text-center">CA (/40)</th>
                <th className="py-2.5 px-2 text-center">Exam (/60)</th>
                <th className="py-2.5 px-2 text-center">Total (%)</th>
                <th className="py-2.5 px-2 text-center">Grade</th>
                <th className="py-2.5 px-3">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-200 font-medium">
              {activeStudent.grades.map((g) => (
                <tr key={g.subjectId}>
                  <td className="py-2 px-3 font-bold">{g.subjectName}</td>
                  <td className="py-2 px-2 text-center font-mono">{g.continuousAssessment}</td>
                  <td className="py-2 px-2 text-center font-mono">{g.finalExam}</td>
                  <td className="py-2 px-2 text-center font-bold font-mono">{g.total}%</td>
                  <td className="py-2 px-2 text-center font-bold">{g.eczGrade} ({g.division})</td>
                  <td className="py-2 px-3 text-emerald-800 text-[11px]">{g.teacherRemarks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Remarks & Signature */}
          <div className="pt-4 border-t border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
              <span className="font-bold text-emerald-900 block text-[11px] uppercase">Class Teacher’s Remarks:</span>
              <p className="mt-1 text-emerald-800 italic">
                "{activeStudent.fullName} exhibits admirable discipline, intellectual rigor, and consistency. Highly commended."
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
              <span className="font-bold text-emerald-900 block text-[11px] uppercase">Headteacher’s Endorsement:</span>
              <p className="mt-1 text-emerald-800 italic">
                "An outstanding academic term. Keep working with diligence toward the final ECZ National Examinations."
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-700 font-semibold border-t border-emerald-200 pt-2">
                <span className="font-bold text-emerald-950">Mrs. Kajimoto R. C. (Headteacher)</span>
                <span className="font-mono text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[9px] font-bold">[Certified Institutional Seal]</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print ECZ Report Card</span>
            </button>
          </div>

        </div>
      )}

      {/* Modal: Post New Grade / CA Update */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-5 sm:p-6 overflow-hidden">
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-500" />
              <span>Post Grade Update for {activeStudent.fullName}</span>
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Submitting updates will instantly calculate ECZ grade, award XP, and trigger a push notification to parent &amp; student.
            </p>

            <form onSubmit={handlePostGradeSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Physics (5054) or Mathematics"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Continuous Assessment (/40)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    required
                    value={formCa}
                    onChange={(e) => setFormCa(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Final Exam (/60)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    required
                    value={formExam}
                    onChange={(e) => setFormExam(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>Calculated Total: {formCa + formExam}%</span>
                  <span>ECZ Grade: {calculateEczGrade(formCa + formExam).eczGrade} ({calculateEczGrade(formCa + formExam).division})</span>
                </div>
                <div className="text-[10px] text-amber-800 dark:text-amber-300 mt-1">
                  Awards +{calculateXpFromGrade(calculateEczGrade(formCa + formExam).eczGrade)} XP points upon save.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Teacher Remarks
                </label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish &amp; Send Push Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student QR Digital ID Pass Modal */}
      {showQrModal && (
        <StudentQrCardModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          student={activeStudent}
          students={students}
          onSelectStudent={onSelectStudent}
        />
      )}

    </div>
  );
};
