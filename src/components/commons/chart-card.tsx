import React from 'react';

interface ChartCardProps {
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ children }) => {
  return (
    <div className="flex min-h-[360px] flex-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      {children}
    </div>
  );
};

export default ChartCard;
