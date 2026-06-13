import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

interface User {
  id: string;
  eisNumber: string;
  fullName: string;
  email: string;
  designation: string;
  departmentId: string;
  isActive: boolean;
  roles: { id: string; name: string }[];
}

const mockUsers: User[] = [
  {
    id: 'u1',
    eisNumber: '12345678',
    fullName: 'J. Henderson',
    email: '12345678@ncl.gov.in',
    designation: 'Operations Lead',
    departmentId: 'Power Generation',
    isActive: true,
    roles: [{ id: 'r1', name: 'Employee' }]
  },
  {
    id: 'u2',
    eisNumber: '88291000',
    fullName: 'Marcus Thorne',
    email: '88291000@ncl.gov.in',
    designation: 'Electrical Specialist',
    departmentId: 'Power Systems',
    isActive: true,
    roles: [{ id: 'r2', name: 'Support Engineer' }]
  },
  {
    id: 'u3',
    eisNumber: '90000001',
    fullName: 'David Sterling',
    email: 'admin@ncl.gov.in',
    designation: 'IT Administrator',
    departmentId: 'IT Infrastructure',
    isActive: true,
    roles: [{ id: 'r3', name: 'IT Administrator' }]
  },
  {
    id: 'u4',
    eisNumber: '11112222',
    fullName: 'Sarah Jenkins',
    email: 'sjenkins@ncl.gov.in',
    designation: 'Database Admin',
    departmentId: 'IT Infrastructure',
    isActive: false, // Locked account example
    roles: [{ id: 'r4', name: 'Support Engineer' }]
  }
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<User[]>('/users');
      setUsers(response.data);
    } catch (err: any) {
      console.warn('API call failed, falling back to mock data', err);
      // Fallback mock data
      setUsers(mockUsers);
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
      // Local toggle fallback for frontend demo
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.eisNumber === eisNumber ? { ...user, isActive: !user.isActive } : user
        )
      );
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

        <button
          onClick={fetchUsers}
          className="w-full md:w-auto px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.306 7" />
          </svg>
          Refresh List
        </button>
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
                        {user.designation}
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
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleToggleActive(user.eisNumber)}
                          className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
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
    </div>
  );
};
