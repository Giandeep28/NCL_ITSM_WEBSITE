import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicketStore, type Ticket } from '../../../store/ticketStore';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, updateTicketStatus, addComment, setSelectedTicketId } = useTicketStore();

  const ticket = tickets.find(t => t.id === id) || tickets[0]; // Fallback to first ticket

  const [newCommentText, setNewCommentText] = useState('');

  if (!ticket) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <h3 className="text-lg font-bold text-gray-800">Ticket not found</h3>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Handle posting comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    addComment(ticket.id, {
      author: 'Marcus Thorne', // simulated current user
      role: 'Electrical Specialist',
      content: newCommentText,
    });
    setNewCommentText('');
  };

  // Handle status update
  const handleMarkResolved = () => {
    updateTicketStatus(ticket.id, 'Resolved');
  };

  // Status Stepper Steps
  const steps: { name: Ticket['status']; label: string }[] = [
    { name: 'Requested', label: 'Requested' },
    { name: 'Assigned', label: 'Assigned' },
    { name: 'In Progress', label: 'In Progress' },
    { name: 'QA Check', label: 'QA Check' },
    { name: 'Resolved', label: 'Resolved' }
  ];

  // Helper to determine step class
  const getStepStatus = (stepName: Ticket['status']) => {
    const ticketStatus = ticket.status;
    
    // Status hierarchy indices
    const order: Ticket['status'][] = ['Requested', 'Assigned', 'In Progress', 'QA Check', 'Resolved'];
    const ticketIdx = order.indexOf(ticketStatus === 'Discussion' || ticketStatus === 'Urgent' ? 'In Progress' : ticketStatus);
    const stepIdx = order.indexOf(stepName);

    if (stepIdx < ticketIdx) return 'completed';
    if (stepIdx === ticketIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header and Back Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setSelectedTicketId(null);
            navigate('/dashboard');
          }}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{ticket.id}</span>
          <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight m-0">{ticket.title}</h2>
        </div>
      </div>

      {/* Dynamic Stepper Bar (Image 4 Style) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between relative max-w-3xl mx-auto px-4">
          {/* Connector Line */}
          <div className="absolute top-[15px] left-8 right-8 h-[3px] bg-gray-100 -z-0">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{
                width: `${
                  (Math.max(0, ['Requested', 'Assigned', 'In Progress', 'QA Check', 'Resolved'].indexOf(
                    ticket.status === 'Discussion' || ticket.status === 'Urgent' ? 'In Progress' : ticket.status
                  )) / 4) * 100
                }%`
              }}
            ></div>
          </div>

          {steps.map((step, idx) => {
            const stepStatus = getStepStatus(step.name);
            return (
              <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 border-2 ${
                    stepStatus === 'completed'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : stepStatus === 'active'
                      ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-50'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="text-center">
                  <span className={`text-[10px] font-bold block ${stepStatus !== 'pending' ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold block mt-0.5">
                    {stepStatus === 'completed' ? 'Completed' : stepStatus === 'active' ? 'Ongoing' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Details & Feed | Right Metadata & Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description, Evidence, Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description & Context Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 relative">
            <button className="absolute top-5 right-5 p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-150 shadow-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider m-0">Description &amp; Context</h3>
            
            <p className="text-sm font-semibold text-gray-700 leading-relaxed max-w-2xl pr-4">
              {ticket.description}
            </p>

            <div className="pt-4 border-t border-gray-100 flex gap-4 text-xs font-bold">
              {ticket.serialNumber && (
                <div className="bg-gray-50 border border-gray-150 px-3.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-gray-400 block uppercase leading-none pb-1">Serial Number</span>
                  <span className="text-gray-700 font-bold leading-none">{ticket.serialNumber}</span>
                </div>
              )}
              {ticket.location && (
                <div className="bg-gray-50 border border-gray-150 px-3.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-gray-400 block uppercase leading-none pb-1">Location</span>
                  <span className="text-gray-700 font-bold leading-none">{ticket.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Supporting Evidence Card */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider m-0">
                Supporting Evidence ({ticket.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ticket.attachments.map((file, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50 h-32 flex flex-col justify-end p-3 relative group select-none">
                    {/* Simulated File Visual Preview */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/20">
                      <svg className="w-10 h-10 text-white/40 group-hover:scale-110 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="relative z-20 text-[10px] font-bold text-white truncate">{file}</span>
                  </div>
                ))}
                
                {/* Upload Action Card */}
                <button className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl h-32 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer bg-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload File</span>
                </button>
              </div>
            </div>
          )}

          {/* Collaboration Feed Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider m-0">Collaboration Feed</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                {ticket.comments.length} Updates
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {ticket.comments.map((comment) => {
                if (comment.isSystem) {
                  return (
                    <div key={comment.id} className="flex items-center justify-center py-2">
                      <div className="h-px bg-gray-100 flex-1"></div>
                      <span className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest italic bg-white">
                        {comment.content} ({comment.timestamp})
                      </span>
                      <div className="h-px bg-gray-100 flex-1"></div>
                    </div>
                  );
                }

                return (
                  <div key={comment.id} className="flex gap-4 items-start bg-gray-50/50 border border-gray-100 rounded-xl p-4 transition-all hover:bg-gray-50">
                    <img
                      src={comment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={comment.author}
                      className="w-8.5 h-8.5 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-extrabold text-gray-800">{comment.author}</span>
                          <span className="text-[10px] font-bold text-gray-400">({comment.role})</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Comment Box */}
            <form onSubmit={handlePostComment} className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-indigo-500 transition-colors">
              <textarea
                placeholder="Add a comment or internal note..."
                rows={3}
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                className="w-full p-2 border-none text-xs text-gray-700 font-semibold focus:outline-none resize-none bg-white"
              ></textarea>
              <div className="flex justify-between items-center pt-2.5 border-t border-gray-100">
                <div className="flex gap-1.5 text-gray-400">
                  <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition-colors cursor-pointer">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition-colors cursor-pointer">
                    <span className="text-xs font-black">@</span>
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition-colors cursor-pointer">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata, Tech, Assets, Actions */}
        <div className="space-y-6">
          {/* Request Metadata Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider m-0">Request Metadata</h3>
            
            {/* Tech Info Card */}
            {ticket.engineerName && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Technician</span>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <img
                    src={ticket.engineerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={ticket.engineerName}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-gray-800 m-0 truncate leading-tight">{ticket.engineerName}</h4>
                    <span className="text-[10px] text-gray-500 font-bold">{ticket.engineerRole}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Priority and SLA badging */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Priority</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider inline-flex items-center justify-center uppercase w-full ${
                  ticket.priority === 'Critical'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : ticket.priority === 'Medium'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-green-50 text-green-600 border border-green-100'
                }`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">SLA Status</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider inline-flex items-center justify-center gap-1.5 uppercase w-full ${
                  ticket.slaStatus === 'At Risk'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : ticket.slaStatus === 'Breached'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-green-50 text-green-600 border border-green-100'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ticket.slaStatus || 'Optimal'}
                </span>
              </div>
            </div>

            {/* Static Fields */}
            <div className="space-y-3.5 pt-3 border-t border-gray-100 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-gray-400">Created By</span>
                <span className="text-gray-800">{ticket.reporterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Department</span>
                <span className="text-gray-800">{ticket.department}</span>
              </div>
              {ticket.slaDeadline && (
                <div className="flex justify-between">
                  <span className="text-gray-400">SLA Deadline</span>
                  <span className="text-red-500">{ticket.slaDeadline}</span>
                </div>
              )}
            </div>
          </div>

          {/* Related Assets Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider m-0">Related Assets</h3>
              <button className="text-gray-400 hover:text-indigo-600 cursor-pointer">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 items-start p-2.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 01-2 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800 m-0 leading-tight">Turbine Unit #4</h4>
                  <span className="text-[10px] text-gray-400 font-bold leading-normal block mt-0.5">Critical Power Grid Component</span>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800 m-0 leading-tight">Coupling ASM-90</h4>
                  <span className="text-[10px] text-gray-400 font-bold leading-normal block mt-0.5">Secondary Drive Assembly</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2">
            {ticket.status !== 'Resolved' && (
              <button
                onClick={handleMarkResolved}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
                </svg>
                Mark as Resolved
              </button>
            )}
            <button
              onClick={() => alert('Reassign technician (Demo)')}
              className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
            >
              <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Reassign Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
