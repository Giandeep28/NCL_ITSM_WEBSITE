import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

// Lazy-loaded page components for bundle code splitting
const Dashboard = lazy(() => import('./features/tickets/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const NewRequest = lazy(() => import('./features/tickets/pages/NewRequest').then(m => ({ default: m.NewRequest })));
const RequestDetail = lazy(() => import('./features/tickets/pages/RequestDetail').then(m => ({ default: m.RequestDetail })));
const Login = lazy(() => import('./features/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./features/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const AssetRegistry = lazy(() => import('./features/hardware-assets/pages/AssetRegistry').then(m => ({ default: m.AssetRegistry })));
const RequestsQueue = lazy(() => import('./features/tickets/pages/RequestsQueue').then(m => ({ default: m.RequestsQueue })));
const AuditLogViewer = lazy(() => import('./features/admin/pages/AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));
const UserManagement = lazy(() => import('./features/admin/pages/UserManagement').then(m => ({ default: m.UserManagement })));
const SystemSettings = lazy(() => import('./features/admin/pages/SystemSettings').then(m => ({ default: m.SystemSettings })));
const EngineerWorkspace = lazy(() => import('./features/engineer/pages/EngineerWorkspace').then(m => ({ default: m.EngineerWorkspace })));
const KnowledgeBase = lazy(() => import('./features/knowledge-base/KnowledgeBase').then(m => ({ default: m.KnowledgeBase })));
const Profile = lazy(() => import('./features/profile/Profile').then(m => ({ default: m.Profile })));

// SupportPage inline component


const SupportPage: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="border-b border-gray-150 pb-3">
        <h2 className="text-xl font-bold text-gray-800 m-0">Technical Support</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Reach out to NCL HQ IT Administration desk.</p>
      </div>
      <div className="space-y-2 text-xs font-semibold text-gray-600">
        <p>📧 Email Support: <span className="text-indigo-600">support.itsm@ncl.gov.in</span></p>
        <p>📞 Phone Intercom: <span className="text-indigo-600">4029 / 1029 (HQ Ext)</span></p>
        <p>🏢 Location: <span className="text-indigo-600">IT Center, 2nd Floor, NCL HQ, Singrauli</span></p>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-400 font-bold text-xs uppercase tracking-widest font-sans">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
              <span>Loading Portal...</span>
            </div>
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            {/* Default dashboard routing */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Admin Registration */}
            <Route path="register" element={<ProtectedRoute allowedRoles={['IT Administrator']}><Register /></ProtectedRoute>} />

            {/* Tickets features */}
            <Route path="requests" element={<RequestsQueue />} />
            <Route path="requests/new" element={<NewRequest />} />
            <Route path="requests/:id" element={<RequestDetail />} />

            {/* Placeholder menus */}
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="assets" element={<ProtectedRoute allowedRoles={['Support Engineer', 'IT Administrator']}><AssetRegistry /></ProtectedRoute>} />
            <Route path="engineer" element={<ProtectedRoute allowedRoles={['Support Engineer', 'IT Administrator']}><EngineerWorkspace /></ProtectedRoute>} />
            <Route path="logs" element={<ProtectedRoute allowedRoles={['IT Administrator', 'Read Only Auditor']}><AuditLogViewer /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['IT Administrator']}><UserManagement /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['IT Administrator']}><SystemSettings /></ProtectedRoute>} />
            <Route path="profile" element={<Profile />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
