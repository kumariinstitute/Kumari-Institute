import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Clock, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { DemoBookingForm } from '../types';
import { AppUserProfile, recordDemoBookingForUser, saveDemoBookingToFirestore } from '../services/firebaseAuth';

interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'Home Tutor' | 'Tuition Center' | 'Online Live';
  currentUser?: AppUserProfile | null;
  onBookingRecorded?: (updatedUser: AppUserProfile) => void;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'Tuition Center',
  currentUser,
  onBookingRecorded,
}) => {
  const [formData, setFormData] = useState<DemoBookingForm>({
    studentName: '',
    parentName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    grade: 'Class 9 & 10 (Board Prep)',
    subject: 'Mathematics & Science',
    mode: initialMode,
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '5:00 PM - 6:00 PM',
    notes: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.phone) return;

    const ref = 'BP-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setIsSubmitted(true);

    // Save to Firestore 'demo_bookings' collection in real time on database 'default'
    saveDemoBookingToFirestore({
      studentName: formData.studentName,
      parentName: formData.parentName,
      phone: formData.phone,
      email: formData.email,
      grade: formData.grade,
      subject: formData.subject,
      mode: formData.mode,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      notes: formData.notes,
      userId: currentUser?.uid
    }).catch((err) => console.warn('Demo booking Firestore save notice:', err));

    if (currentUser?.uid) {
      try {
        const updated = await recordDemoBookingForUser(currentUser.uid, {
          studentName: formData.studentName,
          grade: formData.grade,
          subject: formData.subject,
          mode: formData.mode,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime
        });
        if (onBookingRecorded) {
          onBookingRecorded(updated);
        }
      } catch (err) {
        console.warn('Notice saving demo booking to profile:', err);
      }
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      id="demo-booking-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="demo-booking-modal-container"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 relative">
          <button
            id="close-demo-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <img
              src="/Logo/kumarilogo.png"
              alt="Kumari Institute"
              className="h-10 sm:h-12 w-auto max-w-[170px] object-contain p-[3px]"
              style={{ padding: '3px' }}
              referrerPolicy="no-referrer"
            />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free • No Obligation</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Book a Free Demo Class
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Experience our interactive teaching methodology &amp; get personalized academic assessment.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h4 className="text-xl font-bold text-slate-900 mb-2">
                Demo Class Scheduled!
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                Thank you, <strong>{formData.parentName || formData.studentName}</strong>. Our academic counselor will call you on <strong>{formData.phone}</strong> to confirm teacher allocation and send the session link/room details.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-bold text-blue-700">{bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold">{formData.studentName} ({formData.grade})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="font-semibold text-emerald-700">{formData.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold">{formData.preferredDate} at {formData.preferredTime}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/919876543210?text=Hello%20BrightPath%2C%20I%20just%20booked%20a%20demo%20class%20(Ref%3A%20${bookingRef})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors text-center"
                >
                  Confirm on WhatsApp
                </a>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sharma"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class / Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option>Class 1 to 5 (Primary)</option>
                    <option>Class 6 to 8 (Middle)</option>
                    <option>Class 9 & 10 (Board Prep)</option>
                    <option>Class 11 (Science / Comm)</option>
                    <option>Class 12 (Board + Entrance)</option>
                    <option>JEE (Main & Advanced)</option>
                    <option>NEET Medical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teaching Mode
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mode: e.target.value as 'Home Tutor' | 'Tuition Center' | 'Online Live',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Tuition Center">Tuition Center (Classroom)</option>
                    <option value="Home Tutor">Home Tutor (At Your House)</option>
                    <option value="Online Live">Online Live Interactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option>10:00 AM - 11:30 AM (Morning)</option>
                    <option>4:00 PM - 5:30 PM (Evening 1)</option>
                    <option>5:30 PM - 7:00 PM (Evening 2)</option>
                    <option>7:00 PM - 8:30 PM (Night Batch)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="submit-demo-form-btn"
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#0b213f] hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Confirm Free Demo Class Reservation
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero registration charges. No credit card required.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
