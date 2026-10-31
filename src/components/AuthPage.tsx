import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  Loader2,
  Check,
  ArrowRight
} from 'lucide-react';
import {
  loginWithGoogleFirebase,
  logoutUserFromFirebase,
  formatFirebaseError,
  AppUserProfile
} from '../services/firebaseAuth';
import { TeacherCompleteProfilePage } from './TeacherCompleteProfilePage';

export type AuthViewMode = 'login' | 'teacher-complete-profile';

interface AuthPageProps {
  initialMode?: string;
  initialRole?: 'parent' | 'teacher';
  currentUser?: AppUserProfile | null;
  onNavigateHome: () => void;
  onNavigateTutors?: () => void;
  onNavigateAdmin?: () => void;
  onLoginSuccess?: (user: AppUserProfile) => void;
  onTeacherRegistered?: (teacher: { name: string; email: string; phone: string }) => void;
  onOpenProfileModal?: () => void;
  onNavigateProfile?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  initialRole = 'parent',
  currentUser,
  onNavigateHome,
  onNavigateAdmin,
  onLoginSuccess,
  onNavigateProfile,
}) => {
  const [mode, setMode] = useState<AuthViewMode>(
    initialMode === 'teacher-complete-profile' ? 'teacher-complete-profile' : 'login'
  );
  const [role, setRole] = useState<'parent' | 'teacher'>(initialRole || 'parent');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (initialMode === 'teacher-complete-profile') {
      setMode('teacher-complete-profile');
    } else {
      setMode('login');
    }
    if (initialRole === 'teacher' || initialMode === 'teacher-login' || initialMode === 'create-teacher') {
      setRole('teacher');
    } else if (initialRole === 'parent' || initialMode === 'parent-login' || initialMode === 'create-parent') {
      setRole('parent');
    }
  }, [initialMode, initialRole]);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setIsGoogleLoading(true);
    try {
      const userProfile = await loginWithGoogleFirebase(role);
      setLoginSuccess(`Welcome, ${userProfile.name}!`);

      if (onLoginSuccess) {
        onLoginSuccess(userProfile);
      }

      const isAdmin =
        userProfile.role === 'admin' ||
        userProfile.email?.toLowerCase() === 'kkumariinstitute@gmail.com' ||
        userProfile.email?.toLowerCase() === 'kkumariinstiture@gmail.com' ||
        userProfile.email?.toLowerCase().includes('kkumariinstitut');

      setTimeout(() => {
        if (isAdmin) {
          if (onNavigateAdmin) onNavigateAdmin();
          else onNavigateHome();
        } else if (userProfile.role === 'teacher' && !userProfile.profileCompleted) {
          setMode('teacher-complete-profile');
        } else {
          onNavigateHome();
        }
      }, 500);
    } catch (err: any) {
      console.warn('Google sign-in error:', err?.code || err?.message);
      const errMsg =
        err?.code === 'auth/popup-closed-by-user'
          ? 'Google sign in was cancelled. Please try again.'
          : formatFirebaseError(err);
      setLoginError(errMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // If navigating directly to teacher complete profile
  if (mode === 'teacher-complete-profile' || initialMode === 'teacher-complete-profile') {
    const handleTutorExit = async () => {
      try {
        await logoutUserFromFirebase();
      } catch (err) {
        console.warn('Logout notice:', err);
      }
      setMode('login');
      setRole('teacher');
      setLoginError('The profile upload form is mandatory for tutors. You have been logged out. Please log in and complete your profile.');
    };

    return (
      <TeacherCompleteProfilePage
        currentUser={currentUser}
        onBackToDashboard={handleTutorExit}
        onNavigateHome={handleTutorExit}
        onEscapeLogout={handleTutorExit}
        onProfileSaved={(updated) => {
          if (onLoginSuccess && updated) onLoginSuccess(updated);
          if (onNavigateProfile) onNavigateProfile();
          else onNavigateHome();
        }}
      />
    );
  }

  return (
    <div id="auth-page-root" className="min-h-[calc(100vh-80px)] bg-slate-50/70 py-8 sm:py-12 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Back navigation */}
        <div className="mb-4">
          <button
            type="button"
            id="auth-back-home-btn"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0c2340] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden text-left">
          {/* Top Brand Banner */}
          <div className="bg-gradient-to-r from-[#0c2340] via-[#122e54] to-[#1d4ed8] p-6 text-white text-center relative">
            <div className="flex justify-center mb-3">
              <img
                src="/Logo/kumarilogo.png"
                alt="Kumari Institute Logo"
                className="w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-white/80 object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Log in to Kumari Institute
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
              Select your role and log in with your Google account securely.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Role Selector: Parent vs Teacher */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="auth-role-parent-btn"
                  onClick={() => setRole('parent')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    role === 'parent'
                      ? 'border-[#1d4ed8] bg-blue-50/80 text-[#1d4ed8] ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Parent / Student</span>
                </button>

                <button
                  type="button"
                  id="auth-role-teacher-btn"
                  onClick={() => setRole('teacher')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    role === 'teacher'
                      ? 'border-purple-600 bg-purple-50/80 text-purple-700 ring-2 ring-purple-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Teacher / Tutor</span>
                </button>
              </div>
            </div>

            {/* TUTOR-ONLY COMMISSION NOTICE (Shows ONLY in tutor login page, hidden for parents) */}
            {role === 'teacher' && (
              <div
                id="tutor-commission-notice"
                className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 space-y-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    %
                  </div>
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Kumari Institute Commission Notice
                  </h3>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  Please note that <strong>20% of your tuition fees are payable to Kumari Institute as service commission</strong> for verified student allocation, background checking, doorstep timetable coordination, and administrative support.
                </p>
                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/80 flex items-center justify-between text-xs font-bold text-amber-950">
                  <span>Your Net Take-Home Earnings:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-extrabold">
                    80% of Tuition Fees
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 font-medium">
                  ✓ This notice applies to registered home tutors and teachers only.
                </p>
              </div>
            )}

            {/* MINIMAL DIRECT GOOGLE LOG IN */}
            <div className="space-y-5" id="login-form">
              {/* Error Banner */}
              {loginError && (
                <div
                  id="login-error-alert"
                  className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span className="flex-1">{loginError}</span>
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {loginSuccess && (
                <div
                  id="login-success-alert"
                  className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span className="flex-1">{loginSuccess}</span>
                  </div>
                </div>
              )}

              {/* Minimal Card Container */}
              <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 text-center space-y-4">

                {/* Primary Google Sign-In Button */}
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-800 font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-60 active:scale-[0.99] group"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Connecting with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all ml-auto" />
                    </>
                  )}
                </button>

                {/* Security Highlights */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Google Verified
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <Check className="w-3.5 h-3.5" />
                    No Password Needed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
