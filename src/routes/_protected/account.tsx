import { createFileRoute } from '@tanstack/react-router';

import AccountPage from '@/pages/account';

export const Route = createFileRoute('/_protected/account')({
  component: AccountPage,
});
