import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Check,
  Shield,
  UserCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { TrishulLogo } from '../TrishulLogo';
import type { UserRole } from '../../types';

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
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please verify your credentials or use Google SSO.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Signed in with Google SSO successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onCloseModal) onCloseModal();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in could not be completed.');
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
      setErrorMsg('Please accept the terms and conditions to complete registration.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await signupWithEmail(regEmail.trim(), regPassword, regName.trim());
      setSuccessMsg(`Welcome, ${regName}! Account provisioned successfully.`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onCloseModal) onCloseModal();
      }, 700);
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
          : 'min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8'
      } ${
        !isModal ? 'bg-[#0b0f17] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0b0f17] to-black' : ''
      } font-sans relative select-none`}
    >
      {/* Modal Close Button if opened as popup */}
      {isModal && onCloseModal && (
        <button
          onClick={onCloseModal}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700/60 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Main Dual-Panel Split Auth Card */}
      <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[#151c28] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden border border-slate-700/40 flex flex-col md:flex-row relative">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: MEMBER LOGIN / CREDENTIAL FORM              */}
        {/* ======================================================== */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 bg-[#161d28] flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-slate-800/80">
          
          <div>
            {/* Top Trishul CRM Logo */}
            <div className="mb-6">
              <TrishulLogo size="sm" theme="dark" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#fb7185] tracking-tight">
              {isRegisterMode ? 'Create Account' : 'Member Login'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
              {isRegisterMode
                ? 'Join Trishul CRM & Enterprise suite'
                : 'Please fill in your work credentials to access the CRM'}
            </p>

            {/* Error Feedback Banner */}
            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback Banner */}
            {successMsg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Dynamic Form: Login or Register */}
            {!isRegisterMode ? (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                {/* Username / Email Pill Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Work Email (e.g. user@company.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-[#1b2533] border border-slate-700/70 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                {/* Password Pill Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-full bg-[#1b2533] border border-slate-700/70 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Pill Gradient CTA Button: Coral to Cyan */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-full font-bold text-white text-sm tracking-wider uppercase bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#22d3ee] hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(251,113,133,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>LOGIN</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-3.5">
                {/* Full Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#1b2533] border border-slate-700/70 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Work Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Work Email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#1b2533] border border-slate-700/70 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Create Password (min 6 chars)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#1b2533] border border-slate-700/70 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Pill Gradient CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-full font-bold text-white text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#22d3ee] hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(251,113,133,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>CREATE ACCOUNT</span>
                  )}
                </button>
              </form>
            )}

            {/* Forget Password Link & Form Toggle */}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-400 px-2">
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email.trim());
                  setForgotError(null);
                  setForgotStatus('idle');
                  setShowForgotModal(true);
                }}
                className="hover:text-cyan-400 italic transition-colors font-medium cursor-pointer"
              >
                Forget Password?
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMsg(null);
                }}
                className="text-[#fb7185] hover:text-[#f43f5e] font-semibold transition-colors cursor-pointer"
              >
                {isRegisterMode ? 'Already registered? Login' : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: GOOGLE SSO & ENTERPRISE PORTAL            */}
        {/* ======================================================== */}
        <div className="w-full md:w-1/2 relative p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
          
          {/* Scenic Mountain Lake Twilight Background with Dark Vignette */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0 scale-105 transform hover:scale-100 transition-transform duration-1000"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')`
            }}
          />
          {/* Dark Atmospheric Mood Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/80 to-slate-950/95 z-10" />

          {/* Foreground Content */}
          <div className="relative z-20 flex flex-col items-center text-center my-auto py-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#fb7185] tracking-tight">
              Enterprise SSO
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-normal max-w-xs">
              Fast, secure one-click sign-in with your Google corporate account
            </p>

            {/* Google SSO Hero Button */}
            <div className="mt-8 w-full max-w-xs">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 px-6 rounded-full bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-600/80 hover:border-[#fb7185] text-white flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                {googleLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#fb7185]" />
                ) : (
                  <>
                    {/* Google Multicolor Logo SVG */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                    <span className="font-semibold text-sm tracking-wide">
                      Continue with Google SSO
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-[#fb7185] focus:ring-0 focus:ring-offset-0 accent-[#fb7185] cursor-pointer"
                />
                <span>
                  By signing in, you accept Trishul Enterprise{' '}
                  <span className="text-[#fb7185] hover:underline font-semibold">
                    terms of service
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="relative z-20 text-center mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Encrypted with Firebase 256-bit TLS</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL POPUP                              */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#161d28] border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotStatus('idle');
                setForgotError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-[#fb7185]/20 text-[#fb7185]">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Password</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Enter your registered work email to receive a secure Firebase Authentication password reset link.
            </p>

            {forgotError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{forgotError}</div>
              </div>
            )}

            {forgotStatus === 'sent' ? (
              <div className="mt-4 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-slate-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Reset Link Dispatched</span>
                </div>
                <p className="text-xs text-slate-300">
                  Firebase Authentication has dispatched a password recovery email to <strong className="text-white font-mono">{forgotEmail || email}</strong>.
                </p>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  <div className="font-semibold text-slate-200">Where to check:</div>
                  <div>• Check both your <strong>Inbox</strong> and <strong>Spam / Junk</strong> folder.</div>
                  <div>• Sender is Firebase (<code className="text-cyan-300 font-mono text-[10px]">noreply@...firebaseapp.com</code>).</div>
                  <div>• If you registered via <strong>Google SSO</strong>, you can log in directly without a password.</div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStatus('idle');
                      setForgotError(null);
                    }}
                    className="flex-1 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Resend / Try Another
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotStatus('idle');
                      setForgotError(null);
                    }}
                    className="flex-1 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Registered Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@company.com"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotStatus === 'loading'}
                  className="w-full py-2.5 rounded-full font-bold text-white text-xs bg-gradient-to-r from-[#fb7185] to-[#22d3ee] hover:opacity-95 cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                >
                  {forgotStatus === 'loading' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Send Password Reset Link</span>
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
