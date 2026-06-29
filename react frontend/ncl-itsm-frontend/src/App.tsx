import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './features/tickets/pages/Dashboard';
import { NewRequest } from './features/tickets/pages/NewRequest';
import { RequestDetail } from './features/tickets/pages/RequestDetail';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { ForgotPassword } from './features/auth/ForgotPassword';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AssetRegistry } from './features/hardware-assets/pages/AssetRegistry';
import { RequestsQueue } from './features/tickets/pages/RequestsQueue';
import { AuditLogViewer } from './features/admin/pages/AuditLogViewer';
import { UserManagement } from './features/admin/pages/UserManagement';
import { SystemSettings } from './features/admin/pages/SystemSettings';
import { EngineerWorkspace } from './features/engineer/pages/EngineerWorkspace';
import { KnowledgeBase } from './features/knowledge-base/KnowledgeBase';
import { Profile } from './features/profile/Profile';

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
          <Route path="register" element={<ProtectedRoute allowedRoles={['IT Administrator', 'Super Admin']}><Register /></ProtectedRoute>} />

          {/* Tickets features */}
          <Route path="requests" element={<RequestsQueue />} />
          <Route path="requests/new" element={<NewRequest />} />
          <Route path="requests/:id" element={<RequestDetail />} />

          {/* Placeholder menus */}
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="assets" element={<AssetRegistry />} />
          <Route path="engineer" element={<ProtectedRoute allowedRoles={['Support Engineer', 'IT Administrator', 'Super Admin']}><EngineerWorkspace /></ProtectedRoute>} />
          <Route path="logs" element={<ProtectedRoute allowedRoles={['IT Administrator', 'Super Admin', 'Read Only Auditor']}><AuditLogViewer /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['IT Administrator', 'Super Admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['IT Administrator', 'Super Admin']}><SystemSettings /></ProtectedRoute>} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<SupportPage />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
