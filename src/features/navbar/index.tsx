import {
  ArrowRightEndOnRectangleIcon,
  RectangleGroupIcon,
  TicketIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { signOut } from 'firebase/auth';
import React from 'react';

import Logo from '@/assets/images/logo.png';
import IconButton from '@/components/buttons/icon-button';
import { auth } from '@/firebase/config';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { clearTokens } from '@/redux/reducers/auth';
import { toggleNavbar } from '@/redux/reducers/navbar';
import { cn } from '@/utils/cn';

interface IndexProps {}

const Index: React.FC<IndexProps> = () => {
  const dispatch = useAppDispatch();
  const isExpanded = useAppSelector((state) => state.navbar.isExpanded);
  const isAdmin = useAppSelector((state) => state.auth.isAdmin);
  const isActive = useAppSelector((state) => state.auth.active);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();

  const navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <RectangleGroupIcon className="size-6" />,
      path: '/',
      visible: true,
    },
    {
      key: 'tickets',
      label: 'Tickets',
      icon: <TicketIcon className="size-6" />,
      path: '/tickets',
      visible: true,
    },
    {
      key: 'users',
      label: 'Users',
      icon: <UsersIcon className="size-6" />,
      path: '/admin/users',
      visible: isAdmin && isActive,
    },
  ].filter((item) => item.visible);

  const isItemActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleToggle = () => {
    dispatch(toggleNavbar());
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearTokens());
    navigate({ to: '/login' });
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                navigate({ to: item.path });
              }}
              className={cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center rounded-lg px-2 py-1 text-[11px] font-medium transition-colors',
                isItemActive(item.path)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="mt-1 leading-none">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              void handleLogout();
            }}
            className="flex min-h-14 flex-1 flex-col items-center justify-center rounded-lg px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <ArrowRightEndOnRectangleIcon className="size-6" />
            <span className="mt-1 leading-none">Logout</span>
          </button>
        </div>
      </div>

      <div className="fixed left-0 top-0 z-50 hidden h-screen p-2 md:flex">
        <div
          className={cn(
            'flex h-full flex-col gap-2 overflow-hidden rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200 transition-all duration-300 ease-in-out',
            isExpanded ? 'w-52' : 'w-16'
          )}
        >
          <div className="flex items-center">
            <IconButton
              icon={<img src={Logo} alt="Logo" className="size-6 shrink-0" />}
              label={isExpanded ? 'Menu' : ''}
              onClick={handleToggle}
              className={cn('w-full', !isExpanded && 'justify-center px-2')}
            />
          </div>

          {navItems.map((item) => (
            <IconButton
              key={item.key}
              icon={item.icon}
              label={isExpanded ? item.label : ''}
              active={isItemActive(item.path)}
              onClick={() => {
                navigate({ to: item.path });
              }}
              className={cn('w-full', !isExpanded && 'justify-center px-2')}
            />
          ))}

          <IconButton
            icon={<ArrowRightEndOnRectangleIcon className="size-6" />}
            label={isExpanded ? 'Logout' : ''}
            onClick={() => {
              void handleLogout();
            }}
            className={cn(
              'mt-auto text-red-600 hover:bg-red-50',
              !isExpanded && 'justify-center px-2'
            )}
          />
        </div>
      </div>
    </>
  );
};

export default Index;
