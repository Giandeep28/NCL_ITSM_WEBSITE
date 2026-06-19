import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

export interface Comment {
  id: string;
  author: string;
  role: string;
  avatar?: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Ticket {
  id: string; // e.g. UUID from backend or "SR-9402"
  ticketNumber?: string; // e.g. "INC-2026-12345"
  title: string;
  category: string;
  subCategory?: string;
  status: 'Requested' | 'Assigned' | 'In Progress' | 'QA Check' | 'Resolved' | 'Closed' | 'Discussion' | 'Urgent';
  priority: 'Low' | 'Medium' | 'Critical';
  date: string;
  time?: string;
  description: string;
  serialNumber?: string;
  location?: string;
  department: string;
  issuedByDept?: string;
  reporterName: string;
  reporterId: string;
  reporterPost?: string;
  engineerName?: string;
  engineerRole?: string;
  engineerAvatar?: string;
  slaDeadline?: string;
  slaStatus?: 'Optimal' | 'At Risk' | 'Breached';
  attachments?: string[];
  comments: Comment[];
}

interface TicketState {
  tickets: Ticket[];
  selectedTicketId: string | null;
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: string) => Promise<Ticket | null>;
  addTicket: (ticket: Omit<Ticket, 'id' | 'comments'> & { comments?: Comment[] }) => Promise<void>;
  updateTicketStatus: (id: string, status: Ticket['status']) => Promise<void>;
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  setSelectedTicketId: (id: string | null) => void;
}

// Helpers for API mapping
const mapStatus = (status: string): Ticket['status'] => {
  if (status === 'Created') return 'Requested';
  const validStatuses = ['Requested', 'Assigned', 'In Progress', 'QA Check', 'Resolved', 'Closed', 'Discussion', 'Urgent'];
  return validStatuses.includes(status) ? (status as Ticket['status']) : 'Requested';
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

const formatTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};

const formatSlaDeadline = (dateStr: string | undefined) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};

const getSlaStatus = (slaDueAt: string | undefined, status: string): Ticket['slaStatus'] => {
  if (!slaDueAt) return 'Optimal';
  if (['Resolved', 'Closed'].includes(status)) return 'Optimal';
  try {
    const due = new Date(slaDueAt).getTime();
    const now = Date.now();
    if (now > due) return 'Breached';
    if (due - now < 2 * 60 * 60 * 1000) return 'At Risk'; // within 2 hours
    return 'Optimal';
  } catch {
    return 'Optimal';
  }
};

const mapBackendTicket = (t: any): Ticket => {
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.summary || 'Untitled Service Request',
    category: t.category || 'General',
    subCategory: t.subCategory || '',
    status: mapStatus(t.status),
    priority: (t.priority === 'High' ? 'Critical' : t.priority) as Ticket['priority'] || 'Medium',
    date: formatDate(t.createdAt),
    time: formatTime(t.createdAt),
    description: t.description || 'No description provided.',
    serialNumber: t.serialNumber || '',
    location: t.location || '',
    department: 'General',
    reporterName: t.reporterName || 'Employee',
    reporterId: t.reporterId || '',
    engineerName: t.engineerName || undefined,
    slaDeadline: formatSlaDeadline(t.slaDueAt),
    slaStatus: getSlaStatus(t.slaDueAt, t.status),
    comments: t.history ? t.history.map((h: any) => ({
      id: h.id,
      author: h.actorName || 'System',
      role: h.actorName === 'System' ? 'System Logger' : 'Support Specialist',
      content: h.comment || `Status changed from ${h.oldStatus || 'None'} to ${h.newStatus}`,
      timestamp: h.changedAt ? new Date(h.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      isSystem: !h.comment || h.comment.startsWith('Status') || h.oldStatus !== h.newStatus
    })) : []
  };
};

const initialTickets: Ticket[] = [];

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: initialTickets,
  selectedTicketId: null,

  fetchTickets: async () => {
    try {
      const response = await apiClient.get('/tickets');
      const mapped = (response.data as any[]).map(mapBackendTicket);
      set({ tickets: mapped });
    } catch (e) {
      console.error('Failed to fetch tickets from backend, using local store state', e);
    }
  },

  fetchTicketById: async (id: string) => {
    try {
      const response = await apiClient.get(`/tickets/${id}`);
      const mapped = mapBackendTicket(response.data);
      // Update in tickets array or append if it doesn't exist
      set((state) => {
        const exists = state.tickets.some((t) => t.id === id);
        return {
          tickets: exists
            ? state.tickets.map((t) => (t.id === id ? mapped : t))
            : [...state.tickets, mapped]
        };
      });
      return mapped;
    } catch (e) {
      console.error(`Failed to fetch ticket ${id} from backend`, e);
      return get().tickets.find((t) => t.id === id) || null;
    }
  },

  addTicket: async (newTicket) => {
    try {
      const payload = {
        category: newTicket.category,
        subCategory: newTicket.subCategory || 'General',
        impactLevel: newTicket.priority || 'Medium',
        summary: newTicket.title,
        description: newTicket.description,
        serialNumber: newTicket.serialNumber || '',
        location: newTicket.location || ''
      };
      await apiClient.post('/tickets', payload);
      await get().fetchTickets();
    } catch (e) {
      console.error('Failed to create ticket on backend, adding locally', e);
      const ticketId = `SR-${Math.floor(10000 + Math.random() * 90000)}`;
      const createdTicket: Ticket = {
        ...newTicket,
        id: ticketId,
        comments: newTicket.comments || []
      };
      set((state) => ({
        tickets: [createdTicket, ...state.tickets]
      }));
    }
  },

  updateTicketStatus: async (id, status) => {
    try {
      await apiClient.patch(`/tickets/${id}/status`, null, {
        params: { status, comment: `Status updated to ${status} via portal.` }
      });
      await get().fetchTickets();
    } catch (e) {
      console.error('Failed to update status on backend, updating locally', e);
      set((state) => ({
        tickets: state.tickets.map((ticket) => {
          if (ticket.id === id) {
            const systemComment: Comment = {
              id: String(Date.now()),
              author: 'System',
              role: 'System Logger',
              content: `Status changed to ${status}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: true
            };
            return {
              ...ticket,
              status,
              comments: [...ticket.comments, systemComment]
            };
          }
          return ticket;
        })
      }));
    }
  },

  addComment: (ticketId, commentPayload) => set((state) => ({
    tickets: state.tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        const newComment: Comment = {
          ...commentPayload,
          id: String(Date.now()),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...ticket,
          comments: [...ticket.comments, newComment]
        };
      }
      return ticket;
    })
  })),

  setSelectedTicketId: (id) => set({ selectedTicketId: id })
}));
