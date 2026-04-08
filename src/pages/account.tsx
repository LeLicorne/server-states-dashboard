import React from 'react';

import Tag from '@/components/commons/tag';
import { useAppSelector } from '@/hooks/useAppSelector';

const AccountPage: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Account</h1>
            <Tag
              color={auth.active ? 'green' : 'red'}
              label={auth.active ? 'Active' : 'Inactive'}
            />
          </div>
          <p className="max-w-3xl text-sm text-slate-600">
            Review your account profile and current access level.
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-900">
                {auth.email ?? '-'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">UID</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-900">{auth.uid ?? '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {auth.isAdmin ? 'Administrator' : 'Member'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Session</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {auth.access ? 'Authenticated' : 'Not authenticated'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountPage;
