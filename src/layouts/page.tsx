import { Outlet } from '@tanstack/react-router';

import { FunctionComponent } from '@/commons/types';
import NavBar from '@/features/navbar';
import { useAppSelector } from '@/hooks/useAppSelector';
import { cn } from '@/utils/cn';

const Page: React.FC = (): FunctionComponent => {
  const isExpanded = useAppSelector((state) => state.navbar.isExpanded);
  const access = useAppSelector((state) => state.auth.access);
  const active = useAppSelector((state) => state.auth.active);

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {access && active && <NavBar />}
      {access && active && (
        <div
          className={cn(
            'shrink-0 transition-all duration-500 ease-in-out',
            'size-16 md:h-screen',
            isExpanded ? 'md:w-52' : 'md:w-16'
          )}
        />
      )}

      <div className="w-full">
        <Outlet />
      </div>
    </main>
  );
};

export default Page;
