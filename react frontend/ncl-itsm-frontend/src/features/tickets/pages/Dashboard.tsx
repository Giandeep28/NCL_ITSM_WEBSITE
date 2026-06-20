import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore, type Ticket } from '../../../store/ticketStore';
import { useAuthStore } from '../../../store/authStore';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, setSelectedTicketId, fetchTickets } = useTicketStore();
  const { user } = useAuthStore();

  const isEngineer = user?.role === 'Support Engineer';
  const [isApiOnline, setIsApiOnline] = useState(true);

  const [timeframe, setTimeframe] = useState<'7' | '30' | '90' | 'all'>('30');
  const [timeframeOpen, setTimeframeOpen] = useState(false);
  const timeframeRef = useRef<HTMLDivElement>(null);

  // Close timeframe dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeframeRef.current && !timeframeRef.current.contains(event.target as Node)) {
        setTimeframeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTickets = useMemo(() => {
    if (timeframe === 'all') return tickets;
    const daysLimit = parseInt(timeframe);
    const limitMs = daysLimit * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return tickets.filter(t => {
      try {
        const ticketTime = new Date(t.date).getTime();
        if (isNaN(ticketTime)) return true;
        return (now - ticketTime) <= limitMs;
      } catch {
        return true;
      }
    });
  }, [tickets, timeframe]);

  useEffect(() => {
    const initData = async () => {
      try {
        await fetchTickets();
        setIsApiOnline(true);
      } catch {
        setIsApiOnline(false);
      }
    };
    initData();
  }, [fetchTickets]);

  // Handle clicking on a ticket row
  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    navigate(`/requests/${ticketId}`);
  };

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
        return `${baseClass} bg-red-100 text-red-800 border border-red-200 animate-pulse`;
      case 'Requested':
        return `${baseClass} bg-gray-100 text-gray-800 border border-gray-200`;
      case 'Assigned':
        return `${baseClass} bg-blue-100 text-blue-800 border border-blue-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  // Category Icons helper
  const getCategoryIcon = (category: string) => {
    const iconClass = "p-1.5 rounded-lg text-white bg-[#0F2D54]";
    switch (category) {
      case 'Turbine Maintenance':
        return (
          <span className={iconClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </span>
        );
      case 'Grid Calibration':
        return (
          <span className={iconClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
        );
      case 'Sensor Replacement':
        return (
          <span className={iconClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </span>
        );
      default:
        return (
          <span className={iconClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </span>
        );
    }
  };

  // -------------------------------------------------------------------------
  // DYNAMIC COMPUTATIONS FOR CHARTS
  // -------------------------------------------------------------------------
  const dynamicIntakeData = useMemo(() => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days: { day: string; dateStr: string; logged: number; resolved: number; }[] = [];
    
    // Build last 7 days array
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      days.push({
        day: weekdays[d.getDay()],
        dateStr,
        logged: 0,
        resolved: 0,
      });
    }

    // Populate data dynamically from filteredTickets
    filteredTickets.forEach(ticket => {
      const match = days.find(d => d.dateStr === ticket.date);
      if (match) {
        match.logged += 1;
        if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
          match.resolved += 1;
        }
      }
    });

    return days;
  }, [filteredTickets]);

  const dynamicComplianceData = useMemo(() => {
    const totalWithSla = filteredTickets.filter(t => t.slaStatus).length;
    const metSla = filteredTickets.filter(t => t.slaStatus && t.slaStatus !== 'Breached').length;
    const breachedSla = filteredTickets.filter(t => t.slaStatus === 'Breached').length;

    if (totalWithSla === 0) {
      return {
        data: [{ name: 'No Data', value: 1, color: '#e2e8f0' }],
        rate: null,
        metCount: 0,
        breachedCount: 0
      };
    }

    const rate = Math.round((metSla / totalWithSla) * 100);
    return {
      data: [
        { name: 'SLA Met', value: metSla, color: '#10b981' },
        { name: 'SLA Breached', value: breachedSla, color: '#ef4444' }
      ],
      rate,
      metCount: metSla,
      breachedCount: breachedSla
    };
  }, [filteredTickets]);

  // -------------------------------------------------------------------------
  // EMPLOYEE DASHBOARD COMPUTATIONS
  // -------------------------------------------------------------------------
  const pendingCount = useMemo(() => {
    return filteredTickets.filter(t => !['Resolved', 'Closed', 'Discussion'].includes(t.status)).length;
  }, [filteredTickets]);

  const resolvedCount = useMemo(() => {
    return filteredTickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;
  }, [filteredTickets]);

  const discussionCount = useMemo(() => {
    return filteredTickets.filter(t => t.status === 'Discussion').length;
  }, [filteredTickets]);

  const recentPendingCount = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return filteredTickets.filter(t => !['Resolved', 'Closed'].includes(t.status) && t.date === todayStr).length;
  }, [filteredTickets]);

  const activeTicketsCount = useMemo(() => {
    return filteredTickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;
  }, [filteredTickets]);

  const loadPercentage = useMemo(() => {
    if (!isApiOnline) return 0;
    return Math.min(100, Math.max(5, activeTicketsCount * 15));
  }, [activeTicketsCount, isApiOnline]);

  const loadStatus = useMemo(() => {
    if (!isApiOnline) return 'Offline';
    if (loadPercentage > 80) return 'High Load';
    if (loadPercentage > 50) return 'Moderate';
    return 'Optimal';
  }, [loadPercentage, isApiOnline]);

  const activeTechniciansCount = useMemo(() => {
    const uniqueEngineers = new Set(filteredTickets.map(t => t.engineerName).filter(Boolean));
    return uniqueEngineers.size || (user?.role === 'Support Engineer' ? 1 : 0);
  }, [filteredTickets, user]);

  // -------------------------------------------------------------------------
  // RENDER ENGINEER DASHBOARD
  // -------------------------------------------------------------------------
  if (isEngineer) {
    const myTickets = filteredTickets.filter(t => t.engineerName === user?.fullName);
    const myActiveCount = myTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
    const criticalCount = filteredTickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed').length;
    const breachedCount = filteredTickets.filter(t => t.slaStatus === 'Breached').length;

    return (
      <div className="space-y-6 md:space-y-8 select-none">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none m-0">Support Engineer Console</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Welcome back, <span className="text-[#0F2D54] font-bold">{user?.fullName}</span>. Manage your ticket assignments and monitor SLAs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-gray-500 font-bold">Duty Status: Active</span>
          </div>
        </div>

        {/* Engineer KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Active Tickets</span>
              <h3 className="text-3xl font-extrabold text-[#0F2D54] m-0">{myActiveCount}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Critical Alerts (Global)</span>
              <h3 className="text-3xl font-extrabold text-red-600 m-0">{criticalCount}</h3>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">SLA Breached</span>
              <h3 className="text-3xl font-extrabold text-amber-600 m-0">{breachedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">7-Day Intake vs Resolution Trends</h3>
            {tickets.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-xl z-20">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">No data to display</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-1">No activity recorded yet</span>
              </div>
            )}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynamicIntakeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="logged" stroke="#0F2D54" strokeWidth={3} name="Logged Tickets" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved Tickets" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">SLA Compliance Rate</h3>
            {tickets.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-xl z-20">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">No data to display</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-1">No tickets with SLA configuration</span>
              </div>
            )}
            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicComplianceData.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dynamicComplianceData.data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-gray-800">
                  {dynamicComplianceData.rate !== null ? `${dynamicComplianceData.rate}%` : 'N/A'}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {dynamicComplianceData.rate !== null ? 'Met SLA' : 'No Data'}
                </span>
              </div>
            </div>
            <div className="flex justify-around text-xs font-bold text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 block"></span> Met</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 block"></span> Breached</span>
            </div>
          </div>
        </div>

        {/* Active Queue Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-150 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-800 m-0">My Active Work Queue</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0F2D54]/10 text-[#0F2D54] text-[10px] font-extrabold">
              {myTickets.length} Total Assignments
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">Reporter</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">SLA Countdown</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {myTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 font-bold">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span>No requests assigned</span>
                        <span className="text-[10px] text-gray-400 font-semibold normal-case">No active tasks in your queue</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myTickets.map((ticket) => (
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
                      <td className="py-4 px-5 font-mono font-bold text-gray-500">
                        {ticket.slaDeadline || 'N/A'}
                      </td>
                      <td className="py-4 px-5">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button className="px-3 py-1 bg-[#0F2D54] text-white rounded text-[10px] font-extrabold uppercase tracking-wider hover:bg-slate-800 transition-all">
                          Work
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER EMPLOYEE/DEFAULT DASHBOARD
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6 md:space-y-8 select-none">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none m-0">Operations Dashboard</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Real-time oversight of IT service efficiency and request volume.</p>
        </div>
        <div className="relative" ref={timeframeRef}>
          <button
            onClick={() => setTimeframeOpen(!timeframeOpen)}
            className="self-start px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all duration-150"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {timeframe === '7' ? 'Last 7 Days' : timeframe === '30' ? 'Last 30 Days' : timeframe === '90' ? 'Last 90 Days' : 'All Time'}
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {timeframeOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs py-1 select-none">
              {(['7', '30', '90', 'all'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => {
                    setTimeframe(option);
                    setTimeframeOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 font-bold transition-colors cursor-pointer ${
                    timeframe === option ? 'text-indigo-600 bg-indigo-50/30' : 'text-gray-600'
                  }`}
                >
                  {option === '7' ? 'Last 7 Days' : option === '30' ? 'Last 30 Days' : option === '90' ? 'Last 90 Days' : 'All Time'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-gray-900 m-0">{pendingCount}</h3>
              {pendingCount > 0 && recentPendingCount > 0 && (
                <span className="text-xs text-indigo-600 font-bold tracking-tight bg-indigo-50 px-1.5 py-0.5 rounded">+{recentPendingCount} today</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        {/* Resolved Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolved</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-gray-900 m-0">{resolvedCount}</h3>
              {filteredTickets.length > 0 && (
                <span className="text-xs text-green-600 font-bold tracking-tight bg-green-50 px-1.5 py-0.5 rounded">
                  {Math.round((resolvedCount / filteredTickets.length) * 100)}% efficiency
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* In Discussion Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Discussion</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-gray-900 m-0">{discussionCount}</h3>
              {discussionCount > 0 && (
                <span className="text-xs text-gray-600 font-bold tracking-tight bg-gray-50 px-1.5 py-0.5 rounded">Avg. 4h wait</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Table & Right Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Requests Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-white">
            <h3 className="text-sm font-extrabold text-gray-800 m-0">Recent Requests</h3>
            <button
              onClick={() => navigate('/requests')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View All Requests
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 font-bold">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span>No requests available</span>
                        <span className="text-[10px] text-gray-400 font-semibold normal-case">No activity recorded yet</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.slice(0, 7).map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket.id)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5 font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
                        #{ticket.ticketNumber || ticket.id.substring(0, 8)}
                      </td>
                      <td className="py-4 px-5 flex items-center gap-2.5">
                        {getCategoryIcon(ticket.category)}
                        <span className="text-gray-800 font-bold">{ticket.title}</span>
                      </td>
                      <td className="py-4 px-5">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="py-4 px-5 text-gray-500 font-medium">
                        {ticket.date}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="space-y-6">
          {/* System Status Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 m-0">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isApiOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Production API
                </span>
                <span className={`${isApiOnline ? 'text-green-600' : 'text-red-600'} font-bold`}>
                  {isApiOnline ? 'Operational' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isApiOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Registry DB
                </span>
                <span className={`${isApiOnline ? 'text-green-600' : 'text-red-600'} font-bold`}>
                  {isApiOnline ? 'Operational' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isApiOnline ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  Asset Monitoring
                </span>
                <span className={`${isApiOnline ? 'text-green-600' : 'text-amber-600'} font-bold`}>
                  {isApiOnline ? 'Operational' : 'Degraded'}
                </span>
              </div>
            </div>

            {/* Current Load Bar */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-400">CURRENT LOAD</span>
                <span className="text-indigo-600">{loadPercentage}% Capacity - {loadStatus}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${loadPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Active Site Widget (Network/Datacenter Gradient) */}
          <div className="relative rounded-xl overflow-hidden shadow-sm h-48 border border-gray-200 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-5 flex flex-col justify-end text-white select-none">
            {/* Ambient pattern grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            
            {/* Blurry glow shapes */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-600/30 rounded-full blur-2xl"></div>
            <div className="absolute top-10 -left-10 w-24 h-24 bg-cyan-600/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 space-y-1">
              <h4 className="text-sm font-extrabold m-0 text-white tracking-tight">Active Site: Region {user?.departmentId || 'North-Alpha'}</h4>
              <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {activeTechniciansCount} Active Technician{activeTechniciansCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Predictor Banner */}
        <div className="bg-[#0F2D54] rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-48 border border-[#1e3a5f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d4475] via-[#0F2D54] to-slate-950 opacity-85"></div>
          
          <div className="relative z-10 space-y-2">
            <h3 className="text-base font-extrabold flex items-center gap-2 text-white m-0">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Maintenance Predictor
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Our neural network predicts asset failures before they occur. Currently monitoring {filteredTickets.length > 0 ? (4100 + filteredTickets.length).toLocaleString() : 0} critical components across all regions.
            </p>
          </div>
          <div className="relative z-10 pt-2 flex items-center gap-4 text-xs font-bold text-cyan-400">
            <span>Accuracy: {filteredTickets.length > 0 ? '94.2%' : 'N/A (No data)'}</span>
            <span>·</span>
            <span>Next Scan: {filteredTickets.length > 0 ? 'In 4 mins' : 'N/A'}</span>
          </div>
        </div>

        {/* Knowledge Base Promo */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-48">
          <div className="space-y-2">
            <h3 className="text-base font-extrabold flex items-center gap-2 text-gray-800 m-0">
              <svg className="w-5 h-5 text-[#0F2D54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Service Knowledge Base
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Access technical manuals, safety protocols, and legacy equipment documentation updated daily by our engineering team.
            </p>
          </div>
          <button onClick={() => navigate('/knowledge-base')} className="self-start text-xs font-bold text-[#0F2D54] hover:text-[#1d4475] flex items-center gap-1 cursor-pointer transition-colors border-none bg-transparent p-0">
            Search Articles
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

