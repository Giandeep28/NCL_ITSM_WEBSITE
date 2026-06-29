import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';

interface User {
  id: string;
  eisNumber: string;
  fullName: string;
  email: string;
  mobile?: string;
  designation?: string;
  departmentId: string;
  isActive: boolean;
  roles: { id: string; name: string }[];
}

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit modal states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editRole, setEditRole] = useState('Employee');
  const [editPassword, setEditPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<User[]>('/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Failed to fetch users from backend', err);
      setErrorMsg('Failed to load user directory from the server.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (eisNumber: string) => {
    try {
      const response = await apiClient.put<User>(`/users/${eisNumber}/toggle-active`);
      setUsers(prevUsers =>
        prevUsers.map(user => (user.eisNumber === eisNumber ? response.data : user))
      );
    } catch (err: any) {
      console.error('Failed to toggle active status', err);
      setErrorMsg('Failed to update user status. Please try again.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName || '');
    setEditEmail(user.email || '');
    setEditMobile(user.mobile || '');
    setEditDesignation(user.designation || '');
    setEditDepartmentId(user.departmentId || '');
    setEditRole(user.roles?.[0]?.name || 'Employee');
    setEditPassword('');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg('');
    setIsUpdating(true);

    if (!editFullName.trim() || !editEmail.trim() || !editMobile.trim()) {
      setErrorMsg('Name, Email and Mobile fields are required.');
      setIsUpdating(false);
      return;
    }

    if (!/^\d{10}$/.test(editMobile)) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      setIsUpdating(false);
      return;
    }

    try {
      const payload: any = {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
        designation: editDesignation.trim(),
        departmentId: editDepartmentId.trim(),
        role: editRole,
      };

      if (editPassword) {
        payload.password = editPassword;
      }

      await apiClient.put(`/users/${editingUser.eisNumber}`, payload);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to update user', err);
      setErrorMsg(err.response?.data?.message || 'Error updating user account details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter & Search Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.eisNumber.includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const userRole = user.roles?.[0]?.name || 'Employee';
    const matchesRole = roleFilter === 'All' || userRole === roleFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && user.isActive) ||
      (statusFilter === 'Inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none font-sans">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      )}
      {/* Header and Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4.5 w-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search users by name, EIS or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0F2D54] transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="All">Role: All</option>
            <option value="Employee">Employee</option>
            <option value="Support Engineer">Support Engineer</option>
            <option value="IT Administrator">IT Administrator</option>
            <option value="Super Admin">Super Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Locked / Inactive</option>
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => navigate('/register')}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register New User
          </button>

          <button
            onClick={fetchUsers}
            className="w-full md:w-auto px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.306 7" />
            </svg>
            Refresh List
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400">
            <span className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
            Loading User Records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                  <th className="py-3 px-5">EIS Number</th>
                  <th className="py-3 px-5">Full Name</th>
                  <th className="py-3 px-5">Email Address</th>
                  <th className="py-3 px-5">Designation</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredUsers.map(user => {
                  const roleName = user.roles?.[0]?.name || 'Employee';
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5 font-mono text-gray-900 font-bold">
                        {user.eisNumber}
                      </td>
                      <td className="py-4 px-5 text-gray-900 font-bold">
                        {user.fullName}
                      </td>
                      <td className="py-4 px-5 text-gray-500 font-medium">
                        {user.email}
                      </td>
                      <td className="py-4 px-5 text-gray-600 font-medium">
                        {user.designation || '—'}
                      </td>
                      <td className="py-4 px-5 text-gray-500">
                        {user.departmentId}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          roleName === 'IT Administrator' || roleName === 'Super Admin'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : roleName === 'Support Engineer'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          user.isActive
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {user.isActive ? 'Active' : 'Locked'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-2.5 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.eisNumber)}
                          className={`px-2.5 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            user.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {user.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs font-bold text-gray-400">
                      No user records matched your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-gray-800 m-0">Modify Account Details</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Updating user details for EIS: {editingUser.eisNumber}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable Form) */}
            <form onSubmit={handleUpdateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Official Email ID</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Mobile Number</label>
                  <input
                    type="text"
                    value={editMobile}
                    onChange={e => setEditMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={e => setEditDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Department ID</label>
                  <input
                    type="text"
                    value={editDepartmentId}
                    onChange={e => setEditDepartmentId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Account Role</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="Employee">Employee</option>
                  <option value="Support Engineer">Support Engineer</option>
                  <option value="IT Administrator">IT Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Change Password (leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors placeholder:text-gray-300"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isUpdating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
