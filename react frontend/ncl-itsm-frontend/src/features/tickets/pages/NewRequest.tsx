import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore, type Ticket } from '../../../store/ticketStore';

type FormStyle = 'ess' | 'industrial';

export const NewRequest: React.FC = () => {
  const navigate = useNavigate();
  const { addTicket } = useTicketStore();

  // Toggle layout style
  const [formStyle, setFormStyle] = useState<FormStyle>('industrial');

  // Img 1 Form State
  const [essForm, setEssForm] = useState({
    issuedDepartment: '',
    issuedByDepartment: '',
    category: '',
    subCategory: '',
    shortDescription: '',
    employeeName: '',
    employeeId: '',
    employeePost: '',
    description: '',
  });

  // Img 2 Form State
  const [indForm, setIndForm] = useState({
    department: 'Manufacturing Operations',
    category: 'Electrical Failure',
    priority: 'Medium' as Ticket['priority'],
    assetSerialNumber: '',
    location: '',
    description: '',
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files || [])]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formStyle === 'ess') {
      if (!essForm.category || !essForm.shortDescription || !essForm.employeeName || !essForm.employeeId) {
        alert('Please fill out the required fields marked with *');
        return;
      }
      addTicket({
        title: essForm.shortDescription,
        category: essForm.category,
        subCategory: essForm.subCategory,
        status: 'Requested',
        priority: 'Medium',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        description: essForm.description || 'No detailed description provided.',
        department: essForm.issuedDepartment || 'General',
        issuedByDept: essForm.issuedByDepartment,
        reporterName: essForm.employeeName,
        reporterId: essForm.employeeId,
        reporterPost: essForm.employeePost,
        attachments: attachments.map(f => f.name),
      });
    } else {
      if (!indForm.assetSerialNumber || !indForm.location || !indForm.description) {
        alert('Please fill out the asset details and issue description.');
        return;
      }
      addTicket({
        title: `${indForm.category} - ${indForm.location}`,
        category: indForm.category,
        status: 'Requested',
        priority: indForm.priority,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        description: indForm.description,
        serialNumber: indForm.assetSerialNumber,
        location: indForm.location,
        department: indForm.department,
        reporterName: 'Marcus Thorne',
        reporterId: 'EMP-0291',
        attachments: attachments.map(f => f.name),
      });
    }

    alert('Service Request Submitted Successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* Form Style Switcher */}
      <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-xl flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold text-indigo-700 pl-3">Portal Layout Style:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFormStyle('ess')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              formStyle === 'ess'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-600 hover:bg-indigo-100/50'
            }`}
          >
            Employee Request (Img 1)
          </button>
          <button
            onClick={() => setFormStyle('industrial')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              formStyle === 'industrial'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-600 hover:bg-indigo-100/50'
            }`}
          >
            Industrial Request (Img 2)
          </button>
        </div>
      </div>

      {formStyle === 'ess' ? (
        /* ========================================================================= */
        /* PORTAL STYLE 1: EMPLOYEE REQUEST PORTAL                                   */
        /* ========================================================================= */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight m-0">New Request</h2>
              <p className="text-xs text-gray-400 font-medium mt-1">Please fill out the details below to submit your request.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1 shadow-sm cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4" />
                </svg>
                Full Screen
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="px-3 py-1.5 bg-gray-800 text-xs font-bold text-white rounded-lg hover:bg-gray-900 flex items-center gap-1.5 shadow-sm cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>

          {/* Request Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Issued Department *</label>
                <select
                  value={essForm.issuedDepartment}
                  onChange={e => setEssForm(prev => ({ ...prev, issuedDepartment: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Department</option>
                  <option value="Power Systems">Power Systems</option>
                  <option value="Electrical Operations">Electrical Operations</option>
                  <option value="Instrumentation">Instrumentation</option>
                  <option value="Automation Systems">Automation Systems</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Issued by Department *</label>
                <select
                  value={essForm.issuedByDepartment}
                  onChange={e => setEssForm(prev => ({ ...prev, issuedByDepartment: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Department</option>
                  <option value="Power Generation">Power Generation</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Operations Quality">Operations Quality</option>
                  <option value="Plant Safety">Plant Safety</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category *</label>
                <select
                  value={essForm.category}
                  onChange={e => setEssForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Category</option>
                  <option value="Turbine Maintenance">Turbine Maintenance</option>
                  <option value="Grid Calibration">Grid Calibration</option>
                  <option value="Sensor Replacement">Sensor Replacement</option>
                  <option value="PLC Update">PLC Update</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sub Category *</label>
                <select
                  value={essForm.subCategory}
                  onChange={e => setEssForm(prev => ({ ...prev, subCategory: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Sub Category</option>
                  <option value="Mechanical Calibration">Mechanical Calibration</option>
                  <option value="Electrical Routing">Electrical Routing</option>
                  <option value="Thermal Testing">Thermal Testing</option>
                  <option value="Firmware Patch">Firmware Patch</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Short Description *</label>
              <input
                type="text"
                placeholder="A brief summary of your request"
                value={essForm.shortDescription}
                onChange={e => setEssForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Employee Information Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0">Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Name *</label>
                <input
                  type="text"
                  placeholder="e.g. J. Henderson"
                  value={essForm.employeeName}
                  onChange={e => setEssForm(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee ID *</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-4091"
                  value={essForm.employeeId}
                  onChange={e => setEssForm(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Post *</label>
                <input
                  type="text"
                  placeholder="e.g. Operations Lead"
                  value={essForm.employeePost}
                  onChange={e => setEssForm(prev => ({ ...prev, employeePost: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Description & Attachments Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0">Description &amp; Attachments</h3>
            
            {/* Rich Text Editor Mockup */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
                {/* Editor Toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap text-gray-500">
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  <button type="button" className="px-2 py-0.5 hover:bg-gray-200 rounded text-sm font-bold text-gray-700 hover:text-gray-900">B</button>
                  <button type="button" className="px-2 py-0.5 hover:bg-gray-200 rounded text-sm italic font-serif text-gray-700 hover:text-gray-900">I</button>
                  <button type="button" className="px-2 py-0.5 hover:bg-gray-200 rounded text-sm underline text-gray-700 hover:text-gray-900">U</button>
                  <button type="button" className="px-2 py-0.5 hover:bg-gray-200 rounded text-sm line-through text-gray-700 hover:text-gray-900">abc</button>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  <select className="bg-transparent text-[11px] font-semibold text-gray-600 focus:outline-none border-none pr-2 cursor-pointer"><option>Format</option><option>Paragraph</option><option>Heading 1</option><option>Heading 2</option></select>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button>
                </div>
                {/* Editor Textarea */}
                <textarea
                  placeholder="Enter detailed description here..."
                  rows={6}
                  value={essForm.description}
                  onChange={e => setEssForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 border-none text-xs text-gray-700 font-semibold focus:outline-none resize-none bg-white"
                ></textarea>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Attachments</label>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors ${
                  isDragOver ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 bg-white hover:border-indigo-400'
                }`}
              >
                <input
                  type="file"
                  id="ess-files"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="ess-files" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Select files to upload</span>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">or drag and drop files here</p>
                  </div>
                </label>
              </div>
              <span className="text-[9px] text-gray-400 font-semibold block pt-1 leading-none">
                ℹ Allowed extensions: *.jpg, *.jpeg, *.png, *.pdf, *.docx, *.xlsx, *.xls, *.csv (Max size: 5MB)
              </span>

              {/* Render Selected Attachments */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Selected Files:</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-bold text-gray-700">
                        <span className="truncate pr-2">{file.name}</span>
                        <button type="button" onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700 font-bold cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm cursor-pointer"
            >
              ✕ Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              📤 Submit Request
            </button>
          </div>
        </form>
      ) : (
        /* ========================================================================= */
        /* PORTAL STYLE 2: INDUSTRIAL SERVICE PORTAL                                 */
        /* ========================================================================= */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight m-0">Create New Service Request</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Fill in the details below to initiate a technical support or maintenance ticket.</p>
          </div>

          {/* Request Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                </svg>
              </span>
              Request Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Department</label>
                <select
                  value={indForm.department}
                  onChange={e => setIndForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="Manufacturing Operations">Manufacturing Operations</option>
                  <option value="Power Systems">Power Systems</option>
                  <option value="Electrical Operations">Electrical Operations</option>
                  <option value="Instrumentation">Instrumentation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select
                  value={indForm.category}
                  onChange={e => setIndForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="Electrical Failure">Electrical Failure</option>
                  <option value="Turbine Maintenance">Turbine Maintenance</option>
                  <option value="Grid Calibration">Grid Calibration</option>
                  <option value="Sensor Replacement">Sensor Replacement</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Priority</label>
                <div className="flex gap-1 bg-gray-50 p-1 border border-gray-200 rounded-lg">
                  {(['Low', 'Medium', 'Critical'] as Ticket['priority'][]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setIndForm(prev => ({ ...prev, priority: p }))}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer ${
                        indForm.priority === p
                          ? p === 'Critical'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Equipment & Location Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </span>
              Equipment &amp; Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Asset Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. SN-492-BX-2024"
                  value={indForm.assetSerialNumber}
                  onChange={e => setIndForm(prev => ({ ...prev, assetSerialNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
                <span className="text-[9px] text-gray-400 font-bold block leading-none">
                  * Scan the QR code on the machine for auto-fill
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Plant Location / Zone</label>
                <input
                  type="text"
                  placeholder="e.g. North Wing, Assembly Line 4"
                  value={indForm.location}
                  onChange={e => setIndForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Description & Attachments Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
              Description &amp; Attachments
            </h3>

            {/* Issue Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Issue Description</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
                <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap text-gray-500">
                  <button type="button" className="px-2 py-0.5 hover:bg-gray-200 rounded text-sm font-bold text-gray-700">B</button>
                  <button type="button" className="px-2 py-0.5 hover:bg-gray-200 rounded text-sm italic font-serif text-gray-700">I</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></button>
                </div>
                <textarea
                  placeholder="Provide a detailed explanation of the service required..."
                  rows={6}
                  value={indForm.description}
                  onChange={e => setIndForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 border-none text-xs text-gray-700 font-semibold focus:outline-none resize-none bg-white"
                ></textarea>
              </div>
            </div>

            {/* Drag & Drop Supporting Media */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Upload Supporting Media</label>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors ${
                  isDragOver ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 bg-white hover:border-indigo-400'
                }`}
              >
                <input
                  type="file"
                  id="ind-files"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="ind-files" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-700 m-0">Drag and drop files here</p>
                    <span className="text-[10px] text-gray-400 font-bold mt-1">or <span className="text-indigo-600 hover:text-indigo-800">click to browse</span> from local storage</span>
                  </div>
                </label>
              </div>
              <div className="flex justify-between items-center pt-1 text-[9px] text-gray-400 font-semibold leading-none">
                <span>Supported formats: JPG, PNG, PDF, MP4 (Max 50MB)</span>
                <span className="text-gray-400">⏱ Draft auto-saved 2 mins ago</span>
              </div>

              {/* Render Selected Attachments */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Selected Files:</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-bold text-gray-700">
                        <span className="truncate pr-2">{file.name}</span>
                        <button type="button" onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700 font-bold cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Submit Request
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
