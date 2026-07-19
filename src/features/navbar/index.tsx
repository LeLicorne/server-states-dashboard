import {
  ArrowRightEndOnRectangleIcon,
  RectangleGroupIcon,
  TicketIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from '@tanstack/react-router';
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
  const navigate = useNavigate();

  const handleToggle = () => {
    dispatch(toggleNavbar());
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearTokens());
    navigate({ to: '/login' });
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen flex-row p-2 md:flex-col">
      <div
        className={cn(
          'flex h-full flex-col gap-2 overflow-hidden rounded-md bg-white p-2 shadow-lg transition-all duration-500 ease-in-out',
          isExpanded ? 'w-48' : 'w-14'
        )}
      >
        <div className="flex flex-row items-center justify-between">
          <IconButton
            icon={<img src={Logo} alt="Logo" className="size-6 shrink-0" />}
            onClick={!isExpanded ? handleToggle : () => {}}
            className="w-fit"
          />
          <IconButton
            icon={<XMarkIcon className="size-6 shrink-0" />}
            onClick={!isExpanded ? () => {} : handleToggle}
            className={cn('', isExpanded ? 'flex' : 'hidden')}
          />
        </div>
        <IconButton
          icon={<RectangleGroupIcon className="size-6" />}
          label={isExpanded ? 'Dashboard' : ''}
          onClick={() => {
            navigate({ to: '/' });
          }}
        />
        <IconButton
          icon={<TicketIcon className="size-6" />}
          label={isExpanded ? 'Tickets' : ''}
          onClick={() => {
            navigate({ to: '/tickets' });
          }}
        />
        {isAdmin && isActive && (
          <IconButton
            icon={<UsersIcon className="size-6" />}
            label={isExpanded ? 'Users' : ''}
            onClick={() => {
              navigate({ to: '/admin/users' });
            }}
          />
        )}

        <IconButton
          icon={<ArrowRightEndOnRectangleIcon className="size-6" />}
          label={isExpanded ? 'Logout' : ''}
          onClick={() => {
            void handleLogout();
          }}
          className="mt-auto text-red-500"
        />
      </div>
    </div>
  );
};

export default Index;
