import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [eisNumber, setEisNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!fullName || !email || !mobile || !username || !eisNumber || !password || !confirmPassword) {
      setErrorMsg('All fields are mandatory.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Invalid email format. Must be a valid official email address.');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!/^[A-Za-z0-9]{4,20}$/.test(eisNumber)) {
      setErrorMsg('Employee ID must be 4–20 alphanumeric characters (letters and/or digits).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords and Confirm Password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        fullName,
        email,
        mobile,
        username,
        eisNumber,
        password,
        confirmPassword,
      });

      setSuccessMsg('Registration successful! Redirecting to Login page...');
      setIsLoading(false);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
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

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden select-none font-sans">
      {/* Background Graphic Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 shadow-2xl flex flex-col gap-5 my-8">
        {/* Brand Identity */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/30">
            S
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none m-0">NCL HQ ITSM Platform</h1>
            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-widest">New User Registration</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Marcus Thorne"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Email ID</label>
            <input
              type="email"
              placeholder="e.g. user@ncl.gov.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number (10 Digits)</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
              <input
                type="text"
                placeholder="e.g. marcus12"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employee ID</label>
              <input
                type="text"
                placeholder="e.g. NCL12345 or 12345678"
                value={eisNumber}
                onChange={e => setEisNumber(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                maxLength={20}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
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
              className="w-full px-4 py-2 bg-[#0F172A] border border-slate-700/80 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-xs font-bold border-t border-slate-800 pt-4">
          <span className="text-slate-400">Already have an account? </span>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
