import React from 'react';

import DashboardContent from './content';
import DashboardHero from './hero';

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <DashboardHero />
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
