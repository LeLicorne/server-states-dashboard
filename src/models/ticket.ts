export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'overdue';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  requester: string;
  service: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFormValues {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  requester: string;
  service: string;
}
