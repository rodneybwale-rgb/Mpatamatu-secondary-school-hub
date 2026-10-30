import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEczGrade,
  computeTotalSubjectScore,
  calculateBestSixPoints,
  evaluateJuniorStatus,
  computeAttendanceRate,
  calculateGamificationLevel,
  calculateXpFromGrade,
  buildSubjectLeaderboard
} from './gradeCalculations';
import { SubjectGrade, StudentRecord } from '../types';

test('ECZ grading returns Distinction 1 for 85-100%', () => {
  const g1 = calculateEczGrade(92);
  assert.equal(g1.eczGrade, '1');
  assert.equal(g1.division, 'Distinction');

  const g2 = calculateEczGrade(85);
  assert.equal(g2.eczGrade, '1');
  assert.equal(g2.division, 'Distinction');
});

test('ECZ grading returns Distinction 2 for 75-84%', () => {
  const res = calculateEczGrade(78);
  assert.equal(res.eczGrade, '2');
  assert.equal(res.division, 'Distinction');
});

test('ECZ grading returns Merit and Credit accurately', () => {
  assert.equal(calculateEczGrade(72).eczGrade, '3');
  assert.equal(calculateEczGrade(68).eczGrade, '4');
  assert.equal(calculateEczGrade(60).eczGrade, '5');
  assert.equal(calculateEczGrade(52).eczGrade, '6');
});

test('Senior secondary best 6 points calculator computes correct aggregate', () => {
  const mockGrades: SubjectGrade[] = [
    {
      subjectId: '1',
      subjectName: 'English Language',
      continuousAssessment: 36,
      finalExam: 52,
      total: 88,
      eczGrade: '1',
      division: 'Distinction',
      teacherRemarks: 'Excellent',
      teacherName: 'Mrs. Chibwe',
      lastUpdated: '2026-10-15'
    },
    {
      subjectId: '2',
      subjectName: 'Mathematics',
      continuousAssessment: 38,
      finalExam: 55,
      total: 93,
      eczGrade: '1',
      division: 'Distinction',
      teacherRemarks: 'Brilliant',
      teacherName: 'Mr. Tembo',
      lastUpdated: '2026-10-15'
    },
    {
      subjectId: '3',
      subjectName: 'Physics',
      continuousAssessment: 34,
      finalExam: 48,
      total: 82,
      eczGrade: '2',
      division: 'Distinction',
      teacherRemarks: 'Very good',
      teacherName: 'Mr. Lungu',
      lastUpdated: '2026-10-15'
    },
    {
      subjectId: '4',
      subjectName: 'Chemistry',
      continuousAssessment: 32,
      finalExam: 45,
      total: 77,
      eczGrade: '2',
      division: 'Distinction',
      teacherRemarks: 'Great',
      teacherName: 'Mrs. Mwale',
      lastUpdated: '2026-10-15'
    },
    {
      subjectId: '5',
      subjectName: 'Biology',
      continuousAssessment: 30,
      finalExam: 42,
      total: 72,
      eczGrade: '3',
      division: 'Merit',
      teacherRemarks: 'Good',
      teacherName: 'Mr. Banda',
      lastUpdated: '2026-10-15'
    },
    {
      subjectId: '6',
      subjectName: 'Civic Education',
      continuousAssessment: 30,
      finalExam: 40,
      total: 70,
      eczGrade: '3',
      division: 'Merit',
      teacherRemarks: 'Solid',
      teacherName: 'Ms. Zulu',
      lastUpdated: '2026-10-15'
    }
  ];

  const result = calculateBestSixPoints(mockGrades);
  assert.equal(result.points, 12);
  assert.equal(result.status, 'Full Certificate (Distinction)');
});

test('Gamification level calculation properly calculates level and progress', () => {
  const lvl1 = calculateGamificationLevel(250);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.progressPercent, 50);

  const lvl5 = calculateGamificationLevel(2100);
  assert.equal(lvl5.level, 5);
  assert.equal(lvl5.nextLevelXp, 2500);
  assert.equal(lvl5.title, 'Master Explorer');
});

test('XP award for ECZ grades gives highest rewards to Distinctions', () => {
  assert.equal(calculateXpFromGrade('1'), 250);
  assert.equal(calculateXpFromGrade('2'), 180);
  assert.equal(calculateXpFromGrade('3'), 120);
  assert.equal(calculateXpFromGrade('6'), 70);
  assert.equal(calculateXpFromGrade('9'), 30);
});

test('Leaderboard correctly ranks top students', () => {
  const students: Partial<StudentRecord>[] = [
    {
      id: 's1',
      fullName: 'Alice',
      grade: 12,
      stream: '12A',
      avatar: '',
      grades: [{ subjectId: 'm', subjectName: 'Mathematics', total: 95, eczGrade: '1' } as any],
      gamification: { totalXp: 1500, level: 4, title: 'Hero', streakDays: 5, assignmentsCompleted: 10, badges: [] }
    },
    {
      id: 's2',
      fullName: 'Bob',
      grade: 12,
      stream: '12B',
      avatar: '',
      grades: [{ subjectId: 'm', subjectName: 'Mathematics', total: 80, eczGrade: '2' } as any],
      gamification: { totalXp: 2200, level: 5, title: 'Hero', streakDays: 7, assignmentsCompleted: 15, badges: [] }
    }
  ];

  const boardOverall = buildSubjectLeaderboard(students as StudentRecord[], 'all');
  assert.equal(boardOverall[0].studentName, 'Bob');
  assert.equal(boardOverall[0].rank, 1);

  const boardMath = buildSubjectLeaderboard(students as StudentRecord[], 'Mathematics');
  assert.equal(boardMath[0].studentName, 'Alice');
  assert.equal(boardMath[0].scoreOrXp, 95);
});

import { getAvatarTierForLevel, getAvatarImageForLevel, isTierUnlocked, AVATAR_TIERS } from './avatarSystem';

test('Avatar tier progression assigns appropriate AI avatars as gamification level increases', () => {
  // Level 1-2: Novice Scholar
  const tierLvl1 = getAvatarTierForLevel(1);
  assert.equal(tierLvl1.tierName, 'Novice Scholar');
  assert.equal(getAvatarTierForLevel(2).tierName, 'Novice Scholar');

  // Level 3-4: STEM & Robotics Explorer
  const tierLvl3 = getAvatarTierForLevel(3);
  assert.equal(tierLvl3.tierName, 'STEM & Robotics Explorer');
  assert.equal(getAvatarTierForLevel(4).tierName, 'STEM & Robotics Explorer');

  // Level 5-6: Senior Academic Luminary
  const tierLvl5 = getAvatarTierForLevel(5);
  assert.equal(tierLvl5.tierName, 'Senior Academic Luminary');

  // Level 7-8: Master Academic Champion
  const tierLvl7 = getAvatarTierForLevel(7);
  assert.equal(tierLvl7.tierName, 'Master Academic Champion');

  // Level 9+: Grand Academic Legend
  const tierLvl9 = getAvatarTierForLevel(9);
  assert.equal(tierLvl9.tierName, 'Grand Academic Legend');
  assert.equal(getAvatarTierForLevel(15).tierName, 'Grand Academic Legend');

  // Path check
  assert.ok(getAvatarImageForLevel(1).includes('avatar_novice_scholar'));
  assert.ok(getAvatarImageForLevel(9).includes('avatar_grand_legend'));
});

test('Avatar tier unlocking logic validates student level thresholds', () => {
  assert.equal(isTierUnlocked(1, 1), true);
  assert.equal(isTierUnlocked(1, 3), false);
  assert.equal(isTierUnlocked(4, 3), true);
  assert.equal(isTierUnlocked(4, 5), false);
  assert.equal(isTierUnlocked(9, 9), true);
});

