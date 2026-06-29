import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '../../store/authStore';
import { apiClient } from '../../services/apiClient';

const BYPASS_OTP = false;

// Set to false to disable and hide the testing/credentials drawer at the bottom of the card (or define VITE_SHOW_TESTING_CREDENTIALS=false in .env)
const SHOW_TESTING_CREDENTIALS = import.meta.env.VITE_SHOW_TESTING_CREDENTIALS !== 'false';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [usernameOrEis, setUsernameOrEis] = useState('');
  const [password, setPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulationOtp, setSimulationOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutTime, setLockoutTime] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle Resend OTP Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Lockout Countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(lockoutTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutTime > 0) {
      setErrorMsg(`Account temporarily locked. Please wait ${lockoutTime} seconds.`);
      return;
    }

    if (!usernameOrEis) {
      setErrorMsg('Username or Employee ID is required.');
      return;
    }

    if (/^\d+$/.test(usernameOrEis) && usernameOrEis.length !== 8) {
      setErrorMsg('Employee ID must be exactly 8 digits.');
      return;
    }

    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Try backend authentication first
      const response = await apiClient.post('/auth/login', { usernameOrEmployeeId: usernameOrEis, password });
      
      if (response.data.otpRequired) {
        setSimulationOtp(response.data.simulationOtp || '');
        setOtpMode(true);
        setCountdown(60);
        setIsLoading(false);
      } else {
        const { accessToken, refreshToken, role, fullName, eisNumber, departmentId, id } = response.data;
        const user: AuthUser = { id, eisNumber, fullName, role, departmentId };
        setAuth(user, accessToken, refreshToken);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setIsLoading(false);
      const status = err.response?.status;
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.error ||
        (status ? `Server error (${status}). Please try again or contact support.` : 'Network error. Please check your connection and try again.');
      setErrorMsg(msg);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg('Please enter the OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await apiClient.post('/auth/login/verify-otp', {
        usernameOrEmployeeId: usernameOrEis,
        otp: otpCode.trim()
      });
      const { accessToken, refreshToken, role, fullName, eisNumber, departmentId, id } = response.data;
      const user: AuthUser = { id, eisNumber, fullName, role, departmentId };
      
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      const status = err.response?.status;
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.error ||
        (status ? `Verification failed (${status}). Please check your code and try again.` : 'Network error. Please try again.');
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden select-none font-sans">
      {/* Background Graphic Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
        {/* Brand Identity */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/30">
            S
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none m-0">NCL HQ ITSM Platform</h1>
            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-widest">Employee Security Portal</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {!otpMode ? (
          /* ========================================================================= */
          /* FORM 1: USER DETAILS (EIS + PASSWORD)                                     */
          /* ========================================================================= */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username or Employee ID</label>
              <input
                type="text"
                id="eisNumber"
                name="eisNumber"
                placeholder="Enter Username or EIS Number"
                value={usernameOrEis}
                onChange={e => setUsernameOrEis(e.target.value)}
                disabled={isLoading || lockoutTime > 0}
                className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading || lockoutTime > 0}
                className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold py-1">
              <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
                Forgot Password?
              </Link>
            </div>

            {lockoutTime > 0 && (
              <div className="text-[10px] text-red-400 font-bold text-center pt-2">
                ⏱ Lockout active. Retry in {Math.floor(lockoutTime / 60)}m {lockoutTime % 60}s.
              </div>
            )}

            <button
              type="submit"
              id="loginSubmitBtn"
              name="loginButton"
              disabled={isLoading || lockoutTime > 0}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Secure Log In'
              )}
            </button>
          </form>
        ) : (
          /* ========================================================================= */
          /* FORM 2: OTP VERIFICATION                                                  */
          /* ========================================================================= */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-4 py-3 rounded-lg text-xs font-bold text-center leading-relaxed">
              OTP sent to your registered email address.
            </div>

            {!BYPASS_OTP && simulationOtp && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-xs font-bold text-center">
                🔑 Simulation Mode OTP: <span className="text-white font-mono bg-indigo-900/50 px-2 py-0.5 rounded text-sm">{simulationOtp}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">One-Time Password (OTP)</label>
              <input
                type="text"
                id="otpCode"
                name="otpCode"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-center tracking-widest"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setOtpMode(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={countdown > 0}
                onClick={() => setCountdown(60)}
                className="text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 cursor-pointer"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              id="otpSubmitBtn"
              name="otpSubmitButton"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/20 active:scale-98 cursor-pointer"
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Testing Access Helper Panel */}
        {SHOW_TESTING_CREDENTIALS && (
          <div className="border-t border-slate-700/50 pt-4 mt-2">
            <details className="group">
              <summary className="text-[10px] font-bold text-slate-400 hover:text-indigo-400 cursor-pointer list-none flex items-center justify-between transition-colors">
                <span>🔧 TESTING &amp; QA LOGIN CREDENTIALS</span>
                <svg className="w-3.5 h-3.5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-2.5 text-[11px] text-slate-400 font-semibold bg-[#0F172A] p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase">IT Administrator Login</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameOrEis('admin');
                      setPassword('password');
                    }}
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Autofill
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Username</span>
                    <span className="font-mono text-white font-bold select-all">admin</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Password</span>
                    <span className="font-mono text-white font-bold select-all">password</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-800 pt-2 m-0">
                  💡 Log in as Admin to access the full system. In the "User Management" dashboard, you can register and configure sample employee or support engineer accounts to test other roles.
                </p>
              </div>
            </details>
          </div>
        )}

      </div>
    </div>
  );
};
