import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUserProfile } from './firebaseAuth';

export interface ReceivedFeeRecord {
  id: string;
  receiptNo: string;
  transactionId: string;
  // Parent details
  parentUid: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  // Student details
  studentName: string;
  studentGrade?: string;
  // Tutor & tuition details
  bookingId?: string;
  tutorId?: string;
  tutorName: string;
  tutorPhone?: string;
  tutorSubjects?: string;
  // Financial details
  amount: number;
  formattedAmount: string;
  billingPeriod: string; // e.g., "October 2026 Monthly Tuition"
  paymentMethod: 'UPI' | 'PhonePe / GPay' | 'Net Banking' | 'Debit/Credit Card' | 'Cash / Institute Desk';
  status: 'paid' | 'completed';
  paidAt: string; // ISO string
  paidDate: string; // Formatted date e.g. "10 Oct 2026"
  paidTime: string; // Formatted time e.g. "03:54 PM"
  nextDueDate: string; // 28-30 days from paidAt
  nextDueAt: string; // ISO string
  notes?: string;
  createdAt?: string;
}

/**
 * Format currency in Indian Rupees (INR)
 */
export function formatINR(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.]/g, '')) : val;
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Check if a tutor payment is still active/paid or due for payment based on 28-day cycle
 */
export function getTutorPaymentStatus(
  bookingId: string | undefined,
  tutorId: string | undefined,
  paymentRecords: ReceivedFeeRecord[],
  parentProfile?: AppUserProfile | null
): {
  isPaid: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  isOverdue: boolean;
  lastPayment?: ReceivedFeeRecord | any;
  nextDueDate?: string;
  nextDueTimestamp?: number;
  lastPaidDateFormatted?: string;
} {
  const CYCLE_DAYS = 28;
  const CYCLE_MS = CYCLE_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // 1. Gather all candidates from paymentRecords (Firestore 'received_fees')
  const recordMatches = (paymentRecords || []).filter((r) => {
    if (bookingId && r.bookingId === bookingId) return true;
    if (tutorId && (r.tutorId === tutorId || (r as any).assignedTutorId === tutorId)) return true;
    return false;
  });

  // 2. Also check parent profile's feeReceipts and lastFeePaidAt from Firestore 'parents' collection
  const profileReceiptMatches: any[] = [];
  const pAny = parentProfile as any;
  if (pAny?.feeReceipts && Array.isArray(pAny.feeReceipts)) {
    pAny.feeReceipts.forEach((r: any) => {
      const isMatch =
        (bookingId && (r.bookingId === bookingId || r.id?.includes(bookingId))) ||
        (tutorId && (r.tutorId === tutorId || r.assignedTutorId === tutorId || (r.description && r.description.toLowerCase().includes((tutorId || '').toLowerCase())))) ||
        (!bookingId && !tutorId);
      if (isMatch) {
        profileReceiptMatches.push({
          receiptNo: r.receiptNo || r.id,
          paidAt: r.paidAt || r.date,
          paidDate: r.date?.split('•')[0]?.trim() || r.paidDate || r.date,
          paidTime: r.date?.split('•')[1]?.trim() || r.paidTime || '',
          amount: typeof r.amount === 'string' ? parseFloat(r.amount.replace(/[^\d.]/g, '')) : (r.amount || 0),
          formattedAmount: typeof r.amount === 'string' ? r.amount : `₹${r.amount}`,
          billingPeriod: r.description || 'Monthly Tuition Fee',
          paymentMethod: r.transferMethod || 'UPI',
          transactionId: r.utrNumber || r.transactionId || r.id,
          nextDueDate: r.nextDueDate || pAny.nextFeeDueDate
        });
      }
    });
  }

  // Combine and find latest payment
  const allCandidates = [...recordMatches, ...profileReceiptMatches];

  // If no specific match was found by ID, but the parent has an overall lastFeePaidAt in Firestore
  if (allCandidates.length === 0 && pAny?.lastFeePaidAt) {
    allCandidates.push({
      receiptNo: pAny.lastFeeReceiptNo || 'RECENT-FEE',
      paidAt: pAny.lastFeePaidAt,
      paidDate: new Date(pAny.lastFeePaidAt).toLocaleDateString('en-IN'),
      paidTime: new Date(pAny.lastFeePaidAt).toLocaleTimeString('en-IN'),
      amount: pAny.feesAmount || 3000,
      formattedAmount: `₹${pAny.feesAmount || 3000}`,
      billingPeriod: 'Monthly Tuition Fee',
      paymentMethod: 'UPI',
      transactionId: 'TXN-PAID',
      nextDueDate: pAny.nextFeeDueDate
    });
  }

  if (allCandidates.length === 0) {
    return {
      isPaid: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      isOverdue: false
    };
  }

  // Sort candidates descending by payment timestamp
  allCandidates.sort((a, b) => {
    const timeA = new Date(a.paidAt || a.createdAt || a.paidDate || 0).getTime();
    const timeB = new Date(b.paidAt || b.createdAt || b.paidDate || 0).getTime();
    return timeB - timeA;
  });

  const latest = allCandidates[0];
  const paidTimestamp = new Date(latest.paidAt || latest.createdAt || latest.paidDate || 0).getTime();

  if (isNaN(paidTimestamp) || paidTimestamp === 0) {
    return {
      isPaid: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      isOverdue: false,
      lastPayment: latest
    };
  }

  // Exact 28-day expiration threshold (28 days * 24h * 60m * 60s * 1000ms)
  const nextDueTimestamp = paidTimestamp + CYCLE_MS;
  const timeDifferenceMs = nextDueTimestamp - now;

  const nextDueDateFormatted =
    latest.nextDueDate ||
    new Date(nextDueTimestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  const lastPaidDateFormatted = new Date(paidTimestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Check if exactly 28 days have elapsed
  if (timeDifferenceMs > 0) {
    // Within 28 days -> Mark as 'Paid'
    const daysRemaining = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.max(0, Math.ceil(timeDifferenceMs / (1000 * 60 * 60)));
    return {
      isPaid: true,
      daysRemaining,
      hoursRemaining,
      isOverdue: false,
      lastPayment: latest,
      nextDueDate: nextDueDateFormatted,
      nextDueTimestamp,
      lastPaidDateFormatted
    };
  }

  // Exactly after 28 days have passed -> Expired, triggers 'Pay Now'
  return {
    isPaid: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    isOverdue: true,
    lastPayment: latest,
    nextDueDate: nextDueDateFormatted,
    nextDueTimestamp,
    lastPaidDateFormatted
  };
}

/**
 * Record a parent fee payment in Firestore:
 * 1. Store in `received_fees` collection (for Admin "Received Fee" view & global audit)
 * 2. Update parent document in `parents` with the receipt in `feeReceipts` array
 * 3. Update `activity_logs` so it reconciles across the entire admin audit
 */
export async function processParentFeePayment(payload: {
  parentUser: AppUserProfile;
  booking: any;
  amount: number;
  paymentMethod: 'UPI' | 'PhonePe / GPay' | 'Net Banking' | 'Debit/Credit Card' | 'Cash / Institute Desk';
  utrNumber?: string;
  notes?: string;
}): Promise<{ success: boolean; record: ReceivedFeeRecord; receipt: any }> {
  const { parentUser, booking, amount, paymentMethod, utrNumber, notes } = payload;

  const now = new Date();
  const paidAt = now.toISOString();
  const paidDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const paidTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Calculate next due date (28 days later)
  const nextDueDateObj = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);
  const nextDueDate = nextDueDateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const nextDueAt = nextDueDateObj.toISOString();

  const idSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const receiptNo = `KI-FEE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${idSuffix}`;
  const transactionId = utrNumber?.trim() || `TXN-${Date.now()}-${idSuffix}`;

  const tutorName =
    booking.assignedTutorName ||
    booking.requestedTutorName ||
    booking.tutorName ||
    booking.name ||
    'Assigned Home Tutor';

  const tutorId = booking.assignedTutorId || booking.requestedTutorId || booking.tutorId || booking.id || '';
  const tutorPhone = booking.assignedTutorPhone || booking.phone || '';
  const tutorSubjects = Array.isArray(booking.subjects)
    ? booking.subjects.join(', ')
    : booking.subjects || 'Home Tuition';

  const studentName = booking.studentName || parentUser.childName || parentUser.name || 'Student';
  const studentGrade = booking.studentGrade || parentUser.childGrade || '';

  const billingPeriod = `${now.toLocaleString('default', { month: 'long', year: 'numeric' })} Monthly Home Tuition`;

  const feeRecord: ReceivedFeeRecord = {
    id: receiptNo,
    receiptNo,
    transactionId,
    parentUid: parentUser.uid || '',
    parentName: parentUser.name || (parentUser as any).fullName || 'Parent',
    parentEmail: parentUser.email || '',
    parentPhone: parentUser.phone || '',
    studentName,
    studentGrade,
    bookingId: booking.id || '',
    tutorId,
    tutorName,
    tutorPhone,
    tutorSubjects,
    amount,
    formattedAmount: formatINR(amount),
    billingPeriod,
    paymentMethod,
    status: 'paid',
    paidAt,
    paidDate,
    paidTime,
    nextDueDate,
    nextDueAt,
    notes: notes || `Monthly fee paid for ${studentName} (${tutorSubjects})`,
    createdAt: paidAt
  };

  const receiptForUser = {
    id: receiptNo,
    receiptNo,
    transactionId,
    date: `${paidDate} • ${paidTime}`,
    description: `${billingPeriod} - ${tutorName}`,
    amount: formatINR(amount),
    status: 'Paid',
    transferMethod: paymentMethod,
    utrNumber: transactionId,
    studentName,
    tutorName,
    nextDueDate,
    paidAt
  };

  // 1. Write to Firestore `received_fees` collection
  try {
    const feeDocRef = doc(db, 'received_fees', receiptNo);
    await setDoc(feeDocRef, feeRecord);
  } catch (err) {
    console.warn('[paymentService] Firestore received_fees save notice:', err);
  }

  // 2. Update parent document in Firestore `parents` collection with the new fee receipt
  if (parentUser.uid) {
    try {
      const parentDocRef = doc(db, 'parents', parentUser.uid);
      await updateDoc(parentDocRef, {
        feeReceipts: arrayUnion(receiptForUser),
        lastFeePaidAt: paidAt,
        lastFeeReceiptNo: receiptNo,
        nextFeeDueDate: nextDueDate
      });
    } catch (err) {
      console.warn('[paymentService] Parent feeReceipts update notice:', err);
    }
  }

  // 3. Update activity logs so it's fully indexed in system logs
  try {
    const logDocRef = doc(db, 'activity_logs', receiptNo);
    await setDoc(logDocRef, {
      id: receiptNo,
      category: 'payment_home_tutors',
      actionType: 'payment_home_tutor',
      description: `Received tuition fee of ${formatINR(amount)} from ${feeRecord.parentName} for Tutor ${tutorName}`,
      amount,
      receiptNo,
      transactionId,
      entityName: `${feeRecord.parentName} (${studentName})`,
      timestamp: paidAt,
      dateFormatted: `${paidDate} at ${paidTime}`,
      paymentMethod,
      status: 'success'
    });
  } catch (err) {
    console.warn('[paymentService] Activity logs update notice:', err);
  }

  // Also cache in localStorage
  try {
    const raw = localStorage.getItem('kumari_received_fees') || '[]';
    const existing = JSON.parse(raw);
    const updated = [feeRecord, ...existing.filter((r: any) => r.id !== receiptNo)];
    localStorage.setItem('kumari_received_fees', JSON.stringify(updated));
  } catch {}

  return {
    success: true,
    record: feeRecord,
    receipt: receiptForUser
  };
}

const getLocalReceivedFees = (parentUidFilter?: string): ReceivedFeeRecord[] => {
  try {
    const raw = localStorage.getItem('kumari_received_fees');
    if (!raw) return [];
    const parsed: ReceivedFeeRecord[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parentUidFilter ? parsed.filter(p => p.parentUid === parentUidFilter) : parsed;
  } catch {
    return [];
  }
};

/**
 * Real-time subscription to `received_fees` collection for Admin and Parent
 */
export function subscribeToReceivedFees(
  callback: (records: ReceivedFeeRecord[]) => void,
  parentUidFilter?: string
): () => void {
  // Emit locally cached fees first
  const localList = getLocalReceivedFees(parentUidFilter);
  if (localList.length > 0) {
    callback(localList);
  }

  try {
    const colRef = collection(db, 'received_fees');
    const q = query(colRef, orderBy('paidAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ReceivedFeeRecord[] = [];
        snapshot.forEach((d) => {
          const item = { id: d.id, ...d.data() } as ReceivedFeeRecord;
          if (!parentUidFilter || item.parentUid === parentUidFilter) {
            list.push(item);
          }
        });
        if (list.length > 0) {
          try {
            localStorage.setItem('kumari_received_fees', JSON.stringify(list));
          } catch {}
          callback(list);
        } else if (localList.length > 0) {
          callback(localList);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('[paymentService] subscribeToReceivedFees notice:', err);
        const fallback = getLocalReceivedFees(parentUidFilter);
        callback(fallback);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[paymentService] Error setting up listener:', err);
    callback(getLocalReceivedFees(parentUidFilter));
    return () => {};
  }
}
