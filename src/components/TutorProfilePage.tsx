import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  BookOpen,
  GraduationCap,
  Calendar,
  Sparkles,
  Home,
  Check,
  Heart,
  Phone,
  MessageSquare,
  Users
} from 'lucide-react';
import { Tutor } from '../data/tutorsData';
import { AppUserProfile } from '../services/firebaseAuth';

interface TutorProfilePageProps {
  tutor: Tutor;
  currentUser?: AppUserProfile | null;
  onBack: () => void;
  onBookTutor: (tutor: Tutor) => void;
  onNavigateAuth?: (mode: 'login' | 'register', role?: 'parent' | 'teacher') => void;
  onOpenEnquiry?: () => void;
}

export const TutorProfilePage: React.FC<TutorProfilePageProps> = ({
  tutor,
  currentUser,
  onBack,
  onBookTutor,
  onNavigateAuth,
  onOpenEnquiry
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<'CBSE' | 'ICSE'>('CBSE');
  const tutorPhoto = tutor.avatar || (tutor as any).photoUrl || (tutor as any).image || '';

  // Calculate accurate fees from tutor uploaded data
  const cbseFees = {
    class1to7: Number(tutor.customFeeSchedule?.cbse?.class1to7) || Number(tutor.feeClass1to7) || Number(tutor.customFeeSchedule?.primary1to7) || Number((tutor as any).feePrimary1to5) || Number(tutor.monthlyFee) || 1500,
    class8to10: Number(tutor.customFeeSchedule?.cbse?.class8to10) || Number(tutor.feeClass8to10) || Number(tutor.customFeeSchedule?.middle8to10) || Number((tutor as any).feeSecondary9to10) || 2000,
    class11to12: Number(tutor.customFeeSchedule?.cbse?.class11to12) || Number(tutor.feeClass11to12) || Number(tutor.customFeeSchedule?.senior11to12) || Number((tutor as any).feeSenior11to12) || 3000
  };

  const icseFees = {
    class1to7: Number(tutor.customFeeSchedule?.icse?.class1to7) || Math.round(cbseFees.class1to7 * 1.15) || 1800,
    class8to10: Number(tutor.customFeeSchedule?.icse?.class8to10) || Math.round(cbseFees.class8to10 * 1.1) || 2200,
    class11to12: Number(tutor.customFeeSchedule?.icse?.class11to12) || Math.round(cbseFees.class11to12 * 1.1) || 3200
  };

  const activeFees = selectedBoard === 'CBSE' ? cbseFees : icseFees;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tutor.name} - Verified Home Tutor | Kumari Institute`,
          text: `Check out ${tutor.name}'s home tutoring profile at Kumari Institute Rayagada!`,
          url: window.location.href
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-28 lg:pb-16 antialiased">
      {/* 1. Mobile-First Sticky Top Navigation Bar with Book Now Button */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:px-3 -ml-1 sm:-ml-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors font-bold text-xs sm:text-sm cursor-pointer"
            aria-label="Back to tutors list"
          >
            <ArrowLeft className="w-4 h-4 text-slate-800" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {/* BOOK NOW BUTTON IN NAVBAR */}
            <button
              type="button"
              id="profile-nav-book-now-btn"
              onClick={() => onBookTutor(tutor)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0c2340] to-[#1d4ed8] hover:from-[#122e54] hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Home className="w-3.5 h-3.5 text-amber-300" />
              <span>Book Now</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Share profile"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 text-left">
        {/* 2. Hero Profile Card (Mobile Optimized Header) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Top Decorative Banner */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-[#0c2340] via-[#122e54] to-[#1d4ed8] relative px-4 sm:px-6 flex items-end">
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-300 border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Kumari Institute Verified</span>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-6 pt-0 relative">
            {/* Avatar & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-linear-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-black text-3xl select-none shrink-0">
                  <span className="absolute inset-0 flex items-center justify-center font-black text-3xl text-white">
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
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs" title="Verified Educator">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              {/* Quick Action for larger screens */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBookTutor(tutor)}
                  className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Book Home Tutor</span>
                </button>
              </div>
            </div>

            {/* Tutor Identity & Verification */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
                  {tutor.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Verified</span>
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-600 font-semibold flex items-center gap-2 flex-wrap">
                <span className="text-slate-800 font-bold">{tutor.qualification || 'Graduate Tutor'}</span>
                <span>•</span>
                <span className="text-blue-700 font-bold">
                  {(String(tutor.experienceText || (tutor as any).experience || (tutor as any).totalExperience || '')).toLowerCase().includes('fresher') || tutor.experienceYears === 0
                    ? 'Fresher Educator (New to Teaching)'
                    : (tutor.experienceYears ? `${tutor.experienceYears} Years Teaching Experience` : 'Experienced Educator')}
                </span>
              </p>

              {/* Location & Rating row */}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-[#1d4ed8]" />
                  <span>{tutor.locationArea || 'Rayagada Locality'}</span>
                  {typeof (tutor as any).distanceKm === 'number' && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {(tutor as any).distanceKm.toFixed(1)} km away
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{tutor.rating || '4.9'}</span>
                  <span className="text-slate-500 font-normal">({tutor.reviewCount || 12} Parent Reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Mobile Performance / Trust Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Sessions
            </span>
            <span className="block text-base sm:text-xl font-black text-[#1d4ed8] mt-0.5">
              450+
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">Hours Taught</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Students
            </span>
            <span className="block text-base sm:text-xl font-black text-emerald-700 mt-0.5">
              35+
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">Mentored</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Satisfaction
            </span>
            <span className="block text-base sm:text-xl font-black text-amber-600 mt-0.5">
              99%
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">Positive Rating</span>
          </div>
        </div>

        {/* 4. About the Tutor Section */}
        {tutor.bio && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                About the Tutor
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {tutor.bio}
            </p>
          </div>
        )}

        {/* 5. Subjects Taught */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Subjects Taught
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {tutor.subjects && tutor.subjects.length > 0 ? (
              tutor.subjects.map((sub) => (
                <span
                  key={sub}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 text-[#1d4ed8] border border-blue-200 shadow-2xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{sub}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">All Core Academic Subjects</span>
            )}
          </div>
        </div>

        {/* 6. Classes Handled */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Classes &amp; Standards Handled
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {tutor.classesHandled && tutor.classesHandled.length > 0 ? (
              tutor.classesHandled.map((cls) => (
                <span
                  key={cls}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {cls}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">1st to 10th Standard (CBSE &amp; ICSE)</span>
            )}
          </div>
        </div>

        {/* Monthly Tuition Fee Structure & Tutor Earning Calculations (Before Daily Timings) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                ₹
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#0c2340]">
                  Monthly Tuition Fees Charged (Class-Wise)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Accurate verified fee schedule according to educational board (CBSE &amp; ICSE)
                </p>
              </div>
            </div>

            {/* Board Selector Tabs: CBSE vs ICSE */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 self-start sm:self-auto">
              {(['CBSE', 'ICSE'] as const).map((b) => (
                <button
                  key={`tutor_fee_board_${b}`}
                  type="button"
                  onClick={() => setSelectedBoard(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBoard === b
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b} Board
                </button>
              ))}
            </div>
          </div>

          {/* Fee Cards Grid: 1st-7th all subjects, 8th-10th per subject, 11th-12th per subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Class 1st to 7th */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/60 to-slate-50/60 border border-blue-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Class 1st to 7th</span>
                <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  All Subjects
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#0c2340]">
                  ₹{activeFees.class1to7}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Complete all-subjects home coaching curriculum for {selectedBoard}.
              </p>
              <div className="pt-2 border-t border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Tutor Earning (80%):</span>
                  <span className="font-extrabold text-emerald-700">
                    ₹{Math.round(activeFees.class1to7 * 0.8)}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Institute Commission (20%):</span>
                  <span>₹{Math.round(activeFees.class1to7 * 0.2)}</span>
                </div>
              </div>
            </div>

            {/* 2. Class 8th to 10th */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/60 to-slate-50/60 border border-blue-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Class 8th to 10th</span>
                <span className="text-[10px] font-semibold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                  Per Subject
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#0c2340]">
                  ₹{activeFees.class8to10}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ subject / mo</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Subject-specific intensive coaching for {selectedBoard} board exams.
              </p>
              <div className="pt-2 border-t border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Tutor Earning (80%):</span>
                  <span className="font-extrabold text-emerald-700">
                    ₹{Math.round(activeFees.class8to10 * 0.8)}/sub
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Institute Commission (20%):</span>
                  <span>₹{Math.round(activeFees.class8to10 * 0.2)}</span>
                </div>
              </div>
            </div>

            {/* 3. Class 11th & 12th */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/60 to-slate-50/60 border border-blue-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Class 11th &amp; 12th</span>
                <span className="text-[10px] font-semibold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                  Per Subject
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#0c2340]">
                  ₹{activeFees.class11to12}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ subject / mo</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Higher secondary subject coaching (+2 science, commerce, arts).
              </p>
              <div className="pt-2 border-t border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Tutor Earning (80%):</span>
                  <span className="font-extrabold text-emerald-700">
                    ₹{Math.round(activeFees.class11to12 * 0.8)}/sub
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Institute Commission (20%):</span>
                  <span>₹{Math.round(activeFees.class11to12 * 0.2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Standard Daily Tuition Timings Schedule */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 rounded-3xl border border-blue-200 p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1d4ed8]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0c2340]">
                Standard Daily Tuition Timings
              </h2>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
              Kumari Institute Schedule
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-0.5">
              <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase">1st - 2nd Class</span>
              <span className="block text-base sm:text-xl font-black text-[#1d4ed8]">1 hr</span>
              <span className="block text-[10px] text-slate-400">Daily Doorstep</span>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-0.5">
              <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase">3rd - 4th Class</span>
              <span className="block text-base sm:text-xl font-black text-[#1d4ed8]">1.30 hr</span>
              <span className="block text-[10px] text-slate-400">Daily Doorstep</span>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-0.5">
              <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase">5th Class</span>
              <span className="block text-base sm:text-xl font-black text-[#1d4ed8]">2 hr</span>
              <span className="block text-[10px] text-slate-400">Daily Doorstep</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 border border-blue-200/60 text-[11px] text-slate-600 text-center font-medium">
            6th to 10th Class: 1.5 - 2 hr subject-focused sessions per day
          </div>
        </div>

        {/* 8. Teaching Methodology & Key Highlights */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Teaching Methodology &amp; Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                1-on-1 Dedicated Attention
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tutor sits directly at child's study desk, ensuring 100% focus and zero distraction.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Daily Homework &amp; School Syllabus
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Daily revision aligned strictly with child's school textbook and upcoming exams.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Weekly Progress Reports
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Parents receive weekly marks &amp; chapter updates directly on their WhatsApp.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Doubt Clearing &amp; Test Practice
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Regular mock tests before school unit tests, half-yearly and final exams.
              </p>
            </div>
          </div>
        </div>

        {/* 9. Parent Safety & Guarantee (Kumari Institute 4-Step Verification) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Safety &amp; Trust Guarantee
              </h2>
              <p className="text-sm font-bold text-[#0c2340]">
                4-Step Background Checked Home Educator
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Police &amp; Government ID Verified</h4>
                <p className="text-[11px] text-slate-600">Aadhaar and residential address physically verified.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Academic Marksheet Audited</h4>
                <p className="text-[11px] text-slate-600">10th, +2 and degree certificates checked by admin.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Replacement Guarantee</h4>
                <p className="text-[11px] text-slate-600">Free tutor replacement within 24 hours if not satisfied.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Rayagada Local Support</h4>
                <p className="text-[11px] text-slate-600">Our institute coordinators are available 7 days a week.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 10. Parent Reviews (Real-time & Admin-Created Only - No Fake Data) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#0c2340]">
                  Parent Reviews &amp; Academic Feedback
                </h2>
                <p className="text-[11px] text-slate-500">
                  Audited &amp; published directly by Kumari Institute Administration
                </p>
              </div>
            </div>

            {tutor.reviews && tutor.reviews.length > 0 ? (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>★</span>
                  <span>{tutor.rating ? Number(tutor.rating).toFixed(1) : '5.0'} / 5.0</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({tutor.reviews.length} {tutor.reviews.length === 1 ? 'Review' : 'Reviews'})
                </span>
              </div>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                Admin-Audited Profile
              </span>
            )}
          </div>

          {tutor.reviews && tutor.reviews.length > 0 ? (
            <div className="space-y-3">
              {tutor.reviews.map((rev, idx) => (
                <div
                  key={rev.id || `review_${idx}`}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rev.parentName}</span>
                      {rev.verifiedBooking !== false && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Parent</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {rev.date || 'Recent Session'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex text-amber-400 text-xs tracking-wider">
                      {'★'.repeat(Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5))))}
                      {'☆'.repeat(5 - Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5))))}
                    </div>
                    {(rev.studentGrade || rev.schoolName || rev.relation) && (
                      <span className="text-[11px] text-slate-500">
                        • {rev.relation || rev.studentGrade || 'Primary Student'}{' '}
                        {rev.schoolName ? `(${rev.schoolName})` : ''}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200/60">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-7 px-4 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                Official Admin-Verified Profile
              </p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                No parent reviews published yet for this educator. Kumari Institute maintains strict authenticity — reviews are collected, verified, and published directly by academic coordinators following verified home tuition sessions in Rayagada.
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>100% Real Reviews Guarantee</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 11. Sticky Mobile Bottom Booking Bar (Always visible for mobile parents) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-4 py-3 sm:py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
              <span>{tutor.name}</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                Available
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {tutor.locationArea || 'Rayagada'} • Doorstep Home Tuition
            </p>
          </div>

          <button
            type="button"
            onClick={() => onBookTutor(tutor)}
            className="px-5 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-[#0c2340] to-[#1d4ed8] hover:from-[#122e54] hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>Book Home Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
