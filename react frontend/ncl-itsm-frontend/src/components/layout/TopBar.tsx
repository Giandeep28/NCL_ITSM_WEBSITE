import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'info' | 'success' | 'alert';
  route?: string;
}

interface TopBarProps {
  title: string;
}

// Sub-component for dynamic user profile chip
interface UserProfileChipProps {
  onClick: () => void;
}

const UserProfileChip: React.FC<UserProfileChipProps> = ({ onClick }) => {
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
    <div 
      onClick={onClick}
      className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer hover:opacity-80 transition-opacity"
    >
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('ncl_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('ncl_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (n: NotificationItem) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    setNotificationsOpen(false);
    if (n.route) {
      navigate(n.route);
    }
  };

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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-all duration-150 cursor-pointer"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.659A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 text-[8px] font-black text-white items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-extrabold text-gray-800">Notifications</span>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-[10px] text-gray-500 hover:text-red-500 font-extrabold cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 font-bold">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 flex gap-2.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                          n.unread ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'alert' ? (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-red-50"></span>
                          ) : n.type === 'success' ? (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-green-50"></span>
                          ) : (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></span>
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-baseline gap-1">
                            <span className={`font-bold ${n.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] text-gray-400 font-semibold whitespace-nowrap">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-semibold leading-snug">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-all duration-150 cursor-pointer">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Dynamic User Profile & Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <UserProfileChip onClick={() => setProfileMenuOpen(!profileMenuOpen)} />
          
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2.5 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs py-1.5 select-none">
              {/* Account header */}
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                <p className="font-extrabold text-gray-800 leading-tight m-0 text-left">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate m-0 text-left">{user?.eisNumber}@ncl.gov.in</p>
              </div>

              {/* Menu items */}
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-600 font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  const { logout } = useAuthStore.getState();
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold transition-colors border-t border-gray-100 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
