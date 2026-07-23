import React from 'react';

import Tag from '@/components/commons/tag';
import Dashboard from '@/features/dashboard';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        <header className="space-y-2 sm:space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
            <Tag color="gray" label="Overview" />
          </div>
          <p className="max-w-3xl text-sm text-slate-600">
            Monitor server states and global metrics from a unified dashboard view.
          </p>
        </header>

        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <Dashboard />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
