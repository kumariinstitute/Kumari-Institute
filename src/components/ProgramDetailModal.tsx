import React, { useState } from 'react';
import { X, Check, Calendar, Clock, DollarSign, BookOpen, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Program } from '../types';
import { AppUserProfile, enrollUserInCourse } from '../services/firebaseAuth';

interface ProgramDetailModalProps {
  program: Program | null;
  onClose: () => void;
  onBookDemo: () => void;
  currentUser?: AppUserProfile | null;
  onEnrollSuccess?: (updatedUser: AppUserProfile) => void;
  onPromptLogin?: () => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  onClose,
  onBookDemo,
  currentUser,
  onEnrollSuccess,
  onPromptLogin,
}) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState<string | null>(null);

  if (!program) return null;

  const isAlreadyEnrolled =
    currentUser?.enrolledCourses?.some((c) => c.courseId === program.id) ?? false;

  const handleEnrollClick = async () => {
    if (!currentUser) {
      onClose();
      if (onPromptLogin) {
        onPromptLogin();
      }
      return;
    }

    setIsEnrolling(true);
    try {
      const updatedProfile = await enrollUserInCourse(currentUser.uid, {
        id: program.id,
        title: program.title,
        subtitle: program.subtitle,
        fee: program.feeEstimate,
        tag: program.tag
      });

      setEnrollSuccessMsg(`Congratulations! You have successfully enrolled in ${program.title}. This course is permanently saved in your profile session.`);
      if (onEnrollSuccess) {
        onEnrollSuccess(updatedProfile);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div
      id="program-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 sm:p-8 relative">
          <button
            id="close-program-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <img
              src="/Logo/kumarilogo.png"
              alt="Kumari Institute"
              className="h-10 sm:h-12 w-auto max-w-[170px] object-contain p-[3px]"
              style={{ padding: '3px' }}
              referrerPolicy="no-referrer"
            />
            <div className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 uppercase tracking-wider">
              {program.tag}
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {program.title}
          </h3>
          <p className="text-sm sm:text-base text-blue-100 mt-1 font-medium">
            {program.subtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Enrollment status notification */}
          {enrollSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{enrollSuccessMsg}</span>
            </div>
          )}

          {isAlreadyEnrolled && !enrollSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>You are already enrolled in this course batch. Access details in your profile.</span>
            </div>
          )}

          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Course Overview
            </h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {program.description}
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Key Program Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {program.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Roadmap */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Curriculum & Coverage
            </h4>
            <div className="space-y-2">
              {program.curriculum.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Batches and Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Available Batches</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1">
                {program.timingOptions.map((opt, i) => (
                  <li key={i}>• {opt}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Tuition Fee Structure</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {program.feeEstimate}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Scholarship tests available with up to 40% fee waiver.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            id="book-trial-btn"
            onClick={() => {
              onClose();
              onBookDemo();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-blue-600 text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <span>Book Free Trial</span>
          </button>

          <button
            type="button"
            id="enroll-course-now-btn"
            disabled={isEnrolling || isAlreadyEnrolled}
            onClick={handleEnrollClick}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0c2340] via-[#122e54] to-[#1d4ed8] hover:from-slate-900 hover:to-blue-900 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enrolling...</span>
              </>
            ) : isAlreadyEnrolled ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Enrolled & Active</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{currentUser ? 'Enroll in Course Now' : 'Log In & Enroll in Course'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
