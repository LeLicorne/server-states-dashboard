import React from 'react';

import Tag from '@/components/commons/tag';

const Ticket: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Tickets</h1>
            <Tag color="gray" label="Coming soon" />
          </div>
          <p className="max-w-3xl text-sm text-slate-600">
            Track incidents, review priorities, and monitor ticket progression from this page.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Open</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">In Progress</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Resolved</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Overdue</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Ticket list</h2>
          <p className="mt-2 text-sm text-slate-500">
            No ticket data source is connected yet. Hook this page to your backend when ready.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Ticket;
