import { Outlet } from '@tanstack/react-router';

import { FunctionComponent } from '@/commons/types';
import NavBar from '@/features/navbar';
import { useAppSelector } from '@/hooks/useAppSelector';
import { cn } from '@/utils/cn';

const Page: React.FC = (): FunctionComponent => {
  const isExpanded = useAppSelector((state) => state.navbar.isExpanded);
  const access = useAppSelector((state) => state.auth.access);
  const active = useAppSelector((state) => state.auth.active);
  const showNavigation = Boolean(access && active);

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {showNavigation && <NavBar />}
      {showNavigation && (
        <div
          className={cn(
            'shrink-0 transition-all duration-500 ease-in-out',
            'hidden md:block md:h-screen',
            isExpanded ? 'md:w-52' : 'md:w-16'
          )}
        />
      )}

      <div className={cn('w-full', showNavigation && 'pb-20 md:pb-0')}>
        <Outlet />
      </div>
    </main>
  );
};

export default Page;
