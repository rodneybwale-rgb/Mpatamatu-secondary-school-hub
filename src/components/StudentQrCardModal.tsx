import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  X,
  Download,
  Printer,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Copy,
  School,
  UserCheck
} from 'lucide-react';
import { StudentRecord } from '../types';
import { generateStudentQrPayload, generateQrDataUrl } from '../utils/qrAttendanceSystem';

interface StudentQrCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRecord;
  students?: StudentRecord[];
  onSelectStudent?: (student: StudentRecord) => void;
}

export const StudentQrCardModal: React.FC<StudentQrCardModalProps> = ({
  isOpen,
  onClose,
  student,
  students = [],
  onSelectStudent,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreenQr, setIsFullscreenQr] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !student) return;

    let isMounted = true;
    setIsGenerating(true);

    const payload = generateStudentQrPayload(student);
    generateQrDataUrl(payload, { width: 360, margin: 2, darkColor: '#064e3b' })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleCopyPayload = () => {
    const payload = generateStudentQrPayload(student);
    navigator.clipboard.writeText(payload);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Pass_${student.fullName.replace(/\s+/g, '_')}_${student.eczExamNumber.replace(/\//g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-300 dark:border-emerald-700 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-50">
                Official Student QR Pass &amp; Digital ID
              </h3>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                Contactless morning roll call &amp; ECZ verification badge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Quick Student Switcher (if list provided) */}
          {students.length > 1 && onSelectStudent && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Select Student:
              </span>
              <select
                value={student.id}
                onChange={(e) => {
                  const s = students.find((st) => st.id === e.target.value);
                  if (s) onSelectStudent(s);
                }}
                className="bg-white dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {students.slice(0, 30).map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.stream} - ECZ: {st.eczExamNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Printable Digital ID Badge Card */}
          <div
            ref={cardRef}
            className={`rounded-2xl border-2 transition-all p-5 shadow-md relative overflow-hidden ${
              student.level === 'senior'
                ? 'bg-gradient-to-br from-white via-amber-50/40 to-emerald-50/60 dark:from-emerald-950 dark:via-emerald-900/60 dark:to-emerald-950 border-amber-400 dark:border-amber-600'
                : 'bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/60 dark:from-emerald-950 dark:via-emerald-900/60 dark:to-teal-950 border-emerald-400 dark:border-emerald-600'
            }`}
          >
            {/* Top Security Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-xs shadow-sm">
                  MSS
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
                    Mpatamatu Secondary School
                  </div>
                  <div className="text-[9px] font-semibold text-emerald-700/80 dark:text-emerald-300/80">
                    Ministry of Education &bull; Luanshya, Copperbelt
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-800/80 text-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-600">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                <span>Verified Active &bull; Term 3 2026</span>
              </div>
            </div>

            {/* Middle Section: Avatar + Details + Scannable QR */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
              
              {/* Student Photo / AI Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={student.avatar}
                    alt={student.fullName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-300 dark:border-emerald-700 shadow-md"
                  />
                  {student.avatarTierName && (
                    <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-emerald-950 font-black text-[9px] shadow-sm flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Lvl {student.gamification?.level || 1}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  {student.level === 'senior' ? 'Senior Secondary' : 'Junior Secondary'}
                </div>
              </div>

              {/* Student Details */}
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <h4 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50 leading-tight">
                  {student.fullName}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 sm:px-2.5 rounded-xl bg-white/80 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 min-w-0">
                    <span className="block text-[9px] font-bold uppercase text-emerald-700/70 dark:text-emerald-400">
                      ECZ Exam No:
                    </span>
                    <span className="font-mono font-black text-emerald-950 dark:text-emerald-100 text-[11px] sm:text-xs truncate block">
                      {student.eczExamNumber}
                    </span>
                  </div>

                  <div className="p-2 sm:px-2.5 rounded-xl bg-white/80 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 min-w-0">
                    <span className="block text-[9px] font-bold uppercase text-emerald-700/70 dark:text-emerald-400">
                      Grade &amp; Stream:
                    </span>
                    <span className="font-black text-emerald-950 dark:text-emerald-100 text-[11px] sm:text-xs truncate block">
                      Grade {student.grade} ({student.stream})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <span className="font-semibold">Parent / Guardian:</span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">{student.parentName}</span>
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="flex flex-col items-center bg-white p-3 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-inner">
                {isGenerating ? (
                  <div className="w-32 h-32 flex flex-col items-center justify-center text-emerald-700 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-[10px] font-bold">Generating QR...</span>
                  </div>
                ) : qrDataUrl ? (
                  <div className="relative group cursor-pointer" onClick={() => setIsFullscreenQr(!isFullscreenQr)}>
                    <img
                      src={qrDataUrl}
                      alt="Student Attendance QR Pass"
                      className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                    />
                    <div className="absolute inset-0 bg-emerald-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-[10px] font-bold gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Zoom</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-xs text-red-500 font-bold">
                    QR Error
                  </div>
                )}

                <div className="mt-1 text-[9px] font-mono font-bold text-emerald-900 uppercase tracking-wider text-center">
                  SCAN FOR ROLL CALL
                </div>
              </div>

            </div>

            {/* Bottom Security Footer */}
            <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
              <span className="font-mono">PASS ID: MSS-PASS-{student.id.toUpperCase()}</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Official Contactless Attendance Credential
              </span>
            </div>
          </div>

          {/* Fullscreen QR Popout View (When expanded for easy gate scanner detection) */}
          {isFullscreenQr && qrDataUrl && (
            <div className="p-6 rounded-2xl bg-white border-2 border-emerald-500 shadow-xl flex flex-col items-center space-y-3 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black uppercase text-emerald-950">
                  High-Visibility Scanner Mode (Hold near camera)
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullscreenQr(false)}
                  className="p-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              <img
                src={qrDataUrl}
                alt="Enlarged QR Code"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain p-2 bg-white rounded-xl shadow-inner border border-emerald-200"
              />

              <div className="text-center">
                <div className="font-black text-sm text-emerald-950">{student.fullName}</div>
                <div className="text-xs font-mono text-emerald-700">{student.eczExamNumber}</div>
              </div>
            </div>
          )}

          {/* Action Button Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download QR Code</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Student ID Pass</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPayload}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedCode ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-300">Payload Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy QR Token</span>
                </>
              )}
            </button>
          </div>

          {/* Instructional Help Note */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <School className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Contactless Roll Call Tip:</span> Students can save this QR code to their mobile device or print it on a lanyard badge. When entering the school gate or homeroom class, present this code to the roll call camera scanner for automatic check-in and +15 XP attendance rewards!
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
