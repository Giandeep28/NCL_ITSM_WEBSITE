import { create } from 'zustand';

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
  id: string; // e.g. "SR-9402"
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
  addTicket: (ticket: Omit<Ticket, 'id' | 'comments'> & { comments?: Comment[] }) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  setSelectedTicketId: (id: string | null) => void;
}

const initialTickets: Ticket[] = [
  {
    id: 'SR-88291',
    title: 'Turbine Assembly Vibration Calibration',
    category: 'Turbine Maintenance',
    subCategory: 'Mechanical Calibration',
    status: 'In Progress',
    priority: 'Critical',
    date: 'Oct 12, 2024',
    time: '09:14 AM',
    description: 'The Main Turbine Unit #4 is reporting abnormal vibration levels (4.2mm/s) exceeding the safety threshold. This appears to be localized to the secondary coupling assembly. Immediate diagnostic and re-calibration are required to prevent emergency shutdown.',
    serialNumber: 'TX-99012-B',
    location: 'Bay 7, Sector Delta',
    department: 'Power Systems',
    issuedByDept: 'Power Generation',
    reporterName: 'J. Henderson',
    reporterId: 'EMP-4091',
    reporterPost: 'Operations Lead',
    engineerName: 'Marcus Thorne',
    engineerRole: 'Electrical Specialist',
    engineerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    slaDeadline: 'Oct 14, 08:00 AM',
    slaStatus: 'At Risk',
    attachments: ['vibration_log.png', 'thermal_scan.jpg'],
    comments: [
      {
        id: '1',
        author: 'Marcus Thorne',
        role: 'Field Technician',
        content: "I've arrived at Bay 7. Preliminary inspection shows significant wear on the coupler gaskets. Requesting expedited parts from inventory.",
        timestamp: '10:45 AM'
      },
      {
        id: '2',
        author: 'System',
        role: 'System Logger',
        content: 'Status changed to In Progress',
        timestamp: '10:46 AM',
        isSystem: true
      },
      {
        id: '3',
        author: 'Elena Rodriguez',
        role: 'Support Manager',
        content: 'Parts request approved. Warehouse has dispatched Coupler Kit B-90. Expected arrival: 1 hour.',
        timestamp: '11:12 AM'
      }
    ]
  },
  {
    id: 'SR-9402',
    title: 'Turbine Maintenance Unit 2',
    category: 'Turbine Maintenance',
    status: 'In Progress',
    priority: 'Medium',
    date: 'Oct 24, 2024',
    description: 'Routine maintenance and inspection of Turbine Unit 2. Checking rotor clearance and lubricating bearings.',
    department: 'Power Systems',
    reporterName: 'S. Patel',
    reporterId: 'EMP-1102',
    reporterPost: 'Plant Operator',
    comments: []
  },
  {
    id: 'SR-9401',
    title: 'Grid Calibration Substation C',
    category: 'Grid Calibration',
    status: 'Discussion',
    priority: 'Low',
    date: 'Oct 24, 2024',
    description: 'Phase mismatch reported on Substation C feeder. Needs review from grid engineers before execution.',
    department: 'Electrical Operations',
    reporterName: 'R. Kumar',
    reporterId: 'EMP-3049',
    reporterPost: 'Substation Engineer',
    comments: []
  },
  {
    id: 'SR-9398',
    title: 'Sensor Replacement Boiler 4',
    category: 'Sensor Replacement',
    status: 'Resolved',
    priority: 'Medium',
    date: 'Oct 23, 2024',
    description: 'Boiler 4 temperature thermocouple sensor was faulty, causing false high temperature warnings. Replaced with new unit.',
    department: 'Instrumentation',
    reporterName: 'A. Sharma',
    reporterId: 'EMP-8291',
    reporterPost: 'Technician',
    comments: []
  },
  {
    id: 'SR-9395',
    title: 'PLC Update Main Assembly Line',
    category: 'PLC Update',
    status: 'Urgent',
    priority: 'Critical',
    date: 'Oct 23, 2024',
    description: 'PLC firmware update required to support new conveyor control logic. Needs to be done during scheduled downtime.',
    department: 'Automation Systems',
    reporterName: 'D. Vance',
    reporterId: 'EMP-1284',
    reporterPost: 'Automation Lead',
    comments: []
  }
];

export const useTicketStore = create<TicketState>((set) => ({
  tickets: initialTickets,
  selectedTicketId: 'SR-88291', // default selected ticket for detail view demo
  addTicket: (newTicket) => set((state) => {
    const ticketId = `SR-${Math.floor(10000 + Math.random() * 90000)}`;
    const createdTicket: Ticket = {
      ...newTicket,
      id: ticketId,
      comments: newTicket.comments || []
    };
    return {
      tickets: [createdTicket, ...state.tickets]
    };
  }),
  updateTicketStatus: (id, status) => set((state) => ({
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
  })),
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
