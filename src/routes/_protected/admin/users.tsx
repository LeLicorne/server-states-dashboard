import { createFileRoute } from '@tanstack/react-router';

import AdminUsersPage from '@/pages/admin/users';
import { requireFirestoreSession } from '@/utils/user-session';

export const Route = createFileRoute('/_protected/admin/users')({
  beforeLoad: async () => {
    await requireFirestoreSession({ requireAdmin: true });
  },
  component: AdminUsersPage,
});
