import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TutorWithdrawalRequest {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorEmail?: string;
  tutorPhone?: string;
  amount: number;
  paymentMethod: 'upi' | 'bank_transfer';
  upiId?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  utrNumber?: string;
  transferredAmount?: number;
  transferMethod?: string;
  paymentSlipUrl?: string;
  adminNote?: string;
}

const LOCAL_WITHDRAWALS_KEY = 'kumari_withdrawal_requests_registry';

function getLocalWithdrawals(): TutorWithdrawalRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_WITHDRAWALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalWithdrawals(list: TutorWithdrawalRequest[]) {
  try {
    localStorage.setItem(LOCAL_WITHDRAWALS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving local withdrawals:', err);
  }
}

/**
 * Calculates earnings breakdown: Pending Amount (within 30 days) and Current Available Balance (>= 30 days elapsed minus withdrawals)
 */
export function calculateTutorEarnings(
  tutorRates: {
    hourlyCharges?: number;
    hourlyRate?: number;
    hourlyFee?: number;
    monthlyFee?: number;
  },
  assignedStudents: any[] = [],
  withdrawals: TutorWithdrawalRequest[] = []
) {
  const tutorHourly =
    Number(tutorRates.hourlyCharges) ||
    Number(tutorRates.hourlyRate) ||
    Number(tutorRates.hourlyFee) ||
    (tutorRates.monthlyFee ? Math.round(tutorRates.monthlyFee / 30) : 100);

  const defaultMonthlyPerStudent = tutorHourly * 30;

  let totalMonthlyAccrued = 0;
  let pendingAmount = 0;
  let totalCurrentEarned = 0;

  const now = Date.now();

  assignedStudents.forEach((student) => {
    const fee = Number(student.monthlyFee) || Number(student.assignedTutorFee) || defaultMonthlyPerStudent;
    totalMonthlyAccrued += fee;

    // Check how many days have elapsed since assignment
    let daysElapsed = 0;
    const dateStr = student.assignedAt || student.createdAt || student.date;
    if (dateStr) {
      const parsed = new Date(dateStr).getTime();
      if (!isNaN(parsed)) {
        daysElapsed = Math.floor((now - parsed) / (1000 * 60 * 60 * 24));
      }
    }

    // Explicit override if student tuition is marked completed/settled
    const isCompletedMonth =
      student.monthCompleted === true ||
      student.isMonthCompleted === true ||
      daysElapsed >= 30;

    if (isCompletedMonth) {
      totalCurrentEarned += fee;
    } else {
      pendingAmount += fee;
    }
  });

  // Calculate withdrawals
  let totalApprovedWithdrawn = 0;
  let totalPendingWithdrawn = 0;

  withdrawals.forEach((w) => {
    if (w.status === 'approved') {
      totalApprovedWithdrawn += Number(w.transferredAmount || w.amount) || 0;
    } else if (w.status === 'pending') {
      totalPendingWithdrawn += Number(w.amount) || 0;
    }
  });

  const currentAvailableBalance = Math.max(
    0,
    totalCurrentEarned - totalApprovedWithdrawn - totalPendingWithdrawn
  );

  return {
    tutorHourly,
    defaultMonthlyPerStudent,
    totalMonthlyAccrued,
    pendingAmount,
    totalCurrentEarned,
    totalApprovedWithdrawn,
    totalPendingWithdrawn,
    currentAvailableBalance,
    studentCount: assignedStudents.length
  };
}

/**
 * Submit a withdrawal request from a tutor
 */
export async function submitWithdrawalRequest(
  data: Omit<TutorWithdrawalRequest, 'id' | 'createdAt' | 'status'>
): Promise<TutorWithdrawalRequest> {
  const id = 'WR-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  const newRequest: TutorWithdrawalRequest = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  // 1. Save to local storage for instant reactivity
  const list = getLocalWithdrawals();
  const updatedList = [newRequest, ...list];
  saveLocalWithdrawals(updatedList);

  // 2. Persist to Firestore: save in withdrawal_notices collection and withdrawal_requests
  try {
    const noticeDocRef = doc(db, 'withdrawal_notices', id);
    await setDoc(noticeDocRef, newRequest);

    const docRef = doc(db, 'withdrawal_requests', id);
    await setDoc(docRef, newRequest);
  } catch (err) {
    console.warn('[payoutService] Firestore write notice:', err);
  }

  return newRequest;
}

/**
 * Subscribe to withdrawal requests for a specific tutor
 */
export function subscribeToTutorWithdrawals(
  tutorId: string,
  tutorEmail: string | undefined,
  callback: (requests: TutorWithdrawalRequest[]) => void
): () => void {
  // Initial local emission
  const emitLocal = () => {
    const list = getLocalWithdrawals();
    const filtered = list.filter(
      (r) =>
        r.tutorId === tutorId ||
        (tutorEmail && r.tutorEmail?.toLowerCase() === tutorEmail.toLowerCase())
    );
    callback(filtered);
  };
  emitLocal();

  try {
    const colRef = collection(db, 'withdrawal_requests');
    const q = query(colRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteList: TutorWithdrawalRequest[] = [];
        snapshot.forEach((d) => {
          remoteList.push(d.data() as TutorWithdrawalRequest);
        });

        // Merge remote with local
        const localList = getLocalWithdrawals();
        const mergedMap = new Map<string, TutorWithdrawalRequest>();
        remoteList.forEach((r) => mergedMap.set(r.id, r));
        localList.forEach((r) => {
          if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
        });

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        saveLocalWithdrawals(merged);

        const filtered = merged.filter(
          (r) =>
            r.tutorId === tutorId ||
            (tutorEmail && r.tutorEmail?.toLowerCase() === tutorEmail.toLowerCase())
        );
        callback(filtered);
      },
      (err) => {
        console.warn('[payoutService] Tutor withdrawal listener notice:', err);
        emitLocal();
      }
    );

    return () => unsubscribe();
  } catch (err) {
    console.warn('[payoutService] Listener setup notice:', err);
    return () => {};
  }
}

/**
 * Subscribe to all withdrawal requests for admin
 */
export function subscribeToAllWithdrawalRequests(
  callback: (requests: TutorWithdrawalRequest[]) => void
): () => void {
  const emitLocal = () => {
    const list = getLocalWithdrawals();
    callback(list);
  };
  emitLocal();

  try {
    const colRef = collection(db, 'withdrawal_requests');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const remoteList: TutorWithdrawalRequest[] = [];
        snapshot.forEach((d) => {
          remoteList.push(d.data() as TutorWithdrawalRequest);
        });

        const localList = getLocalWithdrawals();
        const mergedMap = new Map<string, TutorWithdrawalRequest>();
        remoteList.forEach((r) => mergedMap.set(r.id, r));
        localList.forEach((r) => {
          if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
        });

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        saveLocalWithdrawals(merged);
        callback(merged);
      },
      (err) => {
        console.warn('[payoutService] Admin listener notice:', err);
        emitLocal();
      }
    );

    return () => unsubscribe();
  } catch (err) {
    console.warn('[payoutService] Admin setup notice:', err);
    return () => {};
  }
}

/**
 * Admin approves a withdrawal request and records UTR, amount, payment method, and slip
 */
export async function adminApproveWithdrawal(
  requestId: string,
  approvalData: {
    utrNumber: string;
    transferredAmount: number;
    transferMethod: string;
    paymentSlipUrl?: string;
    adminNote?: string;
  }
): Promise<void> {
  const updates = {
    status: 'approved' as const,
    approvedAt: new Date().toISOString(),
    utrNumber: approvalData.utrNumber.trim(),
    transferredAmount: Number(approvalData.transferredAmount),
    transferMethod: approvalData.transferMethod,
    paymentSlipUrl: approvalData.paymentSlipUrl || '',
    adminNote: approvalData.adminNote || ''
  };

  // 1. Update local registry
  const list = getLocalWithdrawals();
  const updated = list.map((item) =>
    item.id === requestId ? { ...item, ...updates } : item
  );
  saveLocalWithdrawals(updated);

  // 2. Update Firestore: save to complete_withdrawals, remove from withdrawal_notices, and update withdrawal_requests
  try {
    const existingReq = list.find((item) => item.id === requestId);
    const completeData: TutorWithdrawalRequest = {
      ...(existingReq || ({} as any)),
      ...updates
    };

    // Save to complete_withdrawals collection in Firestore
    const completeDocRef = doc(db, 'complete_withdrawals', requestId);
    await setDoc(completeDocRef, completeData);

    // Remove from withdrawal_notices collection in Firestore as requested
    const noticeDocRef = doc(db, 'withdrawal_notices', requestId);
    await deleteDoc(noticeDocRef).catch(() => {});

    // Also update legacy withdrawal_requests collection
    const docRef = doc(db, 'withdrawal_requests', requestId);
    await updateDoc(docRef, updates).catch(() => {});
  } catch (err) {
    console.warn('[payoutService] Firestore approve notice:', err);
  }
}

/**
 * Admin rejects a withdrawal request and removes it from pending withdrawal_notices
 */
export async function adminRejectWithdrawal(
  requestId: string,
  reason?: string
): Promise<void> {
  const updates = {
    status: 'rejected' as const,
    approvedAt: new Date().toISOString(),
    adminNote: reason || 'Declined by Administrator'
  };

  const list = getLocalWithdrawals();
  const updated = list.map((item) =>
    item.id === requestId ? { ...item, ...updates } : item
  );
  saveLocalWithdrawals(updated);

  try {
    // Delete from pending withdrawal_notices
    const noticeDocRef = doc(db, 'withdrawal_notices', requestId);
    await deleteDoc(noticeDocRef).catch(() => {});

    // Update in withdrawal_requests
    const docRef = doc(db, 'withdrawal_requests', requestId);
    await updateDoc(docRef, updates).catch(() => {});
  } catch (err) {
    console.warn('[payoutService] Firestore reject notice:', err);
  }
}

/**
 * Admin directly creates and approves a tutor payout record with UTR and payment notes
 * Updates tutor balance and saves to Firestore complete_withdrawals and withdrawal_requests
 */
export async function adminCreateAndApprovePayout(payload: {
  tutorId: string;
  tutorName: string;
  tutorEmail?: string;
  tutorPhone?: string;
  amount: number;
  paymentMethod: 'upi' | 'bank_transfer';
  upiId?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
  utrNumber: string;
  transferredAmount?: number;
  transferMethod?: string;
  paymentSlipUrl?: string;
  adminNote?: string;
  relatedRequestId?: string;
}): Promise<TutorWithdrawalRequest> {
  const payoutId =
    payload.relatedRequestId ||
    ('PAYOUT-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000));
  const now = new Date().toISOString();

  const record: TutorWithdrawalRequest = {
    id: payoutId,
    tutorId: payload.tutorId,
    tutorName: payload.tutorName,
    tutorEmail: payload.tutorEmail,
    tutorPhone: payload.tutorPhone,
    amount: Number(payload.amount),
    paymentMethod: payload.paymentMethod,
    upiId: payload.upiId,
    bankDetails: payload.bankDetails,
    status: 'approved',
    createdAt: now,
    approvedAt: now,
    utrNumber: payload.utrNumber.trim(),
    transferredAmount: Number(payload.transferredAmount || payload.amount),
    transferMethod:
      payload.transferMethod ||
      (payload.paymentMethod === 'upi' ? 'UPI Transfer' : 'IMPS Bank Transfer'),
    paymentSlipUrl: payload.paymentSlipUrl || '',
    adminNote:
      payload.adminNote || 'Approved by Administrator via Received Fee / Payouts Desk'
  };

  // 1. Update local cache
  const list = getLocalWithdrawals();
  const existingIdx = list.findIndex((item) => item.id === payoutId);
  let updatedList: TutorWithdrawalRequest[];
  if (existingIdx >= 0) {
    updatedList = list.map((item, idx) => (idx === existingIdx ? record : item));
  } else {
    updatedList = [record, ...list];
  }
  saveLocalWithdrawals(updatedList);

  // 2. Persist to Firestore: complete_withdrawals and withdrawal_requests
  try {
    const completeDocRef = doc(db, 'complete_withdrawals', payoutId);
    await setDoc(completeDocRef, record);

    const legacyDocRef = doc(db, 'withdrawal_requests', payoutId);
    await setDoc(legacyDocRef, record);

    // If there was a pending notice with this ID, remove it
    const noticeDocRef = doc(db, 'withdrawal_notices', payoutId);
    await deleteDoc(noticeDocRef).catch(() => {});
  } catch (err) {
    console.warn('[payoutService] adminCreateAndApprovePayout Firestore write error:', err);
  }

  return record;
}

/**
 * Real-time listener specifically for pending tutor requests in Firestore collection 'withdrawal_notices'
 */
export function subscribeToWithdrawalNotices(
  callback: (notices: TutorWithdrawalRequest[]) => void
): () => void {
  try {
    const colRef = collection(db, 'withdrawal_notices');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const notices: TutorWithdrawalRequest[] = [];
        snapshot.forEach((d) => {
          notices.push(d.data() as TutorWithdrawalRequest);
        });
        notices.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(notices);
      },
      (err) => {
        console.warn('[payoutService] withdrawal_notices listener notice:', err);
      }
    );
    return () => unsubscribe();
  } catch (err) {
    console.warn('[payoutService] subscribeToWithdrawalNotices error:', err);
    return () => {};
  }
}

/**
 * Real-time listener specifically for accepted tutor payouts in Firestore collection 'complete_withdrawals'
 */
export function subscribeToCompleteWithdrawals(
  callback: (withdrawals: TutorWithdrawalRequest[]) => void
): () => void {
  try {
    const colRef = collection(db, 'complete_withdrawals');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: TutorWithdrawalRequest[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as TutorWithdrawalRequest);
        });
        list.sort(
          (a, b) =>
            new Date(b.approvedAt || b.createdAt).getTime() -
            new Date(a.approvedAt || a.createdAt).getTime()
        );
        callback(list);
      },
      (err) => {
        console.warn('[payoutService] complete_withdrawals listener notice:', err);
      }
    );
    return () => unsubscribe();
  } catch (err) {
    console.warn('[payoutService] subscribeToCompleteWithdrawals error:', err);
    return () => {};
  }
}
