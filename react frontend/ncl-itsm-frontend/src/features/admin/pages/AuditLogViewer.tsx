import React, { useState } from 'react';

interface AuditLogEntry {
  id: string;
  occurredAt: string;
  actorName: string;
  eventType: string;
  entityType: string;
  entityId: string;
  beforeJson: string | null;
  afterJson: string | null;
}

const initialAuditLogs: AuditLogEntry[] = [];

export const AuditLogViewer: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtering logic
  let filteredLogs = logs;
  if (eventTypeFilter !== 'All') {
    filteredLogs = filteredLogs.filter(log => log.eventType === eventTypeFilter);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredLogs = filteredLogs.filter(log =>
      log.actorName.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      log.entityId.toLowerCase().includes(query)
    );
  }

  // CSV Export Utility
  const handleExportCSV = () => {
    const headers = ['ID', 'Occurred At', 'Actor', 'Event Type', 'Entity Type', 'Entity ID', 'Before State', 'After State'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.occurredAt,
      log.actorName,
      log.eventType,
      log.entityType,
      log.entityId,
      log.beforeJson || '',
      log.afterJson || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ncl_itsm_audit_log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Ribbon Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4.5 w-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by Actor, Entity ID or Type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0F2D54] transition-colors"
            />
          </div>

          {/* Event Filter */}
          <select
            value={eventTypeFilter}
            onChange={e => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:outline-none focus:bg-white"
          >
            <option value="All">Event: All Types</option>
            <option value="SYSTEM_BOOT">SYSTEM_BOOT</option>
            <option value="LDAP_CONNECT">LDAP_CONNECT</option>
            <option value="VIEW_TICKET">VIEW_TICKET</option>
            <option value="UPDATE_STATUS">UPDATE_STATUS</option>
            <option value="CREATE_TICKET">CREATE_TICKET</option>
            <option value="UPDATE_CONFIG">UPDATE_CONFIG</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full md:w-auto px-4 py-2 bg-[#0F2D54] hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Actor</th>
                <th className="py-3 px-5">Event</th>
                <th className="py-3 px-5">Entity</th>
                <th className="py-3 px-5">Entity ID</th>
                <th className="py-3 px-5">Before State</th>
                <th className="py-3 px-5">After State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-gray-500 font-bold">
                    {log.occurredAt}
                  </td>
                  <td className="py-4 px-5 text-gray-900 font-bold">
                    {log.actorName}
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-extrabold text-[9px] uppercase tracking-wider border border-gray-200">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-gray-500">
                    {log.entityType}
                  </td>
                  <td className="py-4 px-5 font-mono text-gray-400 font-bold">
                    {log.entityId}
                  </td>
                  <td className="py-4 px-5 font-mono text-[10px] text-red-600 max-w-xs truncate" title={log.beforeJson || ''}>
                    {log.beforeJson || <span className="italic text-gray-300">none</span>}
                  </td>
                  <td className="py-4 px-5 font-mono text-[10px] text-green-600 max-w-xs truncate" title={log.afterJson || ''}>
                    {log.afterJson || <span className="italic text-gray-300">none</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
