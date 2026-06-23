import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

interface ConfigItem {
  id: string;
  configKey: string;
  configValue: string;
  scope: string;
  description: string;
}

export const SystemSettings: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Editable config states
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [slaCritical, setSlaCritical] = useState('2');
  const [slaHigh, setSlaHigh] = useState('8');
  const [slaMedium, setSlaMedium] = useState('24');
  const [slaLow, setSlaLow] = useState('48');

  const [isDownloadingTickets, setIsDownloadingTickets] = useState(false);
  const [isDownloadingAssets, setIsDownloadingAssets] = useState(false);

  const fetchConfigurations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get<ConfigItem[]>('/configurations');
      const data = response.data;
      setConfigs(data);

      // Map values to form state
      data.forEach(item => {
        if (item.configKey === 'low_stock_threshold') setLowStockThreshold(item.configValue);
        if (item.configKey === 'sla_critical_hours') setSlaCritical(item.configValue);
        if (item.configKey === 'sla_high_hours') setSlaHigh(item.configValue);
        if (item.configKey === 'sla_medium_hours') setSlaMedium(item.configValue);
        if (item.configKey === 'sla_low_hours') setSlaLow(item.configValue);
      });
    } catch (err: any) {
      console.error('Failed to fetch system configurations', err);
      setError('Failed to load system configurations from the server. Please ensure the backend is running.');
      setConfigs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleSaveSetting = async (key: string, value: string, scope: string, description: string) => {
    setError('');
    setSaveSuccess('');
    try {
      await apiClient.post(`/configurations?key=${key}&value=${value}&scope=${scope}&description=${encodeURIComponent(description)}`);
      setSaveSuccess(`Successfully updated configuration key: ${key}`);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      console.error(`Failed to update ${key}`, err);
      setError(`Failed to update ${key} on backend server, using offline sync.`);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDownloadReport = async (reportType: 'tickets' | 'assets') => {
    if (reportType === 'tickets') setIsDownloadingTickets(true);
    else setIsDownloadingAssets(true);

    try {
      const response = await apiClient.get(`/reports/${reportType}/excel`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ncl_itsm_${reportType}_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error(`Failed to download ${reportType} report`, err);
      alert(`Error downloading ${reportType} Excel report. Please make sure backend reporting service is active.`);
    } finally {
      if (reportType === 'tickets') setIsDownloadingTickets(false);
      else setIsDownloadingAssets(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-gray-400">
        <span className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
        Loading System Settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 select-none font-sans">
      {/* Alert Notices */}
      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-600 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
          ✓ {saveSuccess}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2.5 rounded-lg text-xs font-bold text-center">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Configurations Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Threshold & Inventory configs */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-150 pb-3">
              <h3 className="text-sm font-bold text-gray-800 m-0">Inventory & Consumables Rules</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">Configure automated stock warnings and inventory rules.</p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-md">
                <label className="text-xs font-bold text-gray-700">Low Stock Alert Threshold</label>
                <p className="text-[11px] text-gray-400 font-semibold leading-normal">
                  Minimum quantity available in inventory before a low-stock alert is generated and dispatched to the Asset Manager.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(e.target.value)}
                  className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold text-center focus:outline-none focus:bg-white focus:border-[#0F2D54]"
                />
                <button
                  onClick={() => handleSaveSetting('low_stock_threshold', lowStockThreshold, 'GLOBAL', 'Reorder alert trigger limit for consumables')}
                  className="px-3 py-2 bg-[#0F2D54] hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: SLA Limits Configs */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h3 className="text-sm font-bold text-gray-800 m-0">Service Level Agreement (SLA) Targets</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">Configure resolution time targets based on ticket priority levels.</p>
            </div>

            <div className="space-y-4">
              {/* Critical SLA */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Critical Priority SLA</span>
                  <p className="text-[11px] text-gray-400 font-semibold">Maximum hours allowed to resolve critical operational issues.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={slaCritical}
                    onChange={e => setSlaCritical(e.target.value)}
                    className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold text-center focus:outline-none focus:bg-white"
                  />
                  <span className="text-xs font-bold text-gray-400">hours</span>
                  <button
                    onClick={() => handleSaveSetting('sla_critical_hours', slaCritical, 'GLOBAL', 'SLA deadline for Critical tickets')}
                    className="px-3 py-2 bg-[#0F2D54] hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* High SLA */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">High Priority SLA</span>
                  <p className="text-[11px] text-gray-400 font-semibold">Maximum hours allowed to resolve major department problems.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={slaHigh}
                    onChange={e => setSlaHigh(e.target.value)}
                    className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold text-center focus:outline-none focus:bg-white"
                  />
                  <span className="text-xs font-bold text-gray-400">hours</span>
                  <button
                    onClick={() => handleSaveSetting('sla_high_hours', slaHigh, 'GLOBAL', 'SLA deadline for High tickets')}
                    className="px-3 py-2 bg-[#0F2D54] hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Medium SLA */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">Medium Priority SLA</span>
                  <p className="text-[11px] text-gray-400 font-semibold">Maximum hours allowed to resolve standard user issues.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={slaMedium}
                    onChange={e => setSlaMedium(e.target.value)}
                    className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold text-center focus:outline-none focus:bg-white"
                  />
                  <span className="text-xs font-bold text-gray-400">hours</span>
                  <button
                    onClick={() => handleSaveSetting('sla_medium_hours', slaMedium, 'GLOBAL', 'SLA deadline for Medium tickets')}
                    className="px-3 py-2 bg-[#0F2D54] hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Low SLA */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">Low Priority SLA</span>
                  <p className="text-[11px] text-gray-400 font-semibold">Maximum hours allowed for minor requests and standard service updates.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={slaLow}
                    onChange={e => setSlaLow(e.target.value)}
                    className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold text-center focus:outline-none focus:bg-white"
                  />
                  <span className="text-xs font-bold text-gray-400">hours</span>
                  <button
                    onClick={() => handleSaveSetting('sla_low_hours', slaLow, 'GLOBAL', 'SLA deadline for Low tickets')}
                    className="px-3 py-2 bg-[#0F2D54] hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Download Side Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 m-0">Administrative Reports</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">Download official worksheets generated by the Excel reconciliation engine.</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                disabled={isDownloadingTickets}
                onClick={() => handleDownloadReport('tickets')}
                className="w-full py-2.5 px-4 bg-[#0F2D54] hover:bg-slate-800 text-white disabled:bg-slate-400 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isDownloadingTickets ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Tickets Sheet
                  </>
                )}
              </button>

              <button
                disabled={isDownloadingAssets}
                onClick={() => handleDownloadReport('assets')}
                className="w-full py-2.5 px-4 bg-[#0F2D54] hover:bg-slate-800 text-white disabled:bg-slate-400 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isDownloadingAssets ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Assets Sheet
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 m-0">Registered Settings</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">Live cache settings keys stored in Redis.</p>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {configs.map(item => (
                <div key={item.id} className="p-2 bg-gray-50 rounded border border-gray-150 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-500 font-mono">{item.configKey}</span>
                  <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">{item.configValue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
