import React from 'react';

interface ChartCardProps {
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ children }) => {
  return (
    <div className="flex flex-1 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">{children}</div>
  );
};

export default ChartCard;
