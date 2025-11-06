import { RectangleGroupIcon, TicketIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import Logo from '@/assets/images/logo.png';
import IconButton from '@/components/buttons/icon-button';
import { cn } from '@/utils/cn';

interface IndexProps {}

const Index: React.FC<IndexProps> = () => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  const navigate = useNavigate();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex h-screen flex-row p-2 md:flex-col">
      <div
        className={cn(
          'flex h-full flex-col gap-2 rounded-md bg-white p-2 shadow-lg transition-all duration-500 ease-in-out overflow-hidden',
          isExpanded ? 'w-48' : 'w-14'
        )}
      >
        <div className="flex flex-row items-center justify-between">
          <IconButton
            icon={<img src={Logo} alt="Logo" className="size-6 shrink-0" />}
            onClick={!isExpanded ? toggleExpand : () => {}}
            className="w-fit"
          />
          <IconButton
            icon={<XMarkIcon className="size-6 shrink-0" />}
            onClick={!isExpanded ? () => {} : toggleExpand}
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
      </div>
    </div>
  );
};

export default Index;
