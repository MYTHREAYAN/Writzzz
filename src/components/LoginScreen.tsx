import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon, CheckCircle2, ShieldCheck, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, register } = useAuth();
  const toast = useToast();

  // Branding animation states: W -> WR -> WRI -> WRIT -> WRITT -> WRITZZ
  const brandSteps = ['W', 'WR', 'WRI', 'WRIT', 'WRITT', 'WRITZZ'];
  const [currentBrandText, setCurrentBrandText] = useState('W');
  const [isBrandDone, setIsBrandDone] = useState(false);
  const [isLoggedInTransition, setIsLoggedInTransition] = useState(false);

  // Form states
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isRegister && !name.trim()) {
      triggerShake('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      triggerShake('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 5) {
      triggerShake('Password must be at least 5 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        toast.success('Account Created!', `Welcome to Writzz, ${name.trim()}`);
      } else {
        await login(email, password);
        toast.success('Welcome Back!', 'Signed into Writzz workspace');
      }

      // Writzz branding transition -> Dashboard
      setIsLoggedInTransition(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 900);
    } catch (err: any) {
      triggerShake(err.message || 'Authentication failed. Please check credentials.');
      toast.error('Authentication Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('nikil@writzz.edu');
    setPassword('student123');
    setName('Nikil Karuppusamy');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-neutral-950 px-4 overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid line background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <AnimatePresence>
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
          <div className="w-full max-w-md z-10">
            {/* Top Brand Animated Logo (W -> WR -> WRI -> WRIT -> WRITT -> WRITZZ) */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white"
                >
                  <PenTool className="w-6 h-6" />
                </motion.div>
              </div>

              {/* Typed Logo Animation */}
              <div className="h-12 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
                  {currentBrandText}
                  {!isBrandDone && (
                    <span className="inline-block w-1.5 h-7 ml-1 bg-indigo-400 animate-pulse align-middle" />
                  )}
                </span>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isBrandDone ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-xs sm:text-sm text-neutral-400 mt-1 font-medium"
              >
                Your Ideas. Your Handwriting. Powered by Gemini AI.
              </motion.p>
            </div>

            {/* Login / Register Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isBrandDone ? 1 : 0,
                y: isBrandDone ? 0 : 20,
              }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`bg-neutral-900/90 border border-neutral-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl transition-all ${
                shakeError ? 'animate-[shake_0.5s_ease-in-out]' : ''
              }`}
            >
              {/* Tab Switcher */}
              <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    !isRegister
                      ? 'bg-neutral-800 text-white shadow-md'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    isRegister
                      ? 'bg-neutral-800 text-white shadow-md'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message with Shake */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-200 text-xs flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
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
                        placeholder="Nikil Karuppusamy"
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
                      placeholder="student@writzz.edu"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300">Password</label>
                    {!isRegister && (
                      <span className="text-[11px] text-neutral-500">MongoDB Protected</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
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
                      <span>{isRegister ? 'Create Writzz Account' : 'Enter Workspace'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Quick Expo Fill Button */}
              <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fill Demo Credentials</span>
                </button>
                <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  JWT + Bcrypt
                </span>
              </div>
            </motion.div>

            {/* Bottom note for college expo */}
            <p className="text-center text-xs text-neutral-500 mt-4">
              Real-time handwriting synthesis & academic AI generation.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
