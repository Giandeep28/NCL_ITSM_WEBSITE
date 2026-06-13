import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulationOtp, setSimulationOtp] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identity) {
      setErrorMsg('Please enter your Email or Employee ID.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', { identity });
      const { message, simulationOtp: receivedOtp } = response.data;
      
      setSuccessMsg(message);
      if (receivedOtp) {
        setSimulationOtp(receivedOtp);
      }
      setStep(2);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Failed to send OTP. User not found or system error.';
      setErrorMsg(msg);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/reset-password', {
        otp,
        identity,
        newPassword,
        confirmPassword,
      });

      setSuccessMsg(response.data.message || 'Password reset successful! Redirecting to Login...');
      setIsLoading(false);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Failed to reset password. Please check your OTP and try again.';
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
            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-widest">Password Recovery</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg text-xs font-bold text-center leading-relaxed">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          /* ========================================================================= */
          /* STEP 1: IDENTITY VERIFICATION                                            */
          /* ========================================================================= */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Email ID or Employee ID</label>
              <input
                type="text"
                placeholder="Enter email, username, or EIS number"
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Request Reset OTP'
              )}
            </button>
          </form>
        ) : (
          /* ========================================================================= */
          /* STEP 2: ENTER OTP & NEW PASSWORD                                         */
          /* ========================================================================= */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {simulationOtp && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-4 py-3 rounded-lg text-xs font-bold text-center leading-relaxed">
                🔑 Simulation Mode OTP: <span className="text-white font-mono bg-indigo-900/50 px-2 py-0.5 rounded text-sm">{simulationOtp}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verification OTP (6 Digits)</label>
              <input
                type="text"
                placeholder="Enter OTP code"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-center tracking-widest font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs font-bold border-t border-slate-800 pt-4">
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
