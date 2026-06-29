import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/apiClient';

interface BackendUser {
  id: string;
  eisNumber: string;
  fullName: string;
  email: string;
  username: string;
  mobile: string;
  departmentId: string;
  designation?: string;
  locationId: string;
  isActive: boolean;
}

export const Profile: React.FC = () => {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [dbUser, setDbUser] = useState<BackendUser | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch full details from database
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const response = await apiClient.get('/users/profile');
        const data = response.data as BackendUser;
        setDbUser(data);
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setMobile(data.mobile || '');
        setDesignation(data.designation || '');
      } catch (err: any) {
        console.error('Failed to load profile from backend', err);
        setErrorMsg('Failed to fetch user profile details from the database.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !mobile.trim()) {
      setErrorMsg('Please fill in all profile details.');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      };
      if (password) {
        payload.password = password;
      }

      const response = await apiClient.patch('/users/profile', payload);
      const updatedUser = response.data as BackendUser;

      // Update auth store with new profile details
      if (user && accessToken && refreshToken) {
        setAuth(
          {
            ...user,
            fullName: updatedUser.fullName,
            departmentId: updatedUser.departmentId,
          },
          accessToken,
          refreshToken
        );
      }

      setDbUser(updatedUser);
      setPassword('');
      setConfirmPassword('');
      setSuccessMsg('Profile details updated successfully!');
      
      // Auto dismiss success toast after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setErrorMsg(err.response?.data?.message || 'Error saving profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = dbUser?.fullName
    ? dbUser.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none m-0">My User Profile</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Review your corporate credentials and update your contact information.</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs font-bold shadow-sm animate-fade-in flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & System Details Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4 h-fit">
          <div className="w-24 h-24 rounded-full bg-[#0F2D54] flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-slate-900/10">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800 leading-none m-0">{dbUser?.fullName}</h3>
            <span className="text-xs text-indigo-600 font-extrabold bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block mt-2">
              {user?.role}
            </span>
          </div>

          <div className="w-full border-t border-gray-100 pt-4 text-left space-y-3">
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Employee ID (EIS)</span>
              <span className="text-xs font-extrabold text-gray-800">{dbUser?.eisNumber}</span>
            </div>
            {dbUser?.designation && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Designation</span>
                <span className="text-xs font-semibold text-gray-600">{dbUser?.designation}</span>
              </div>
            )}
            {dbUser?.departmentId && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Department</span>
                <span className="text-xs font-semibold text-gray-600">{dbUser?.departmentId}</span>
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Portal Username</span>
              <span className="text-xs font-semibold text-gray-600">{dbUser?.username}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Account Status</span>
              {dbUser?.isActive ? (
                <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 border border-green-200 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                </span>
              ) : (
                <span className="text-[10px] font-black text-red-700 bg-red-50 px-2 py-0.5 border border-red-200 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Card */}
          <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 text-left">
            <div className="border-b border-gray-150 pb-3">
              <h3 className="text-sm font-extrabold text-gray-800 m-0">Profile &amp; Contact Details</h3>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Keep your corporate profile and contact details active to create service requests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Official Email ID *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Mobile Number *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Designation / Employee Post *</label>
                <input
                  type="text"
                  value={designation}
                  disabled
                  className="w-full px-3.5 py-2 bg-gray-100 border border-gray-200 text-gray-400 rounded-lg text-xs font-semibold cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 font-bold block mt-1">🔒 Locked (Only IT Administrator can modify)</span>
              </div>
            </div>

            <div className="border-b border-gray-150 pb-3 pt-2">
              <h3 className="text-sm font-extrabold text-gray-800 m-0">Change Account Password</h3>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Leave blank if you do not wish to modify your current password.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
