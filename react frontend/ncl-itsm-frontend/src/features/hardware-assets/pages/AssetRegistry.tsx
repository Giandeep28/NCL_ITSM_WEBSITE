import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Databases for HAM & SAM
const initialHardwareAssets = [
  { id: '1', tag: 'HW-DESK-0012', category: 'Desktop', make: 'HP', model: 'EliteDesk 800', serial: 'SGH90210X', dept: 'Power Systems', status: 'Assigned', location: 'Bay 7, Sector Delta' },
  { id: '2', tag: 'HW-LAP-9014', category: 'Laptop', make: 'Dell', model: 'Latitude 5420', serial: 'CN088210Y', dept: 'Electrical Ops', status: 'Available', location: 'IT Center, Floor 2' },
  { id: '3', tag: 'HW-PRN-0481', category: 'Printer', make: 'Canon', model: 'LBP6030', serial: 'CAN994821Z', dept: 'Instrumentation', status: 'Maintenance', location: 'Boiler 4 Room' },
  { id: '4', tag: 'HW-PHN-2210', category: 'IPPhone', make: 'Cisco', model: '7841', serial: 'CIS221098W', dept: 'Automation Systems', status: 'Assigned', location: 'Main Assembly Line' },
  { id: '5', tag: 'HW-LAP-1029', category: 'Laptop', make: 'Lenovo', model: 'ThinkPad T14', serial: 'LNV402918P', dept: 'Power Systems', status: 'Assigned', location: 'Bay 3' }
];

const initialSoftwareLicenses = [
  { id: '1', product: 'Windows 11 Enterprise', vendor: 'Microsoft', type: 'Volume', seats: 500, allocated: 382, expiry: '2026-12-31', daysRemaining: 180 },
  { id: '2', product: 'Symantec Endpoint Protection', vendor: 'Broadcom', type: 'Subscription', seats: 200, allocated: 198, expiry: '2026-07-15', daysRemaining: 32 },
  { id: '3', product: 'Adobe Acrobat Pro', vendor: 'Adobe', type: 'OEM', seats: 50, allocated: 48, expiry: '2026-08-22', daysRemaining: 68 },
  { id: '4', product: 'SCADA HMI Suite', vendor: 'Siemens', type: 'Volume', seats: 15, allocated: 12, expiry: '2026-06-25', daysRemaining: 12 }
];

const initialConsumables = [
  { id: '1', code: 'MAT-9020', desc: 'HP LaserJet 85A Toner', qty: 42, reserved: 8, minLevel: 15 },
  { id: '2', code: 'MAT-1029', desc: 'CAT6 Ethernet Cable (10m)', qty: 8, reserved: 2, minLevel: 10 }, // Alert triggered!
  { id: '3', code: 'MAT-4481', desc: 'RJ45 Connectors Pack (100pcs)', qty: 3, reserved: 0, minLevel: 5 }, // Alert triggered!
  { id: '4', code: 'MAT-5029', desc: 'USB Optical Mouse', qty: 25, reserved: 5, minLevel: 10 }
];

export const AssetRegistry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hardware' | 'software' | 'expiry' | 'consumables' | 'import'>('hardware');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Excel reconciliation wizard state
  const [importStep, setImportStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [columnMappings, setColumnMappings] = useState({
    colA: 'Material Code',
    colB: 'Description',
    colC: 'Quantity Available',
    colD: 'Reorder Level'
  });

  // Reconciled Preview Table
  const reconciliationData = [
    { code: 'MAT-9020', desc: 'HP LaserJet 85A Toner', dbQty: 42, fileQty: 50, status: 'Match (Update +50)', badge: 'bg-green-50 text-green-700 border-green-150' },
    { code: 'MAT-1029', desc: 'CAT6 Ethernet Cable (10m)', dbQty: 8, fileQty: 8, status: 'Duplicate (Skipped)', badge: 'bg-amber-50 text-amber-700 border-amber-150' },
    { code: 'MAT-4481', desc: 'RJ45 Connectors Premium', dbQty: 3, fileQty: 20, status: 'Conflict: Overwrite Name', badge: 'bg-red-50 text-red-700 border-red-150' }
  ];

  // Filtering hardware assets
  const filteredHardware = initialHardwareAssets.filter(asset => {
    const matchesSearch = asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none m-0">Assets Control Center</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">Manage physical hardware registries, software allocations, licensing, and stock imports.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('import')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-indigo-600/10"
          >
            📂 Import Wizard
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-gray-200 gap-1.5 bg-white p-1 rounded-xl shadow-sm border">
        {(['hardware', 'software', 'expiry', 'consumables', 'import'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'import') setImportStep(1); // Reset wizard steps when opening
            }}
            className={`px-4.5 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab === 'expiry' ? 'License Expirations' : tab + ' Registry'}
          </button>
        ))}
      </div>

      {/* TAB CONTENT AREAS */}
      {activeTab === 'hardware' && (
        /* ========================================================================= */
        /* TAB 1: HARDWARE ASSETS                                                    */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Advanced Filter Sidebar */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider m-0">Filter Parameters</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search</label>
              <input
                type="text"
                placeholder="Asset tag or model..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="All">All Categories</option>
                <option value="Desktop">Desktop</option>
                <option value="Laptop">Laptop</option>
                <option value="Printer">Printer</option>
                <option value="IPPhone">IPPhone</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="All">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Asset List Table */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                    <th className="py-3 px-5">Asset Tag</th>
                    <th className="py-3 px-5">Model</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                  {filteredHardware.map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-400">
                        {asset.tag}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-800">
                        {asset.make} {asset.model}
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 font-medium">
                        {asset.dept}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          asset.status === 'Assigned' ? 'bg-green-50 text-green-700 border border-green-100' :
                          asset.status === 'Available' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 font-medium">
                        {asset.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'software' && (
        /* ========================================================================= */
        /* TAB 2: SOFTWARE LICENSES                                                  */
        /* ========================================================================= */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                  <th className="py-3 px-5">Product</th>
                  <th className="py-3 px-5">Vendor</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Seats (Allocated / Max)</th>
                  <th className="py-3 px-5">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {initialSoftwareLicenses.map(license => (
                  <tr key={license.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5 font-bold text-gray-800">
                      {license.product}
                    </td>
                    <td className="py-4 px-5 text-gray-500 font-medium">
                      {license.vendor}
                    </td>
                    <td className="py-4 px-5 text-gray-500 font-medium">
                      {license.type}
                    </td>
                    <td className="py-4 px-5 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-600">
                        <span>{license.allocated} / {license.seats} Seats</span>
                        <span>{Math.round((license.allocated / license.seats) * 100)}%</span>
                      </div>
                      <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${(license.allocated / license.seats) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        license.daysRemaining < 30 ? 'bg-red-50 text-red-700 border border-red-100' :
                        license.daysRemaining < 90 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {license.expiry} ({license.daysRemaining} days)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expiry' && (
        /* ========================================================================= */
        /* TAB 3: SOFTWARE EXPIRY DASHBOARD                                          */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Traffic Light Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Expiring (30 Days)</span>
                <h3 className="text-2xl font-black text-red-700 m-0 mt-1">1 License</h3>
              </div>
              <span className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-black">!</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Expiring (60 Days)</span>
                <h3 className="text-2xl font-black text-amber-700 m-0 mt-1">2 Licenses</h3>
              </div>
              <span className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-black">!</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Expiring (90 Days)</span>
                <h3 className="text-2xl font-black text-indigo-700 m-0 mt-1">3 Licenses</h3>
              </div>
              <span className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-black">✓</span>
            </div>
          </div>

          {/* Recharts Bar Chart & Warning Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Expiry Timeline (Days Remaining)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={initialSoftwareLicenses}
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                    <YAxis dataKey="product" type="category" stroke="#94a3b8" fontSize={8} fontWeight="bold" width={110} />
                    <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                    <Bar dataKey="daysRemaining" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Critical Alerts</h3>
                <div className="divide-y divide-gray-150 text-xs font-semibold text-gray-700">
                  {initialSoftwareLicenses.map(license => (
                    <div key={license.id} className="py-2.5 flex justify-between items-center">
                      <span className="truncate pr-2">{license.product}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        license.daysRemaining <= 15 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`}>{license.daysRemaining} Days</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'consumables' && (
        /* ========================================================================= */
        /* TAB 4: CONSUMABLES TRACKER                                                */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Low Stock Notification banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-amber-700">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 font-extrabold">!</span>
              <div>
                <h4 className="text-xs font-extrabold m-0">Low Stock Threshold Triggered</h4>
                <p className="text-[10px] font-bold text-amber-600 mt-0.5">Two consumable materials are currently below their safety inventory levels.</p>
              </div>
            </div>
          </div>

          {/* Consumables Inventory Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                    <th className="py-3 px-5">Material Code</th>
                    <th className="py-3 px-5">Description</th>
                    <th className="py-3 px-5">Inventory Status</th>
                    <th className="py-3 px-5">Available Stock</th>
                    <th className="py-3 px-5">Reorder Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                  {initialConsumables.map(item => {
                    const isLow = item.qty <= item.minLevel;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-5 font-bold text-gray-400">
                          {item.code}
                        </td>
                        <td className="py-4 px-5 font-bold text-gray-800">
                          {item.desc}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            isLow ? 'bg-red-500 text-white' : 'bg-green-50 text-green-700 border border-green-150'
                          }`}>{isLow ? 'Low Stock' : 'In Stock'}</span>
                        </td>
                        <td className="py-4 px-5 font-bold">
                          {item.qty} units <span className="text-[10px] text-gray-400 font-bold">({item.reserved} reserved)</span>
                        </td>
                        <td className="py-4 px-5 text-gray-500 font-bold">
                          {item.minLevel} units
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        /* ========================================================================= */
        /* TAB 5: EXCEL IMPORT RECONCILIATION WIZARD                                  */
        /* ========================================================================= */
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-150 pb-3">
            <h3 className="text-base font-extrabold text-gray-800 m-0">Bulk Data Reconciliation Wizard</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Follow the three steps to upload, map, and synchronize external Excel assets databases.</p>
          </div>

          {/* Stepper Header */}
          <div className="flex justify-between items-center max-w-xl mx-auto border-b border-gray-150 pb-4">
            {['Upload File', 'Map Columns', 'Review Results'].map((step, idx) => {
              const stepNum = idx + 1;
              const active = importStep === stepNum;
              const done = importStep > stepNum;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    active ? 'bg-indigo-600 border-indigo-600 text-white' :
                    done ? 'bg-green-600 border-green-600 text-white' :
                    'border-gray-200 text-gray-400'
                  }`}>
                    {done ? '✓' : stepNum}
                  </div>
                  <span className={`text-[10px] font-bold ${active || done ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STEP CONTENT */}
          {importStep === 1 && (
            <div className="space-y-4 flex flex-col items-center">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 w-full max-w-md flex flex-col items-center justify-center gap-3 bg-gray-50/50">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">Choose Excel / CSV File</span>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">or drag and drop it here</p>
                </div>
              </div>

              {uploadedFile ? (
                <div className="bg-indigo-50 border border-indigo-150 p-2.5 rounded-lg text-xs font-bold text-indigo-700 flex justify-between w-full max-w-md">
                  <span>📂 {uploadedFile}</span>
                  <button onClick={() => setUploadedFile(null)} className="text-red-500 cursor-pointer">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setUploadedFile('Consumables_Reconcile_Q2.xlsx')}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Simulate Select File: Consumables_Reconcile_Q2.xlsx
                </button>
              )}

              <button
                disabled={!uploadedFile}
                onClick={() => setImportStep(2)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Next: Map Columns →
              </button>
            </div>
          )}

          {importStep === 2 && (
            <div className="space-y-4 max-w-md mx-auto">
              <h4 className="text-xs font-extrabold text-gray-800 block uppercase tracking-wider mb-2">Configure Column Headers Map</h4>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-500">Column A (Primary Key)</span>
                  <select
                    value={columnMappings.colA}
                    onChange={e => setColumnMappings(prev => ({ ...prev, colA: e.target.value }))}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                  >
                    <option>Material Code</option>
                    <option>Description</option>
                    <option>Quantity</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-500">Column B</span>
                  <select
                    value={columnMappings.colB}
                    onChange={e => setColumnMappings(prev => ({ ...prev, colB: e.target.value }))}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                  >
                    <option>Description</option>
                    <option>Material Code</option>
                    <option>Quantity</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-500">Column C</span>
                  <select
                    value={columnMappings.colC}
                    onChange={e => setColumnMappings(prev => ({ ...prev, colC: e.target.value }))}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                  >
                    <option>Quantity Available</option>
                    <option>Description</option>
                    <option>Material Code</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setImportStep(1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setImportStep(3)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  Next: Review Results →
                </button>
              </div>
            </div>
          )}

          {importStep === 3 && (
            <div className="space-y-5">
              <h4 className="text-xs font-extrabold text-gray-800 block uppercase tracking-wider mb-2">Reconciliation Conflict Resolution</h4>
              
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                      <th className="py-2.5 px-4">Material</th>
                      <th className="py-2.5 px-4">Current Qty</th>
                      <th className="py-2.5 px-4">Import Qty</th>
                      <th className="py-2.5 px-4">Resolution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                    {reconciliationData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4 flex flex-col">
                          <span className="font-extrabold text-gray-800">{row.desc}</span>
                          <span className="text-[9px] text-gray-400 font-bold">{row.code}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-bold">{row.dbQty} units</td>
                        <td className="py-3 px-4 text-gray-800 font-bold">{row.fileQty} units</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${row.badge}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setImportStep(2)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Reconciliation Approved & Synced with Database!');
                    setActiveTab('consumables');
                  }}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
                >
                  Approve Reconciliation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AssetRegistry;
