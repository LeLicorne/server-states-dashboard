import { createFileRoute } from '@tanstack/react-router';

import Ticket from '@/pages/ticket';

export const Route = createFileRoute('/_protected/tickets')({
  component: Ticket,
});
