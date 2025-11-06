import { createFileRoute, redirect } from '@tanstack/react-router';

import isAuthenticated from '@/hooks/useIsAuthenticated';

export const Route = createFileRoute('/_protected')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/',
      });
    }
  },
});
