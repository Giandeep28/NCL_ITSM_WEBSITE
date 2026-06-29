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
  const [role, setRole] = useState('Employee');
  const [designation, setDesignation] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
        role,
        designation,
        profilePhoto,
      });

      setSuccessMsg('User registered successfully! Redirecting to User Directory...');
      setIsLoading(false);

      setTimeout(() => {
        navigate('/users');
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
    <div className="flex justify-center select-none font-sans py-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col gap-5">
        {/* Brand Identity */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/30">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none m-0">NCL HQ ITSM Platform</h1>
            <p className="text-xs text-gray-400 font-bold mt-1.5 uppercase tracking-widest">Register New User Account</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-[#0F2D54] flex items-center justify-center text-white font-extrabold text-lg overflow-hidden shrink-0 border border-gray-300 shadow-sm">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                '📷'
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Profile Photo (Optional)</span>
              <label className="px-2.5 py-1 bg-white border border-gray-250 text-gray-600 hover:bg-gray-50 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-sm inline-block">
                Choose Image
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoChange} 
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Marcus Thorne"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Official Email ID</label>
            <input
              type="email"
              placeholder="e.g. user@ncl.gov.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Mobile Number (10 Digits)</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Designation / Employee Post</label>
            <input
              type="text"
              placeholder="e.g. Operations Assistant"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Username</label>
              <input
                type="text"
                placeholder="e.g. marcus12"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Employee ID</label>
              <input
                type="text"
                placeholder="e.g. NCL12345 or 12345678"
                value={eisNumber}
                onChange={e => setEisNumber(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                maxLength={20}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Account Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="Employee">Employee</option>
              <option value="Support Engineer">Support Engineer</option>
              <option value="IT Administrator">IT Administrator</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-400"
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
              'Create User Account'
            )}
          </button>
        </form>

        <div className="text-center text-xs font-bold border-t border-gray-150 pt-4">
          <Link to="/users" className="text-indigo-600 hover:text-indigo-500">
            ← Back to User Directory
          </Link>
        </div>
      </div>
    </div>
  );
};
