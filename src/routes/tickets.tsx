import { createFileRoute } from '@tanstack/react-router';

import Ticket from '@/pages/ticket';

export const Route = createFileRoute('/tickets')({
  component: Ticket,
});
