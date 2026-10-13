import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Download,
  Printer,
  Filter,
  ArrowUpRight,
  Receipt,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Wallet,
  AlertCircle,
  Loader2,
  X,
  ArrowRight
} from 'lucide-react';
import { ReceivedFeeRecord, formatINR } from '../services/feePaymentService';
import { adminCreateAndApprovePayout } from '../services/payoutService';

interface AdminReceivedFeeTabProps {
  receivedFees: ReceivedFeeRecord[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AdminReceivedFeeTab: React.FC<AdminReceivedFeeTabProps> = ({
  receivedFees,
  isLoading = false,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [methodFilter, setMethodFilter] = useState<
    'all' | 'UPI' | 'PhonePe / GPay' | 'Net Banking' | 'Debit/Credit Card' | 'Cash / Institute Desk'
  >('all');
  const [selectedFeeModal, setSelectedFeeModal] = useState<ReceivedFeeRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Approve Withdrawal Modal State
  const [payoutFeeTarget, setPayoutFeeTarget] = useState<ReceivedFeeRecord | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [payoutUtr, setPayoutUtr] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  const [payoutUpiId, setPayoutUpiId] = useState<string>('');
  const [payoutBankName, setPayoutBankName] = useState<string>('State Bank of India (Rayagada)');
  const [payoutAccountNo, setPayoutAccountNo] = useState<string>('');
  const [payoutIfsc, setPayoutIfsc] = useState<string>('SBIN0000167');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState<string | null>(null);
  const [payoutErrorMessage, setPayoutErrorMessage] = useState<string | null>(null);

  // Quick Date Preset Handler
  const handleDatePresetChange = (preset: 'all' | 'today' | 'this_week' | 'this_month' | 'custom') => {
    setDatePreset(preset);
    const now = new Date();
    const toISODate = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = toISODate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'this_week') {
      const dayOfWeek = now.getDay();
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
      setStartDate(toISODate(firstDay));
      setEndDate(toISODate(now));
    } else if (preset === 'this_month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toISODate(firstDayOfMonth));
      setEndDate(toISODate(now));
    }
  };

  // Helper to extract comparable date (YYYY-MM-DD) from fee record
  const getFeeDateStr = (fee: ReceivedFeeRecord): string | null => {
    if (fee.paidAt) {
      try {
        const d = new Date(fee.paidAt);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      } catch {
        // ignore
      }
    }
    if (fee.createdAt) {
      try {
        const d = new Date(fee.createdAt);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      } catch {
        // ignore
      }
    }
    if (fee.paidDate) {
      try {
        const d = new Date(fee.paidDate);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      } catch {
        // ignore
      }
    }
    return null;
  };

  // Filter fees based on parent name, student name, date range, search query, and payment method
  const filteredFees = receivedFees.filter((fee) => {
    // 1. Payment method filter
    if (methodFilter !== 'all' && fee.paymentMethod !== methodFilter) {
      return false;
    }

    // 2. Specific Parent Name filter
    if (parentFilter.trim()) {
      const pQuery = parentFilter.toLowerCase().trim();
      if (!(fee.parentName || '').toLowerCase().includes(pQuery)) {
        return false;
      }
    }

    // 3. Specific Student Name filter
    if (studentFilter.trim()) {
      const sQuery = studentFilter.toLowerCase().trim();
      if (!(fee.studentName || '').toLowerCase().includes(sQuery)) {
        return false;
      }
    }

    // 4. Date Range filter (startDate & endDate)
    if (startDate || endDate) {
      const feeDateStr = getFeeDateStr(fee);
      if (feeDateStr) {
        if (startDate && feeDateStr < startDate) {
          return false;
        }
        if (endDate && feeDateStr > endDate) {
          return false;
        }
      }
    }

    // 5. General search bar keyword query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const parentNameMatch = (fee.parentName || '').toLowerCase().includes(q);
      const studentNameMatch = (fee.studentName || '').toLowerCase().includes(q);
      const tutorNameMatch = (fee.tutorName || '').toLowerCase().includes(q);
      const receiptNoMatch = (fee.receiptNo || '').toLowerCase().includes(q);
      const txnMatch = (fee.transactionId || '').toLowerCase().includes(q);
      const phoneMatch = (fee.parentPhone || '').toLowerCase().includes(q);
      const emailMatch = (fee.parentEmail || '').toLowerCase().includes(q);
      const subjectsMatch = (fee.tutorSubjects || '').toLowerCase().includes(q);
      const periodMatch = (fee.billingPeriod || '').toLowerCase().includes(q);

      if (
        !parentNameMatch &&
        !studentNameMatch &&
        !tutorNameMatch &&
        !receiptNoMatch &&
        !txnMatch &&
        !phoneMatch &&
        !emailMatch &&
        !subjectsMatch &&
        !periodMatch
      ) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats for current filtered set vs all records
  const totalCollectedFiltered = filteredFees.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const isAnyFilterActive = Boolean(
    searchTerm.trim() ||
      parentFilter.trim() ||
      studentFilter.trim() ||
      startDate ||
      endDate ||
      methodFilter !== 'all' ||
      datePreset !== 'all'
  );

  const clearAllFilters = () => {
    setSearchTerm('');
    setParentFilter('');
    setStudentFilter('');
    setStartDate('');
    setEndDate('');
    setDatePreset('all');
    setMethodFilter('all');
  };

  // Calculate cumulative stats
  const totalCollected = receivedFees.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalTransactions = receivedFees.length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenApproveWithdrawal = (fee: ReceivedFeeRecord) => {
    setPayoutFeeTarget(fee);
    setPayoutAmount(fee.amount ? fee.amount.toString() : '3000');
    setPayoutMethod('upi');
    setPayoutUtr('');
    setPayoutNotes(`Monthly tuition payout for ${fee.tutorName} (Student: ${fee.studentName})`);
    setPayoutUpiId(`${fee.tutorName.toLowerCase().replace(/\s+/g, '')}@okaxis`);
    setPayoutAccountNo('982400192837');
    setPayoutSuccessMessage(null);
    setPayoutErrorMessage(null);
  };

  const handleConfirmApprovePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutFeeTarget) return;

    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayoutErrorMessage('Please enter a valid disbursement amount.');
      return;
    }

    if (!payoutUtr.trim()) {
      setPayoutErrorMessage('Bank UTR / Transaction Reference number is mandatory for audit verification.');
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutErrorMessage(null);

    try {
      const tutorIdentifier =
        payoutFeeTarget.tutorId ||
        payoutFeeTarget.tutorName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      await adminCreateAndApprovePayout({
        tutorId: tutorIdentifier,
        tutorName: payoutFeeTarget.tutorName,
        tutorPhone: payoutFeeTarget.tutorPhone,
        amount: amt,
        paymentMethod: payoutMethod,
        upiId: payoutMethod === 'upi' ? payoutUpiId.trim() : undefined,
        bankDetails:
          payoutMethod === 'bank_transfer'
            ? {
                bankName: payoutBankName.trim(),
                accountNumber: payoutAccountNo.trim(),
                ifscCode: payoutIfsc.trim(),
                accountHolder: payoutFeeTarget.tutorName
              }
            : undefined,
        utrNumber: payoutUtr.trim(),
        transferredAmount: amt,
        transferMethod: payoutMethod === 'upi' ? 'UPI Bank Transfer' : 'IMPS / NEFT Settlement',
        adminNote: payoutNotes.trim() || `Disbursed for ${payoutFeeTarget.receiptNo}`
      });

      setPayoutSuccessMessage(
        `✓ Payout of ₹${amt.toLocaleString('en-IN')} approved for ${payoutFeeTarget.tutorName}! Tutor balance updated and UTR logged in payout history.`
      );

      setTimeout(() => {
        setPayoutFeeTarget(null);
        setPayoutSuccessMessage(null);
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err: any) {
      console.error('Error approving withdrawal:', err);
      setPayoutErrorMessage(err?.message || 'Failed to approve withdrawal. Please retry.');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stat Cards */}
      <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Received Fees Desk
              </h2>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Cloud Firestore Real-Time Sync
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            All parent tuition fee transactions paid online or recorded at the institute desk. View paying parent, child details, assigned educator, exact date &amp; timestamp, payment mode, and billing cycles. Directly approve tutor withdrawals with UTR.
          </p>
        </div>

        {/* Global Summary KPI Pills */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700/80 min-w-[150px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Fees Collected
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {formatINR(totalCollected)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Cumulative Parent Inflows
            </span>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700/80 min-w-[130px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Verified Receipts
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalTransactions}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
              ✓ Active Tuition Cycles
            </span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer self-stretch flex items-center justify-center"
              title="Refresh received fees from Cloud Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Search and Advanced Filter Panel for Parent Name, Student Name, Date Range, & Mode */}
      <div className="bg-slate-850/80 rounded-2xl border border-slate-700/80 p-4 space-y-3.5 shadow-lg">
        {/* Row 1: Quick Search Bar + Filter Status / Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* General Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search by receipt no, UTR, parent, student, tutor, phone, or billing cycle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/90 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:border-emerald-400/80 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
                title="Clear quick search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Status Badge & Reset All Button */}
          <div className="flex items-center gap-2 shrink-0">
            {isAnyFilterActive ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    Showing {filteredFees.length} of {receivedFees.length} payments ({formatINR(totalCollectedFiltered)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                  title="Reset all filters to default"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </>
            ) : (
              <div className="text-xs text-slate-400 font-medium px-1">
                Showing all {receivedFees.length} payments ({formatINR(totalCollected)})
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Specific Filters - Parent Name, Student Name, & Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-2 border-t border-slate-750/80">
          {/* Filter by Parent Name */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" />
              <span>Parent Name</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by parent name..."
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                  parentFilter.trim() ? 'border-emerald-500/70 bg-emerald-950/20' : 'border-slate-700'
                }`}
              />
              {parentFilter && (
                <button
                  type="button"
                  onClick={() => setParentFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter by Student Name */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-cyan-400" />
              <span>Student Name</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by student name..."
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${
                  studentFilter.trim() ? 'border-cyan-500/70 bg-cyan-950/20' : 'border-slate-700'
                }`}
              />
              {studentFilter && (
                <button
                  type="button"
                  onClick={() => setStudentFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter by Date Range: From & To */}
          <div className="lg:col-span-4 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Date Range (Payment Date)</span>
              </span>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setDatePreset('all');
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-normal"
                >
                  Clear dates
                </button>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className={`w-full bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                    startDate ? 'border-amber-500/70 bg-amber-950/20' : 'border-slate-700'
                  }`}
                  title="From date"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className={`w-full bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                    endDate ? 'border-amber-500/70 bg-amber-950/20' : 'border-slate-700'
                  }`}
                  title="To date"
                />
              </div>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="lg:col-span-2 sm:col-span-2 flex flex-col justify-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Quick Presets
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' }
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDatePresetChange(p.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    datePreset === p.id
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-750'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Payment Method Filter Pills */}
        <div className="pt-2 border-t border-slate-750/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" />
              <span>Mode:</span>
            </span>
            {(
              [
                { id: 'all', label: 'All Modes' },
                { id: 'UPI', label: 'UPI' },
                { id: 'PhonePe / GPay', label: 'PhonePe / GPay' },
                { id: 'Net Banking', label: 'Net Banking' },
                { id: 'Debit/Credit Card', label: 'Cards' },
                { id: 'Cash / Institute Desk', label: 'Desk / Cash' }
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethodFilter(m.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  methodFilter === m.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Active Filter Pills Display */}
          {(parentFilter || studentFilter || startDate || endDate || datePreset !== 'all' || methodFilter !== 'all') && (
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {parentFilter && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  Parent: {parentFilter}
                  <button type="button" onClick={() => setParentFilter('')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {studentFilter && (
                <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  Student: {studentFilter}
                  <button type="button" onClick={() => setStudentFilter('')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  Dates: {startDate || 'Start'} to {endDate || 'End'}
                  <button type="button" onClick={() => { setStartDate(''); setEndDate(''); setDatePreset('all'); }} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {methodFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
                  Mode: {methodFilter}
                  <button type="button" onClick={() => setMethodFilter('all')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Received Fees Table */}
      {filteredFees.length === 0 ? (
        <div className="bg-slate-800/40 rounded-3xl p-12 text-center border border-slate-700/60 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Received Fee Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isAnyFilterActive
              ? 'No transactions matched your specified search or filter criteria. Try clearing parent, student, date range, or keyword filters.'
              : 'When parents click "Pay Fee" on the portal or pay online, their transaction receipt will automatically populate here in real-time.'}
          </p>
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/70 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="py-3.5 px-4">Receipt / Date</th>
                  <th className="py-3.5 px-4">Parent Details</th>
                  <th className="py-3.5 px-4">Student &amp; Class</th>
                  <th className="py-3.5 px-4">Assigned Tutor</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Next Due (28 Days)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredFees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-slate-750/50 transition-colors group"
                  >
                    {/* Receipt No & Timestamp */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                        <span>{fee.receiptNo}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(fee.receiptNo, fee.id)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                          title="Copy Receipt No"
                        >
                          {copiedId === fee.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{fee.paidDate} • {fee.paidTime}</span>
                      </div>
                    </td>

                    {/* Parent Name & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3 h-3 text-emerald-400" />
                        <span>{fee.parentName}</span>
                      </div>
                      {fee.parentPhone && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{fee.parentPhone}</span>
                        </div>
                      )}
                    </td>

                    {/* Student Name & Grade */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-amber-300">
                        {fee.studentName}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {fee.studentGrade || 'Class'}
                      </span>
                    </td>

                    {/* Assigned Tutor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 text-blue-400" />
                        <span>{fee.tutorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {fee.tutorSubjects || 'Home Tuition'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm">
                      <span>{fee.formattedAmount || formatINR(fee.amount)}</span>
                      <span className="block text-[10px] font-bold text-emerald-300/80 uppercase">
                        ✓ Verified Paid
                      </span>
                    </td>

                    {/* Payment Method & UTR */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 text-xs">
                        {fee.paymentMethod}
                      </div>
                      {fee.transactionId && (
                        <div
                          className="text-[10px] font-mono text-slate-400 truncate max-w-[130px] mt-0.5"
                          title={fee.transactionId}
                        >
                          Txn: {fee.transactionId}
                        </div>
                      )}
                    </td>

                    {/* Next Due (28 Days) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-300 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{fee.nextDueDate}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">28-day cycle</span>
                    </td>

                    {/* Actions: View Receipt Modal & Approve Withdrawal */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenApproveWithdrawal(fee)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Approve tutor payout with UTR and payment notes"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Approve Withdrawal</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedFeeModal(fee)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                          title="View Fee Voucher"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          APPROVE WITHDRAWAL & RECORD PAYOUT MODAL (With UTR and Notes)
         ========================================================================= */}
      {payoutFeeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-500/30 overflow-hidden relative my-6 text-left flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-5 text-white border-b border-slate-800 relative">
              <button
                type="button"
                onClick={() => setPayoutFeeTarget(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <Wallet className="w-4 h-4" />
                <span>Tutor Payout Disbursement</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Approve Tutor Withdrawal
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Disburse fees to <strong>{payoutFeeTarget.tutorName}</strong> for student{' '}
                <strong>{payoutFeeTarget.studentName}</strong> ({payoutFeeTarget.receiptNo})
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleConfirmApprovePayout} className="p-6 space-y-4 text-xs text-slate-300">
              {payoutSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{payoutSuccessMessage}</span>
                </div>
              )}

              {payoutErrorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{payoutErrorMessage}</span>
                </div>
              )}

              {/* Reference Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assigned Educator:</span>
                  <span className="font-bold text-white text-sm">{payoutFeeTarget.tutorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Parent Fee Received:</span>
                  <span className="font-bold text-emerald-400">
                    {formatINR(payoutFeeTarget.amount)} (Receipt: {payoutFeeTarget.receiptNo})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Student &amp; Class:</span>
                  <span className="font-semibold text-amber-300">
                    {payoutFeeTarget.studentName} ({payoutFeeTarget.studentGrade || 'Class'})
                  </span>
                </div>
              </div>

              {/* Payout Amount Field */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Disbursement Payout Amount (INR) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="1"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="e.g. 3000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Directly credited toward the educator's completed withdrawal balance.
                </p>
              </div>

              {/* Transfer Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Disbursement Payment Mode <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payoutMethod === 'upi'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>UPI Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payoutMethod === 'bank_transfer'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>IMPS / Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Mode Details */}
              {payoutMethod === 'upi' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tutor UPI ID
                  </label>
                  <input
                    type="text"
                    value={payoutUpiId}
                    onChange={(e) => setPayoutUpiId(e.target.value)}
                    placeholder="e.g. tutor@okaxis"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={payoutBankName}
                      onChange={(e) => setPayoutBankName(e.target.value)}
                      placeholder="Bank Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={payoutAccountNo}
                      onChange={(e) => setPayoutAccountNo(e.target.value)}
                      placeholder="Account No"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={payoutIfsc}
                      onChange={(e) => setPayoutIfsc(e.target.value)}
                      placeholder="IFSC"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* UTR Number Field (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Bank UTR / Transaction Reference Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={payoutUtr}
                  onChange={(e) => setPayoutUtr(e.target.value)}
                  placeholder="e.g. UTR20261010892348"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter the 12-to-16 digit bank settlement UTR recorded from your payment application.
                </p>
              </div>

              {/* Payment Notes Field */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Payment Notes &amp; Audit Reference <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Monthly tuition fee disbursed for Rohit (Class 10 CBSE)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayoutFeeTarget(null)}
                  disabled={isSubmittingPayout}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingPayout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Balance...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm &amp; Approve Withdrawal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          RECEIPT VOUCHER PREVIEW LIGHTBOX (Includes Nav Logo & Approve Action)
         ========================================================================= */}
      {selectedFeeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-700 overflow-hidden relative my-6 text-left flex flex-col">
            {/* Header with Top Nav Bar Logo */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-5 sm:p-6 text-white border-b border-slate-800 relative">
              <button
                type="button"
                onClick={() => setSelectedFeeModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-2">
                <img
                  src="/Logo/kumarilogo.png"
                  alt="Kumari Institute"
                  className="h-10 w-auto max-w-[150px] object-contain p-[2px]"
                  style={{ padding: '2px' }}
                  referrerPolicy="no-referrer"
                />
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Tuition Voucher</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Kumari Institute Fee Voucher
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rayagada, Odisha • Official Student Fee Record
              </p>
            </div>

            {/* Receipt Details */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Receipt No:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedFeeModal.receiptNo}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Paid Date &amp; Time:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedFeeModal.paidDate} at {selectedFeeModal.paidTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Paying Parent:</span>
                  <span className="font-bold text-white">{selectedFeeModal.parentName}</span>
                </div>
                {selectedFeeModal.parentPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Parent Phone:</span>
                    <span className="font-medium text-slate-300">
                      {selectedFeeModal.parentPhone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-amber-300">
                    {selectedFeeModal.studentName} ({selectedFeeModal.studentGrade || 'Class'})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assigned Educator:</span>
                  <span className="font-bold text-blue-300">{selectedFeeModal.tutorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Payment Mode:</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedFeeModal.paymentMethod}
                  </span>
                </div>
                {selectedFeeModal.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Txn / UTR Ref:</span>
                    <span className="font-mono text-slate-300">
                      {selectedFeeModal.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Next Billing Renewal:</span>
                  <span className="font-bold text-blue-400">
                    {selectedFeeModal.nextDueDate} (28 Days)
                  </span>
                </div>

                <div className="flex justify-between items-baseline font-bold pt-3 border-t border-slate-800 text-sm">
                  <span className="text-white">Amount Paid:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {selectedFeeModal.formattedAmount || formatINR(selectedFeeModal.amount)}
                  </span>
                </div>
              </div>

              {selectedFeeModal.notes && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-slate-300 text-xs">
                  <strong className="block text-slate-400 mb-0.5">Fee Notes:</strong>
                  <span>{selectedFeeModal.notes}</span>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const fee = selectedFeeModal;
                    setSelectedFeeModal(null);
                    handleOpenApproveWithdrawal(fee);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Approve Withdrawal for {selectedFeeModal.tutorName}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFeeModal(null)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Voucher</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
