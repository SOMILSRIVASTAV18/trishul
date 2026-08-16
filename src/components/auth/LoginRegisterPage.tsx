import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Check,
  Shield,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Building2,
  ArrowRight,
  Database,
  BarChart3,
  Users2
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { TrishulLogo } from '../TrishulLogo';

interface LoginRegisterPageProps {
  onSuccess?: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const LoginRegisterPage: React.FC<LoginRegisterPageProps> = ({
  onSuccess,
  isModal = false,
  onCloseModal
}) => {
  const {
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    sendPasswordReset,
    currentUser
  } = useCrm();

  // Mode: 'login' | 'register'
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Login Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign up fields
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Forgot password email & feedback
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Loading & error feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your work email and password.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      await loginWithEmail(email.trim(), password);
      setSuccessMsg('Authentication successful! Loading workspace...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onCloseModal) onCloseModal();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please verify your credentials or use Google SSO.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    if (googleLoading || loading) return;
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Signed in with Google SSO successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onCloseModal) onCloseModal();
      }, 500);
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.includes('closed') ||
        msg.includes('cancelled') ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        setErrorMsg('Google sign-in popup was closed. Please try again when ready.');
      } else {
        setErrorMsg(msg || 'Google sign-in could not be completed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the terms of service to continue.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await signupWithEmail(regEmail.trim(), regPassword, regName.trim());
      setSuccessMsg(`Welcome, ${regName}! Account created successfully.`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onCloseModal) onCloseModal();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to create account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (forgotEmail || email).trim();
    if (!targetEmail) {
      setForgotError('Please enter your registered work email address.');
      return;
    }
    setForgotStatus('loading');
    setForgotError(null);
    try {
      await sendPasswordReset(targetEmail);
      setForgotStatus('sent');
    } catch (err: any) {
      setForgotStatus('error');
      setForgotError(err.message || 'Failed to dispatch reset email. Please try again.');
    }
  };

  return (
    <div
      className={`${
        isModal
          ? 'w-full'
          : 'min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#0b0f19]'
      } font-sans relative`}
    >
      {/* Modal Close Button if opened as popup */}
      {isModal && onCloseModal && (
        <button
          onClick={onCloseModal}
          className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Main Dual-Panel Auth Card */}
      <div className="w-full max-w-4xl mx-auto rounded-xl bg-white dark:bg-[#0f172a] shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: AUTHENTICATION FORM                         */}
        {/* ======================================================== */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <div>
            {/* Logo */}
            <div className="mb-6">
              <TrishulLogo size="sm" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRegisterMode ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              {isRegisterMode
                ? 'Enter your work details to get started with Trishul CRM'
                : 'Enter your credentials or use Single Sign-On'}
            </p>

            {/* Error Feedback Banner */}
            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback Banner */}
            {successMsg && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Google SSO Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white dark:bg-[#0f172a] px-2 text-slate-400 font-medium">
                  Or with email
                </span>
              </div>
            </div>

            {/* Dynamic Form: Login or Register */}
            {!isRegisterMode ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-500 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email.trim());
                        setForgotError(null);
                        setForgotStatus('idle');
                        setShowForgotModal(true);
                      }}
                      className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-500 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-white dark:text-slate-900 text-xs bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-0 mt-0.5 cursor-pointer"
                    />
                    <span>I accept the enterprise platform terms and privacy guidelines.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-white dark:text-slate-900 text-xs bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Login/Register */}
            <div className="text-center mt-5">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMsg(null);
                }}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
              >
                {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: TRISHUL BRAND SHOWCASE & PORTAL           */}
        {/* ======================================================== */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 bg-slate-900 text-white flex flex-col justify-between items-center text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full flex justify-between items-center z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              Enterprise CRM Suite
            </span>
            <span className="font-mono text-[10px] text-slate-500">v2.4</span>
          </div>

          {/* Central Trishul Image Showcase */}
          <div className="my-auto py-6 flex flex-col items-center z-10">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-indigo-500/20 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
              <img
                src="/Trishul.png"
                alt="Trishul CRM"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
                className="relative max-h-56 sm:max-h-64 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="text-xl font-bold text-white mt-5 tracking-tight">
              TRISHUL CRM
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
              Innovate • Empower • Accelerate Enterprise Growth
            </p>
          </div>

          {/* Footer Security Badge */}
          <div className="w-full pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 z-10">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>TLS 256-Bit Encrypted</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Cloud Protected</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL POPUP                              */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotStatus('idle');
                setForgotError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Password</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your work email to receive a secure password recovery link.
            </p>

            {forgotError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{forgotError}</div>
              </div>
            )}

            {forgotStatus === 'sent' ? (
              <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Reset Link Sent</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Password recovery instructions have been dispatched to <strong className="text-slate-900 dark:text-white font-mono">{forgotEmail || email}</strong>.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStatus('idle');
                      setForgotError(null);
                    }}
                    className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Resend
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotStatus('idle');
                      setForgotError(null);
                    }}
                    className="flex-1 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError(null);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotStatus === 'loading'}
                  className="w-full py-2 rounded-lg font-semibold text-white dark:text-slate-900 text-xs bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                >
                  {forgotStatus === 'loading' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
