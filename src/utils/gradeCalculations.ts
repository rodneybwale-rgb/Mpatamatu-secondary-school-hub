import { SubjectGrade, GamificationProfile, Badge, LeaderboardEntry, StudentRecord } from '../types';

/**
 * Calculates the Examinations Council of Zambia (ECZ) standard grading:
 * Distinction:
 *  - 1: 85 - 100%
 *  - 2: 75 - 84%
 * Merit:
 *  - 3: 70 - 74%
 *  - 4: 65 - 69%
 * Credit:
 *  - 5: 55 - 64%
 *  - 6: 50 - 54%
 * Satisfactory:
 *  - 7: 45 - 49%
 *  - 8: 40 - 44%
 * Unsatisfactory:
 *  - 9: 0 - 39%
 */
export function calculateEczGrade(score: number): {
  eczGrade: string;
  division: 'Distinction' | 'Merit' | 'Credit' | 'Satisfactory' | 'Unsatisfactory';
} {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  if (clamped >= 85) return { eczGrade: '1', division: 'Distinction' };
  if (clamped >= 75) return { eczGrade: '2', division: 'Distinction' };
  if (clamped >= 70) return { eczGrade: '3', division: 'Merit' };
  if (clamped >= 65) return { eczGrade: '4', division: 'Merit' };
  if (clamped >= 55) return { eczGrade: '5', division: 'Credit' };
  if (clamped >= 50) return { eczGrade: '6', division: 'Credit' };
  if (clamped >= 45) return { eczGrade: '7', division: 'Satisfactory' };
  if (clamped >= 40) return { eczGrade: '8', division: 'Satisfactory' };
  return { eczGrade: '9', division: 'Unsatisfactory' };
}

/**
 * Total score = Continuous Assessment (CA out of 40) + Final Exam (out of 60)
 */
export function computeTotalSubjectScore(ca: number, exam: number): number {
  const safeCa = Math.max(0, Math.min(40, ca));
  const safeExam = Math.max(0, Math.min(60, exam));
  return safeCa + safeExam;
}

/**
 * ECZ Best 6 Points Calculator for Senior Secondary Certificate
 */
export function calculateBestSixPoints(grades: SubjectGrade[]): {
  points: number;
  status: 'Full Certificate (Distinction)' | 'Full Certificate (Merit)' | 'Full Certificate (Credit)' | 'General Certificate';
  bestSubjects: SubjectGrade[];
} {
  if (!grades || grades.length === 0) {
    return { points: 0, status: 'General Certificate', bestSubjects: [] };
  }

  const english = grades.find(g => g.subjectName.toLowerCase().includes('english'));
  const others = grades.filter(g => !english || g.subjectId !== english.subjectId);

  const sortedOthers = [...others].sort((a, b) => Number(a.eczGrade) - Number(b.eczGrade));

  const chosen: SubjectGrade[] = [];
  if (english) {
    chosen.push(english);
  }

  const needed = 6 - chosen.length;
  chosen.push(...sortedOthers.slice(0, needed));

  const points = chosen.reduce((sum, g) => sum + Number(g.eczGrade), 0);

  let status: 'Full Certificate (Distinction)' | 'Full Certificate (Merit)' | 'Full Certificate (Credit)' | 'General Certificate';
  if (points >= 6 && points <= 12) {
    status = 'Full Certificate (Distinction)';
  } else if (points <= 24) {
    status = 'Full Certificate (Merit)';
  } else if (points <= 36) {
    status = 'Full Certificate (Credit)';
  } else {
    status = 'General Certificate';
  }

  return { points, status, bestSubjects: chosen };
}

/**
 * Junior Secondary Certificate evaluation
 */
export function evaluateJuniorStatus(grades: SubjectGrade[]): {
  average: number;
  passed: boolean;
  divisionRemarks: string;
} {
  if (!grades || grades.length === 0) {
    return { average: 0, passed: false, divisionRemarks: 'No records available' };
  }

  const total = grades.reduce((acc, g) => acc + g.total, 0);
  const average = Math.round((total / grades.length) * 10) / 10;

  const english = grades.find(g => g.subjectName.toLowerCase().includes('english'));
  const math = grades.find(g => g.subjectName.toLowerCase().includes('math'));

  const corePassed = (!english || english.total >= 50) && (!math || math.total >= 50);
  const passed = average >= 50 && corePassed;

  let divisionRemarks = '';
  if (average >= 75) divisionRemarks = 'Division 1 (Distinction Honors)';
  else if (average >= 65) divisionRemarks = 'Division 2 (Merit)';
  else if (average >= 50) divisionRemarks = 'Division 3 (Credit Pass)';
  else divisionRemarks = 'Division 4 (Needs Academic Support)';

  return { average, passed, divisionRemarks };
}

/**
 * Calculates overall attendance rate from history array
 */
export function computeAttendanceRate(
  history: Array<{ status: 'present' | 'absent' | 'late' | 'excused' }>
): number {
  if (!history || history.length === 0) return 100;
  let scoreSum = 0;
  for (const day of history) {
    if (day.status === 'present') scoreSum += 1.0;
    else if (day.status === 'late') scoreSum += 0.8;
    else if (day.status === 'excused') scoreSum += 0.9;
  }
  return Math.round((scoreSum / history.length) * 100);
}

/**
 * Gamification: Computes level and title based on XP
 * Every 500 XP = 1 Level
 */
export function calculateGamificationLevel(xp: number): {
  level: number;
  title: string;
  nextLevelXp: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, xp);
  const level = Math.floor(safeXp / 500) + 1;
  const currentLevelBase = (level - 1) * 500;
  const nextLevelXp = level * 500;
  const progressPercent = Math.min(100, Math.round(((safeXp - currentLevelBase) / 500) * 100));

  let title = 'Scholar Apprentice';
  if (level >= 10) title = 'Grand Academic Luminary';
  else if (level >= 8) title = 'Distinguished Scholar';
  else if (level >= 6) title = 'Senior Honor Student';
  else if (level >= 4) title = 'Master Explorer';
  else if (level >= 2) title = 'Active Learner';

  return { level, title, nextLevelXp, progressPercent };
}

/**
 * Calculates XP reward for a grade update:
 * Distinction 1 gives 250 XP
 * Distinction 2 gives 180 XP
 * Merit 3-4 gives 120 XP
 * Credit 5-6 gives 70 XP
 */
export function calculateXpFromGrade(eczGrade: string): number {
  if (eczGrade === '1') return 250;
  if (eczGrade === '2') return 180;
  if (eczGrade === '3' || eczGrade === '4') return 120;
  if (eczGrade === '5' || eczGrade === '6') return 70;
  return 30; // Effort reward
}

/**
 * Computes Leaderboard for subject or overall XP
 */
export function buildSubjectLeaderboard(
  students: StudentRecord[],
  subjectFilter?: string,
  limit = 10
): LeaderboardEntry[] {
  if (!students || students.length === 0) return [];

  const mapped = students.map((std) => {
    let scoreOrXp = std.gamification?.totalXp || 0;
    if (subjectFilter && subjectFilter !== 'all') {
      const matchSub = std.grades.find(g =>
        g.subjectName.toLowerCase().includes(subjectFilter.toLowerCase())
      );
      scoreOrXp = matchSub ? matchSub.total : 0;
    }

    return {
      studentId: std.id,
      studentName: std.fullName,
      grade: std.grade,
      stream: std.stream,
      avatar: std.avatar,
      subjectName: subjectFilter && subjectFilter !== 'all' ? subjectFilter : 'Overall XP',
      scoreOrXp,
      badgesCount: std.gamification?.badges?.length || 0,
      trend: 'up' as const,
    };
  });

  // Sort descending
  mapped.sort((a, b) => b.scoreOrXp - a.scoreOrXp);

  return mapped.slice(0, limit).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

/**
 * Formats Zambian Kwacha (ZMW) currency
 */
export function formatZMW(amount: number): string {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
  }).format(amount).replace('ZMW', 'K');
}
