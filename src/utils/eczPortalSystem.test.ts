import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeExamNumber,
  getEczSubjectCode,
  queryEczCandidate,
  buildStatementOfResults,
  validateCenterNumber,
} from './eczPortalSystem';
import { StudentRecord } from '../types';

const mockStudents: StudentRecord[] = [
  {
    id: 'std_test_senior',
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
    attendanceRate: 98,
    attendanceHistory: [],
    grades: [
      {
        subjectId: 'sub_1',
        subjectName: 'English Language (1121)',
        continuousAssessment: 38,
        finalExam: 57,
        total: 95,
        eczGrade: '1',
        division: 'Distinction',
        teacherRemarks: 'Brilliant mastery',
        teacherName: 'Mrs. Tembo',
        lastUpdated: '2026-10-18',
      },
      {
        subjectId: 'sub_2',
        subjectName: 'Mathematics (4024)',
        continuousAssessment: 39,
        finalExam: 56,
        total: 95,
        eczGrade: '1',
        division: 'Distinction',
        teacherRemarks: 'Excellent problem solving',
        teacherName: 'Mr. Banda',
        lastUpdated: '2026-10-18',
      },
      {
        subjectId: 'sub_3',
        subjectName: 'Physics (5054)',
        continuousAssessment: 37,
        finalExam: 55,
        total: 92,
        eczGrade: '1',
        division: 'Distinction',
        teacherRemarks: 'Top practical score',
        teacherName: 'Mr. Tembo',
        lastUpdated: '2026-10-18',
      },
      {
        subjectId: 'sub_4',
        subjectName: 'Chemistry (5070)',
        continuousAssessment: 36,
        finalExam: 53,
        total: 89,
        eczGrade: '1',
        division: 'Distinction',
        teacherRemarks: 'Outstanding analytical skills',
        teacherName: 'Mr. Tembo',
        lastUpdated: '2026-10-18',
      },
      {
        subjectId: 'sub_5',
        subjectName: 'Biology (5090)',
        continuousAssessment: 35,
        finalExam: 52,
        total: 87,
        eczGrade: '1',
        division: 'Distinction',
        teacherRemarks: 'Exceptional diagram drawing',
        teacherName: 'Mrs. Mwansa',
        lastUpdated: '2026-10-18',
      },
      {
        subjectId: 'sub_6',
        subjectName: 'Computer Studies (7010)',
        continuousAssessment: 38,
        finalExam: 56,
        total: 94,
        eczGrade: '1',
        division: 'Distinction',
        teacherRemarks: 'Superb programming',
        teacherName: 'Mr. Rodney Bwale',
        lastUpdated: '2026-10-18',
      },
    ],
    clubs: [],
    conduct: 'Exemplary',
    termFeesPaid: true,
    balanceZMW: 0,
    gamification: {
      totalXp: 2800,
      level: 6,
      title: 'Senior Luminary',
      streakDays: 14,
      assignmentsCompleted: 12,
      badges: [],
    },
  },
  {
    id: 'std_test_junior',
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
    attendanceRate: 92,
    attendanceHistory: [],
    grades: [
      {
        subjectId: 'jsub_1',
        subjectName: 'English Language',
        continuousAssessment: 32,
        finalExam: 48,
        total: 80,
        eczGrade: '2',
        division: 'Distinction',
        teacherRemarks: 'Great essays',
        teacherName: 'Mrs. Banda',
        lastUpdated: '2026-10-18',
      },
      {
        subjectId: 'jsub_2',
        subjectName: 'Mathematics',
        continuousAssessment: 30,
        finalExam: 45,
        total: 75,
        eczGrade: '2',
        division: 'Distinction',
        teacherRemarks: 'Good algebra',
        teacherName: 'Mr. Tembo',
        lastUpdated: '2026-10-18',
      },
    ],
    clubs: [],
    conduct: 'Very Good',
    termFeesPaid: true,
    balanceZMW: 0,
    gamification: {
      totalXp: 1800,
      level: 3,
      title: 'Junior Explorer',
      streakDays: 8,
      assignmentsCompleted: 6,
      badges: [],
    },
  },
];

test('normalizeExamNumber strips whitespaces', () => {
  assert.equal(normalizeExamNumber(' 2026 / 12 / 0118 '), '2026/12/0118');
});

test('getEczSubjectCode accurately identifies ECZ subject numbers', () => {
  assert.equal(getEczSubjectCode('English Language (1121)'), '1121');
  assert.equal(getEczSubjectCode('Mathematics 4024'), '4024');
  assert.equal(getEczSubjectCode('Physics (5054)'), '5054');
  assert.equal(getEczSubjectCode('Chemistry'), '5070');
  assert.equal(getEczSubjectCode('Biology 5090'), '5090');
});

test('queryEczCandidate successfully finds candidate by exact examination number', () => {
  const result = queryEczCandidate('2026/12/0118', 'all', mockStudents);
  assert.equal(result.found, true);
  assert.equal(result.student?.fullName, 'Natasha Musonda');
});

test('queryEczCandidate handles case-insensitive query and level filter', () => {
  const result = queryEczCandidate('2026/09/0421', 'junior', mockStudents);
  assert.equal(result.found, true);
  assert.equal(result.student?.fullName, 'Chileshe Mulenga');

  // Should fail if level mismatch
  const mismatch = queryEczCandidate('2026/09/0421', 'senior', mockStudents);
  assert.equal(mismatch.found, false);
});

test('buildStatementOfResults produces comprehensive ECZ statement data for senior student', () => {
  const statement = buildStatementOfResults(mockStudents[0]);
  assert.equal(statement.candidateName, 'NATASHA MUSONDA');
  assert.equal(statement.examNumber, '2026/12/0118');
  assert.equal(statement.centreCode, '0118');
  assert.equal(statement.centreName.includes('MPATAMATU SECONDARY SCHOOL'), true);
  assert.equal(statement.subjects.length, 6);
  assert.equal(statement.aggregateSummary.pointsOrAverage, 6); // 6 distinctions = 6 points
  assert.equal(statement.aggregateSummary.qualification.includes('DISTINCTION'), true);
  assert.ok(statement.serialNumber.startsWith('ECZ-2026-MSS-'));
});

test('buildStatementOfResults produces accurate JSSLE statement for junior student', () => {
  const statement = buildStatementOfResults(mockStudents[1]);
  assert.equal(statement.candidateName, 'CHILESHE MULENGA');
  assert.equal(statement.level, 'junior');
  assert.ok(statement.aggregateSummary.qualification.includes('JSSLE'));
});

test('validateCenterNumber validates official Mpatamatu center number 0118', () => {
  const result1 = validateCenterNumber('2026/12/0118', '0118');
  assert.equal(result1.valid, true);

  const result2 = validateCenterNumber('2026/09/0421', '0118');
  assert.equal(result2.valid, true);

  const resultInvalid = validateCenterNumber('2026/12/0118', '9999');
  assert.equal(resultInvalid.valid, false);
  assert.ok(resultInvalid.error?.includes('Security Verification Mismatch'));
});

test('queryEczCandidate enforces both examination number and center number validation', () => {
  // Correct exam number and correct center number
  const validRes = queryEczCandidate('2026/12/0118', 'senior', mockStudents, '0118');
  assert.equal(validRes.found, true);
  assert.equal(validRes.student?.fullName, 'Natasha Musonda');

  // Correct exam number but incorrect center number
  const wrongCenterRes = queryEczCandidate('2026/12/0118', 'senior', mockStudents, '8888');
  assert.equal(wrongCenterRes.found, false);
  assert.ok(wrongCenterRes.error?.includes('Security Verification Mismatch'));
});
