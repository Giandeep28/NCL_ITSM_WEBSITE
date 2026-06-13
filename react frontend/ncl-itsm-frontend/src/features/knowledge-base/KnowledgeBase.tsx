import React, { useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
  readTime: string;
  lastUpdated: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Turbine Vibration Calibration Protocol',
    category: 'Turbine Maintenance',
    tags: ['vibration', 'calibration', 'turbine', 'mechanical'],
    summary: 'Step-by-step guide to diagnosing and recalibrating abnormal turbine vibration levels exceeding safety thresholds.',
    content: `## Overview\nAbnormal vibration levels (>4.0 mm/s) on turbine units indicate potential coupling or bearing issues. Immediate diagnostic is required.\n\n## Procedure\n1. **Safety Lockout**: Initiate lockout-tagout (LOTO) on turbine breaker panel before any inspection.\n2. **Initial Inspection**: Check secondary coupling assembly for visible wear. Look for lubricant leaks and gasket condition.\n3. **Sensor Verification**: Validate vibration sensor (TX series) calibration against reference. Replace if deviation exceeds ±0.3 mm/s.\n4. **Bearing Check**: Inspect bearing clearances using feeler gauges. Standard clearance: 0.03–0.06 mm.\n5. **Recalibration**: Using calibration rig, slowly bring turbine to operational speed. Target: ≤2.5 mm/s at full load.\n6. **Sign-off**: Close service request only after 2-hour stable operation log.\n\n## Parts Reference\n- Coupler Kit B-90 (Standard)\n- Vibration Sensor TX-99012 series\n- Gasket Set TG-4400`,
    readTime: '8 min',
    lastUpdated: 'Nov 2024',
  },
  {
    id: '2',
    title: 'PLC Firmware Upload Protocol (Safe Mode)',
    category: 'PLC Update',
    tags: ['PLC', 'firmware', 'automation', 'conveyor', 'programming'],
    summary: 'Procedures for uploading new PLC firmware during scheduled downtime. Covers backup, verification, and rollback steps.',
    content: `## Pre-requisites\n- Obtain Change Control Number from IT\n- Ensure 2-hour maintenance window is scheduled\n- Backup existing PLC project to shared drive: \\\\NCL-NAS\\\\PLC-Backups\\\\\n\n## Upload Steps\n1. Connect RS232/Ethernet cable to PLC programming port.\n2. Launch STEP 7 or TIA Portal (v17+).\n3. Load new firmware project file (*.ap17).\n4. Compare online/offline blocks — ensure no unexpected differences.\n5. Download project with **Stop PLC before download** option checked.\n6. Restart PLC in RUN mode.\n7. Validate I/O mapping on HMI panel.\n\n## Rollback Procedure\nIf conveyor does not initialize within 60 seconds:\n1. Immediately halt PLC.\n2. Load backup project from NAS.\n3. Re-download.\n4. Raise Severity 1 ticket tagging "PLC Failure" category.`,
    readTime: '12 min',
    lastUpdated: 'Oct 2024',
  },
  {
    id: '3',
    title: 'Substation Grid Phase Calibration',
    category: 'Grid Calibration',
    tags: ['grid', 'substation', 'phase', 'electrical', 'feeder'],
    summary: 'Instructions for identifying and correcting phase mismatch on distribution feeder lines at NCL substations.',
    content: `## Background\nPhase mismatch on feeder lines can cause asymmetric loading and equipment damage. Only qualified grid engineers may perform calibration.\n\n## Diagnosis\n1. Using a Power Quality Analyzer, record phase voltages and angles at the affected substation.\n2. Expected values: 415V ±5%, phase angle 120° ±2° between phases.\n3. If mismatch >3°: escalate to Senior Grid Engineer.\n\n## Correction Steps\n1. Issue Substation Work Permit.\n2. Isolate affected feeder using motorized disconnector.\n3. Adjust tap changer position on distribution transformer (one tap = 2.5% voltage).\n4. Reconnect feeder and verify on PQA.\n5. Log all tap settings in Substation Log Book.\n\n## Safety Note\nNever attempt phase correction without energized line clearance from Control Room (Phone: 4029).`,
    readTime: '10 min',
    lastUpdated: 'Sep 2024',
  },
  {
    id: '4',
    title: 'Temperature Sensor Replacement (Boiler Series)',
    category: 'Sensor Replacement',
    tags: ['sensor', 'thermocouple', 'boiler', 'temperature'],
    summary: 'Guide for replacing faulty thermocouple sensors in NCL boiler units, including wiring and calibration steps.',
    content: `## Parts Required\n- Thermocouple: Type K, 6mm probe, M12 connector (NCL Part: TC-K6M12)\n- Terminal block screwdriver\n- HART Communicator or calibrator\n\n## Replacement Procedure\n1. Lower boiler load to <20% before sensor work.\n2. Disconnect terminal block leads (document wire colors).\n3. Remove sensor from thermowell using 22mm spanner.\n4. Insert new sensor — torque to 25 Nm.\n5. Reconnect terminals per documentation.\n6. Zero calibration using HART Communicator: set at 0°C (ice bath reference).\n7. Span calibration: set at 100°C (boiling water or reference oven).\n8. Verify reading on DCS screen matches reference within ±1°C.`,
    readTime: '7 min',
    lastUpdated: 'Oct 2024',
  },
  {
    id: '5',
    title: 'IT Hardware Asset Intake & Tagging SOP',
    category: 'IT Operations',
    tags: ['hardware', 'asset', 'inventory', 'tagging', 'onboarding'],
    summary: 'Standard procedure for receiving, registering, and tagging new hardware assets in the NCL IT inventory system.',
    content: `## Intake Checklist\n- [ ] Inspect packaging for damage\n- [ ] Verify model and serial number against purchase order\n- [ ] Photograph asset front and back\n- [ ] Apply NCL Asset Tag (format: HW-[TYPE]-[XXXX])\n\n## ITSM Registration Steps\n1. Navigate to Assets > Hardware Registry > Add Asset.\n2. Fill: Category, Make, Model, Serial Number, Department, Location.\n3. Set Status to "Procured".\n4. Attach photos to asset record.\n5. Update procurement date.\n\n## Assignment\n- To assign to a user: change Status to "Assigned" and fill Assigned User field.\n- Notify user via email: use template "Asset Assignment Notification".\n\n## Retirement\n- For assets >5 years or irrepairable: change Status to "Retired".\n- Move to Disposal Queue and notify Finance for write-off.`,
    readTime: '9 min',
    lastUpdated: 'Nov 2024',
  },
  {
    id: '6',
    title: 'Software License Renewal Workflow',
    category: 'IT Operations',
    tags: ['software', 'license', 'renewal', 'SAM', 'Microsoft'],
    summary: 'Process for tracking expiring software licenses and initiating renewal through the procurement channel.',
    content: `## Monitoring\nThe ITSM system sends automated alerts for licenses expiring within:\n- 90 days: Informational email to IT Admin\n- 30 days: Escalation email to IT Head\n- 15 days: Critical alert on dashboard with SLA tracking\n\n## Renewal Process\n1. Identify expiring license in ITSM Assets > Software Registry > Expiry Dashboard.\n2. Raise Procurement Request (PR) in SAP with the license details.\n3. Attach vendor quote to PR.\n4. On approval, upload new license key to ITSM (hashed storage — never plain text).\n5. Update Expiry Date in software record.\n\n## Volume License Management\n- Microsoft: Managed via Open Value Agreement (OVA). Contact: software@ncl.gov.in\n- Siemens SCADA: Requires on-site vendor engineer for activation. SLA: 5 business days.`,
    readTime: '6 min',
    lastUpdated: 'Oct 2024',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

export const KnowledgeBase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = ARTICLES.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q));
    const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categoryColors: Record<string, string> = {
    'Turbine Maintenance': 'bg-blue-100 text-blue-700 border-blue-200',
    'PLC Update': 'bg-purple-100 text-purple-700 border-purple-200',
    'Grid Calibration': 'bg-amber-100 text-amber-700 border-amber-200',
    'Sensor Replacement': 'bg-teal-100 text-teal-700 border-teal-200',
    'IT Operations': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  // Render article content as simple markdown (basic)
  const renderContent = (md: string) =>
    md.split('\n').map((line, i) => {
      if (line.startsWith('## '))
        return (
          <h3 key={i} className="text-sm font-extrabold text-gray-800 mt-5 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
      if (line.startsWith('- **'))
        return (
          <li key={i} className="text-xs text-gray-600 font-semibold leading-relaxed ml-4 mt-1">
            {line.replace(/- \*\*(.*?)\*\*/g, (_m, g) => `${g}: `).replace(/\*\*(.*?)\*\*/g, '$1')}
          </li>
        );
      if (line.startsWith('- [ ]') || line.startsWith('- '))
        return (
          <li key={i} className="text-xs text-gray-600 font-medium leading-relaxed ml-4 mt-1 list-disc">
            {line.replace(/^- \[ \] /, '☐ ').replace(/^- /, '')}
          </li>
        );
      if (line.match(/^\d+\./))
        return (
          <li key={i} className="text-xs text-gray-600 font-medium leading-relaxed ml-4 mt-1 list-decimal">
            {line.replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '$1')}
          </li>
        );
      if (line.trim() === '') return <div key={i} className="mt-2" />;
      return (
        <p key={i} className="text-xs text-gray-600 font-medium leading-relaxed">
          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        </p>
      );
    });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none m-0">
          Service Knowledge Base
        </h2>
        <p className="text-xs text-gray-400 font-medium mt-1">
          Search technical documentation, SOPs, and field guides for NCL operations.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search articles, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-indigo-500 shadow-sm transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <p className="text-sm font-bold text-gray-400">No articles found</p>
              <p className="text-xs text-gray-300 mt-1">Try a different search query</p>
            </div>
          ) : (
            filtered.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`w-full text-left bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedArticle?.id === article.id
                    ? 'border-indigo-400 ring-1 ring-indigo-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      categoryColors[article.category] || 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {article.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-xs font-extrabold text-gray-800 leading-snug mb-1">
                  {article.title}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed line-clamp-2">
                  {article.summary}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Article Reader */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      categoryColors[selectedArticle.category] || ''
                    }`}
                  >
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-900 mt-2 leading-snug">
                    {selectedArticle.title}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {selectedArticle.summary}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-[10px] text-gray-400 font-bold border-b border-gray-100 pb-3">
                <span>🕐 {selectedArticle.readTime} read</span>
                <span>📅 Updated {selectedArticle.lastUpdated}</span>
                <span>
                  🏷{' '}
                  {selectedArticle.tags.map((t) => `#${t}`).join(', ')}
                </span>
              </div>

              <div className="space-y-1">{renderContent(selectedArticle.content)}</div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                  Print / Export PDF
                </button>
                <button className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                  Copy Link
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-600">Select an article to read</p>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Choose from {ARTICLES.length} technical guides and SOPs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
