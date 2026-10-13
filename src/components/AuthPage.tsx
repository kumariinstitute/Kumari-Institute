import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  Loader2,
  KeyRound,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Clock,
  Check,
  MapPin,
  Compass,
  Navigation
} from 'lucide-react';
import {
  registerUserInFirebase,
  loginUserWithFirebase,
  sendPasswordResetWithFirebase,
  resendAccountVerificationEmail,
  checkEmailVerificationStatus,
  formatFirebaseError,
  AppUserProfile
} from '../services/firebaseAuth';
import { TeacherCompleteProfilePage } from './TeacherCompleteProfilePage';
import { RAYAGADA_LOCALITIES } from '../data/tutorsData';
import { getLiveUserLocation } from '../services/tutorApi';

export type AuthViewMode = 'login' | 'register' | 'forgot-password' | 'verify-email' | 'teacher-complete-profile';

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
  onNavigateTutors,
  onNavigateAdmin,
  onLoginSuccess,
  onNavigateProfile,
}) => {
  // Normalize initialMode
  const startMode: AuthViewMode =
    initialMode === 'register' || initialMode === 'create-parent' || initialMode === 'create-teacher'
      ? 'register'
      : initialMode === 'forgot-password'
      ? 'forgot-password'
      : 'login';

  const [mode, setMode] = useState<AuthViewMode>(startMode);
  const [role, setRole] = useState<'parent' | 'teacher'>(initialRole);

  useEffect(() => {
    if (initialMode === 'register' || initialMode === 'create-parent' || initialMode === 'create-teacher') {
      setMode('register');
    } else if (initialMode === 'forgot-password') {
      setMode('forgot-password');
    } else {
      setMode('login');
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  // Log In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Register Form State (Name, Email, Mobile Number, Gender, Password, Confirm Password)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Email Verification Screen State
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [pendingVerificationPassword, setPendingVerificationPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendingVerify, setIsResendingVerify] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  // Tutor Location Cardinals Registration State
  const [tutorLocality, setTutorLocality] = useState('Indira Nagar');
  const [tutorLatitude, setTutorLatitude] = useState<number>(19.1691);
  const [tutorLongitude, setTutorLongitude] = useState<number>(83.4150);
  const [tutorAddress, setTutorAddress] = useState('Indira Nagar, Rayagada, Odisha - 765001');
  const [isLocatingTutor, setIsLocatingTutor] = useState(false);
  const [tutorLocationNotice, setTutorLocationNotice] = useState<string | null>(null);

  // Fetch Live Location for Tutor Registration
  const handleFetchTutorGpsCardinals = async () => {
    setIsLocatingTutor(true);
    setTutorLocationNotice('Acquiring precise GPS satellite fix...');
    try {
      const geo = await getLiveUserLocation((statusMsg) => {
        setTutorLocationNotice(statusMsg);
      });
      setTutorLatitude(geo.latitude);
      setTutorLongitude(geo.longitude);
      const locName = geo.placeName || 'Rayagada';
      setTutorLocality(locName);
      setTutorAddress(`${locName}, Rayagada, Odisha`);
      setTutorLocationNotice(`GPS Cardinals Locked: ${geo.latitude.toFixed(4)}° N, ${geo.longitude.toFixed(4)}° E (±${geo.accuracy}m radius)`);
    } catch (err: any) {
      setTutorLocationNotice(err.message || 'Could not acquire GPS fix. You can choose your Rayagada locality below.');
    } finally {
      setIsLocatingTutor(false);
    }
  };

  // Countdown timer for resend link cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Handle Log In Submit
  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const targetEmail = loginEmail.trim() || pendingVerificationEmail.trim();
    const targetPassword = loginPassword || pendingVerificationPassword;

    if (!targetEmail) {
      setLoginError('Please enter your registered email address.');
      return;
    }
    if (!targetPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsLoggingIn(true);
    const cleanedEmail = targetEmail.trim();
    try {
      const userProfile = await loginUserWithFirebase(cleanedEmail, targetPassword, role);

      // STRICT EMAIL VERIFICATION GATE:
      // Verify email status before setting the session in App.tsx!
      // If user profile indicates unverified status, strictly deny session and prompt for verification.
      if (!userProfile || userProfile.emailVerified !== true) {
        setPendingVerificationEmail(cleanedEmail);
        setPendingVerificationPassword(targetPassword);
        setLoginError(
          `Kindly verify your account to log in. We sent a verification link to ${cleanedEmail}. Please check your inbox and verify your email before logging in.`
        );
        return;
      }

      setLoginSuccess(`Welcome back, ${userProfile.name}!`);

      // Set the session in App.tsx ONLY after email status is confirmed verified!
      if (onLoginSuccess) {
        onLoginSuccess(userProfile);
      }

      setTimeout(() => {
        if (
          userProfile.role === 'admin' ||
          userProfile.email.toLowerCase() === 'chandinikurumoju424@gmail.com'
        ) {
          if (onNavigateAdmin) onNavigateAdmin();
          else onNavigateHome();
        } else {
          onNavigateHome();
        }
      }, 500);
    } catch (err: any) {
      console.warn('Login attempt notice:', err?.code || err?.message);
      if (err?.code === 'auth/email-not-verified') {
        setPendingVerificationEmail(cleanedEmail);
        setPendingVerificationPassword(targetPassword);
        setLoginError(
          err.message ||
            `Kindly verify your account to log in. We sent a verification link to ${cleanedEmail}. Please check your inbox and verify your email before logging in.`
        );
      } else {
        setLoginError(formatFirebaseError(err));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Create Account Submit -> creates Auth user, sends verification link, and redirects to Login page with notification
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    // Validation
    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please enter a valid email address.');
      return;
    }
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setRegError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regGender) {
      setRegError('Please select your gender.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Password and Confirm Password do not match. Please re-enter.');
      return;
    }

    setIsRegistering(true);
    try {
      await registerUserInFirebase({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        gender: regGender,
        password: regPassword,
        role: role,
        latitude: role === 'teacher' ? tutorLatitude : undefined,
        longitude: role === 'teacher' ? tutorLongitude : undefined,
        locationArea: role === 'teacher' ? tutorLocality : undefined,
        locality: role === 'teacher' ? tutorLocality : undefined,
        address: role === 'teacher' ? tutorAddress : undefined
      });

      const registeredEmail = regEmail.trim();
      setPendingVerificationEmail(registeredEmail);
      setPendingVerificationPassword(regPassword);
      setLoginEmail(registeredEmail);
      setRegPassword('');
      setRegConfirmPassword('');
      setLoginPassword('');

      // CRITICAL: Do NOT call onLoginSuccess. User must verify their email first before logging in.
      // Redirect to the Log In page with a clear notification:
      setMode('login');
      setLoginSuccess(
        `Account created successfully! We sent a verification link to ${registeredEmail}. Please verify your email from that link and log in with your credentials.`
      );
      setLoginError(null);
    } catch (err: any) {
      console.warn('Registration notice:', err?.code || err?.message);
      setRegError(formatFirebaseError(err));
    } finally {
      setIsRegistering(false);
    }
  };

  // Resend account verification email
  const handleResendVerificationEmail = async () => {
    if (resendCooldown > 0 || isResendingVerify) return;
    const targetEmail = pendingVerificationEmail || loginEmail;
    if (!targetEmail) return;

    setIsResendingVerify(true);
    setVerifyNotice(null);

    try {
      await resendAccountVerificationEmail(targetEmail, pendingVerificationPassword || loginPassword);
      setResendCooldown(30);
      setVerifyNotice(`A fresh verification link was sent to ${targetEmail}. Please check your inbox or spam folder.`);
    } catch (err: any) {
      console.warn('Notice resending verification email:', err?.code || err?.message);
      setVerifyNotice('Could not resend verification email right now. Please try again in 30 seconds.');
    } finally {
      setIsResendingVerify(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordResetWithFirebase(forgotEmail.trim());
      setForgotSuccess(
        `A password reset link has been sent to ${forgotEmail.trim()}. Please check your inbox and spam folder.`
      );
    } catch (err: any) {
      console.warn('Password reset notice:', err?.code || err?.message);
      setForgotError(formatFirebaseError(err));
    } finally {
      setIsSendingReset(false);
    }
  };

  // If navigating directly to teacher complete profile
  if (initialMode === 'teacher-complete-profile') {
    return (
      <TeacherCompleteProfilePage
        currentUser={currentUser}
        onBackToDashboard={onNavigateProfile || onNavigateHome}
        onNavigateHome={onNavigateHome}
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
                alt="Kumari Institute"
                className="h-14 sm:h-16 w-auto max-w-[240px] object-contain p-[3px] transition-transform duration-200 hover:scale-105"
                style={{ padding: '3px' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {mode === 'login'
                ? 'Welcome Back'
                : mode === 'register'
                ? 'Create New Account'
                : mode === 'verify-email'
                ? 'Kindly verify your account to log in'
                : 'Reset Password'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
              {mode === 'login'
                ? 'Sign in to access your courses, hired tutors, and profile'
                : mode === 'register'
                ? 'Register in 1 step to start learning or teaching in Rayagada'
                : mode === 'verify-email'
                ? 'A verification link has been sent to your email address'
                : 'Enter your email to receive password reset instructions'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Role Selector: Parent vs Teacher */}
            {mode !== 'forgot-password' && mode !== 'verify-email' && (
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
            )}

            {/* ============================================================ */}
            {/* VIEW 1: NORMAL LOG IN FORM */}
            {/* ============================================================ */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
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

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="login-email-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={role === 'parent' ? 'parent@example.com' : 'teacher@example.com'}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password-input"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      id="forgot-password-link-btn"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setMode('forgot-password');
                      }}
                      className="text-xs font-bold text-[#1d4ed8] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure Rayagada Portal</span>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0c2340] via-[#122e54] to-[#1d4ed8] hover:from-slate-900 hover:to-blue-900 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Register */}
                <div className="text-center pt-2 text-xs sm:text-sm text-slate-600">
                  <span>Don't have an account yet? </span>
                  <button
                    type="button"
                    id="switch-to-register-link"
                    onClick={() => {
                      setMode('register');
                      setRegError(null);
                    }}
                    className="font-black text-[#1d4ed8] hover:underline cursor-pointer"
                  >
                    Create New Account
                  </button>
                </div>

                {/* Administrator Quick-Access Info Card */}
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      Administrator Access
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('chandinikurumoju424@gmail.com');
                        setLoginPassword('ram123');
                        setLoginError(null);
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      Fill Admin Login
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    <span className="font-semibold">Email:</span> chandinikurumoju424@gmail.com &nbsp;|&nbsp; <span className="font-semibold">Password:</span> ram123
                  </p>
                </div>
              </form>
            )}

            {/* ============================================================ */}
            {/* VIEW 2: NORMAL CREATE ACCOUNT FORM */}
            {/* (Asks Name, Email, Mobile Number, Gender, Password, Confirm Password) */}
            {/* ============================================================ */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
                {/* Error Banner */}
                {regError && (
                  <div
                    id="reg-error-alert"
                    className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span className="flex-1">{regError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {regSuccess && (
                  <div
                    id="reg-success-alert"
                    className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span className="flex-1">{regSuccess}</span>
                  </div>
                )}

                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="reg-name-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-name-input"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Behera"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 2. Email Address */}
                <div>
                  <label
                    htmlFor="reg-email-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email-input"
                      type="email"
                      required
                      autoComplete="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. ramesh.behera@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label
                    htmlFor="reg-phone-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                      <span>+91</span>
                    </div>
                    <input
                      id="reg-phone-input"
                      type="tel"
                      required
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">10-digit mobile number for SMS notifications</p>
                </div>

                {/* 4. Gender Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        id={`gender-select-${g}`}
                        onClick={() => setRegGender(g)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                          regGender === g
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-400/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teacher Location Cardinals & Rayagada Locality Section */}
                {role === 'teacher' && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200/60">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#0c2340] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          Teaching Location &amp; GPS Cardinals
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Required so parents can search and find you as the nearest tutor in Rayagada
                        </p>
                      </div>

                      {/* Use Live Location Button */}
                      <button
                        type="button"
                        onClick={handleFetchTutorGpsCardinals}
                        disabled={isLocatingTutor}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                      >
                        {isLocatingTutor ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Acquiring GPS...</span>
                          </>
                        ) : (
                          <>
                            <Compass className="w-3.5 h-3.5 text-white" />
                            <span>Use Live Location</span>
                          </>
                        )}
                      </button>
                    </div>

                    {tutorLocationNotice && (
                      <div className="p-2.5 rounded-xl bg-white/90 border border-blue-200 text-blue-900 text-[11px] font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{tutorLocationNotice}</span>
                      </div>
                    )}

                    {/* Quick Locality Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Rayagada Locality / Area <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tutorLocality}
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          setTutorLocality(selectedName);
                          const matchedLoc = RAYAGADA_LOCALITIES.find(l => l.name === selectedName);
                          if (matchedLoc) {
                            setTutorLatitude(matchedLoc.latitude);
                            setTutorLongitude(matchedLoc.longitude);
                            setTutorAddress(`${matchedLoc.name}, ${matchedLoc.subtitle || 'Rayagada'}, Odisha - 765001`);
                            setTutorLocationNotice(`Coordinates updated to ${matchedLoc.name}: ${matchedLoc.latitude.toFixed(4)}° N, ${matchedLoc.longitude.toFixed(4)}° E`);
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {RAYAGADA_LOCALITIES.map((loc) => (
                          <option key={loc.id} value={loc.name}>
                            {loc.name} ({loc.landmark})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cardinal Coordinates Inputs (Latitude & Longitude) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Latitude Cardinal (° N) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          required
                          value={tutorLatitude}
                          onChange={(e) => setTutorLatitude(parseFloat(e.target.value) || 19.1691)}
                          className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Longitude Cardinal (° E) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          required
                          value={tutorLongitude}
                          onChange={(e) => setTutorLongitude(parseFloat(e.target.value) || 83.4150)}
                          className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Complete Address & Landmarks */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Residential Address &amp; Landmarks <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={tutorAddress}
                        onChange={(e) => setTutorAddress(e.target.value)}
                        placeholder="e.g. Near Chinmaya Vidyalaya, Raniguda Farm, Rayagada - 765001"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Password */}
                <div>
                  <label
                    htmlFor="reg-password-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-password-input"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 6. Confirm Password */}
                <div>
                  <label
                    htmlFor="reg-confirm-password-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-confirm-password-input"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter same password"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={isRegistering}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 pt-3"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-2 text-xs sm:text-sm text-slate-600">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    id="switch-to-login-link"
                    onClick={() => {
                      setMode('login');
                      setLoginError(null);
                    }}
                    className="font-black text-[#1d4ed8] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              </form>
            )}

            {/* ============================================================ */}
            {/* VIEW 3: FORGOT PASSWORD FORM */}
            {/* ============================================================ */}
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4" id="forgot-password-form">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d4ed8] mx-auto flex items-center justify-center mb-2 shadow-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Forgot Your Password?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    No worries! Enter your registered account email and we'll send you a password reset link.
                  </p>
                </div>

                {/* Error Banner */}
                {forgotError && (
                  <div
                    id="forgot-error-alert"
                    className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span className="flex-1">{forgotError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {forgotSuccess && (
                  <div
                    id="forgot-success-alert"
                    className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>{forgotSuccess}</span>
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="forgot-email-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Registered Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  id="send-reset-link-btn"
                  disabled={isSendingReset}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0c2340] via-[#122e54] to-[#1d4ed8] hover:from-slate-900 hover:to-blue-900 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Return to Login */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    id="back-to-login-btn"
                    onClick={() => {
                      setMode('login');
                      setForgotError(null);
                      setForgotSuccess(null);
                    }}
                    className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0c2340] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Log In</span>
                  </button>
                </div>
              </form>
            )}

            {/* ============================================================ */}
            {/* VIEW 4: EMAIL VERIFICATION SCREEN */}
            {/* ============================================================ */}
            {mode === 'verify-email' && (
              <div className="space-y-6 text-center py-2" id="verify-email-page-view">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Account Created Successfully!
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    We sent a verification link to{' '}
                    <strong className="text-slate-900 font-bold break-all">
                      {pendingVerificationEmail || loginEmail || 'your email'}
                    </strong>
                    . Please verify your email from that link and log in with your credentials.
                  </p>
                </div>

                {verifyNotice && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{verifyNotice}</span>
                  </div>
                )}

                <div className="space-y-3 pt-2 max-w-sm mx-auto">
                  {/* 1. Back to Log In Button */}
                  <button
                    type="button"
                    id="verify-email-back-to-login-btn"
                    onClick={() => {
                      setMode('login');
                      setLoginEmail(pendingVerificationEmail || loginEmail);
                      setLoginPassword(pendingVerificationPassword || loginPassword);
                      setLoginError(null);
                    }}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0c2340] hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Log In</span>
                  </button>

                  {/* 2. Resend Verification Link Button */}
                  <button
                    type="button"
                    id="resend-verify-email-btn"
                    disabled={resendCooldown > 0 || isResendingVerify}
                    onClick={handleResendVerificationEmail}
                    className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResendingVerify ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Resend Verification Link in ${resendCooldown}s`
                        : isResendingVerify
                        ? 'Resending Link...'
                        : 'Resend Verification Link'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
