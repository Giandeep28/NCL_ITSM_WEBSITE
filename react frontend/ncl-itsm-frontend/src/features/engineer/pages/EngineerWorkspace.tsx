import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore, type Ticket } from '../../../store/ticketStore';
import { useAuthStore } from '../../../store/authStore';

// SLA Countdown Timer Component
const SlaTimer: React.FC<{ deadline: string; status: Ticket['slaStatus'] }> = ({ deadline, status }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const compute = () => {
      const now = Date.now();
      const target = new Date(deadline).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft('BREACHED');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m remaining`);
    };
    compute();
    const iv = setInterval(compute, 60000);
    return () => clearInterval(iv);
  }, [deadline]);

  const cls =
    status === 'Breached'
      ? 'text-red-600 bg-red-50 border-red-200'
      : status === 'At Risk'
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-green-600 bg-green-50 border-green-200';

  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${cls}`}>
      ⏱ {timeLeft || deadline}
    </span>
  );
};

// Priority badge helper
const getPriorityBadge = (priority: string) => {
  if (priority === 'Critical')
    return 'bg-red-100 text-red-700 border border-red-200';
  if (priority === 'Medium')
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
};

// Status badge helper
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'bg-sky-100 text-sky-800 border border-sky-200';
    case 'Assigned':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'Discussion':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'Urgent':
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

// Stat card component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}> = ({ label, value, sub, color }) => (
  <div className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-1 border-l-4 ${color}`}>
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    <span className="text-2xl font-black text-gray-900">{value}</span>
    {sub && <span className="text-[10px] font-semibold text-gray-400">{sub}</span>}
  </div>
);

type ActiveView = 'queue' | 'myWork' | 'resolved';

export const EngineerWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, updateTicketStatus, addComment } = useTicketStore();
  const { user } = useAuthStore();

  const [activeView, setActiveView] = useState<ActiveView>('queue');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    ticketId: string;
    action: string;
    newStatus: Ticket['status'];
  } | null>(null);

  // Use authenticated user's name for engineer assignment filtering
  const engineerName = user?.fullName ?? '';

  const allOpen = tickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Closed'
  );
  const myWork = tickets.filter(
    (t) =>
      t.engineerName === engineerName &&
      t.status !== 'Resolved' &&
      t.status !== 'Closed'
  );
  const resolved = tickets.filter(
    (t) =>
      (t.engineerName === engineerName || !t.engineerName) &&
      (t.status === 'Resolved' || t.status === 'Closed')
  );

  const activeTickets =
    activeView === 'queue' ? allOpen : activeView === 'myWork' ? myWork : resolved;

  const categories = ['All', ...Array.from(new Set(tickets.map((t) => t.category)))];

  const filtered = activeTickets.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    return matchSearch && matchPriority && matchCat;
  });

  const breached = myWork.filter((t) => t.slaStatus === 'Breached').length;
  const atRisk = myWork.filter((t) => t.slaStatus === 'At Risk').length;

  const handleAction = (ticketId: string, action: string, newStatus: Ticket['status']) => {
    setConfirmAction({ ticketId, action, newStatus });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    updateTicketStatus(confirmAction.ticketId, confirmAction.newStatus);
    addComment(confirmAction.ticketId, {
      author: engineerName,
      role: 'Support Engineer',
      content: `${confirmAction.action} — Status updated to ${confirmAction.newStatus}.`,
    });
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none m-0">
            Engineer Workspace
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {engineerName} — {user?.departmentId ?? 'Power Systems'} · Support Engineer
          </p>
        </div>
        <button
          onClick={() => navigate('/requests/new')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-600/20 transition-colors cursor-pointer"
        >
          + Log New Ticket
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="My Active Tickets"
          value={myWork.length}
          sub="Assigned to me"
          color="border-l-indigo-500"
        />
        <StatCard
          label="SLA Breached"
          value={breached}
          sub="Immediate attention"
          color="border-l-red-500"
        />
        <StatCard
          label="At Risk"
          value={atRisk}
          sub="Within 4h of deadline"
          color="border-l-amber-500"
        />
        <StatCard
          label="Total Queue"
          value={allOpen.length}
          sub="Unresolved across system"
          color="border-l-slate-400"
        />
      </div>

      {/* View Tabs + Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          {(
            [
              { id: 'queue', label: `All Open (${allOpen.length})` },
              { id: 'myWork', label: `My Work (${myWork.length})` },
              { id: 'resolved', label: `Resolved (${resolved.length})` },
            ] as { id: ActiveView; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                activeView === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search ticket ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:border-indigo-500 w-48 transition-colors"
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket Queue Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-bold text-gray-500">No tickets in this view</p>
            <p className="text-xs text-gray-400 mt-1">All clear for this filter combination</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                  <th className="py-3 px-5">Ticket ID</th>
                  <th className="py-3 px-5">Title &amp; Category</th>
                  <th className="py-3 px-5">Reporter</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">SLA Deadline</th>
                  <th className="py-3 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <button
                        onClick={() => navigate(`/requests/${ticket.id}`)}
                        className="font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        {ticket.id}
                      </button>
                    </td>
                    <td className="py-4 px-5">
                      <span className="block font-bold text-gray-800 truncate max-w-[200px]">
                        {ticket.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{ticket.category}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="block text-gray-600">{ticket.reporterName}</span>
                      <span className="text-[10px] text-gray-400">{ticket.department}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getPriorityBadge(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getStatusBadge(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {ticket.slaDeadline ? (
                        <SlaTimer
                          deadline={ticket.slaDeadline}
                          status={ticket.slaStatus}
                        />
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-1.5">
                        {ticket.status !== 'In Progress' &&
                          ticket.status !== 'Resolved' && (
                            <button
                              onClick={() =>
                                handleAction(
                                  ticket.id,
                                  'Accepted and started work',
                                  'In Progress'
                                )
                              }
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold rounded-md transition-colors cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                        {ticket.status === 'In Progress' && (
                          <button
                            onClick={() =>
                              handleAction(
                                ticket.id,
                                'Work completed and marked resolved',
                                'Resolved'
                              )
                            }
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold rounded-md transition-colors cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/requests/${ticket.id}`)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[9px] font-bold rounded-md transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 m-0">Confirm Action</h3>
            <p className="text-xs font-semibold text-gray-600">
              Are you sure you want to{' '}
              <span className="text-indigo-600 font-bold">{confirmAction.action}</span> for ticket{' '}
              <span className="font-black">{confirmAction.ticketId}</span>? This will update the
              ticket status to{' '}
              <span className="font-black">{confirmAction.newStatus}</span> and add a system comment.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerWorkspace;
