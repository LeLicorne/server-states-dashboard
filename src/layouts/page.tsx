import { Outlet } from '@tanstack/react-router';

import { FunctionComponent } from '@/commons/types';
import NavBar from '@/features/navbar';

const Page: React.FC = (): FunctionComponent => {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <NavBar />
      <Outlet />
    </main>
  );
};

export default Page;
