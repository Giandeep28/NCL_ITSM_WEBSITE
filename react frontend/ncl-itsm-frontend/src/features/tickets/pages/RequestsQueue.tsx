import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore, type Ticket } from '../../../store/ticketStore';
import { useAuthStore } from '../../../store/authStore';

export const RequestsQueue: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, setSelectedTicketId, fetchTickets } = useTicketStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'unassigned' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    navigate(`/requests/${ticketId}`);
  };

  const isEngineer = user?.role === 'Support Engineer' || user?.role === 'IT Administrator' || user?.role === 'Super Admin';

  // 1. Filter tickets by User Context & Role
  let filteredTickets = tickets;
  if (!isEngineer) {
    // Regular employees see only their own tickets
    filteredTickets = tickets.filter(t => t.reporterId === user?.eisNumber || t.reporterName === user?.fullName);
  }

  // 2. Filter by Active Tab selection
  if (activeTab === 'mine') {
    filteredTickets = filteredTickets.filter(t => t.engineerName === user?.fullName);
  } else if (activeTab === 'unassigned') {
    filteredTickets = filteredTickets.filter(t => !t.engineerName);
  } else if (activeTab === 'resolved') {
    filteredTickets = filteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  }

  // 3. Filter by Priority Dropdown
  if (priorityFilter !== 'All') {
    filteredTickets = filteredTickets.filter(t => t.priority === priorityFilter);
  }

  // 4. Filter by Category Dropdown
  if (categoryFilter !== 'All') {
    filteredTickets = filteredTickets.filter(t => t.category === categoryFilter);
  }

  // 5. Filter by Search Query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredTickets = filteredTickets.filter(t =>
      t.id.toLowerCase().includes(query) ||
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(query)) ||
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.reporterName.toLowerCase().includes(query)
    );
  }

  // Get status color styling
  const getStatusBadge = (status: Ticket['status']) => {
    const baseClass = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase inline-flex items-center justify-center";
    switch (status) {
      case 'In Progress':
        return `${baseClass} bg-sky-100 text-sky-800 border border-sky-200`;
      case 'Discussion':
        return `${baseClass} bg-purple-100 text-purple-800 border border-purple-200`;
      case 'Resolved':
        return `${baseClass} bg-green-100 text-green-800 border border-green-200`;
      case 'Urgent':
        return `${baseClass} bg-red-100 text-red-800 border border-red-200`;
      case 'Requested':
        return `${baseClass} bg-gray-100 text-gray-800 border border-gray-200`;
      case 'Assigned':
        return `${baseClass} bg-blue-100 text-blue-800 border border-blue-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Search & Filter Ribbon */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4.5 w-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by ID, summary or reporter..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0F2D54] transition-colors"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:outline-none focus:bg-white"
            >
              <option value="All">Priority: All</option>
              <option value="Critical">Critical</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:outline-none focus:bg-white"
            >
              <option value="All">Category: All</option>
              <option value="Turbine Maintenance">Turbine Maintenance</option>
              <option value="Grid Calibration">Grid Calibration</option>
              <option value="Sensor Replacement">Sensor Replacement</option>
            </select>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-gray-150 pt-2 text-xs font-bold text-gray-400">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-4 border-b-2 transition-all ${
              activeTab === 'all'
                ? 'border-[#0F2D54] text-[#0F2D54]'
                : 'border-transparent hover:text-gray-600'
            }`}
          >
            All Tickets
          </button>
          {isEngineer && (
            <button
              onClick={() => setActiveTab('mine')}
              className={`pb-2.5 px-4 border-b-2 transition-all ${
                activeTab === 'mine'
                  ? 'border-[#0F2D54] text-[#0F2D54]'
                  : 'border-transparent hover:text-gray-600'
              }`}
            >
              My Assignments
            </button>
          )}
          {isEngineer && (
            <button
              onClick={() => setActiveTab('unassigned')}
              className={`pb-2.5 px-4 border-b-2 transition-all ${
                activeTab === 'unassigned'
                  ? 'border-[#0F2D54] text-[#0F2D54]'
                  : 'border-transparent hover:text-gray-600'
              }`}
            >
              Unassigned
            </button>
          )}
          <button
            onClick={() => setActiveTab('resolved')}
            className={`pb-2.5 px-4 border-b-2 transition-all ${
              activeTab === 'resolved'
                ? 'border-[#0F2D54] text-[#0F2D54]'
                : 'border-transparent hover:text-gray-600'
            }`}
          >
            Resolved &amp; Closed
          </button>
        </div>
      </div>

      {/* Tickets List Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-semibold space-y-3">
            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No tickets found matching the filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">Reporter</th>
                  <th className="py-3 px-5">Summary</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Assigned To</th>
                  <th className="py-3 px-5">SLA Countdown</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket.id)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
                      #{ticket.ticketNumber || ticket.id.substring(0, 8)}
                    </td>
                    <td className="py-4 px-5 text-gray-800 font-bold">
                      {ticket.reporterName}
                    </td>
                    <td className="py-4 px-5 max-w-xs truncate font-bold text-gray-800">
                      {ticket.title}
                    </td>
                    <td className="py-4 px-5">
                      {ticket.category}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-gray-500">
                      {ticket.engineerName || <span className="italic text-gray-400">Unassigned</span>}
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-gray-500">
                      {ticket.slaDeadline || 'N/A'}
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button className="px-3 py-1 bg-[#0F2D54] hover:bg-slate-800 text-white rounded text-[10px] font-extrabold uppercase tracking-wider transition-all">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
