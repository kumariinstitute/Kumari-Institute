import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  Phone,
  QrCode,
  Building,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AppUserProfile } from '../services/firebaseAuth';
import { formatINR, processParentFeePayment, ReceivedFeeRecord } from '../services/feePaymentService';

interface PayTutorFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  currentUser: AppUserProfile;
  onPaymentSuccess: (record: ReceivedFeeRecord, receipt: any) => void;
}

type PaymentOption = 'upi' | 'gpay_phonepe' | 'netbanking' | 'cards' | 'desk';

export const PayTutorFeeModal: React.FC<PayTutorFeeModalProps> = ({
  isOpen,
  onClose,
  booking,
  currentUser,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentOption>('gpay_phonepe');
  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const tutorName =
    booking.assignedTutorName ||
    booking.requestedTutorName ||
    booking.tutorName ||
    booking.name ||
    'Assigned Home Tutor';

  const tutorFee = Number(
    booking.assignedTutorFee ||
    booking.requestedTutorMonthlyFee ||
    booking.monthlyFee ||
    booking.fee ||
    3000
  );

  const studentName = booking.studentName || currentUser.childName || currentUser.name || 'Student';
  const studentGrade = booking.studentGrade || currentUser.childGrade || 'All Classes';
  const tutorSubjects = Array.isArray(booking.subjects)
    ? booking.subjects.join(', ')
    : booking.subjects || 'All Subjects';

  const methodLabelMap: Record<PaymentOption, 'UPI' | 'PhonePe / GPay' | 'Net Banking' | 'Debit/Credit Card' | 'Cash / Institute Desk'> = {
    upi: 'UPI',
    gpay_phonepe: 'PhonePe / GPay',
    netbanking: 'Net Banking',
    cards: 'Debit/Credit Card',
    desk: 'Cash / Institute Desk'
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Simulate realistic bank / gateway processing latency
      await new Promise((resolve) => setTimeout(resolve, 900));

      const res = await processParentFeePayment({
        parentUser: currentUser,
        booking,
        amount: tutorFee,
        paymentMethod: methodLabelMap[selectedMethod],
        utrNumber: utrNumber.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (res.success) {
        setIsProcessing(false);
        onPaymentSuccess(res.record, res.receipt);
      } else {
        setErrorMsg('Could not record payment. Please try again.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMsg(err?.message || 'Payment transaction failed. Please retry.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 text-left flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#03132B] via-[#082245] to-[#041938] p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between gap-3 mb-2.5">
            <img
              src="/Logo/kumarilogo.png"
              alt="Kumari Institute"
              className="h-10 w-auto max-w-[150px] object-contain p-[3px]"
              style={{ padding: '3px' }}
              referrerPolicy="no-referrer"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tuition Fee Payment</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pay Monthly Tutor Fee
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Kumari Educational Coaching Institute • Official Payment Desk
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handlePaySubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tuition & Educator Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200">
                  {tutorName ? tutorName.slice(0, 2).toUpperCase() : 'HT'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">{tutorName}</h4>
                  <p className="text-xs text-slate-500">{tutorSubjects}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Student: <strong className="text-slate-700">{studentName}</strong> ({studentGrade})
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Monthly Fee
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-700">
                  {formatINR(tutorFee)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Cycle: 1 Full Month (28 Days)</span>
              </span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Official Digital Receipt Included
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Payment Option
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: PhonePe / Google Pay / Paytm */}
              <div
                onClick={() => setSelectedMethod('gpay_phonepe')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedMethod === 'gpay_phonepe'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">PhonePe / GPay / Paytm</p>
                  <p className="text-[11px] text-slate-500">Fast UPI QR &amp; Apps</p>
                </div>
              </div>

              {/* Option 2: Direct UPI ID */}
              <div
                onClick={() => setSelectedMethod('upi')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Direct UPI ID</p>
                  <p className="text-[11px] text-slate-500">kumari@oksbi / All UPIs</p>
                </div>
              </div>

              {/* Option 3: Net Banking */}
              <div
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedMethod === 'netbanking'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Net Banking</p>
                  <p className="text-[11px] text-slate-500">SBI, HDFC, ICICI, etc.</p>
                </div>
              </div>

              {/* Option 4: Debit / Credit Card */}
              <div
                onClick={() => setSelectedMethod('cards')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedMethod === 'cards'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Debit / Credit Card</p>
                  <p className="text-[11px] text-slate-500">Visa, Mastercard, RuPay</p>
                </div>
              </div>
            </div>
          </div>

          {/* Institute UPI QR Display Box */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Official UPI ID: <span className="font-mono text-blue-700 select-all">8280036680@ybl</span></p>
                <p className="text-[11px] text-slate-500">Kumari Educational Coaching Institute</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('8280036680@ybl');
                alert('UPI ID copied to clipboard!');
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-blue-700 font-bold text-[11px] hover:bg-blue-50 cursor-pointer shrink-0"
            >
              Copy UPI
            </button>
          </div>

          {/* Optional UTR / Reference Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Bank Transaction / UTR Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 423984128912 or UPI Ref"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Payment Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1st month tuition fee"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Security & Renewal Notice */}
          <div className="p-3 rounded-xl bg-slate-100/80 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Automatic 28-day billing reminder:</strong> Once payment is confirmed, the button will display <strong>Paid</strong> for 28 days. An official receipt will be generated in your Fee Receipts tab immediately.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Pay {formatINR(tutorFee)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
