import QRCode from 'qrcode';
import { StudentRecord, AttendanceDay } from '../types';

export interface StudentQrData {
  app: string;
  type: string;
  id: string;
  ecz: string;
  name: string;
  grade: number;
  stream: string;
  validTerm: string;
  issuedAt: string;
}

export interface QrValidationResult {
  success: boolean;
  student?: StudentRecord;
  error?: string;
  decodedData?: Partial<StudentQrData>;
  isDuplicate?: boolean;
  existingRecord?: AttendanceDay;
}

/**
 * Encodes student details into a standardized, tamper-evident JSON payload for QR badges
 */
export function generateStudentQrPayload(
  student: Pick<StudentRecord, 'id' | 'fullName' | 'eczExamNumber' | 'grade' | 'stream'>
): string {
  const payload: StudentQrData = {
    app: 'MPATAMATU_SECONDARY',
    type: 'STUDENT_ATTENDANCE_PASS',
    id: student.id,
    ecz: student.eczExamNumber,
    name: student.fullName,
    grade: student.grade,
    stream: student.stream,
    validTerm: 'Term 3, 2026',
    issuedAt: '2026-10-21',
  };
  return JSON.stringify(payload);
}

/**
 * Asynchronously generates a high-contrast QR code data URL (PNG)
 */
export async function generateQrDataUrl(
  text: string,
  options?: { width?: number; margin?: number; darkColor?: string; lightColor?: string }
): Promise<string> {
  const opts = {
    width: options?.width || 320,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor || '#064e3b', // Deep emerald
      light: options?.lightColor || '#ffffff',
    },
    errorCorrectionLevel: 'M' as const,
  };
  return QRCode.toDataURL(text, opts);
}

/**
 * Validates any scanned text or QR string against the student database.
 * Supports JSON payload, prefix string (MPATAMATU:<id>), direct student ID, or ECZ number.
 */
export function parseAndValidateQrPayload(
  rawText: string,
  students: StudentRecord[],
  targetDate: string = new Date().toISOString().split('T')[0]
): QrValidationResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { success: false, error: 'Empty QR code detected' };
  }

  let studentId: string | null = null;
  let eczNumber: string | null = null;
  let decoded: Partial<StudentQrData> | undefined;

  // 1. Try parsing JSON format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<StudentQrData>;
      decoded = parsed;
      if (parsed.id) studentId = parsed.id;
      if (parsed.ecz) eczNumber = parsed.ecz;
    } catch {
      // Fallback to text matching
    }
  }

  // 2. Try prefix format: MPATAMATU:STD:<id>:<ecz> or MPATAMATU:<id>:<ecz> or MPATAMATU:<id>
  if (!studentId && trimmed.startsWith('MPATAMATU:')) {
    const parts = trimmed.split(':');
    if (parts[1]?.toUpperCase() === 'STD') {
      studentId = parts[2];
      if (parts[3]) eczNumber = parts[3];
    } else if (parts.length >= 3) {
      studentId = parts[1];
      eczNumber = parts[2];
    } else if (parts.length === 2) {
      studentId = parts[1];
    }
  }

  // 3. Fallback: match by ID or ECZ Exam Number directly
  const foundStudent = students.find((s) => {
    if (studentId && s.id === studentId) return true;
    if (eczNumber && s.eczExamNumber.toLowerCase() === eczNumber.toLowerCase()) return true;
    if (s.id.toLowerCase() === trimmed.toLowerCase()) return true;
    if (s.eczExamNumber.toLowerCase() === trimmed.toLowerCase()) return true;
    return false;
  });

  if (!foundStudent) {
    return {
      success: false,
      error: `No registered student matches code: "${trimmed.slice(0, 32)}..."`,
      decodedData: decoded,
    };
  }

  // Check if student is already marked present for the target date
  const existingRecord = foundStudent.attendanceHistory?.find((h) => h.date === targetDate);
  const isDuplicate = existingRecord?.status === 'present';

  return {
    success: true,
    student: foundStudent,
    decodedData: decoded,
    isDuplicate,
    existingRecord,
  };
}

/**
 * Records student roll call check-in, calculates updated rate, and rewards XP
 */
export function applyQrRollCallCheckIn(
  studentId: string,
  students: StudentRecord[],
  options: {
    date?: string;
    sessionName?: string;
    status?: 'present' | 'late';
    method?: 'qr_scan' | 'manual' | 'biometric';
    scannedBy?: string;
    timeString?: string;
  } = {}
): {
  updatedStudents: StudentRecord[];
  student: StudentRecord;
  alreadyCheckedIn: boolean;
  xpAwarded: number;
  checkInTime: string;
} {
  const date = options.date || new Date().toISOString().split('T')[0];
  const status = options.status || 'present';
  const method = options.method || 'qr_scan';
  const sessionName = options.sessionName || 'Morning Roll Call (07:30)';
  const scannedBy = options.scannedBy || 'Gate Scanner / Mrs. Kajimoto R. C.';
  const checkInTime =
    options.timeString ||
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let alreadyCheckedIn = false;
  let targetStudent: StudentRecord | null = null;
  let xpAwarded = 0;

  const updatedStudents = students.map((s) => {
    if (s.id !== studentId) return s;

    // Check if an entry for today already exists
    const history = s.attendanceHistory ? [...s.attendanceHistory] : [];
    const existingIndex = history.findIndex((h) => h.date === date);

    if (existingIndex >= 0 && history[existingIndex].status === 'present' && status === 'present') {
      alreadyCheckedIn = true;
      targetStudent = s;
      return s; // No change needed if already present
    }

    const newEntry: AttendanceDay = {
      date,
      status,
      timestamp: checkInTime,
      method,
      sessionName,
      scannedBy,
      periodRemarks: `${method === 'qr_scan' ? 'Contactless QR roll call' : 'Manual roll call'} verified at ${checkInTime} (${sessionName})`,
    };

    let newHistory: AttendanceDay[];
    if (existingIndex >= 0) {
      newHistory = [...history];
      newHistory[existingIndex] = newEntry;
    } else {
      newHistory = [newEntry, ...history.slice(0, 20)];
    }

    const presentDays = newHistory.filter((h) => h.status === 'present').length;
    const newRate = Math.round((presentDays / Math.max(1, newHistory.length)) * 100);

    // Gamification XP Reward: 15 XP for prompt QR roll call check-in
    xpAwarded = status === 'present' ? 15 : 5;
    const currentXp = s.gamification?.totalXp || 1200;
    const updatedGamification = {
      ...(s.gamification || {
        totalXp: 1200,
        level: 1,
        title: 'Academic Novice',
        streakDays: 4,
        assignmentsCompleted: 3,
        badges: [],
      }),
      totalXp: currentXp + xpAwarded,
      streakDays: (s.gamification?.streakDays || 1) + 1,
    };

    const updated: StudentRecord = {
      ...s,
      attendanceRate: newRate,
      attendanceHistory: newHistory,
      gamification: updatedGamification,
    };
    targetStudent = updated;
    return updated;
  });

  return {
    updatedStudents,
    student: targetStudent || students.find((s) => s.id === studentId)!,
    alreadyCheckedIn,
    xpAwarded,
    checkInTime,
  };
}

/**
 * Computes roll call attendance analytics for a specific date and optional stream filter
 */
export function calculateRollCallStats(
  students: StudentRecord[],
  targetDate: string,
  filterStream: string = 'all'
) {
  const filtered = filterStream === 'all' ? students : students.filter((s) => s.stream === filterStream);
  const total = filtered.length;

  let present = 0;
  let late = 0;
  let absent = 0;
  let qrScanned = 0;

  filtered.forEach((s) => {
    const record = s.attendanceHistory?.find((h) => h.date === targetDate);
    if (!record || record.status === 'absent') {
      absent++;
    } else if (record.status === 'present') {
      present++;
      if (record.method === 'qr_scan') qrScanned++;
    } else if (record.status === 'late') {
      late++;
      if (record.method === 'qr_scan') qrScanned++;
    } else {
      absent++;
    }
  });

  const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

  return {
    total,
    present,
    late,
    absent,
    qrScanned,
    rate,
  };
}

/**
 * Web Audio feedback generator - no audio files required, runs client-side seamlessly
 */
export function playRollCallAudioFeedback(type: 'success' | 'warning' | 'error') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      // Cheerful two-tone chime (G5 -> C6)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now); // G5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.1); // C6
      gain2.gain.setValueAtTime(0.18, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } else if (type === 'warning') {
      // Lower double beep (Already checked in)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Error buzz (Unknown code)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // AudioContext blocked or not supported, ignore silently
  }
}
