import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Ban,
  Clock,
  Phone,
  MapPin,
  Users,
  RefreshCw,
  Search,
  ArrowRight,
  UserCheck,
  AlertCircle,
  X,
  Sparkles,
  Calendar,
  DollarSign
} from 'lucide-react';
import { HomeTutorBooking } from '../types';
import { Tutor } from '../data/tutorsData';
import {
  subscribeToRealtimeBookings,
  adminAcceptAndAssignTutorBooking,
  adminDeclineTutorBooking
} from '../services/firebaseAuth';

interface IncomingBookingsProps {
  availableTutors?: Tutor[];
  onNavigateAssignedTutors?: () => void;
  onTutorAssigned?: (tutorId: string) => void;
  showToast?: (type: 'success' | 'info' | 'error', message: string) => void;
}

export const IncomingBookings: React.FC<IncomingBookingsProps> = ({
  availableTutors = [],
  onNavigateAssignedTutors,
  onTutorAssigned,
  showToast
}) => {
  const [bookings, setBookings] = useState<HomeTutorBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookingFilter, setBookingFilter] = useState<'pending' | 'accepted' | 'declined' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Decline Modal State
  const [declineModalBooking, setDeclineModalBooking] = useState<HomeTutorBooking | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('Selected time slot is already fully occupied.');
  const [customDeclineReason, setCustomDeclineReason] = useState<string>('');

  // Re-assign / Alternative Modal State
  const [reassignModalBooking, setReassignModalBooking] = useState<HomeTutorBooking | null>(null);
  const [selectedAlternativeTutorId, setSelectedAlternativeTutorId] = useState<string>('');
  const [reassignNotes, setReassignNotes] = useState<string>('');

  // Local Toast fallback
  const [localToast, setLocalToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'info' | 'error', message: string) => {
    if (showToast) {
      showToast(type, message);
    } else {
      setLocalToast({ type, message });
      setTimeout(() => setLocalToast(null), 4000);
    }
  };

  // Subscribe to real-time parent requests from Firestore collection 'tutor_bookings'
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToRealtimeBookings((liveBookings) => {
      setBookings(liveBookings);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered and searched bookings
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'pending'), [bookings]);
  const acceptedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'accepted' || b.status === 'reassigned'),
    [bookings]
  );
  const declinedBookings = useMemo(() => bookings.filter((b) => b.status === 'declined'), [bookings]);

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (bookingFilter === 'pending') {
      list = pendingBookings;
    } else if (bookingFilter === 'accepted') {
      list = acceptedBookings;
    } else if (bookingFilter === 'declined') {
      list = declinedBookings;
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (b) =>
        (b.studentName && b.studentName.toLowerCase().includes(q)) ||
        (b.parentName && b.parentName.toLowerCase().includes(q)) ||
        (b.parentPhone && b.parentPhone.includes(q)) ||
        (b.address && b.address.toLowerCase().includes(q)) ||
        (b.requestedTutorName && b.requestedTutorName.toLowerCase().includes(q)) ||
        (b.assignedTutorName && b.assignedTutorName.toLowerCase().includes(q)) ||
        (b.studentGrade && b.studentGrade.toLowerCase().includes(q))
    );
  }, [bookings, bookingFilter, pendingBookings, acceptedBookings, declinedBookings, searchQuery]);

  // Approved tutors available for alternate assignment
  const approvedTutors = useMemo(
    () => availableTutors.filter((t) => t.isApproved === true || t.verified === true || t.status === 'approved'),
    [availableTutors]
  );

  // ACTION: Accept Booking & Automatically Assign Tutor
  const handleAcceptBooking = async (booking: HomeTutorBooking) => {
    setIsProcessing(true);
    try {
      const tutorId = booking.requestedTutorId;
      const res = await adminAcceptAndAssignTutorBooking(
        booking.id,
        tutorId,
        'Automatically assigned requested home tutor upon admin confirmation.',
        booking
      );

      // Update local state optimistically
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: 'accepted',
                assignedTutorId: tutorId,
                assignedTutorName: booking.requestedTutorName,
                assignedTutorFee: booking.requestedTutorMonthlyFee,
                updatedAt: new Date().toISOString()
              }
            : b
        )
      );

      if (onTutorAssigned) {
        onTutorAssigned(tutorId);
      }

      notify(
        'success',
        `✓ Home Tutor ${booking.requestedTutorName} assigned to student ${booking.studentName} and moved to 'Assigned Tutors' list!`
      );
    } catch (err: any) {
      notify('error', err?.message || 'Failed to accept booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ACTION: Open Decline Modal
  const handleOpenDeclineModal = (booking: HomeTutorBooking) => {
    setDeclineModalBooking(booking);
    setDeclineReason('Selected time slot is already fully occupied.');
    setCustomDeclineReason('');
  };

  // ACTION: Confirm Decline
  const handleConfirmDecline = async () => {
    if (!declineModalBooking) return;

    setIsProcessing(true);
    const finalReason = customDeclineReason.trim() ? customDeclineReason.trim() : declineReason;

    try {
      await adminDeclineTutorBooking(declineModalBooking.id, finalReason);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === declineModalBooking.id
            ? {
                ...b,
                status: 'declined',
                declineReason: finalReason,
                declinedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : b
        )
      );

      notify('info', `Booking request for ${declineModalBooking.studentName} has been declined.`);
      setDeclineModalBooking(null);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to decline booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ACTION: Open Reassign / Alternative Mentor Modal
  const handleOpenReassignModal = (booking: HomeTutorBooking) => {
    setReassignModalBooking(booking);
    const otherTutor = approvedTutors.find((t) => t.id !== booking.requestedTutorId) || approvedTutors[0];
    setSelectedAlternativeTutorId(otherTutor ? otherTutor.id : '');
    setReassignNotes(`Assigned specialized educator to match ${booking.studentName}'s schedule.`);
  };

  // ACTION: Confirm Alternative Mentor Assignment
  const handleConfirmReassignment = async () => {
    if (!reassignModalBooking || !selectedAlternativeTutorId) return;

    setIsProcessing(true);
    const chosenTutor = approvedTutors.find((t) => t.id === selectedAlternativeTutorId);

    try {
      await adminAcceptAndAssignTutorBooking(
        reassignModalBooking.id,
        selectedAlternativeTutorId,
        reassignNotes,
        reassignModalBooking
      );

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== reassignModalBooking.id) return b;
          const chosenHourly =
            Number(chosenTutor?.hourlyRate) ||
            Number((chosenTutor as any)?.hourlyCharges) ||
            (chosenTutor?.monthlyFee ? Math.round(chosenTutor.monthlyFee / 30) : 100);
          const chosenFee = chosenHourly > 0 ? chosenHourly * 30 : (chosenTutor?.monthlyFee || 3000);
          return {
            ...b,
            status: 'reassigned',
            assignedTutorId: selectedAlternativeTutorId,
            assignedTutorName: chosenTutor?.name || 'Assigned Tutor',
            assignedTutorFee: chosenFee,
            assignedTutorAvatar: chosenTutor?.avatar,
            reassignedNotes: reassignNotes,
            updatedAt: new Date().toISOString()
          };
        })
      );

      if (onTutorAssigned) {
        onTutorAssigned(selectedAlternativeTutorId);
      }

      notify(
        'success',
        `Assigned alternative Home Mentor ${chosenTutor?.name} to student ${reassignModalBooking.studentName}!`
      );
      setReassignModalBooking(null);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to assign alternative tutor.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Local Notification Toast */}
      {localToast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2 ${
            localToast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : localToast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : 'bg-blue-950/90 text-blue-200 border-blue-500/50'
          }`}
        >
          {localToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span>{localToast.message}</span>
        </div>
      )}

      {/* Header Banner & Realtime Status */}
      <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Incoming Bookings</span>
            </h2>
            {pendingBookings.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{pendingBookings.length} Parent Requests Pending</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Requests Processed</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Live notification stream fetched directly from Cloud Firestore. Review the student's requirements and preferred schedule. Click <strong>Accept &amp; Assign Tutor</strong> to automatically confirm the mentor and move them to the <strong>Assigned Tutors</strong> list, or click <strong>Decline</strong> with a reason.
          </p>
        </div>

        {/* Filter Section: Pending Incoming Requests */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setBookingFilter('pending')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-xs cursor-default"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pending Requests</span>
            {pendingBookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-bold">
                {pendingBookings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student name, parent phone, address in Rayagada, grade, or tutor..."
          className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Bookings Feed */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
          <p className="text-sm">Fetching live parent requests from Firestore...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-dashed border-slate-700 space-y-3">
          <Bell className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            {bookingFilter === 'pending' ? 'No Pending Bookings at the Moment' : 'No Bookings Matching Filter'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {bookingFilter === 'pending'
              ? 'All parent booking requests have been assigned or evaluated! New parent bookings from Rayagada will trigger notifications here in real-time.'
              : 'Try changing your filter or clearing your search term.'}
          </p>
          {onNavigateAssignedTutors && acceptedBookings.length > 0 && (
            <button
              type="button"
              onClick={onNavigateAssignedTutors}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer transition-colors mt-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>View {acceptedBookings.length} Assigned Tutors</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isPending = booking.status === 'pending';
            const isAccepted = booking.status === 'accepted' || booking.status === 'reassigned';
            const isDeclined = booking.status === 'declined';

            return (
              <div
                key={booking.id}
                className={`bg-slate-800 rounded-3xl p-6 border transition-all ${
                  isPending
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                    : isDeclined
                    ? 'border-rose-900/60 bg-slate-800/60 opacity-90'
                    : 'border-slate-700/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Parent & Student Request Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800">
                        REF: {booking.id}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </span>

                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Pending Notification: Action Required</span>
                        </span>
                      )}

                      {isAccepted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Accepted &amp; Moved to Assigned Tutors</span>
                        </span>
                      )}

                      {isDeclined && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <Ban className="w-3.5 h-3.5 text-rose-400" />
                          <span>Declined by Administrator</span>
                        </span>
                      )}
                    </div>

                    {/* Student, Parent & Location Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Student Information
                        </span>
                        <span className="font-bold text-white text-sm block mt-0.5">{booking.studentName}</span>
                        <span className="text-amber-400/90 font-medium block">{booking.studentGrade}</span>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                          Subjects: {Array.isArray(booking.subjects) ? booking.subjects.join(', ') : 'Home Tuition'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Parent Contact Details
                        </span>
                        <span className="font-semibold text-slate-200 block mt-0.5">{booking.parentName}</span>
                        <a
                          href={`tel:${booking.parentPhone}`}
                          className="text-amber-400 font-mono inline-flex items-center gap-1 hover:underline mt-0.5 font-bold"
                        >
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{booking.parentPhone}</span>
                        </a>
                        {booking.parentEmail && (
                          <span className="text-slate-400 text-[11px] block truncate">{booking.parentEmail}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Locality in Rayagada
                        </span>
                        <span className="text-slate-300 font-medium flex items-center gap-1 truncate mt-0.5" title={booking.address}>
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{booking.address}</span>
                        </span>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                          Preferred Slot: <strong className="text-slate-200">{booking.preferredTimeSlot || 'Evening'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Decline Reason Banner */}
                    {isDeclined && booking.declineReason && (
                      <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                        <Ban className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-300 block">Decline Reason Recorded:</span>
                          <p className="text-rose-200/90">{booking.declineReason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tutor Card & Action Buttons */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-700/80 min-w-[300px] shrink-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          booking.assignedTutorAvatar ||
                          booking.requestedTutorAvatar ||
                          '/src/assets/images/tutor_priya_sharma_1789370534007.jpg'
                        }
                        alt={booking.assignedTutorName || booking.requestedTutorName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                          {isAccepted ? 'Assigned Home Tutor' : 'Requested Tutor'}
                        </span>
                        <h4 className="font-bold text-white text-sm truncate">
                          {booking.assignedTutorName || booking.requestedTutorName}
                        </h4>
                        {(() => {
                          const fee = Number(booking.assignedTutorFee || booking.requestedTutorMonthlyFee) || 3000;
                          const hourly = Math.round(fee / 30);
                          const fee31 = hourly * 31;
                          return (
                            <div className="mt-0.5">
                              <p className="text-xs font-semibold text-emerald-400">
                                ₹{fee.toLocaleString('en-IN')}/month
                              </p>
                              <p className="text-[10px] text-slate-400">
                                ₹{hourly}/hr • Daily 1 hr Home Tuition (30 hrs/month)
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {booking.reassignedNotes && (
                      <p className="text-[11px] text-amber-300/90 italic bg-amber-950/30 p-2 rounded-xl border border-amber-500/20">
                        Admin Note: {booking.reassignedNotes}
                      </p>
                    )}

                    {/* ACTIONS FOR PENDING: ACCEPT & DECLINE */}
                    {isPending && (
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAcceptBooking(booking)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                          title="Accept request and automatically assign tutor"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept &amp; Assign Tutor</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleOpenDeclineModal(booking)}
                            className="w-full py-2 px-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-rose-500/30 active:scale-95"
                            title="Decline this booking request"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-400" />
                            <span>Decline</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleOpenReassignModal(booking)}
                            className="w-full py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-amber-500/30 active:scale-95"
                            title="Assign a different tutor from approved pool"
                          >
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            <span>Alternative</span>
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-400 text-center">
                          Accepting moves tutor to <strong>Assigned Tutors</strong>
                        </p>
                      </div>
                    )}

                    {isAccepted && (
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active on Parent Profile</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenReassignModal(booking)}
                            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                          >
                            Change Tutor
                          </button>
                        </div>

                        {onNavigateAssignedTutors && (
                          <button
                            type="button"
                            onClick={onNavigateAssignedTutors}
                            className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                          >
                            <span>Open in Assigned Tutors</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    {isDeclined && (
                      <div className="pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleOpenReassignModal(booking)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-slate-700"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Re-evaluate &amp; Assign Tutor</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DECLINE BOOKING MODAL */}
      {declineModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Decline Booking Request</h3>
                  <p className="text-xs text-slate-400">
                    Parent: <span className="text-white font-semibold">{declineModalBooking.parentName}</span> ({declineModalBooking.studentName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeclineModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Select Reason for Declining this Request:
              </label>

              <div className="space-y-2">
                {[
                  'Selected time slot is already fully occupied.',
                  'Requested tutor is unavailable for home visits in this locality.',
                  'Requested tutor is at full student capacity for this academic month.',
                  'Address is outside tutor daily travel perimeter in Rayagada.',
                  'Other reason...'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      declineReason === reason
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 font-semibold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="declineReason"
                      value={reason}
                      checked={declineReason === reason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      className="mt-0.5 text-rose-500 focus:ring-rose-400"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {(declineReason === 'Other reason...' || declineReason.includes('Other')) && (
                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] font-bold text-slate-400">Custom Decline Note:</label>
                  <textarea
                    rows={2}
                    value={customDeclineReason}
                    onChange={(e) => setCustomDeclineReason(e.target.value)}
                    placeholder="Provide specific notes for parent communication..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeclineModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDecline}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN / ALTERNATIVE TUTOR MODAL */}
      {reassignModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Assign Home Tutor to Parent</h3>
                <p className="text-xs text-slate-400">
                  Student: <span className="text-white font-semibold">{reassignModalBooking.studentName}</span> ({reassignModalBooking.studentGrade})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReassignModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Select Approved Home Mentor:</label>
                <select
                  value={selectedAlternativeTutorId}
                  onChange={(e) => setSelectedAlternativeTutorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer text-sm"
                >
                  {approvedTutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.qualification} • {t.locationArea || 'Rayagada'} • ₹{t.monthlyFee}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Assignment Notes / Instructions:</label>
                <textarea
                  rows={2}
                  value={reassignNotes}
                  onChange={(e) => setReassignNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReassignModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmReassignment}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
