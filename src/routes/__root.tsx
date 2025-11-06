import { createRootRoute } from '@tanstack/react-router';

import Page from '@/layouts/page';

export const Route = createRootRoute({
  pendingComponent: () => {
    return <div>Loading...</div>;
  },
  notFoundComponent: () => {
    <p>Erreur 404</p>;
  },
  errorComponent: () => {
    return <div>Error</div>;
  },
  component: Page,
});
