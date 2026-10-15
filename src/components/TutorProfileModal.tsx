import React from 'react';
import {
  X,
  GraduationCap,
  Award,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  Home,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Tutor } from '../data/tutorsData';
import { FEE_SUMMARY, FEE_STRUCTURE } from '../data/feeStructure';

interface TutorProfileModalProps {
  tutor: Tutor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTutor: (tutor: Tutor) => void;
}

export const TutorProfileModal: React.FC<TutorProfileModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onBookTutor
}) => {
  if (!isOpen || !tutor) return null;

  const tutorPhoto = tutor.avatar || (tutor as any).photoUrl || (tutor as any).image || '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#122e54] to-[#1d4ed8] text-white p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>Verified Kumari Institute Home Educator</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-linear-to-br from-blue-700 to-indigo-900 flex items-center justify-center shrink-0 shadow-md text-white font-bold text-2xl select-none">
              <span className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-white">
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

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {tutor.name}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Tutor</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5">
                {tutor.qualification} • {tutor.experienceYears ? `${tutor.experienceYears} Years Experience` : 'Experienced Educator'}
              </p>
              <div className="flex items-center gap-3 text-xs text-blue-200 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>{tutor.locationArea || 'Rayagada'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{tutor.rating || '4.9'} ({tutor.reviewCount || 12} Parent Reviews)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-left">
          {/* Bio / Background */}
          {tutor.bio && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                About the Tutor
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                {tutor.bio}
              </p>
            </div>
          )}

          {/* Subjects Handled */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Subjects Taught
            </h4>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects && tutor.subjects.length > 0 ? (
                tutor.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-[#1d4ed8] border border-blue-200"
                  >
                    {sub}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">All Core Academic Subjects</span>
              )}
            </div>
          </div>

          {/* Classes Handled */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Classes Handled
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tutor.classesHandled && tutor.classesHandled.length > 0 ? (
                tutor.classesHandled.map((cls) => (
                  <span
                    key={cls}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {cls}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">1st to 10th Standard</span>
              )}
            </div>
          </div>

          {/* Standardized Session Timings Schedule */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1d4ed8]" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0c2340]">
                  Standard Daily Tuition Timings
                </h4>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                Kumari Institute Schedule
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-xs">
                <span className="block text-[11px] font-bold text-slate-500 uppercase">1st - 2nd Class</span>
                <span className="block text-base sm:text-lg font-black text-[#1d4ed8] mt-0.5">1 hr</span>
                <span className="block text-[10px] text-slate-400">Daily Doorstep</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-xs">
                <span className="block text-[11px] font-bold text-slate-500 uppercase">3rd - 4th Class</span>
                <span className="block text-base sm:text-lg font-black text-[#1d4ed8] mt-0.5">1.30 hr</span>
                <span className="block text-[10px] text-slate-400">Daily Doorstep</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-xs">
                <span className="block text-[11px] font-bold text-slate-500 uppercase">5th Class</span>
                <span className="block text-base sm:text-lg font-black text-[#1d4ed8] mt-0.5">2 hr</span>
                <span className="block text-[10px] text-slate-400">Daily Doorstep</span>
              </div>
            </div>
          </div>

          {/* Modern Class-wise Monthly Tuition Fee Structure */}
          <div className="rounded-2xl border border-slate-200/90 overflow-hidden space-y-0">
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Monthly Home Tuition Fee Structure
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Transparent Monthly Rates
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider block">1st to 5th</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">
                    ₹{((tutor as any).customFeeSchedule?.primary1to5 || (tutor as any).feePrimary1to5 || tutor.monthlyFee || 1500).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">/ month</span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider block">6th to 8th</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">
                    ₹{((tutor as any).customFeeSchedule?.middle6to8 || (tutor as any).feeMiddle6to8 || 1800).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">/ month</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider block">9th to 10th</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">
                    ₹{((tutor as any).customFeeSchedule?.secondary9to10 || (tutor as any).feeSecondary9to10 || 2500).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">/ month</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider block">11th &amp; 12th</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">
                    ₹{((tutor as any).customFeeSchedule?.senior11to12 || (tutor as any).feeSenior11to12 || 3000).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">/ subject / mo</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                * All tuition fees are billed per month on a 28-day billing cycle with personalized 1-on-1 home attention.
              </p>
            </div>
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Safe Parent-Tutor Communication:</strong> All tutor bookings are scheduled through Kumari Institute. Tutors are background-verified and identity-checked for doorstep safety.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onBookTutor(tutor);
            }}
            className="flex-1 max-w-xs py-2.5 px-4 rounded-xl bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Book Home Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
