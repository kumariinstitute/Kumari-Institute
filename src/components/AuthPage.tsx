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
  loginWithGoogleFirebase,
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

  // Google Sign-In Loading State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setRegError(null);
    setIsGoogleLoading(true);
    try {
      const userProfile = await loginWithGoogleFirebase(role);
      setLoginSuccess(`Welcome, ${userProfile.name}!`);

      if (onLoginSuccess) {
        onLoginSuccess(userProfile);
      }

      setTimeout(() => {
        if (
          userProfile.role === 'admin' ||
          userProfile.email.toLowerCase().includes('kkumariinstitut')
        ) {
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
      if (mode === 'register') {
        setRegError(errMsg);
      } else {
        setLoginError(errMsg);
      }
    } finally {
      setIsGoogleLoading(false);
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
          userProfile.email.toLowerCase().includes('kkumariinstitut')
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
        role: role
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
                    {role === 'teacher' && (
                      <div className="pt-2 border-t border-emerald-200/80">
                        <button
                          type="button"
                          onClick={() => setMode('teacher-complete-profile')}
                          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Complete Profile (Teaching Location, GPS & Qualifications)</span>
                        </button>
                      </div>
                    )}
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

                {/* Google Sign In */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-500 font-bold">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Connecting with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Sign in with Google</span>
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

                {/* Google Registration */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-500 font-bold">Or register with</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="google-register-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Registering with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Sign up with Google</span>
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

                  {/* 3. Complete Profile Button for Tutors */}
                  {role === 'teacher' && (
                    <button
                      type="button"
                      id="verify-email-complete-profile-btn"
                      onClick={() => setMode('teacher-complete-profile')}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <GraduationCap className="w-4 h-4 text-amber-300" />
                      <span>Complete Profile (Location, GPS & Qualifications)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
