import React from 'react';
import { useAuthStore } from '../../store/authStore';

interface TopBarProps {
  title: string;
}

// Sub-component for dynamic user profile chip
const UserProfileChip: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleBadgeColor =
    user.role === 'Super Admin' || user.role === 'IT Administrator'
      ? 'bg-red-100 text-red-700'
      : user.role === 'Support Engineer'
      ? 'bg-indigo-100 text-indigo-700'
      : user.role === 'Asset Manager'
      ? 'bg-teal-100 text-teal-700'
      : user.role === 'Read Only Auditor'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-600';

  return (
    <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
      <div className="text-right hidden md:block">
        <p className="text-xs font-extrabold text-gray-800 leading-tight">{user.fullName}</p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${roleBadgeColor}`}>
          {user.role}
        </span>
      </div>
      <div className="w-9 h-9 rounded-full bg-[#0F2D54] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
        {initials}
      </div>
    </div>
  );
};

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Page Title / Section Brand */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight m-0">{title}</h2>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-6">
        {/* Search Input */}
        <div className="relative w-72">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4.5 w-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search system..."
            className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 rounded-full text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-150"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4.5 text-gray-500">
          {/* Notification Bell */}
          <button className="relative p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-all duration-150 cursor-pointer">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.659A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full border border-white"></span>
          </button>

          {/* Help */}
          <button className="p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-all duration-150 cursor-pointer">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Dynamic User Profile */}
        <UserProfileChip />
      </div>
    </header>
  );
};
