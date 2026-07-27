import React from 'react';

export const SupportPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-bold uppercase tracking-wider">
            NCL HQ IT Service Desk
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Technical Support Desk</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Need hardware assistance, infrastructure support, or access management? Contact NCL HQ IT Admin desk.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Desk Active (8:00 AM - 8:00 PM IST)
        </div>
      </div>

      {/* Support Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 hover:border-indigo-200 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
            📧
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Email Desk</h3>
            <p className="text-xs text-gray-400 mt-0.5">Official ticket escalations</p>
          </div>
          <p className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50/50 p-2 rounded-md border border-indigo-100/60">
            support.itsm@ncl.gov.in
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 hover:border-indigo-200 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
            📞
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Intercom Lines</h3>
            <p className="text-xs text-gray-400 mt-0.5">HQ Direct Extension Numbers</p>
          </div>
          <p className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50/50 p-2 rounded-md border border-indigo-100/60">
            4029 / 1029 (HQ Ext)
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 hover:border-indigo-200 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
            🏢
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Physical Office</h3>
            <p className="text-xs text-gray-400 mt-0.5">On-site technical support</p>
          </div>
          <p className="text-xs font-semibold text-indigo-600 bg-indigo-50/50 p-2 rounded-md border border-indigo-100/60 leading-tight">
            IT Center, 2nd Floor, NCL HQ, Singrauli
          </p>
        </div>
      </div>
    </div>
  );
};
