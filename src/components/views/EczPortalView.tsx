import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Search,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  QrCode,
  Sparkles,
  School,
  FileText,
  Copy,
  ExternalLink,
  Users,
  RefreshCw,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { StudentRecord, User } from '../../types';
import {
  queryEczCandidate,
  buildStatementOfResults,
  generateStatementQrCode,
  EczStatementOfResults,
} from '../../utils/eczPortalSystem';

interface EczPortalViewProps {
  currentUser: User | null;
  students: StudentRecord[];
  activeStudent: StudentRecord;
  onSelectStudent: (student: StudentRecord) => void;
  onTriggerNotification: (notif: {
    title: string;
    body: string;
    type: 'grade' | 'attendance' | 'event' | 'library' | 'chat';
    linkAction: any;
    priority: 'normal' | 'high';
  }) => void;
}

export const EczPortalView: React.FC<EczPortalViewProps> = ({
  currentUser,
  students,
  activeStudent,
  onSelectStudent,
  onTriggerNotification,
}) => {
  // Search parameters
  const [examNumberInput, setExamNumberInput] = useState<string>(activeStudent.eczExamNumber);
  const [centerNumberInput, setCenterNumberInput] = useState<string>('0118');
  const [levelFilter, setLevelFilter] = useState<'all' | 'junior' | 'senior'>(activeStudent.level);
  const [examYear, setExamYear] = useState<number>(2026);
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaCode, setCaptchaCode] = useState<string>('7K82');
  const [captchaError, setCaptchaError] = useState<boolean>(false);

  // Results State
  const [currentStatement, setCurrentStatement] = useState<EczStatementOfResults | null>(null);
  const [statementQrUrl, setStatementQrUrl] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Print reference
  const statementPrintRef = useRef<HTMLDivElement>(null);

  // Initialize with active student's official statement
  useEffect(() => {
    loadStudentStatement(activeStudent);
  }, [activeStudent]);

  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  const loadStudentStatement = (student: StudentRecord) => {
    setIsVerifying(true);
    setSearchError(null);

    const statement = buildStatementOfResults(student);
    setCurrentStatement(statement);

    generateStatementQrCode(statement.verificationUrl)
      .then((url) => {
        setStatementQrUrl(url);
        setIsVerifying(false);
      })
      .catch((err) => {
        console.error('Failed to generate statement QR', err);
        setIsVerifying(false);
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      return;
    }
    setCaptchaError(false);

    setIsVerifying(true);
    setSearchError(null);

    const result = queryEczCandidate(examNumberInput, levelFilter, students, centerNumberInput);
    if (!result.found || !result.student) {
      setSearchError(result.error || 'Candidate not found in Mpatamatu ECZ Examination Records.');
      setCurrentStatement(null);
      setIsVerifying(false);
      return;
    }

    onSelectStudent(result.student);
    loadStudentStatement(result.student);

    onTriggerNotification({
      title: 'ECZ Results Verified',
      body: `Official Statement of Results accessed for ${result.student.fullName} (${result.student.eczExamNumber}).`,
      type: 'grade',
      linkAction: 'portal',
      priority: 'normal',
    });
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const handleCopyVerificationLink = () => {
    if (!currentStatement) return;
    navigator.clipboard.writeText(currentStatement.verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* ECZ Official Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border-2 border-emerald-300 dark:border-emerald-800 shadow-sm relative overflow-hidden">
        {/* National Ribbon Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-xl shadow-md ring-2 ring-amber-400 flex-shrink-0">
              ECZ
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Republic of Zambia &bull; Examinations Council of Zambia</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
                Official Candidate Results Portal &amp; Statement of Results
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 max-w-2xl">
                National Candidate Verification System &bull; Centre 0118: Mpatamatu Secondary School, Luanshya District. Instant access to certified provisional results.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVerificationModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verify Legitimacy</span>
            </button>

            {currentStatement && (
              <button
                type="button"
                onClick={handlePrintStatement}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Print Official Statement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Query Search Chamber */}
      <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-5 sm:p-6 space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Candidate Examination Lookup &amp; Verification Query
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-300/80 hidden sm:inline">
            Directly linked to ECZ National Candidate Database
          </span>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            
            {/* Candidate Examination Number Input */}
            <div>
              <label className="block font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                Examination Number:
              </label>
              <input
                type="text"
                value={examNumberInput}
                onChange={(e) => setExamNumberInput(e.target.value)}
                placeholder="e.g. 2026/12/0118"
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/40 font-mono font-bold text-emerald-950 dark:text-emerald-100 placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5 block">
                Format: 2026/12/XXXX
              </span>
            </div>

            {/* Examination Center Number Input */}
            <div>
              <label className="block font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                Center Number:
              </label>
              <input
                type="text"
                value={centerNumberInput}
                onChange={(e) => setCenterNumberInput(e.target.value)}
                placeholder="e.g. 0118"
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/40 font-mono font-bold text-emerald-950 dark:text-emerald-100 placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5 block">
                Mpatamatu Sec: <strong>0118</strong>
              </span>
            </div>

            {/* Examination Level */}
            <div>
              <label className="block font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                Examination Level:
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Levels (Grade 9 &amp; 12)</option>
                <option value="senior">Grade 12 School Certificate (SCE / GCE)</option>
                <option value="junior">Grade 9 Junior Secondary (JSSLE)</option>
              </select>
            </div>

            {/* Examination Year */}
            <div>
              <label className="block font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                Session Year:
              </label>
              <select
                value={examYear}
                onChange={(e) => setExamYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={2026}>2026 (Current Academic Session)</option>
                <option value={2025}>2025 (Previous National Examination)</option>
              </select>
            </div>

            {/* Security Captcha Box */}
            <div>
              <label className="block font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                Security Code:
              </label>
              <div className="flex items-center gap-1.5">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-300 font-mono font-black text-sm tracking-widest select-none shadow-inner border border-emerald-700">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="p-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                  title="Generate new code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  maxLength={4}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Code"
                  className="w-20 px-2 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 font-mono font-bold text-center text-xs uppercase"
                  required
                />
              </div>
            </div>

          </div>

          {captchaError && (
            <p className="text-xs text-red-600 font-bold">
              Incorrect security code entered. Please type the 4-digit code shown in the green box.
            </p>
          )}

          {/* Form Action & Demo Switchers */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Quick Demo Candidate Clickers */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">Quick Check:</span>
              <button
                type="button"
                onClick={() => {
                  const s = students.find((st) => st.id === 'std_senior_1') || students[0];
                  setExamNumberInput(s.eczExamNumber);
                  setCenterNumberInput('0118');
                  setLevelFilter('senior');
                  setCaptchaInput(captchaCode);
                  onSelectStudent(s);
                  loadStudentStatement(s);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition-all ${
                  activeStudent.id === 'std_senior_1'
                    ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                Natasha Musonda (Senior 12A &bull; 6 Pts &bull; Center 0118)
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = students.find((st) => st.id === 'std_junior_1') || students[1];
                  setExamNumberInput(s.eczExamNumber);
                  setCenterNumberInput('0118');
                  setLevelFilter('junior');
                  setCaptchaInput(captchaCode);
                  onSelectStudent(s);
                  loadStudentStatement(s);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition-all ${
                  activeStudent.id === 'std_junior_1'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                Chileshe Mulenga (Junior 9B &bull; JSSLE &bull; Center 0118)
              </button>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Verify &amp; Retrieve Statement</span>
            </button>
          </div>
        </form>

        {searchError && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ECZ Candidate Query Notice: </span>
              <span>{searchError}</span>
            </div>
          </div>
        )}

      </div>

      {/* Official ECZ Statement of Results Document Container */}
      {currentStatement && (
        <div className="space-y-4">
          
          {/* Document Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 dark:text-emerald-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Certified Statement &bull; Serial: {currentStatement.serialNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyVerificationLink}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-50"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Verification URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintStatement}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>

          {/* The Physical-Style Statement of Results Document Sheet */}
          <div
            ref={statementPrintRef}
            className="bg-[#fafaf6] dark:bg-emerald-950 text-emerald-950 dark:text-emerald-50 rounded-3xl border-4 border-emerald-800 dark:border-emerald-700 p-6 sm:p-10 shadow-2xl relative overflow-hidden max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Subtle Security Guilloche Background Watermark Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none flex items-center justify-center font-serif text-8xl font-black rotate-[-25deg] select-none text-emerald-900">
              EXAMINATIONS COUNCIL OF ZAMBIA
            </div>

            {/* Official Institutional Header */}
            <div className="border-b-2 border-emerald-900 dark:border-emerald-700 pb-5 text-center relative space-y-2">
              
              {/* National Crest Badge */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-400 flex items-center justify-center font-serif font-black text-2xl shadow-md border-2 border-amber-400">
                  🇿🇲
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
                  Republic of Zambia
                </h1>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-emerald-900 dark:text-amber-300">
                  Examinations Council of Zambia
                </h2>
                <div className="inline-block px-4 py-1 rounded-full bg-emerald-900 text-amber-300 font-bold text-xs tracking-wider uppercase mt-1">
                  Provisional Statement of Results
                </div>
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1 uppercase">
                  {currentStatement.levelTitle} &bull; SESSION {currentStatement.examYear}
                </div>
              </div>

              {/* Serial & Date Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-900 dark:text-emerald-300 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <span>SERIAL NO: {currentStatement.serialNumber}</span>
                <span>DATE OF ISSUE: {currentStatement.issuedDate}</span>
              </div>
            </div>

            {/* Candidate Bio Table */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-emerald-50/70 dark:bg-emerald-900/30 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800">
              <div>
                <span className="block text-[10px] font-bold uppercase text-emerald-700/80 dark:text-emerald-400">
                  Candidate Full Name:
                </span>
                <span className="font-black text-sm text-emerald-950 dark:text-emerald-100">
                  {currentStatement.candidateName}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-emerald-700/80 dark:text-emerald-400">
                  Candidate Examination Number:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-emerald-950 dark:text-emerald-100">
                    {currentStatement.examNumber}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-300" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-emerald-700/80 dark:text-emerald-400">
                  Examination Centre:
                </span>
                <span className="font-bold text-emerald-950 dark:text-emerald-100">
                  {currentStatement.centreName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-emerald-700/80 dark:text-emerald-400">
                    Center Number:
                  </span>
                  <span className="font-mono font-black text-xs text-emerald-950 dark:text-emerald-100 bg-emerald-200/50 dark:bg-emerald-800/50 px-2 py-0.5 rounded">
                    {currentStatement.centreCode}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-emerald-700/80 dark:text-emerald-400">
                    Gender:
                  </span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">
                    {currentStatement.gender}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-emerald-700/80 dark:text-emerald-400">
                    Date of Birth:
                  </span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">
                    {currentStatement.dob}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Results Table */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-amber-300 font-extrabold uppercase border-b-2 border-emerald-950 text-[11px]">
                    <th className="py-2.5 px-3">Subject Code</th>
                    <th className="py-2.5 px-3">Subject Description</th>
                    <th className="py-2.5 px-3 text-center">Score (%)</th>
                    <th className="py-2.5 px-3 text-center">Grade Awarded</th>
                    <th className="py-2.5 px-3 text-right">Standard Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-200 dark:divide-emerald-800 font-medium">
                  {currentStatement.subjects.map((sub, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-transparent' : 'bg-emerald-50/40 dark:bg-emerald-900/20'}
                    >
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-950 dark:text-emerald-100">
                        {sub.code}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-950 dark:text-emerald-100">
                        {sub.name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-950 dark:text-emerald-100">
                        {sub.mark}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                          sub.grade === '1'
                            ? 'bg-amber-400 text-emerald-950 shadow-xs'
                            : sub.grade === '2'
                            ? 'bg-emerald-600 text-white'
                            : Number(sub.grade) <= 4
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100'
                        }`}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          sub.gradeTitle === 'DISTINCTION'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : sub.gradeTitle === 'MERIT'
                            ? 'bg-blue-100 text-blue-900'
                            : sub.gradeTitle === 'CREDIT'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}>
                          {sub.gradeTitle}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overall Qualification & Aggregate Summary Box */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-2 border border-emerald-700 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-700/80 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                    Candidate Aggregate Performance:
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    {currentStatement.aggregateSummary.pointsOrAverage} {currentStatement.aggregateSummary.unitLabel}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                    Official Award Standing:
                  </span>
                  <div className="text-sm font-black text-white">
                    {currentStatement.aggregateSummary.qualification}
                  </div>
                </div>
              </div>

              <div className="text-xs text-emerald-100 font-semibold pt-1">
                <span className="text-amber-300 font-bold">Official Decision Remarks: </span>
                <span>{currentStatement.aggregateSummary.remarks}</span>
              </div>
            </div>

            {/* Cryptographic QR Code & Digital Signature Stamp */}
            <div className="mt-6 pt-5 border-t-2 border-emerald-900 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* QR Verification Code */}
              <div className="flex items-center gap-3">
                {statementQrUrl ? (
                  <img
                    src={statementQrUrl}
                    alt="ECZ Cryptographic Verification QR"
                    className="w-20 h-20 sm:w-24 sm:h-24 p-1 bg-white rounded-xl border-2 border-emerald-300 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 bg-zinc-100 flex items-center justify-center text-xs">
                    QR
                  </div>
                )}
                <div className="text-[10px] space-y-0.5">
                  <div className="font-bold text-emerald-950 dark:text-emerald-100 uppercase">
                    Scan to Verify Authenticity
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-mono text-[9px]">
                    https://eservices.exams-council.org.zm
                  </div>
                  <div className="text-emerald-800/80 dark:text-emerald-300/80 text-[9px] max-w-xs">
                    Official cryptographic seal generated by the Examinations Council of Zambia.
                  </div>
                </div>
              </div>

              {/* Digital Signature & Seal */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic font-bold text-emerald-900 dark:text-amber-300 text-sm">
                  {currentStatement.digitalSignature.signatory}
                </div>
                <div className="text-[10px] font-bold text-emerald-950 dark:text-emerald-100">
                  {currentStatement.digitalSignature.title}
                </div>
                <div className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{currentStatement.digitalSignature.hash}</span>
                </div>
              </div>

            </div>

            {/* Legal Warning Notice */}
            <div className="mt-5 text-[9px] text-center text-emerald-800/70 dark:text-emerald-400/70 border-t border-emerald-200 dark:border-emerald-800 pt-3">
              This statement is issued as an interim provisional record of results. Any alteration, erasure, or unauthorized tampering renders this document immediately null and void. Official certificates are issued under the Examinations Council of Zambia Act Chapter 137.
            </div>

          </div>

        </div>
      )}

      {/* ECZ Legitimacy & Verification Explainer Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-300 dark:border-emerald-700 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-black text-base text-emerald-950 dark:text-emerald-50">
                  ECZ Electronic Verification Standard
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200"
              >
                &times;
              </button>
            </div>

            <div className="text-xs space-y-3 text-emerald-900 dark:text-emerald-200">
              <p>
                The Statements of Results generated through this portal conform to the official standards of the <strong>Examinations Council of Zambia (ECZ)</strong> for secondary education institutions in Zambia.
              </p>
              
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="font-bold text-emerald-950 dark:text-emerald-100">Verification Steps:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800/90 dark:text-emerald-300/90">
                  <li>Scan the embedded QR code with any camera or smartphone</li>
                  <li>Check that the Candidate Name matches the ECZ Registration Roll</li>
                  <li>Verify the 6-subject aggregate points against the grade threshold</li>
                  <li>Confirm the serial number: <span className="font-mono font-bold">{currentStatement?.serialNumber}</span></li>
                </ul>
              </div>

              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Tertiary institutions, colleges, employers, and scholarship boards can accept this official e-Statement for provisional placement.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowVerificationModal(false)}
              className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
            >
              Close Verification Guide
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
