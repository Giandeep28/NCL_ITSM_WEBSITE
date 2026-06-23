import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '../../../store/ticketStore';
import { apiClient } from '../../../services/apiClient';

const ISSUED_BY_DEPARTMENTS: string[] = [
  'CD',
  'Civil',
  'CP',
  'E&M',
  'Excavation',
  'Finance',
  'HR',
  'Mining',
  'MM',
  'Medical',
  'Survey',
  'System',
  'L&R',
  'E&T',
  'Environment',
  'M&S'
];

const SUB_DEPARTMENTS_MAP: Record<string, string[]> = {
  'Civil': ['Colony Civil Maintenance'],
  'E&M': [
    'Colony E&M Maintenance',
    'E&M Field',
    'Light Vhicle',
    'CHP',
    'Substation',
    'Crane Section',
    'E&M Pump'
  ],
  'Excavation': [
    'Dumper Workshop',
    'Dozer Workshop',
    'Shovel Workshop',
    'Dragline Workshop'
  ],
  'Finance': ['AHQ'],
  'HR': [
    'Manpower',
    'CMPF',
    'Welfare',
    'Establishment',
    'Security'
  ],
  'Mining': [
    'Weigh Bridge',
    'Production',
    'Drilling Blasting',
    'Time office',
    'VTC',
    'Fire Fighting',
    'HOE'
  ],
  'MM': ['Reginal Store / Area Purchase cell']
};

const CATEGORIES: string[] = ['Software', 'Hardware', 'Other'];

const SUB_CATEGORIES_MAP: Record<string, string[]> = {
  'Software': [
    'Normal Application',
    'Web Application'
  ],
  'Hardware': [
    'Desktop Workstation',
    'Monitor',
    'Printer',
    'Scanner',
    'UPS',
    'Keyboard',
    'Mouse',
    'Keyboard and Mouse',
    'Printer and Scanner'
  ],
  'Other': [
    'Others'
  ]
};

export const NewRequest: React.FC = () => {
  const navigate = useNavigate();
  const { addTicket } = useTicketStore();

  // Employee Form State
  const [essForm, setEssForm] = useState({
    issuedDepartment: '',
    issuedByDepartment: '',
    category: '',
    subCategory: '',
    shortDescription: '',
    employeeName: '',
    employeeId: '',
    employeePost: '',
    employeeEmail: '',
    employeeDepartment: '',
    description: '',
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileMissingFields, setProfileMissingFields] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await apiClient.get('/users/profile');
        const profile = response.data;
        
        setEssForm(prev => ({
          ...prev,
          employeeName: profile.fullName || '',
          employeeId: profile.eisNumber || '',
          employeePost: profile.designation || '',
          employeeEmail: profile.email || '',
          employeeDepartment: profile.departmentId || '',
          issuedByDepartment: profile.departmentId || prev.issuedByDepartment
        }));

        if (!profile.fullName || !profile.eisNumber || !profile.designation) {
          setProfileMissingFields(true);
        }
      } catch (err) {
        console.error('Failed to load profile for service request', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const subDepartments = essForm.issuedByDepartment
    ? (SUB_DEPARTMENTS_MAP[essForm.issuedByDepartment] || [])
    : [];

  const subCategories = essForm.category
    ? (SUB_CATEGORIES_MAP[essForm.category] || [])
    : [];

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

    alert('Service Request Submitted Successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight m-0">Create New Service Request</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Fill in the details below to initiate a technical support or maintenance ticket.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate('/dashboard')} className="px-3 py-1.5 bg-gray-800 text-xs font-bold text-white rounded-lg hover:bg-gray-900 flex items-center gap-1.5 shadow-sm cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>

        {profileMissingFields && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3.5 rounded-xl text-xs font-bold shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Profile Information Incomplete</span>
            </div>
            <p className="font-semibold text-gray-600 m-0">
              Some required employee details (Name, ID, or Designation) are missing from your account profile. Please update your profile with your designation and details before you can submit a service request.
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-fit mt-1 px-3.5 py-1.5 bg-amber-600 text-[10px] text-white font-extrabold rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Go to My Profile
            </button>
          </div>
        )}

        {/* Request Details Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0">Request Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Department *</label>
              <select
                value={essForm.issuedByDepartment}
                onChange={e => setEssForm(prev => ({ ...prev, issuedByDepartment: e.target.value, issuedDepartment: '' }))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Department</option>
                {ISSUED_BY_DEPARTMENTS.length === 0 ? (
                  <option value="" disabled>No data available</option>
                ) : (
                  ISSUED_BY_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sub Department</label>
              <select
                value={essForm.issuedDepartment}
                onChange={e => setEssForm(prev => ({ ...prev, issuedDepartment: e.target.value }))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Sub Department</option>
                {subDepartments.length === 0 ? (
                  <option value="" disabled>No data available</option>
                ) : (
                  subDepartments.map(d => <option key={d} value={d}>{d}</option>)
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category *</label>
              <select
                value={essForm.category}
                onChange={e => setEssForm(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Category</option>
                {CATEGORIES.length === 0 ? (
                  <option value="" disabled>No data available</option>
                ) : (
                  CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                )}
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
                {subCategories.length === 0 ? (
                  <option value="" disabled>No data available</option>
                ) : (
                  subCategories.map(s => <option key={s} value={s}>{s}</option>)
                )}
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
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <h3 className="text-sm font-extrabold text-gray-800 m-0">Employee Information</h3>
            <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked (Managed via Profile)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Name *</label>
              <input
                type="text"
                readOnly
                value={essForm.employeeName}
                placeholder="Required (update in profile)"
                className="w-full px-3.5 py-2 bg-gray-100/70 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold focus:outline-none cursor-not-allowed select-none"
                onKeyDown={e => e.preventDefault()}
                onPaste={e => e.preventDefault()}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee ID *</label>
              <input
                type="text"
                readOnly
                value={essForm.employeeId}
                placeholder="Required (update in profile)"
                className="w-full px-3.5 py-2 bg-gray-100/70 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold focus:outline-none cursor-not-allowed select-none"
                onKeyDown={e => e.preventDefault()}
                onPaste={e => e.preventDefault()}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Post *</label>
              <input
                type="text"
                readOnly
                value={essForm.employeePost}
                placeholder="Required (update in profile)"
                className="w-full px-3.5 py-2 bg-gray-100/70 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold focus:outline-none cursor-not-allowed select-none"
                onKeyDown={e => e.preventDefault()}
                onPaste={e => e.preventDefault()}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Official Email ID</label>
              <input
                type="text"
                readOnly
                value={essForm.employeeEmail}
                placeholder="Not provided in profile"
                className="w-full px-3.5 py-2 bg-gray-100/70 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none cursor-not-allowed select-none"
                onKeyDown={e => e.preventDefault()}
                onPaste={e => e.preventDefault()}
              />
            </div>
          </div>
        </div>

        {/* Description & Attachments Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2.5 m-0">Description &amp; Attachments</h3>
          
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
            disabled={profileLoading || profileMissingFields}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            {profileLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </>
            ) : profileMissingFields ? (
              '⚠️ Complete Profile to Submit'
            ) : (
              <>
                📤 Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
