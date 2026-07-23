import React from 'react';

const DashboardHero: React.FC = () => {
  return (
    <div className="mb-4 flex flex-col gap-1 sm:mb-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Server States Dashboard</h1>
      <p className="text-sm text-slate-500">
        Cards tagged <span className="font-medium text-blue-600">Live</span> pull real data from
        Zabbix. Cards tagged <span className="font-medium text-slate-500">Demo data</span> are
        placeholders not wired to any backend yet.
      </p>
    </div>
  );
};

export default DashboardHero;
