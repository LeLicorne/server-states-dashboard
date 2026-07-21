import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

import type { Ticket, TicketFormValues, TicketPriority, TicketStatus } from '@/models/ticket';

type TicketFilters = {
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  query: string;
};

type TicketsState = {
  items: Ticket[];
  filters: TicketFilters;
};

const getTimestamp = () => new Date().toISOString();

const createSeedTicket = (ticket: Omit<Ticket, 'createdAt' | 'updatedAt'>): Ticket => {
  const timestamp = getTimestamp();

  return {
    ...ticket,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const initialState: TicketsState = {
  items: [
    createSeedTicket({
      id: 'ticket-1',
      title: 'Database replicas lagging behind primary',
      description: 'Investigate replication delay on the reporting cluster before business hours.',
      status: 'in_progress',
      priority: 'critical',
      assignee: 'On-call SRE',
      requester: 'Monitoring',
      service: 'PostgreSQL',
    }),
    createSeedTicket({
      id: 'ticket-2',
      title: 'TLS certificate renewal for staging ingress',
      description:
        'Renew expiring ingress certificate and confirm staging routes respond correctly.',
      status: 'open',
      priority: 'high',
      assignee: 'Platform Team',
      requester: 'DevOps',
      service: 'Ingress',
    }),
    createSeedTicket({
      id: 'ticket-3',
      title: 'Archive old dashboard metrics export job',
      description: 'Close the legacy export task after verifying the new pipeline is stable.',
      status: 'resolved',
      priority: 'medium',
      assignee: 'Backend Team',
      requester: 'Analytics',
      service: 'Reporting',
    }),
    createSeedTicket({
      id: 'ticket-4',
      title: 'Review overdue uptime alert escalation',
      description: 'Escalated notification has been pending for over 24 hours and needs triage.',
      status: 'overdue',
      priority: 'critical',
      assignee: 'Incident Manager',
      requester: 'Monitoring',
      service: 'Alerting',
    }),
  ],
  filters: {
    status: 'all',
    priority: 'all',
    query: '',
  },
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTicket: {
      reducer(state, action: PayloadAction<Ticket>) {
        state.items.unshift(action.payload);
      },
      prepare(values: TicketFormValues) {
        const timestamp = getTimestamp();

        return {
          payload: {
            id: nanoid(),
            createdAt: timestamp,
            updatedAt: timestamp,
            ...values,
          },
        };
      },
    },
    updateTicket(state, action: PayloadAction<{ id: string; values: TicketFormValues }>) {
      const ticket = state.items.find((item) => item.id === action.payload.id);

      if (!ticket) {
        return;
      }

      Object.assign(ticket, {
        ...action.payload.values,
        updatedAt: getTimestamp(),
      });
    },
    deleteTicket(state, action: PayloadAction<string>) {
      state.items = state.items.filter((ticket) => ticket.id !== action.payload);
    },
    setTicketStatus(state, action: PayloadAction<{ id: string; status: TicketStatus }>) {
      const ticket = state.items.find((item) => item.id === action.payload.id);

      if (!ticket) {
        return;
      }

      ticket.status = action.payload.status;
      ticket.updatedAt = getTimestamp();
    },
    setTicketFilters(state, action: PayloadAction<Partial<TicketFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetTicketFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const {
  addTicket,
  updateTicket,
  deleteTicket,
  setTicketStatus,
  setTicketFilters,
  resetTicketFilters,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
