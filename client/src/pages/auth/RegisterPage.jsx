import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as authService from '../../services/authService';
import {
  Sparkles,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Mail,
  RotateCcw,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegisterPage = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Mode Selection: 'instant' vs 'verified'
  const [authMode, setAuthMode] = useState('instant');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP Verification Step States
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOtpPreview, setDemoOtpPreview] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [verifyingOtpLoading, setVerifyingOtpLoading] = useState(false);

  const otpInputRefs = useRef([]);

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  const isFormValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch && name.trim().length >= 2;

  // Countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (isVerifyingOtp && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVerifyingOtp, resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setErrorMessage('Please satisfy all password and field requirements.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const requireVerification = authMode === 'verified';

    try {
      const res = await authService.register(name, email, password, requireVerification);

      if (requireVerification && res?.data?.requiresVerification) {
        setIsVerifyingOtp(true);
        setDemoOtpPreview(res.data.demoOtp || '');
        setResendTimer(60);
        showSuccess('Verification code sent! Please enter the 6-digit OTP.');
      } else {
        showSuccess('Account created successfully! Please sign in with your credentials.');
        navigate('/login');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-advance cursor
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newDigits = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtpDigits(newDigits.slice(0, 6));
      otpInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    if (demoOtpPreview && demoOtpPreview.length === 6) {
      setOtpDigits(demoOtpPreview.split(''));
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      showError('Please enter all 6 digits of the OTP.');
      return;
    }

    setVerifyingOtpLoading(true);
    setErrorMessage('');
    try {
      await authService.verifyOtp(email, fullOtp);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showSuccess('Email verified successfully! Welcome to RoleFlow.');
      navigate('/login');
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Invalid or expired OTP.');
      showError(err.message || 'Verification failed.');
    } finally {
      setVerifyingOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    try {
      const res = await authService.resendOtp(email);
      setDemoOtpPreview(res.data.demoOtp || '');
      setResendTimer(60);
      showSuccess('A fresh 6-digit OTP has been sent.');
    } catch (err) {
      showError(err.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-elevated border border-slate-200/80 max-w-lg w-full p-6 sm:p-10">
        {/* Header Branding */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">RoleFlow</span>
        </div>

        {!isVerifyingOtp ? (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
              <p className="text-xs text-slate-500">Choose your registration preference below</p>
            </div>

            {/* Registration Mode Selector (Instant vs Verified) */}
            <div className="mt-5 p-1 bg-slate-100 rounded-2xl grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setAuthMode('instant')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  authMode === 'instant'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Sign Up</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('verified')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  authMode === 'verified'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Email OTP Required</span>
              </button>
            </div>

            {/* Mode Explanation Notice */}
            <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
              {authMode === 'instant' ? (
                <>
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Instant Mode:</strong> No email confirmation required. Create your account with any email format and log in immediately.
                  </p>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Verified Mode:</strong> Generates a 6-digit security OTP to verify email ownership before activating account access.
                  </p>
                </>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              {/* Password Requirements Realtime Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <span className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider block">
                  Password Requirements
                </span>
                <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>}
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>}
                  <span>One number</span>
                </div>
                {confirmPassword && (
                  <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-700 font-medium' : 'text-rose-600'}`}>
                    {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                    <span>Passwords match</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'verified' ? 'Continue to Email Verification' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Sign In
              </Link>
            </p>
          </>
        ) : (
          /* OTP Verification Screen */
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Verify your email</h2>
              <p className="text-xs text-slate-500">
                We sent a 6-digit confirmation OTP to <strong className="text-slate-800">{email}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                An email containing your <strong>6-digit security code</strong> has been dispatched to <strong>{email}</strong>. Please check your inbox (and spam/promotions folder).
              </p>
            </div>

            {demoOtpPreview && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-950">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Backup OTP: <strong className="font-mono text-sm tracking-wider text-indigo-700">{demoOtpPreview}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Auto Fill
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
              {/* 6-Digit OTP Inputs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 text-center">
                  Enter 6-Digit OTP
                </label>
                <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingOtpLoading || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {verifyingOtpLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Activate Account</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsVerifyingOtp(false)}
                className="text-slate-500 hover:text-slate-800 font-medium"
              >
                ← Back to Edit Details
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || resending}
                onClick={handleResendOtp}
                className={`font-semibold flex items-center gap-1 ${
                  resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
