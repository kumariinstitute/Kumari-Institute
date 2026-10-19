/**
 * Kumari Institute Standardized Fee Structure & Class Timings
 *
 * Board - CBSE:
 *  1st class: ₹1,200
 *  2nd class: ₹1,700
 *  3rd class: ₹2,500
 *  4th class: ₹3,000
 *  5th class: ₹3,500
 *  Subject-wise (per subject):
 *  6th to 8th class: ₹3,000 / subject
 *  9th to 10th class: ₹3,500 / subject
 *
 * Board - ICSE:
 *  1st class: ₹1,500
 *  2nd class: ₹2,000
 *  3rd class: ₹2,500
 *  4th class: ₹3,200
 *  5th class: ₹4,000
 *  Subject-wise (per subject):
 *  6th to 8th class: ₹3,000 / subject
 *  8th to 10th class: ₹4,000 / subject
 *
 * Standard Timings:
 *  1st - 2nd class: 1 hr
 *  3rd - 4th class: 1.30 hr (1 hr 30 mins)
 *  5th class: 2 hr
 */

export type EducationBoard = 'CBSE' | 'ICSE';

export interface ClassFeeRule {
  gradeLabel: string;
  classNumber: number; // 1 to 10
  cbseFee: number;
  icseFee: number;
  isPerSubject?: boolean;
  timingText: string;
}

export const CLASS_TIMINGS: Record<number, string> = {
  1: '1 hr daily',
  2: '1 hr daily',
  3: '1.30 hr daily',
  4: '1.30 hr daily',
  5: '2 hr daily',
  6: '1.30 hr / session',
  7: '1.30 hr / session',
  8: '1.30 hr / session',
  9: '1.5 - 2 hr / session',
  10: '1.5 - 2 hr / session',
  11: '1.5 - 2 hr / session',
  12: '1.5 - 2 hr / session',
};

export const FEE_STRUCTURE: ClassFeeRule[] = [
  { gradeLabel: '1st Class', classNumber: 1, cbseFee: 1200, icseFee: 1500, timingText: '1 hr' },
  { gradeLabel: '2nd Class', classNumber: 2, cbseFee: 1700, icseFee: 2000, timingText: '1 hr' },
  { gradeLabel: '3rd Class', classNumber: 3, cbseFee: 2500, icseFee: 2500, timingText: '1.30 hr' },
  { gradeLabel: '4th Class', classNumber: 4, cbseFee: 3000, icseFee: 3200, timingText: '1.30 hr' },
  { gradeLabel: '5th Class', classNumber: 5, cbseFee: 3500, icseFee: 4000, timingText: '2 hr' },
  { gradeLabel: '6th Class', classNumber: 6, cbseFee: 3000, icseFee: 3000, isPerSubject: true, timingText: '1.30 hr' },
  { gradeLabel: '7th Class', classNumber: 7, cbseFee: 3000, icseFee: 3000, isPerSubject: true, timingText: '1.30 hr' },
  { gradeLabel: '8th Class', classNumber: 8, cbseFee: 3000, icseFee: 3000, isPerSubject: true, timingText: '1.30 hr' },
  { gradeLabel: '9th Class', classNumber: 9, cbseFee: 3500, icseFee: 4000, isPerSubject: true, timingText: '1.5 - 2 hr' },
  { gradeLabel: '10th Class', classNumber: 10, cbseFee: 3500, icseFee: 4000, isPerSubject: true, timingText: '1.5 - 2 hr' },
  { gradeLabel: '11th Class', classNumber: 11, cbseFee: 3000, icseFee: 3200, isPerSubject: true, timingText: '1.5 - 2 hr' },
  { gradeLabel: '12th Class', classNumber: 12, cbseFee: 3000, icseFee: 3200, isPerSubject: true, timingText: '1.5 - 2 hr' },
];

/**
 * Returns the exact monthly fee for a given class number, board, and subject count
 */
export function calculateHomeTutorFee(
  classNumber: number,
  board: EducationBoard = 'CBSE',
  subjectCount: number = 1
): { fee: number; isPerSubject: boolean; timing: string; note: string } {
  const rule = FEE_STRUCTURE.find((r) => r.classNumber === classNumber) || FEE_STRUCTURE[0];
  const isPerSubject = !!rule.isPerSubject;
  const baseRate = board === 'ICSE' ? rule.icseFee : rule.cbseFee;
  const fee = isPerSubject ? baseRate * Math.max(1, subjectCount) : baseRate;

  const timing = CLASS_TIMINGS[classNumber] || '1 hr daily';
  const note = isPerSubject
    ? `₹${baseRate.toLocaleString('en-IN')}/subject • ${board} Board`
    : `₹${baseRate.toLocaleString('en-IN')}/month • ${board} Board`;

  return { fee, isPerSubject, timing, note };
}

/**
 * Extracts class number (1-12) from text string like "3rd Class", "Class 5", "11th Class", "12th Standard"
 */
export function parseClassNumber(text: string): number {
  if (!text) return 1;
  const match = text.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 12) return num;
  }
  return 1;
}

/**
 * Standard summary strings for tutor cards and badges
 */
export const FEE_SUMMARY = {
  cbseRangeText: 'CBSE Board: ₹1,200 to ₹3,500',
  icseRangeText: 'ICSE Board: ₹1,500 to ₹4,000',
  higherClassesText: '6th-10th: ₹3,000 to ₹4,000 / subject',
  timingsSummary: '1-2 Class: 1 hr | 3-4 Class: 1.30 hr | 5 Class: 2 hr',
  timingsMap: [
    { label: '1st - 2nd Class', duration: '1 hr' },
    { label: '3rd - 4th Class', duration: '1.30 hr' },
    { label: '5th Class', duration: '2 hr' },
  ]
};
