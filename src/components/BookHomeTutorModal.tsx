import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle2, Home, Clock, Calendar, ShieldCheck, MapPin, Phone, User, BookOpen, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { Tutor } from '../data/tutorsData';
import { submitHomeTutorBooking, subscribeToTutorBookedSlots, AppUserProfile } from '../services/firebaseAuth';

interface BookHomeTutorModalProps {
  isOpen: boolean;
  tutor: Tutor | null;
  currentUser?: AppUserProfile | null;
  onClose: () => void;
  onBookingSuccess?: (bookingId: string) => void;
  onNavigateAuth?: (mode: 'login' | 'register', role?: 'parent' | 'teacher') => void;
}

export const BookHomeTutorModal: React.FC<BookHomeTutorModalProps> = ({
  isOpen,
  tutor,
  currentUser,
  onClose,
  onBookingSuccess,
  onNavigateAuth
}) => {
  const [studentName, setStudentName] = useState(currentUser?.childName || '');
  const [studentGrade, setStudentGrade] = useState(
    currentUser?.childGrade || tutor?.classesHandled?.[0] || 'Class 4 (CBSE)'
  );
  const [parentName, setParentName] = useState(currentUser?.name || '');
  const [parentPhone, setParentPhone] = useState(currentUser?.phone || '');
  const [parentEmail, setParentEmail] = useState(currentUser?.email || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    tutor?.subjects && tutor.subjects.length > 0 ? [tutor.subjects[0]] : ['Mathematics']
  );
  const [address, setAddress] = useState(currentUser?.locality || tutor?.locationArea || 'Rayagada');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Real-time listener for tutor's booked time slots from Firestore
  useEffect(() => {
    if (!tutor?.id) return;
    const unsub = subscribeToTutorBookedSlots(tutor.id, (slots) => {
      setBookedSlots(slots);
    });
    return () => unsub();
  }, [tutor?.id]);

  // Synchronize form inputs when a tutor is selected or modal opens
  useEffect(() => {
    if (tutor && isOpen) {
      setStudentName((prev) => prev || currentUser?.childName || '');
      setStudentGrade((prev) => prev || currentUser?.childGrade || tutor.classesHandled?.[0] || 'Class 4 (CBSE)');
      setParentName((prev) => prev || currentUser?.name || '');
      setParentPhone((prev) => prev || currentUser?.phone || '');
      setParentEmail((prev) => prev || currentUser?.email || '');
      if (tutor.subjects && tutor.subjects.length > 0) {
        setSelectedSubjects((prev) => (prev.length > 0 ? prev : [tutor.subjects[0]]));
      }
      setAddress((prev) => prev || currentUser?.locality || tutor.locationArea || 'Rayagada');
      setBookingSuccessId(null);
    }
  }, [tutor?.id, isOpen]);

  const allSlots = useMemo(() => {
    if (!tutor) return [];
    return tutor.availableTimeSlots && tutor.availableTimeSlots.length > 0
      ? tutor.availableTimeSlots
      : [
          '4:00 PM - 5:00 PM',
          '5:00 PM - 6:00 PM',
          '6:00 PM - 7:00 PM',
          '7:00 PM - 8:00 PM'
        ];
  }, [tutor?.availableTimeSlots]);

  // Dynamically filter out booked slots in real time so other parents cannot see or book them
  // Ensures new parents always have teaching slots available to book the tutor
  const openSlots = useMemo(() => {
    const bookedSet = new Set(bookedSlots.map((s) => s.trim().toLowerCase()));
    const unreserved = allSlots.filter((slot) => !bookedSet.has(slot.trim().toLowerCase()));
    if (unreserved.length > 0) return unreserved;

    // Flexible additional batches so new parents can always book
    const flexibleSlots = [
      'Flexible Morning (7:00 AM - 9:00 AM)',
      'Flexible Afternoon (3:00 PM - 5:00 PM)',
      'Flexible Evening (7:30 PM - 8:30 PM)',
      'Custom Timing (Tutor Coordination)'
    ];
    const availableFlexible = flexibleSlots.filter((slot) => !bookedSet.has(slot.trim().toLowerCase()));
    return availableFlexible.length > 0 ? availableFlexible : ['Custom Timing (Tutor Coordination)'];
  }, [allSlots, bookedSlots]);

  const [preferredSlot, setPreferredSlot] = useState(
    openSlots[0] || (allSlots[0] || '5:00 PM - 6:00 PM')
  );

  // Synchronize preferredSlot if currently selected slot gets booked in real time
  useEffect(() => {
    if (openSlots.length > 0) {
      if (!preferredSlot || !openSlots.some((s) => s.trim().toLowerCase() === preferredSlot.trim().toLowerCase())) {
        setPreferredSlot(openSlots[0]);
      }
    } else {
      setPreferredSlot('');
    }
  }, [openSlots, preferredSlot]);

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Hourly rate and monthly fee calculation based on tutor assigned hourly amount:
  // 1 hour daily tuition:
  // For 30 days = 30 hours * hourlyRate (e.g. ₹100 * 30 = ₹3,000)
  // For 31 days = 31 hours * hourlyRate (e.g. ₹100 * 31 = ₹3,100)
  const tutorHourlyRate = tutor
    ? Number(tutor.hourlyRate) ||
      Number((tutor as any).hourlyCharges) ||
      Number((tutor as any).hourlyFee) ||
      (tutor.monthlyFee ? Math.round(tutor.monthlyFee / 30) : 100)
    : 100;
  const effectiveMonthlyFee = tutorHourlyRate * 30; // standard 30 hours monthly tuition
  const tutorPhoto = tutor?.avatar || (tutor as any)?.photoUrl || (tutor as any)?.image || '';

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? (prev.length > 1 ? prev.filter((s) => s !== sub) : prev) : [...prev, sub]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor) return;
    if (!studentName.trim() || !parentPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitHomeTutorBooking({
        parentUid: currentUser?.uid,
        parentName: parentName.trim() || 'Parent',
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        studentName: studentName.trim(),
        studentGrade: studentGrade.trim(),
        subjects: selectedSubjects,
        address: address.trim(),
        locality: tutor.locationArea || 'Rayagada',
        preferredTimeSlot: preferredSlot,
        requestedTutorId: tutor.id,
        requestedTutorName: tutor.name,
        requestedTutorMonthlyFee: effectiveMonthlyFee,
        requestedTutorAvatar: tutorPhoto
      });

      setBookingSuccessId(res.bookingId);
      if (onBookingSuccess) onBookingSuccess(res.bookingId);
    } catch (err: any) {
      console.warn('Booking submit notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setBookingSuccessId(null);
    onClose();
  };

  if (!isOpen || !tutor) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && handleResetAndClose()}
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 relative">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>Dedicated 1-on-1 Home Tuition</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">Book Home Tutor</h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Personalized in-home tutoring at your residence in Rayagada with verified background check.
          </p>
        </div>

        {/* Success View */}
        {bookingSuccessId ? (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Booking Request Sent to Admin
              </span>
              <h4 className="text-xl font-bold text-slate-900 pt-1">Booking Confirmed!</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Thank you! Your request to book <span className="font-bold text-slate-800">{tutor.name}</span> for{' '}
                <span className="font-bold text-slate-800">{studentName}</span> has been sent directly to the Kumari Institute admin panel.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-slate-800">{bookingSuccessId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Tutor:</span>
                <span className="font-semibold text-slate-800">{tutor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tuition Mode:</span>
                <span className="font-semibold text-emerald-700">Home Tutor (At Your Home)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Monthly Tuition Fee:</span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₹{effectiveMonthlyFee.toLocaleString('en-IN')}/month</span>
                  <span className="text-[11px] text-slate-500 font-semibold">₹{tutorHourlyRate}/hour</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Admin will verify mentor availability and confirm tutor assignment within 2-4 hours.
            </p>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full max-w-md py-3 rounded-xl bg-[#0b213f] hover:bg-slate-900 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
            >
              Done &amp; Return
            </button>
          </div>
        ) : !currentUser ? (
          /* Parent Authentication Gate View */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            {/* Tutor Snapshot Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 bg-linear-to-br from-blue-700 to-indigo-800 flex items-center justify-center shrink-0 shadow-xs text-white font-bold text-lg select-none">
                  <span className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white">
                    {tutor.name?.charAt(0).toUpperCase() || 'T'}
                  </span>
                  {tutorPhoto && (
                    <img
                      src={tutorPhoto}
                      alt={tutor.name}
                      className="relative z-10 w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{tutor.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{tutor.qualification}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{tutor.locationArea || 'Rayagada'}</span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Fee</span>
                <span className="text-base font-black text-emerald-700">₹{effectiveMonthlyFee.toLocaleString('en-IN')}/month</span>
                <span className="text-[11px] text-slate-500 block font-semibold">₹{tutorHourlyRate}/hour</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Parent Account Required for Home Tuition</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                To book a verified home tutor for your child, please sign in with your parent account. If you already have an account, log in using your email and password. If you are a new parent, please register first to submit this booking.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  if (onNavigateAuth) onNavigateAuth('login', 'parent');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#0b213f] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Existing Parent: Log In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  if (onNavigateAuth) onNavigateAuth('register', 'parent');
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Parent: Register First</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Registration takes less than 30 seconds with mobile number &amp; residential area in Rayagada.
            </p>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
            {/* Tutor Snapshot Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 bg-linear-to-br from-blue-700 to-indigo-800 flex items-center justify-center shrink-0 shadow-xs text-white font-bold text-lg select-none">
                  <span className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white">
                    {tutor.name?.charAt(0).toUpperCase() || 'T'}
                  </span>
                  {tutorPhoto && (
                    <img
                      src={tutorPhoto}
                      alt={tutor.name}
                      className="relative z-10 w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{tutor.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{tutor.qualification}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{tutor.locationArea || 'Rayagada'}</span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Fee</span>
                <span className="text-base font-black text-emerald-700">₹{effectiveMonthlyFee.toLocaleString('en-IN')}/month</span>
                <span className="text-[11px] text-slate-500 block font-semibold">₹{tutorHourlyRate}/hour</span>
              </div>
            </div>

            {/* Student & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student's Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade *</label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="1st Class (Primary)">1st Class</option>
                  <option value="2nd Class (Primary)">2nd Class</option>
                  <option value="3rd Class (Primary)">3rd Class</option>
                  <option value="4th Class (Primary)">4th Class</option>
                  <option value="5th Class (Primary)">5th Class</option>
                  <option value="6th Class (Middle)">6th Class</option>
                  <option value="7th Class (Middle)">7th Class</option>
                  <option value="8th Class (Middle)">8th Class</option>
                  <option value="9th Class (Board Prep)">9th Class</option>
                  <option value="10th Class (Board Prep)">10th Class</option>
                </select>
              </div>
            </div>

            {/* Parent Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94370 00000"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Address in Rayagada */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Home Address &amp; Landmark in Rayagada *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sector 2, Near Sai Mandir, Indira Nagar, Rayagada"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Subjects Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subjects Required</label>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection (Dynamic & Real-Time Sync) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Preferred Daily Time Slot *</label>
                {openSlots.length > 0 ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{openSlots.length} open {openSlots.length === 1 ? 'slot' : 'slots'} available</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Fully Booked</span>
                  </span>
                )}
              </div>

              {openSlots.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>All Time Slots Currently Booked</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    All teaching slots for <strong className="font-semibold">{tutor.name}</strong> are currently reserved by active students in real time. Please explore other verified tutors in Rayagada or check back later.
                  </p>
                </div>
              ) : (
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  required
                >
                  {openSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (Open Slot)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Notice regarding Admin Assignment */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Your booking will be sent to the Kumari Institute Admin Panel. The admin will verify teacher availability and confirm assignment of your dedicated home tutor.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || openSlots.length === 0}
                className="px-6 py-2.5 rounded-xl bg-[#0b213f] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Sending Request...'
                  : openSlots.length === 0
                  ? 'Fully Booked'
                  : 'Book Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
