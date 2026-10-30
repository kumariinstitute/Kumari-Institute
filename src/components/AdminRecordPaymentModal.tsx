import React, { useState } from 'react';
import {
  X,
  CreditCard,
  IndianRupee,
  Home,
  BookOpen,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  User,
  Phone,
  FileText,
  Sparkles
} from 'lucide-react';
import { Tutor } from '../data/tutorsData';
import { ActivityActionType, ActivityCategory } from '../types';

interface AdminRecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutors: Tutor[];
  currentAdminName?: string;
  onSave: (data: {
    adminName: string;
    actionType: ActivityActionType;
    category: ActivityCategory;
    studentName: string;
    parentName?: string;
    parentPhone?: string;
    tutorName?: string;
    tutorId?: string;
    courseTitle?: string;
    amount?: number;
    paymentMethod?: 'UPI / QR' | 'Cash (At Center)' | 'Bank Transfer / NEFT' | 'Online Card / Gateway';
    transactionId?: string;
    receiptNo?: string;
    notes?: string;
  }) => Promise<void>;
}

export const AdminRecordPaymentModal: React.FC<AdminRecordPaymentModalProps> = ({
  isOpen,
  onClose,
  tutors,
  currentAdminName = 'Admin Chandini Kurumoju',
  onSave
}) => {
  const [selectedWay, setSelectedWay] = useState<
    'way1_home_tutor' | 'way2_course' | 'demo_booking' | 'tutor_approval'
  >('way1_home_tutor');

  const [adminName, setAdminName] = useState<string>(currentAdminName);
  const [studentName, setStudentName] = useState<string>('');
  const [parentName, setParentName] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  
  // Way 1: Home Tutor
  const [selectedTutorId, setSelectedTutorId] = useState<string>(tutors[0]?.id || '');
  const [customTutorName, setCustomTutorName] = useState<string>('');
  
  // Way 2: Course
  const [courseTitle, setCourseTitle] = useState<string>('JNVST Navodaya Class 6 Exam Prep Course');
  
  // Payment Details
  const [amount, setAmount] = useState<string>('3500');
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI / QR' | 'Cash (At Center)' | 'Bank Transfer / NEFT' | 'Online Card / Gateway'
  >('UPI / QR');
  const [transactionId, setTransactionId] = useState<string>(`UPI-${Date.now().toString().slice(-6)}`);
  const [receiptNo, setReceiptNo] = useState<string>(`KIR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState<string>('');
  
  // Demo Booking Fields
  const [demoAction, setDemoAction] = useState<'scheduled' | 'contacted' | 'enrolled'>('scheduled');
  const [demoDate, setDemoDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [demoTime, setDemoTime] = useState<string>('10:00 AM');

  // Tutor Approval Fields
  const [approvalDecision, setApprovalDecision] = useState<'approved' | 'rejected'>('approved');
  const [verificationNotes, setVerificationNotes] = useState<string>('Verified 10th marksheet, degree certificate, and identity proof.');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWaySelect = (way: 'way1_home_tutor' | 'way2_course' | 'demo_booking' | 'tutor_approval') => {
    setSelectedWay(way);
    setErrorMessage(null);
    if (way === 'way1_home_tutor') {
      const tutor = tutors.find(t => t.id === selectedTutorId);
      setAmount(tutor?.monthlyFee ? String(tutor.monthlyFee) : '3500');
      setReceiptNo(`KIR-HT-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (way === 'way2_course') {
      setAmount('2500');
      setReceiptNo(`KIR-CR-${Math.floor(2000 + Math.random() * 8000)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedWay.startsWith('way') && !studentName.trim()) {
      setErrorMessage('Student name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;

      if (selectedWay === 'way1_home_tutor') {
        const foundTutor = tutors.find(t => t.id === selectedTutorId);
        const resolvedTutorName = foundTutor?.name || customTutorName || 'Home Tutor';
        await onSave({
          adminName,
          actionType: 'payment_home_tutor',
          category: 'payment_home_tutors',
          studentName: studentName.trim(),
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          tutorName: resolvedTutorName,
          tutorId: selectedTutorId,
          amount: parsedAmount,
          paymentMethod,
          transactionId: transactionId.trim(),
          receiptNo: receiptNo.trim(),
          notes: notes.trim() || `Monthly tuition fee collected for ${resolvedTutorName} in Rayagada.`
        });
      } else if (selectedWay === 'way2_course') {
        await onSave({
          adminName,
          actionType: 'payment_course',
          category: 'payment_courses',
          studentName: studentName.trim(),
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          courseTitle,
          amount: parsedAmount,
          paymentMethod,
          transactionId: transactionId.trim(),
          receiptNo: receiptNo.trim(),
          notes: notes.trim() || `Course fee payment received for ${courseTitle}.`
        });
      } else if (selectedWay === 'demo_booking') {
        await onSave({
          adminName,
          actionType: demoAction === 'scheduled' ? 'demo_booking_scheduled' : 'demo_booking_handled',
          category: 'demo_bookings',
          studentName: studentName.trim() || 'Demo Student',
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          courseTitle,
          notes: notes.trim() || `Offline demo inquiry handled. Trial scheduled for ${demoDate} at ${demoTime}.`
        });
      } else if (selectedWay === 'tutor_approval') {
        const foundTutor = tutors.find(t => t.id === selectedTutorId);
        const resolvedTutorName = foundTutor?.name || customTutorName || 'Educator';
        await onSave({
          adminName,
          actionType: approvalDecision === 'approved' ? 'tutor_approved' : 'tutor_rejected',
          category: 'tutors',
          tutorName: resolvedTutorName,
          tutorId: selectedTutorId,
          notes: verificationNotes.trim() || `Tutor verification status set to ${approvalDecision}.`
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to record entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure bottom navigation bar is hidden while modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      window.dispatchEvent(new Event('modal-state-change'));
      return () => {
        document.body.classList.remove('modal-open');
        window.dispatchEvent(new Event('modal-state-change'));
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-700 overflow-hidden relative my-6 text-left max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Record Admin Activity &amp; Payment</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Audit Entry
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Log administrative actions and received payments for auditable record keeping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Type Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Select Activity / Payment Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleWaySelect('way1_home_tutor')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedWay === 'way1_home_tutor'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Home className={`w-4 h-4 ${selectedWay === 'way1_home_tutor' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Way 1
                  </span>
                </div>
                <div className="font-bold text-xs">Home Tutor Payment</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Monthly fee for tutor</div>
              </button>

              <button
                type="button"
                onClick={() => handleWaySelect('way2_course')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedWay === 'way2_course'
                    ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <BookOpen className={`w-4 h-4 ${selectedWay === 'way2_course' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Way 2
                  </span>
                </div>
                <div className="font-bold text-xs">Course Payment</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Navodaya / Coaching</div>
              </button>

              <button
                type="button"
                onClick={() => handleWaySelect('demo_booking')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedWay === 'demo_booking'
                    ? 'bg-purple-500/20 border-purple-500/60 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Calendar className={`w-4 h-4 ${selectedWay === 'demo_booking' ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Demo
                  </span>
                </div>
                <div className="font-bold text-xs">Handle Demo Class</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Schedule &amp; inquiry</div>
              </button>

              <button
                type="button"
                onClick={() => handleWaySelect('tutor_approval')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedWay === 'tutor_approval'
                    ? 'bg-blue-500/20 border-blue-500/60 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ShieldCheck className={`w-4 h-4 ${selectedWay === 'tutor_approval' ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Verify
                  </span>
                </div>
                <div className="font-bold text-xs">Tutor Verification</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Certificates &amp; approval</div>
              </button>
            </div>
          </div>

          {/* Admin Performing the Action */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Performing this Action (Audit Identity) *
            </label>
            <select
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="Admin Chandini Kurumoju">Admin Chandini Kurumoju (Principal Admin)</option>
              <option value="Admin Rajesh Panda">Admin Rajesh Panda (Head Coordinator)</option>
              <option value="Admin Sunita Sahoo">Admin Sunita Sahoo (Academic Registrar)</option>
              <option value="Admin Anil Mohanty">Admin Anil Mohanty (Finance &amp; Accounts Desk)</option>
            </select>
          </div>

          {/* Student & Parent Info (for payments & demo queries) */}
          {selectedWay !== 'tutor_approval' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Choudhury"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manas Choudhury"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Parent Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 94371 XXXXX"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WAY 1: HOME TUTOR SELECTION */}
          {selectedWay === 'way1_home_tutor' && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Home className="w-4 h-4" />
                <span>Way 1: Assigned Home Tutor Details</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Registered Home Tutor *
                </label>
                <select
                  value={selectedTutorId}
                  onChange={(e) => {
                    setSelectedTutorId(e.target.value);
                    const selected = tutors.find(t => t.id === e.target.value);
                    if (selected?.monthlyFee) {
                      setAmount(String(selected.monthlyFee));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.qualification || 'Educator'}) - ₹{t.monthlyFee}/mo - {t.locationArea || 'Rayagada'}
                    </option>
                  ))}
                  <option value="custom">Other / Custom Home Tutor</option>
                </select>
              </div>

              {selectedTutorId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Custom Tutor Name:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tutor full name..."
                    value={customTutorName}
                    onChange={(e) => setCustomTutorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* WAY 2: COURSE SELECTION */}
          {selectedWay === 'way2_course' && (
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Way 2: Institute Coaching Course</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Enrolled Course Program *
                </label>
                <select
                  value={courseTitle}
                  onChange={(e) => {
                    setCourseTitle(e.target.value);
                    if (e.target.value.includes('Navodaya')) setAmount('2500');
                    else if (e.target.value.includes('Foundation')) setAmount('5800');
                    else if (e.target.value.includes('Olympiad')) setAmount('3200');
                    else setAmount('3000');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="JNVST Navodaya Class 6 Exam Prep Course">JNVST Navodaya Class 6 Exam Prep Course (Top Choice)</option>
                  <option value="Secondary Foundation Course (CBSE 9-10)">Secondary Foundation Course (CBSE 9-10)</option>
                  <option value="Secondary Foundation Course (ICSE 9-10)">Secondary Foundation Course (ICSE 9-10)</option>
                  <option value="Science Olympiad & NTSE Mastery">Science Olympiad &amp; NTSE Mastery</option>
                  <option value="Board Exam Booster (Class 10)">Board Exam Booster (Class 10)</option>
                  <option value="Primary Excellence & Navodaya Junior (Class 3-5)">Primary Excellence &amp; Navodaya Junior (Class 3-5)</option>
                  <option value="Spoken English & Communication Mastery">Spoken English &amp; Communication Mastery</option>
                  <option value="Vedic Mathematics & Mental Arithmetic">Vedic Mathematics &amp; Mental Arithmetic</option>
                </select>
              </div>
            </div>
          )}

          {/* PAYMENT DETAILS (for Way 1 & Way 2) */}
          {selectedWay.startsWith('way') && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Financial &amp; Receipt Reconcile Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Amount Received (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-emerald-400">₹</span>
                    <input
                      type="number"
                      required
                      min={100}
                      step={100}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                  >
                    <option value="UPI / QR">UPI / QR (PhonePe / GPay / Paytm)</option>
                    <option value="Cash (At Center)">Cash (Received at Center Desk)</option>
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT / IMPS</option>
                    <option value="Online Card / Gateway">Online Card / Gateway</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Transaction ID / Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-94820129"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Receipt / Voucher Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KIR-HT-1092"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DEMO BOOKING HANDLING FIELDS */}
          {selectedWay === 'demo_booking' && (
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status Action</label>
                  <select
                    value={demoAction}
                    onChange={(e) => setDemoAction(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="scheduled">Scheduled Demo Class</option>
                    <option value="contacted">Contacted Parent</option>
                    <option value="enrolled">Enrolled Directly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={demoDate}
                    onChange={(e) => setDemoDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={demoTime}
                    onChange={(e) => setDemoTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TUTOR VERIFICATION ACTION FIELDS */}
          {selectedWay === 'tutor_approval' && (
            <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Tutor to Audit *</label>
                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.qualification || 'Educator'}) - Status: {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Audit Decision</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-400">
                    <input
                      type="radio"
                      name="decision"
                      checked={approvalDecision === 'approved'}
                      onChange={() => setApprovalDecision('approved')}
                    />
                    <span>Approved Genuine Tutor</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-400">
                    <input
                      type="radio"
                      name="decision"
                      checked={approvalDecision === 'rejected'}
                      onChange={() => setApprovalDecision('rejected')}
                    />
                    <span>Verification Rejected</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Marksheet &amp; Verification Audit Notes</label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Audit Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Audit Notes / Administrative Memo
            </label>
            <textarea
              rows={2}
              placeholder="Add verification notes, batch details, or reconciliation comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Recording Audit...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit Audit Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
