import React from 'react';

import DashboardContent from './content';
import DashboardHero from './hero';

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <DashboardHero />
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
