import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateStudentQrPayload,
  parseAndValidateQrPayload,
  applyQrRollCallCheckIn,
  calculateRollCallStats,
} from './qrAttendanceSystem';
import { StudentRecord } from '../types';

const mockStudents: StudentRecord[] = [
  {
    id: 'std_test_1',
    fullName: 'Natasha Musonda',
    gender: 'F',
    dob: '2008-04-12',
    level: 'senior',
    grade: 12,
    stream: '12 Science A',
    eczExamNumber: '2026/12/0118',
    parentName: 'Mr. Joseph Musonda',
    parentPhone: '+260977229104',
    parentEmail: 'jmusonda@gmail.com',
    avatar: '/avatar.jpg',
    attendanceRate: 90,
    attendanceHistory: [
      { date: '2026-10-20', status: 'present' },
      { date: '2026-10-19', status: 'present' },
    ],
    grades: [],
    clubs: [],
    conduct: 'Exemplary',
    termFeesPaid: true,
    balanceZMW: 0,
    gamification: {
      totalXp: 1500,
      level: 2,
      title: 'Senior Scholar',
      streakDays: 5,
      assignmentsCompleted: 4,
      badges: [],
    },
  },
  {
    id: 'std_test_2',
    fullName: 'Chileshe Mulenga',
    gender: 'M',
    dob: '2011-08-20',
    level: 'junior',
    grade: 9,
    stream: '9B',
    eczExamNumber: '2026/09/0421',
    parentName: 'Mrs. Gertrude Mulenga',
    parentPhone: '+260979401289',
    parentEmail: 'g.mulenga@gmail.com',
    avatar: '/avatar2.jpg',
    attendanceRate: 85,
    attendanceHistory: [],
    grades: [],
    clubs: [],
    conduct: 'Very Good',
    termFeesPaid: true,
    balanceZMW: 0,
    gamification: {
      totalXp: 900,
      level: 1,
      title: 'Junior Novice',
      streakDays: 2,
      assignmentsCompleted: 2,
      badges: [],
    },
  },
];

test('generateStudentQrPayload produces valid JSON payload with required attributes', () => {
  const payload = generateStudentQrPayload(mockStudents[0]);
  assert.ok(payload.length > 0);
  const parsed = JSON.parse(payload);
  assert.equal(parsed.app, 'MPATAMATU_SECONDARY');
  assert.equal(parsed.id, 'std_test_1');
  assert.equal(parsed.ecz, '2026/12/0118');
  assert.equal(parsed.grade, 12);
});

test('parseAndValidateQrPayload parses JSON payload successfully', () => {
  const payload = generateStudentQrPayload(mockStudents[0]);
  const result = parseAndValidateQrPayload(payload, mockStudents, '2026-10-21');
  assert.equal(result.success, true);
  assert.equal(result.student?.id, 'std_test_1');
  assert.equal(result.student?.fullName, 'Natasha Musonda');
  assert.equal(result.isDuplicate, false);
});

test('parseAndValidateQrPayload recognizes prefix and plain ECZ number', () => {
  // Test plain ECZ number
  const result1 = parseAndValidateQrPayload('2026/09/0421', mockStudents, '2026-10-21');
  assert.equal(result1.success, true);
  assert.equal(result1.student?.id, 'std_test_2');

  // Test prefix format
  const result2 = parseAndValidateQrPayload('MPATAMATU:std_test_1:2026/12/0118', mockStudents, '2026-10-21');
  assert.equal(result2.success, true);
  assert.equal(result2.student?.id, 'std_test_1');
});

test('parseAndValidateQrPayload fails gracefully on unknown code', () => {
  const result = parseAndValidateQrPayload('INVALID_CODE_9999', mockStudents, '2026-10-21');
  assert.equal(result.success, false);
  assert.ok(result.error?.includes('No registered student'));
});

test('applyQrRollCallCheckIn updates student attendance and awards gamification XP', () => {
  const res = applyQrRollCallCheckIn('std_test_2', mockStudents, {
    date: '2026-10-21',
    sessionName: 'Morning Roll Call (07:30)',
    status: 'present',
    scannedBy: 'Gate Scanner #1',
  });

  assert.equal(res.alreadyCheckedIn, false);
  assert.equal(res.xpAwarded, 15);
  assert.equal(res.student.gamification.totalXp, 915);
  assert.equal(res.student.gamification.streakDays, 3);

  const checkinEntry = res.student.attendanceHistory[0];
  assert.equal(checkinEntry.date, '2026-10-21');
  assert.equal(checkinEntry.status, 'present');
  assert.equal(checkinEntry.method, 'qr_scan');
});

test('applyQrRollCallCheckIn flags duplicate check-in if student already checked in', () => {
  // First check in
  const res1 = applyQrRollCallCheckIn('std_test_1', mockStudents, {
    date: '2026-10-21',
    status: 'present',
  });

  // Second check in with the updated list
  const res2 = applyQrRollCallCheckIn('std_test_1', res1.updatedStudents, {
    date: '2026-10-21',
    status: 'present',
  });

  assert.equal(res2.alreadyCheckedIn, true);
});

test('calculateRollCallStats computes accurate metrics for a date', () => {
  const testList: StudentRecord[] = [
    {
      ...mockStudents[0],
      attendanceHistory: [{ date: '2026-10-21', status: 'present', method: 'qr_scan' }],
    },
    {
      ...mockStudents[1],
      attendanceHistory: [{ date: '2026-10-21', status: 'late', method: 'qr_scan' }],
    },
  ];

  const stats = calculateRollCallStats(testList, '2026-10-21');
  assert.equal(stats.total, 2);
  assert.equal(stats.present, 1);
  assert.equal(stats.late, 1);
  assert.equal(stats.absent, 0);
  assert.equal(stats.qrScanned, 2);
});
