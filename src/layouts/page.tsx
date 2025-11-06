import { Outlet } from '@tanstack/react-router';

import { FunctionComponent } from '@/commons/types';

const Page: React.FC = (): FunctionComponent => {
  return (
    <main className="flex min-h-screen flex-col">
      <Outlet />
    </main>
  );
};

export default Page;
