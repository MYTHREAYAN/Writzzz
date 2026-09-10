import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  ShieldCheck,
  PenTool,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from './Toast';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, register } = useAuth();
  const toast = useToast();

  // Branding animation states
  const brandSteps = ['W', 'WR', 'WRI', 'WRIT', 'WRITT', 'WRITZZ'];
  const [currentBrandText, setCurrentBrandText] = useState('W');
  const [isBrandDone, setIsBrandDone] = useState(false);
  const [isLoggedInTransition, setIsLoggedInTransition] = useState(false);

  // Mode: 'login' | 'register' | 'forgot-password' | 'reset-password'
  const [mode, setMode] = useState<AuthMode>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password & reset password states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [generatedResetUrl, setGeneratedResetUrl] = useState<string | null>(null);

  // Submission & validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check URL query parameters for resetToken on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('resetToken');
      if (tokenFromUrl) {
        setResetToken(tokenFromUrl);
        setMode('reset-password');
      }
    } catch {
      // ignore
    }
  }, []);

  // Animate logo on mount
  useEffect(() => {
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < brandSteps.length) {
        setCurrentBrandText(brandSteps[stepIndex]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBrandDone(true);
        }, 400);
      }
    }, 180);

    return () => clearInterval(interval);
  }, []);

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  // 1. Handle Login or Registration
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'register' && !name.trim()) {
      triggerShake('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      triggerShake('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      triggerShake('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password);
        toast.success('Account Created!', `Welcome to Writzz, ${name.trim()}`);
      } else {
        await login(email.trim(), password);
        toast.success('Welcome Back!', 'Signed into Writzz workspace');
      }

      setIsLoggedInTransition(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 900);
    } catch (err: any) {
      triggerShake(err.message || 'Authentication failed. Please check your credentials.');
      toast.error('Authentication Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Forgot Password Request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setForgotSuccessMessage(null);
    setGeneratedResetUrl(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      triggerShake('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setForgotSuccessMessage(res.message || 'Password reset link has been generated.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      if (res.resetUrl) {
        setGeneratedResetUrl(res.resetUrl);
      }
      toast.success('Reset Request Sent', 'Check your instructions below to reset your password.');
    } catch (err: any) {
      triggerShake(err.message || 'Could not process password reset request.');
      toast.error('Password Reset Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Reset Password Submission
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resetToken.trim()) {
      triggerShake('Password reset token is required');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      triggerShake('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerShake('Passwords do not match. Please re-enter both carefully.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.resetPassword(resetToken.trim(), newPassword);
      toast.success('Password Reset Successful!', res.message);
      // Clear sensitive states and return to login
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setForgotSuccessMessage(null);
      setGeneratedResetUrl(null);
      setMode('login');
    } catch (err: any) {
      triggerShake(err.message || 'Failed to reset password. The link or token may have expired.');
      toast.error('Reset Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-neutral-950 px-4 overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid line background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <AnimatePresence mode="wait">
        {isLoggedInTransition ? (
          /* Transition state: Writzz Branding -> Dashboard */
          <motion.div
            key="logged-in-transition"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center space-y-4 z-20"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50"
            >
              <PenTool className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white font-display">
              WRITZZ
            </h1>
            <p className="text-indigo-300 font-caveat text-2xl tracking-wide">
              Preparing your personalized handwritten workspace...
            </p>
            <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
              />
            </div>
          </motion.div>
        ) : (
          /* Main Authentication Container */
          <div className="w-full max-w-md z-10 py-10">
            {/* Logo and Tagline */}
            <div className="text-center space-y-2 mb-8">
              <div className="flex items-center justify-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-extrabold tracking-wider text-white font-display flex items-center">
                    <span>{currentBrandText}</span>
                    {!isBrandDone && (
                      <span className="w-0.5 h-6 bg-indigo-400 ml-0.5 animate-pulse" />
                    )}
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">
                Your Ideas. Your Handwriting.
              </p>
            </div>

            {/* Interactive Card */}
            <motion.div
              animate={shakeError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
            >
              {/* Error Message Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
                >
                  {errorMessage}
                </motion.div>
              )}

              {/* VIEW 1 & 2: LOGIN OR REGISTER */}
              {(mode === 'login' || mode === 'register') && (
                <>
                  {/* Mode Tab Switcher */}
                  <div className="flex rounded-xl bg-neutral-950 p-1 mb-6 border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-neutral-850 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === 'register'
                          ? 'bg-neutral-850 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Register Account
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-1.5"
                      >
                        <label className="text-xs font-semibold text-neutral-300">Full Name</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@example.edu"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-300">Password</label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              setMode('forgot-password');
                              setErrorMessage('');
                              setForgotSuccessMessage(null);
                            }}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{mode === 'register' ? 'Create Account' : 'Enter Workspace'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Security Badge Footer */}
                  <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-neutral-500 text-xs">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Encrypted Authentication</span>
                    </span>
                    <span>JWT & Bcrypt</span>
                  </div>
                </>
              )}

              {/* VIEW 3: FORGOT PASSWORD REQUEST */}
              {mode === 'forgot-password' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage('');
                      }}
                      className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white">Reset Your Password</h2>
                      <p className="text-xs text-neutral-400">
                        Enter your registered email to receive a password reset token.
                      </p>
                    </div>
                  </div>

                  {forgotSuccessMessage ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-3"
                    >
                      <div className="flex items-start gap-2.5 text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-semibold text-emerald-200">Reset Request Generated</p>
                          <p className="text-emerald-300/90">{forgotSuccessMessage}</p>
                        </div>
                      </div>

                      {resetToken && (
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs space-y-1.5">
                          <span className="text-neutral-400 text-[11px] block">Security Reset Token:</span>
                          <code className="text-indigo-300 font-mono text-[11px] break-all block bg-neutral-900 p-1.5 rounded">
                            {resetToken}
                          </code>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setMode('reset-password')}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>Set New Password Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login');
                            setForgotSuccessMessage(null);
                          }}
                          className="w-full py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Registered Email</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@example.edu"
                            required
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Send Reset Instructions</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          Remembered your password? Sign in
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* VIEW 4: RESET PASSWORD FORM */}
              {mode === 'reset-password' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage('');
                      }}
                      className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white">Create New Password</h2>
                      <p className="text-xs text-neutral-400">
                        Enter your reset token and your desired new password.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Security Token</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          placeholder="Paste the reset token here"
                          required
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          required
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Update Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-xs text-neutral-400 hover:text-white transition-colors"
                      >
                        Cancel and return to Sign In
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>

            {/* Bottom note */}
            <p className="text-center text-xs text-neutral-500 mt-4">
              Real-time handwriting synthesis & academic AI generation.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
