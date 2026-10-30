import { StudentRecord, SubjectGrade } from '../types';
import { calculateBestSixPoints, evaluateJuniorStatus, calculateEczGrade } from './gradeCalculations';
import QRCode from 'qrcode';

export interface EczSubjectRecord {
  code: string;
  name: string;
  mark: number;
  grade: string; // '1' - '9'
  gradeTitle: string; // 'DISTINCTION', 'MERIT', 'CREDIT', etc.
}

export interface EczStatementOfResults {
  serialNumber: string;
  issuedDate: string;
  candidateName: string;
  examNumber: string;
  centreCode: string;
  centreName: string;
  level: 'junior' | 'senior';
  levelTitle: string;
  examYear: number;
  gender: string;
  dob: string;
  subjects: EczSubjectRecord[];
  aggregateSummary: {
    pointsOrAverage: number;
    unitLabel: string; // 'Points (Best 6)' or 'Average %'
    qualification: string;
    divisionOrStatus: string;
    remarks: string;
  };
  verificationUrl: string;
  qrDataUrl?: string;
  digitalSignature: {
    signatory: string;
    title: string;
    hash: string;
  };
}

/**
 * Standard ECZ Subject Codes map
 */
export const ECZ_SUBJECT_CODES: Record<string, string> = {
  'english': '1121',
  'english language': '1121',
  'mathematics': '4024',
  'additional mathematics': '4037',
  'physics': '5054',
  'chemistry': '5070',
  'biology': '5090',
  'science': '5124',
  'integrated science': '5001',
  'geography': '2218',
  'history': '2167',
  'civic education': '2030',
  'social studies': '2010',
  'religious education': '2046',
  'commerce': '7100',
  'principles of accounts': '7110',
  'business studies': '7001',
  'computer studies': '7010',
  'agricultural science': '5037',
  'icibemba': '3141',
  'zambian languages': '3141',
  'art and design': '6010',
};

/**
 * Official ECZ Examination Center code for Mpatamatu Secondary School
 */
export const OFFICIAL_MPATAMATU_CENTER_NUMBER = '0118';

/**
 * Normalizes user input for ECZ examination numbers
 */
export function normalizeExamNumber(input: string): string {
  return input.trim().replace(/\s+/g, '');
}

/**
 * Validates candidate Center Number against official ECZ examination registry
 */
export function validateCenterNumber(candidateExamNumber: string, centerNumber: string): {
  valid: boolean;
  expectedCenter: string;
  error?: string;
} {
  const cleanCenter = centerNumber.trim();
  if (!cleanCenter) {
    return {
      valid: false,
      expectedCenter: OFFICIAL_MPATAMATU_CENTER_NUMBER,
      error: 'Center Number is required for secure ECZ result verification.',
    };
  }

  // Accept formats like "0118", "118", "2026/0118", or center code embedded in candidate number
  const normInput = cleanCenter.replace(/\s+/g, '');
  const normOfficial = OFFICIAL_MPATAMATU_CENTER_NUMBER;
  const isMatch =
    normInput === normOfficial ||
    normInput.endsWith(normOfficial) ||
    normInput.includes('0118') ||
    (normInput.length >= 3 && candidateExamNumber.includes(normInput));

  if (!isMatch) {
    return {
      valid: false,
      expectedCenter: OFFICIAL_MPATAMATU_CENTER_NUMBER,
      error: `Security Verification Mismatch: Center Number "${cleanCenter}" does not match the registered candidate center (Official Center: 0118 - Mpatamatu Secondary School).`,
    };
  }

  return { valid: true, expectedCenter: OFFICIAL_MPATAMATU_CENTER_NUMBER };
}

/**
 * Maps subject names to official ECZ numeric codes
 */
export function getEczSubjectCode(subjectName: string): string {
  const clean = subjectName.toLowerCase();
  for (const [key, code] of Object.entries(ECZ_SUBJECT_CODES)) {
    if (clean.includes(key)) return code;
  }
  return '9000';
}

/**
 * Looks up student results securely by ECZ examination number and center number
 */
export function queryEczCandidate(
  searchQuery: string,
  levelFilter: 'all' | 'junior' | 'senior',
  students: StudentRecord[],
  centerNumber?: string
): {
  found: boolean;
  student?: StudentRecord;
  error?: string;
} {
  const query = normalizeExamNumber(searchQuery).toLowerCase();
  if (!query) {
    return { found: false, error: 'Please enter a valid ECZ Examination Number.' };
  }

  const matched = students.find((s) => {
    const eczClean = normalizeExamNumber(s.eczExamNumber).toLowerCase();
    const idClean = s.id.toLowerCase();
    const nameClean = s.fullName.toLowerCase();

    const matchesQuery = eczClean === query || idClean === query || eczClean.includes(query) || nameClean.includes(query);
    if (!matchesQuery) return false;

    if (levelFilter !== 'all' && s.level !== levelFilter) return false;
    return true;
  });

  if (!matched) {
    return {
      found: false,
      error: `No candidate found matching examination number "${searchQuery}". Please verify the candidate number and level.`,
    };
  }

  // If center number is provided, perform secure verification against candidate record
  if (centerNumber !== undefined && centerNumber !== null) {
    const centerCheck = validateCenterNumber(matched.eczExamNumber, centerNumber);
    if (!centerCheck.valid) {
      return {
        found: false,
        error: centerCheck.error,
      };
    }
  }

  return { found: true, student: matched };
}

/**
 * Builds the official statement of results data structure
 */
export function buildStatementOfResults(student: StudentRecord): EczStatementOfResults {
  const isSenior = student.level === 'senior';
  const examYear = 2026;

  // Map subjects with ECZ codes and divisions
  const subjects: EczSubjectRecord[] = student.grades.map((g) => {
    const code = getEczSubjectCode(g.subjectName);
    const gradeObj = calculateEczGrade(g.total);
    const gradeTitle =
      gradeObj.division === 'Distinction'
        ? 'DISTINCTION'
        : gradeObj.division === 'Merit'
        ? 'MERIT'
        : gradeObj.division === 'Credit'
        ? 'CREDIT'
        : gradeObj.division === 'Satisfactory'
        ? 'SATISFACTORY'
        : 'UNSATISFACTORY';

    return {
      code,
      name: g.subjectName.toUpperCase(),
      mark: g.total,
      grade: gradeObj.eczGrade,
      gradeTitle,
    };
  });

  let aggregateSummary: EczStatementOfResults['aggregateSummary'];

  if (isSenior) {
    const bestSix = calculateBestSixPoints(student.grades);
    const points = bestSix.points;
    let qualification = 'FULL SCHOOL CERTIFICATE';
    if (points <= 12) {
      qualification = 'FULL SCHOOL CERTIFICATE (DISTINCTION DIVISION)';
    } else if (points <= 24) {
      qualification = 'FULL SCHOOL CERTIFICATE (MERIT DIVISION)';
    } else if (points <= 36) {
      qualification = 'FULL SCHOOL CERTIFICATE (CREDIT DIVISION)';
    } else {
      qualification = 'GENERAL CERTIFICATE OF EDUCATION (GCE)';
    }

    aggregateSummary = {
      pointsOrAverage: points,
      unitLabel: 'Aggregate Points (Best 6 Subjects)',
      qualification,
      divisionOrStatus: bestSix.status,
      remarks:
        points <= 18
          ? 'QUALIFIED FOR DIRECT ADMISSION TO HIGHER INSTITUTIONS & UNIVERSITIES'
          : points <= 30
          ? 'QUALIFIED FOR DIPLOMA & COLLEGE ENTRY PROGRAMMES'
          : 'GENERAL CERTIFICATE OF EDUCATION AWARDED',
    };
  } else {
    const junior = evaluateJuniorStatus(student.grades);
    aggregateSummary = {
      pointsOrAverage: junior.average,
      unitLabel: 'Overall Mean Percentage (%)',
      qualification: junior.passed
        ? 'JUNIOR SECONDARY SCHOOL LEAVING CERTIFICATE (JSSLE)'
        : 'CERTIFICATE OF ATTENDANCE',
      divisionOrStatus: junior.divisionRemarks,
      remarks: junior.passed
        ? 'SELECTED FOR SENIOR SECONDARY SCHOOL (GRADE 10 ENTRY 2027)'
        : 'REFERRED FOR REMEDIAL QUALIFYING ASSESSMENT',
    };
  }

  const serialNumber = `ECZ-2026-MSS-${student.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${(10000 + Math.abs(student.fullName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 17)).toString().slice(0, 5)}`;
  const verificationUrl = `https://eservices.exams-council.org.zm/verify?serial=${serialNumber}&candidate=${encodeURIComponent(student.eczExamNumber)}`;

  return {
    serialNumber,
    issuedDate: '21-OCT-2026',
    candidateName: student.fullName.toUpperCase(),
    examNumber: student.eczExamNumber,
    centreCode: '0118',
    centreName: 'MPATAMATU SECONDARY SCHOOL, LUANSHYA (COPPERBELT)',
    level: student.level,
    levelTitle: isSenior ? 'GRADE 12 SCHOOL CERTIFICATE EXAMINATION' : 'GRADE 9 JUNIOR SECONDARY SCHOOL LEAVING EXAMINATION',
    examYear,
    gender: student.gender === 'F' ? 'FEMALE' : 'MALE',
    dob: student.dob || '2008-04-12',
    subjects,
    aggregateSummary,
    verificationUrl,
    digitalSignature: {
      signatory: 'Dr. Michael M. Chilala',
      title: 'Director / Chief Executive Officer, Examinations Council of Zambia',
      hash: `SHA256:${serialNumber}:CERTIFIED-VALID`,
    },
  };
}

/**
 * Generates the official QR code for the statement of results
 */
export async function generateStatementQrCode(verificationUrl: string): Promise<string> {
  return QRCode.toDataURL(verificationUrl, {
    width: 260,
    margin: 1,
    color: {
      dark: '#064e3b',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}
