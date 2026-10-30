import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Printer,
  Upload,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { StudentRecord, User } from '../../types';
import {
  parseAndValidateQrPayload,
  applyQrRollCallCheckIn,
  calculateRollCallStats,
  playRollCallAudioFeedback,
} from '../../utils/qrAttendanceSystem';
import { StudentQrCardModal } from '../StudentQrCardModal';

interface AttendanceViewProps {
  currentUser: User | null;
  students: StudentRecord[];
  onUpdateStudents: (updatedStudents: StudentRecord[]) => void;
  onSelectStudent: (student: StudentRecord) => void;
  onTriggerNotification: (notif: {
    title: string;
    body: string;
    type: 'attendance';
    linkAction: 'attendance';
    priority: 'normal' | 'high';
  }) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  students,
  onUpdateStudents,
  onSelectStudent,
  onTriggerNotification,
}) => {
  // Roll Call Session Configuration
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sessionName, setSessionName] = useState<string>('Morning Roll Call (07:30)');
  const [scanMode, setScanMode] = useState<'present' | 'late'>('present');
  const [continuousScan, setContinuousScan] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scanner States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  // Scan Validation Result Banner
  const [lastScanResult, setLastScanResult] = useState<{
    status: 'success' | 'duplicate' | 'error';
    student?: StudentRecord;
    message: string;
    timestamp: string;
    xpAwarded?: number;
  } | null>(null);

  // QR Modal for viewing student badge
  const [modalStudent, setModalStudent] = useState<StudentRecord | null>(null);

  // Register Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [streamFilter, setStreamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Camera & Canvas DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isScanningLockedRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate live statistics for selected date
  const stats = calculateRollCallStats(students, selectedDate, streamFilter);

  // Available streams for filtering
  const allStreams = Array.from(new Set(students.map((s) => s.stream))).sort();

  // Handle successful validation of a student QR string
  const handleProcessQrString = (rawText: string) => {
    if (isScanningLockedRef.current) return;

    // Lock temporarily to avoid duplicate frame triggers
    isScanningLockedRef.current = true;

    const validation = parseAndValidateQrPayload(rawText, students, selectedDate);

    if (!validation.success || !validation.student) {
      if (soundEnabled) playRollCallAudioFeedback('error');
      setLastScanResult({
        status: 'error',
        message: validation.error || 'Invalid or unrecognized QR code format.',
        timestamp: new Date().toLocaleTimeString('en-GB'),
      });

      setTimeout(() => {
        isScanningLockedRef.current = false;
      }, 1200);
      return;
    }

    const matchedStudent = validation.student;

    // Check if duplicate
    if (validation.isDuplicate && scanMode === 'present') {
      if (soundEnabled) playRollCallAudioFeedback('warning');
      const existing = validation.existingRecord;
      setLastScanResult({
        status: 'duplicate',
        student: matchedStudent,
        message: `${matchedStudent.fullName} was already checked in at ${
          existing?.timestamp || 'morning roll call'
        }.`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
      });

      setTimeout(() => {
        isScanningLockedRef.current = false;
      }, 1500);
      return;
    }

    // Apply check-in
    const checkin = applyQrRollCallCheckIn(matchedStudent.id, students, {
      date: selectedDate,
      sessionName,
      status: scanMode,
      scannedBy: currentUser?.name || 'Gate Scanner / Admin',
    });

    onUpdateStudents(checkin.updatedStudents);

    if (soundEnabled) playRollCallAudioFeedback('success');

    setLastScanResult({
      status: 'success',
      student: checkin.student,
      message: `${checkin.student.fullName} validated as ${scanMode.toUpperCase()}!`,
      timestamp: checkin.checkInTime,
      xpAwarded: checkin.xpAwarded,
    });

    // Dispatch parent and administrative notification
    onTriggerNotification({
      title: 'Roll Call Check-In Verified',
      body: `${checkin.student.fullName} (${checkin.student.stream}) marked ${scanMode.toUpperCase()} at ${checkin.checkInTime} via Contactless QR Scanner.`,
      type: 'attendance',
      linkAction: 'attendance',
      priority: 'normal',
    });

    // Release scan lock after delay for smooth user feedback
    setTimeout(() => {
      isScanningLockedRef.current = false;
      if (!continuousScan) {
        stopCamera();
      }
    }, 1800);
  };

  // Start Webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable:', err);
      const msg = err instanceof Error ? err.message : 'Camera hardware unavailable';
      setCameraError(
        `Unable to access camera (${msg}). You can still use the Photo Upload, Simulation Buttons, or Manual ECZ Code entry below!`
      );
      setIsCameraActive(false);
    }
  };

  // Stop Webcam stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Continuous frame scanning loop with jsQR
  useEffect(() => {
    let active = true;

    const scanFrame = () => {
      if (!active || !isCameraActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data && !isScanningLockedRef.current) {
              handleProcessQrString(code.data);
            }
          } catch (e) {
            // Ignore frame capture hiccups
          }
        }
      }

      if (active && isCameraActive) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    };

    if (isCameraActive) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    }

    return () => {
      active = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isCameraActive, students, selectedDate, scanMode, sessionName]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle uploaded QR code image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleProcessQrString(code.data);
        } else {
          if (soundEnabled) playRollCallAudioFeedback('error');
          setLastScanResult({
            status: 'error',
            message: 'No readable QR code found in the uploaded image. Please try another photo.',
            timestamp: new Date().toLocaleTimeString('en-GB'),
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Manual roll call submission (ECZ or Student ID)
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleProcessQrString(manualCodeInput.trim());
    setManualCodeInput('');
  };

  // Quick Simulation Triggers for seamless testing
  const handleSimulateScan = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    if (!st) return;
    // Pass raw JSON or ID
    handleProcessQrString(st.id);
  };

  // Export attendance register to CSV
  const handleExportCsv = () => {
    const headers = ['Student ID', 'Full Name', 'Grade', 'Stream', 'ECZ Exam Number', 'Date', 'Status', 'Check-In Time', 'Method'];
    const rows = students.map((s) => {
      const record = s.attendanceHistory?.find((h) => h.date === selectedDate);
      return [
        s.id,
        `"${s.fullName}"`,
        s.grade,
        `"${s.stream}"`,
        s.eczExamNumber,
        selectedDate,
        record?.status || 'absent',
        record?.timestamp || '--',
        record?.method || 'manual',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mpatamatu_RollCall_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students for the daily register table
  const filteredStudents = students.filter((s) => {
    if (gradeFilter !== 'all' && s.grade.toString() !== gradeFilter) return false;
    if (streamFilter !== 'all' && s.stream !== streamFilter) return false;

    const record = s.attendanceHistory?.find((h) => h.date === selectedDate);
    const currentStatus = record ? record.status : 'absent';

    if (statusFilter !== 'all' && currentStatus !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.eczExamNumber.toLowerCase().includes(q) ||
        s.stream.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Module Title Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold mb-2">
            <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Smart Campus Contactless Attendance System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
            Student QR Roll Call &amp; Validation Gate
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-1 max-w-2xl">
            High-speed optical roll call scanner for homeroom teachers, school gates, and examination halls. Automatically validates identity and updates parental notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-500'
            }`}
            title="Toggle Audio Feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Mute'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Real-time Attendance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Total Enrolled</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-50 mt-1">
            {stats.total}
          </div>
          <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400 mt-0.5">
            Mpatamatu Registry
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.present}
          </div>
          <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400 mt-0.5">
            {stats.qrScanned} Scanned via QR
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-amber-200 dark:border-amber-800/60 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
            <span>Late Check-Ins</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.late}
          </div>
          <div className="text-[10px] text-amber-700/80 dark:text-amber-400 mt-0.5">
            Grace Period Marked
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-red-200 dark:border-red-900/40 shadow-sm">
          <div className="flex items-center justify-between text-red-700 dark:text-red-400 text-xs font-bold uppercase">
            <span>Unchecked / Absent</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {stats.absent}
          </div>
          <div className="text-[10px] text-red-700/80 dark:text-red-400 mt-0.5">
            Pending validation
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Roll Call Rate</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-50 mt-1">
            {stats.rate}%
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">
            {stats.rate >= 90 ? '🌟 Excellent' : 'In Progress'}
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner Chamber & Session Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Optical Scanner Chamber (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                    Optical QR Code Scanner Chamber
                  </h3>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                    Point student badge or screen toward camera for instant verification
                  </p>
                </div>
              </div>

              {/* Camera Switcher / Toggle */}
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                        setTimeout(startCamera, 100);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                    >
                      Flip Camera
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Stop Camera</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activate Live Camera</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport / Viewfinder */}
            <div className="relative rounded-2xl overflow-hidden bg-emerald-950 aspect-video flex items-center justify-center border-2 border-emerald-300/60 dark:border-emerald-700 shadow-inner">
              
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  {/* Hidden canvas used by jsQR for pixel processing */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Optical Targeting Reticle & Laser Sweep Animation */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400 rounded-3xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      {/* Corner Target Marks */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                      {/* Sweeping Laser Bar */}
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-200 text-[10px] font-mono font-bold tracking-wider backdrop-blur-sm">
                    SCANNER READY &bull; REAL-TIME DECODER ACTIVE
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-900/80 border border-emerald-700 text-emerald-300 flex items-center justify-center mx-auto shadow-md">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-100">
                      Camera Scanner is Currently Idle
                    </h4>
                    <p className="text-xs text-emerald-400/80 max-w-sm mt-1">
                      Click "Activate Live Camera" to begin scanning student badges, or use the fast simulation buttons below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Launch Camera Scanner</span>
                  </button>
                </div>
              )}

            </div>

            {/* Camera error message fallback */}
            {cameraError && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Camera Notice</div>
                  <div className="text-[11px] mt-0.5">{cameraError}</div>
                </div>
              </div>
            )}

            {/* Scan Feedback Banner */}
            {lastScanResult && (
              <div
                className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 shadow-md animate-in slide-in-from-top-2 duration-200 ${
                  lastScanResult.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-400 text-emerald-950 dark:text-emerald-50'
                    : lastScanResult.status === 'duplicate'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-950 dark:text-amber-50'
                    : 'bg-red-50 dark:bg-red-950/50 border-red-400 text-red-950 dark:text-red-50'
                }`}
              >
                {lastScanResult.student ? (
                  <img
                    src={lastScanResult.student.avatar}
                    alt={lastScanResult.student.fullName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-300 dark:border-emerald-700 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-emerald-950/60 border">
                      {lastScanResult.status === 'success'
                        ? 'Check-In Confirmed'
                        : lastScanResult.status === 'duplicate'
                        ? 'Duplicate Warning'
                        : 'Scan Rejected'}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
                      {lastScanResult.timestamp}
                    </span>
                  </div>

                  <div className="font-black text-sm sm:text-base mt-1 truncate">
                    {lastScanResult.student?.fullName || 'Validation Alert'}
                  </div>

                  <div className="text-xs text-emerald-800/90 dark:text-emerald-200/90 mt-0.5">
                    {lastScanResult.message}
                  </div>

                  {lastScanResult.student && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800/60 font-mono font-bold">
                        ECZ: {lastScanResult.student.eczExamNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800/60 font-bold">
                        {lastScanResult.student.stream}
                      </span>
                      {lastScanResult.xpAwarded && (
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-emerald-950 font-black flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>+{lastScanResult.xpAwarded} XP Awarded</span>
                        </span>
                      )}
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Parent SMS/Push Dispatched
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alternative Input Tools: Photo Upload, Simulation Buttons & Manual Entry */}
            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800 space-y-3">
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate / Fast Roll Call Testing Options</span>
              </div>

              {/* Fast Barcode Simulator Clickers */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('std_senior_1')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-700 transition-colors flex items-center gap-1"
                >
                  <span>Simulate: Natasha (12A)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateScan('std_junior_1')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>Simulate: Chileshe (9B)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Pick a student who has not checked in today yet
                    const unchecked = students.find(
                      (s) => !s.attendanceHistory?.some((h) => h.date === selectedDate)
                    );
                    if (unchecked) handleSimulateScan(unchecked.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-emerald-900 hover:bg-emerald-50 text-emerald-900 dark:text-emerald-100 text-xs font-bold border border-emerald-300 dark:border-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>Simulate Next Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProcessQrString('INVALID_CODE_XYZ_999')}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  <span>Simulate Unknown Code</span>
                </button>
              </div>

              {/* Upload QR Image file or manual code entry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* File Upload */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload QR Image / Photo</span>
                  </button>
                </div>

                {/* Manual Text Form */}
                <form onSubmit={handleManualSubmit} className="flex gap-1.5">
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Enter ECZ No. / Student ID..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-xs font-semibold text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    Validate
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Roll Call Session Settings & Mode (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-800">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                Roll Call Session Settings
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Date Selector */}
              <div>
                <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Roll Call Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/40 font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Session Selector */}
              <div>
                <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Active Period / Station:
                </label>
                <select
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950 font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Morning Roll Call (07:30)">Morning Homeroom Roll Call (07:30)</option>
                  <option value="Main Gate Arrival Check">School Gate Entry Scanner (07:00 - 08:00)</option>
                  <option value="Afternoon Session (13:30)">Afternoon Session (13:30)</option>
                  <option value="Evening Prep Period">Evening Study Hall Prep (16:30)</option>
                  <option value="ECZ National Examination Entry">ECZ National Exam Hall Entry Verification</option>
                </select>
              </div>

              {/* Check-In Mode (Present vs Late) */}
              <div>
                <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Check-In Status Attribution:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScanMode('present')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      scanMode === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>On Time (Present)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScanMode('late')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      scanMode === 'late'
                        ? 'bg-amber-500 text-emerald-950 shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tardy (Late)</span>
                  </button>
                </div>
              </div>

              {/* Continuous Gate Duty Toggle */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950 dark:text-emerald-100">
                    Continuous Gate Mode
                  </div>
                  <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
                    Keep camera scanning stream without pausing
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={continuousScan}
                  onChange={(e) => setContinuousScan(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

            </div>

            {/* Quick Student ID Pass Opener */}
            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800">
              <button
                type="button"
                onClick={() => setModalStudent(students[0])}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Open Student Digital QR ID Pass Maker</span>
              </button>
            </div>

          </div>

          {/* Gamification Incentive Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 shadow-sm space-y-2.5 border border-emerald-700">
            <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Contactless XP Incentive</span>
            </div>
            <h4 className="font-black text-base text-white">
              Prompt Attendance Streak System
            </h4>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Every student who validates their presence via the contactless QR scanner earns <strong className="text-amber-300">+15 XP</strong> toward their next AI Avatar evolution tier and extends their consecutive attendance streak.
            </p>
          </div>

        </div>

      </div>

      {/* Daily Roll Call Register & Verification Logs */}
      <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-5 sm:p-6 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-800">
          <div>
            <h3 className="font-extrabold text-base text-emerald-950 dark:text-emerald-50">
              Daily Attendance Register &bull; {selectedDate}
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
              Showing {filteredStudents.length} students enrolled in selected filters
            </p>
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('present')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'present'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              Present ({stats.present})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('late')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'late'
                  ? 'bg-amber-500 text-emerald-950'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
              }`}
            >
              Late ({stats.late})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('absent')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'absent'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 dark:bg-red-900/60 text-red-900 dark:text-red-200'
              }`}
            >
              Unchecked ({stats.absent})
            </button>
          </div>
        </div>

        {/* Search & Stream Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, ECZ, or stream..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-xs font-semibold text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
              Grade:
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-xs font-semibold text-emerald-950 dark:text-emerald-100"
            >
              <option value="all">All Grades (8-12)</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
              Stream:
            </label>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-xs font-semibold text-emerald-950 dark:text-emerald-100"
            >
              <option value="all">All Streams</option>
              {allStreams.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-50/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-extrabold border-b border-emerald-200 dark:border-emerald-800">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">ECZ Exam Number</th>
                <th className="py-3 px-3">Grade &amp; Stream</th>
                <th className="py-3 px-3">Roll Call Status</th>
                <th className="py-3 px-3">Check-In Time</th>
                <th className="py-3 px-3">Validation Method</th>
                <th className="py-3 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60 font-medium">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-emerald-700 dark:text-emerald-400">
                    No students match the selected roll call filter.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => {
                  const dayRecord = st.attendanceHistory?.find((h) => h.date === selectedDate);
                  const isPresent = dayRecord?.status === 'present';
                  const isLate = dayRecord?.status === 'late';
                  const isAbsent = !dayRecord || dayRecord.status === 'absent';

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={st.avatar}
                            alt={st.fullName}
                            className="w-8 h-8 rounded-lg object-cover border border-emerald-200 dark:border-emerald-700"
                          />
                          <div>
                            <div className="font-bold text-emerald-950 dark:text-emerald-100">
                              {st.fullName}
                            </div>
                            <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400">
                              Parent: {st.parentName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-900 dark:text-emerald-200">
                        {st.eczExamNumber}
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-emerald-950 dark:text-emerald-100">
                        {st.stream} (Gr {st.grade})
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                              : isLate
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Present</span>
                            </>
                          ) : isLate ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Late</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-red-500" />
                              <span>Unchecked</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-900 dark:text-emerald-200">
                        {dayRecord?.timestamp || '--'}
                      </td>

                      <td className="py-2.5 px-3">
                        {dayRecord?.method === 'qr_scan' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                            <QrCode className="w-3 h-3" />
                            <span>Contactless QR</span>
                          </span>
                        ) : dayRecord ? (
                          <span className="text-[10px] text-emerald-600">Manual Entry</span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">--</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Manual Toggle */}
                          <button
                            type="button"
                            title="Mark Present"
                            onClick={() => {
                              const res = applyQrRollCallCheckIn(st.id, students, {
                                date: selectedDate,
                                sessionName,
                                status: 'present',
                                method: 'manual',
                              });
                              onUpdateStudents(res.updatedStudents);
                            }}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                              isPresent
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-white dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            title="Mark Late"
                            onClick={() => {
                              const res = applyQrRollCallCheckIn(st.id, students, {
                                date: selectedDate,
                                sessionName,
                                status: 'late',
                                method: 'manual',
                              });
                              onUpdateStudents(res.updatedStudents);
                            }}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                              isLate
                                ? 'bg-amber-500 text-emerald-950 border-amber-600'
                                : 'bg-white dark:bg-emerald-900 text-amber-700 dark:text-amber-300 border-amber-300 hover:bg-amber-50'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                          </button>

                          {/* View QR Code Pass */}
                          <button
                            type="button"
                            onClick={() => setModalStudent(st)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                            title="View Student QR Attendance Pass"
                          >
                            <QrCode className="w-3 h-3" />
                            <span className="hidden xl:inline text-[10px]">QR Pass</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-emerald-100 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 disabled:opacity-40 hover:bg-emerald-100"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 disabled:opacity-40 hover:bg-emerald-100"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

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
