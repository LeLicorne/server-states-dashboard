import { createFileRoute } from '@tanstack/react-router';

import { requireFirestoreSession } from '@/utils/user-session';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    console.log('[_protected route] Checking session...');
    const profile = await requireFirestoreSession();
    console.log('[_protected route] ✅ Session valid, profile:', profile);
  },
});
