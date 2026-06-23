import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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
    id: 'service-request-flow',
    title: 'Service Request Lifecycle & Process Flow',
    category: 'IT Operations',
    tags: ['service request', 'ticketing', 'process flow', 'SOP'],
    summary: 'A visual interactive flowchart illustrating the complete lifecycle of a service request from submission to closure.',
    content: `## How to Raise a Service Request
To request IT support, hardware maintenance, or software assistance, employees initiate a service request through the portal.

## Step-by-Step Process Flow
1. **Initiate Request (Employee):** Navigate to the 'Create New Service Request' form. Enter your name, ID, and select the appropriate Department, Sub-department, Category, and Sub-category. Add a clear description of the issue and optional file attachments.
2. **Triaging & Assignment (IT Coordinator):** Once submitted, the ticket is registered in the database under the 'Requested' status. An IT Coordinator or Admin reviews the request details and assigns it to a qualified Support Engineer.
3. **Execution & Troubleshooting (Support Engineer):** The assigned Support Engineer claims the ticket, updates the status to 'In Progress', and starts troubleshooting. They can post public updates or internal comments to communicate progress.
4. **Resolution (Support Engineer):** Once the fix is verified (e.g., hardware repaired, software installed), the engineer enters resolution notes and marks the ticket as 'Resolved'.
5. **Closure (Employee):** The employee is notified of the resolution. After confirming the issue is fixed, the ticket is transitioned to 'Closed'.`,
    readTime: '3 min',
    lastUpdated: 'June 22, 2026'
  },
  {
    id: 'password-reset-guide',
    title: 'Portal Password Reset Guide',
    category: 'IT Operations',
    tags: ['password', 'authentication', 'self-service'],
    summary: 'Instructions on securely resetting your workstation/portal password using mobile OTP verification.',
    content: `## Workstation Password Recovery
For security compliance, passwords should be kept secure. If you forget your portal credentials, follow this guide to perform a self-service reset.

## Recovery Procedure
1. Click the **Forgot Password** link on the login window.
2. Enter your registered **Employee ID** and primary mobile number.
3. Check your mobile device for a one-time passcode (OTP).
4. Enter the received OTP in the verification screen.
5. Create a new compliant password (minimum 8 characters, containing uppercase, lowercase, numeric, and special characters).`,
    readTime: '2 min',
    lastUpdated: 'June 18, 2026'
  },
  {
    id: 'workstation-troubleshoot-sop',
    title: 'Basic Workstation Troubleshooting SOP',
    category: 'Hardware Maintenance',
    tags: ['workstation', 'troubleshoot', 'peripherals', 'sop'],
    summary: 'Initial steps to perform before reporting local hardware peripheral issues to the helpdesk.',
    content: `## Standard Workstation Checkup
Standard Operating Procedure for handling local peripheral failures (e.g., Monitor blank, keyboard/mouse unresponsive, printer offline).

## Basic Checks
1. **Physical Connections:** Confirm all USB, display, and power cables are firmly plugged into both the workstation and the UPS.
2. **Power Cycle:** Shut down the computer completely, toggle the power switch at the outlet, wait 10 seconds, and reboot.
3. **Driver/State Reset:** Unplug and replug the peripheral device to prompt the OS to reload drivers.
4. **Log Request:** If the device still does not work, record the asset barcode/serial number and open a ticket under Category: Hardware.`,
    readTime: '4 min',
    lastUpdated: 'June 20, 2026'
  }
];

const CATEGORIES = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

const ServiceRequestFlowChart: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      number: 1,
      title: 'Raise Request',
      actor: 'Employee / User',
      status: 'Requested',
      desc: 'Employee completes and submits the service request form specifying Department, Category, Sub-category, and details.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      number: 2,
      title: 'Triage & Assign',
      actor: 'IT Coordinator',
      status: 'Open / Assigned',
      desc: 'The coordinator reviews request specifications and assigns it to a Support Engineer.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      number: 3,
      title: 'Work in Progress',
      actor: 'Support Engineer',
      status: 'In Progress',
      desc: 'The engineer investigates, changes status to "In Progress", updates logs, and troubleshoots.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    {
      number: 4,
      title: 'Resolve Ticket',
      actor: 'Support Engineer',
      status: 'Resolved',
      desc: 'The engineer logs resolution parameters and marks the ticket as Resolved.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      number: 5,
      title: 'Verify & Close',
      actor: 'Employee / User',
      status: 'Closed',
      desc: 'The employee verifies the solution, closing the ticket permanently.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
      badge: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ];

  return (
    <div className="space-y-5 bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm mb-6">
      <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider m-0">Interactive Process Flowchart</h3>
        <span className="text-[10px] text-gray-400 font-bold">Click steps to see details</span>
      </div>

      {/* Horizontal Flow for Desktop */}
      <div className="hidden md:flex items-center justify-between relative py-4 px-2">
        {/* Background connector line */}
        <div className="absolute left-10 right-10 top-10 h-0.5 bg-gray-200 z-0"></div>

        {steps.map((s, idx) => (
          <button
            key={s.number}
            type="button"
            onClick={() => setActiveStep(idx)}
            className="relative z-10 flex flex-col items-center focus:outline-none cursor-pointer group shrink-0 w-24"
          >
            {/* Step circle */}
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
              activeStep === idx
                ? 'border-indigo-600 bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110'
                : 'border-gray-200 bg-white text-gray-400 group-hover:border-indigo-400 group-hover:text-indigo-500 group-hover:scale-105'
            }`}>
              {s.icon}
            </div>

            {/* Label info */}
            <div className="mt-2 text-center">
              <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wide">Step {s.number}</span>
              <h4 className="text-[10px] font-black text-gray-800 m-0 leading-tight mt-0.5">{s.title}</h4>
              <p className="text-[8px] text-gray-500 font-semibold m-0">{s.actor}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Vertical List for Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {steps.map((s, idx) => (
          <button
            key={s.number}
            type="button"
            onClick={() => setActiveStep(idx)}
            className={`w-full flex items-start gap-3 p-3 bg-white border rounded-xl text-left focus:outline-none transition-all cursor-pointer ${
              activeStep === idx ? 'border-indigo-500 shadow-sm' : 'border-gray-150 hover:border-indigo-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
              activeStep === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              {s.icon}
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider">Step {s.number} — {s.actor}</span>
              <h4 className="text-[11px] font-black text-gray-800 m-0">{s.title}</h4>
              <p className="text-[10px] text-gray-500 font-medium m-0 leading-normal line-clamp-1">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Active Step Details Panel */}
      <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-2.5 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">
              {steps[activeStep].number}
            </span>
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
              {steps[activeStep].title}
            </span>
          </div>
          <span className={`px-2 py-0.5 border text-[9px] font-extrabold rounded-full ${steps[activeStep].badge}`}>
            Status: {steps[activeStep].status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="space-y-1">
            <p className="text-[9px] text-gray-400 font-bold uppercase m-0 leading-none">Responsible Role</p>
            <p className="text-[11px] text-gray-700 font-extrabold m-0 mt-1">{steps[activeStep].actor}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] text-gray-400 font-bold uppercase m-0 leading-none">Operation Details</p>
            <p className="text-[11px] text-gray-600 font-semibold leading-relaxed m-0 mt-1">{steps[activeStep].desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KnowledgeBase: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const articleParam = searchParams.get('article');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (articleParam) {
      const art = ARTICLES.find((a) => a.id === articleParam);
      if (art) {
        setSelectedArticle(art);
        setSelectedCategory('All');
      }
    }
  }, [articleParam]);

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setSearchParams({ article: article.id });
  };

  const handleCopyLink = () => {
    if (!selectedArticle) return;
    const url = `${window.location.origin}${window.location.pathname}?article=${selectedArticle.id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handlePrint = () => {
    window.print();
  };

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
    'Hardware Maintenance': 'bg-pink-100 text-pink-700 border-pink-200',
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
                onClick={() => handleSelectArticle(article)}
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4 print-article-content">
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

              {selectedArticle.id === 'service-request-flow' && (
                <ServiceRequestFlowChart />
              )}

              <div className="space-y-1">{renderContent(selectedArticle.content)}</div>

              <style>{`
                @media print {
                  /* Hide everything on page */
                  body * {
                    visibility: hidden !important;
                  }
                  /* Make only the print article content and its children visible */
                  .print-article-content, .print-article-content * {
                    visibility: visible !important;
                  }
                  /* Position print container at top left */
                  .print-article-content {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                  }
                  /* Hide layout headers and print buttons */
                  .no-print {
                    display: none !important;
                  }
                }
              `}</style>

              <div className="flex gap-2 pt-4 border-t border-gray-100 no-print">
                <button 
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / Export PDF
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742a3 3 0 00-2.204 3.071V18m0 0a3 3 0 003 3h3.586a3 3 0 003-3v-4.258m-6.586 2.258A5.003 5.003 0 0014 6H8.684a3 3 0 00-2.204 3.071l.002.329z" />
                      </svg>
                      Copy Link
                    </>
                  )}
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
