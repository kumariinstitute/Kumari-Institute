import React from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Receipt,
  Home,
  BookOpen,
  Calendar,
  ShieldCheck,
  UserCheck,
  Download
} from 'lucide-react';
import { AdminActivityLog } from '../types';

interface AdminReceiptVoucherModalProps {
  log: AdminActivityLog | null;
  onClose: () => void;
}

export const AdminReceiptVoucherModal: React.FC<AdminReceiptVoucherModalProps> = ({
  log,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const isHomeTutorPayment =
    log.category === 'payment_home_tutors' || log.actionType === 'payment_home_tutor';
  const isCoursePayment =
    log.category === 'payment_courses' || log.actionType === 'payment_course';
  const isPayment = isHomeTutorPayment || isCoursePayment || (typeof log.amount === 'number' && log.amount > 0);

  const handleCopyRef = () => {
    const text = log.receiptNo || log.transactionId || log.id;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-700 overflow-hidden relative my-6 text-left flex flex-col">
        {/* Header Bar */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span>Audit Trail &amp; Reconciled Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
              title="Print Voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="p-6 bg-slate-900 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Institute Letterhead */}
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="inline-block p-1 bg-white rounded-xl mb-2 shadow-sm">
              <img
                src="/Logo/kumarilogo.png"
                alt="Kumari Institute"
                className="h-12 w-auto object-contain p-[3px]"
                style={{ padding: '3px' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase">
              Kumari Institute
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Indira Nagar, Near Traffic Square, Rayagada, Odisha - 765001
            </p>
            <p className="text-[10px] text-slate-500">
              Coaching Center &amp; Verified Home Tutor Services • Ph: +91 94371 88201
            </p>

            {/* Voucher Category Banner */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {isHomeTutorPayment && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span>Way 1: Home Tutor Tuition Payment Voucher</span>
                </span>
              )}
              {isCoursePayment && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Way 2: Course Admission Payment Voucher</span>
                </span>
              )}
              {!isPayment && (
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administrative Audit Certificate</span>
                </span>
              )}
            </div>
          </div>

          {/* Voucher Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Voucher No.</span>
              <span className="font-mono font-bold text-white text-sm">
                {log.receiptNo || `KIR-${log.id.slice(-6).toUpperCase()}`}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date &amp; Time</span>
              <span className="font-medium text-slate-200">
                {new Date(log.timestamp).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audited By Admin</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <span>{log.adminName}</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reconciliation Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified &amp; Reconciled</span>
              </span>
            </div>
          </div>

          {/* Student & Parent Section */}
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
              Student &amp; Beneficiary Details
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Student Name:</span>
                <span className="font-bold text-white text-sm">{log.studentName || log.targetName || 'Registered Student'}</span>
              </div>
              {log.parentName && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Parent / Guardian:</span>
                  <span className="font-medium text-slate-200">{log.parentName}</span>
                </div>
              )}
              {log.parentPhone && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact Phone:</span>
                  <span className="font-mono text-slate-200">{log.parentPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Service / Tutor / Course Details */}
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
              Service / Program Particulars
            </div>
            <div className="space-y-1.5 pt-1">
              {log.tutorName && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assigned Home Tutor:</span>
                  <span className="font-bold text-emerald-400">{log.tutorName}</span>
                </div>
              )}
              {log.courseTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Enrolled Course:</span>
                  <span className="font-bold text-amber-300">{log.courseTitle}</span>
                </div>
              )}
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-400">Audit Action / Title:</span>
                <span className="font-medium text-right text-slate-200 max-w-[65%]">{log.title}</span>
              </div>
              {log.notes && (
                <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 italic">
                  Note: "{log.notes}"
                </div>
              )}
            </div>
          </div>

          {/* Amount Breakdown Box (if payment) */}
          {isPayment && typeof log.amount === 'number' && (
            <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block">
                  Total Amount Received &amp; Reconciled
                </span>
                <span className="text-2xl font-black text-white">
                  ₹{log.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Method: {log.paymentMethod || 'UPI / QR'}
                </span>
              </div>

              {log.transactionId && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Transaction Ref</span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                    {log.transactionId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Official Stamp & Sign Off */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block text-xs">Kumari Institute Audit Desk</span>
                <span className="text-slate-400 text-[10px]">Verified Official Record</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Authorized Signature</span>
              <span className="font-serif italic font-bold text-amber-400 text-sm">{log.adminName}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleCopyRef}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Reference!' : 'Copy Reference'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
