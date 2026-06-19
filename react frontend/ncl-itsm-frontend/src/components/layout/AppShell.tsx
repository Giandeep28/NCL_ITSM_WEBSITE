import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine page title based on active path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Service Hub Portal';
    if (path === '/requests/new') return 'Create New Service Request';
    if (path.startsWith('/requests/')) return 'Service Request Details';
    if (path === '/requests') return 'Service Requests Queue';
    if (path === '/knowledge-base') return 'Knowledge Base';
    if (path === '/assets') return 'Asset Registry';
    if (path === '/engineer') return 'Engineer Workspace';
    if (path === '/logs') return 'Audit & System Logs';
    if (path === '/users') return 'User Management';
    if (path === '/settings') return 'System Settings';
    return 'Service Hub Portal';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar - Left Section */}
      <Sidebar onNewRequestClick={() => navigate('/requests/new')} />

      {/* Main Content - Right Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TopBar Header */}
        <TopBar title={getPageTitle()} />

        {/* Scrollable Workspace Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
