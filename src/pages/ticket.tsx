import { ArrowPathIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import React from 'react';

import Button from '@/components/buttons/button';
import Tag from '@/components/commons/tag';
import TextInput from '@/components/inputs/textInput';
import DangerModal from '@/components/modals/danger-modal';
import { app } from '@/firebase/config';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'overdue';
type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  requester: string;
  service: string;
  createdAt?: number;
  updatedAt?: number;
}

interface TicketFormValues {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  requester: string;
  service: string;
}

interface TicketFilters {
  query: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
}

const emptyForm: TicketFormValues = {
  title: '',
  description: '',
  status: 'open',
  priority: 'medium',
  assignee: '',
  requester: '',
  service: '',
};

const initialFilters: TicketFilters = {
  query: '',
  status: 'all',
  priority: 'all',
};

const statusLabels: Record<
  TicketStatus,
  { label: string; color: 'gray' | 'orange' | 'blue' | 'green' | 'red' }
> = {
  open: { label: 'Open', color: 'gray' },
  in_progress: { label: 'In progress', color: 'blue' },
  resolved: { label: 'Resolved', color: 'green' },
  overdue: { label: 'Overdue', color: 'red' },
};

const priorityLabels: Record<
  TicketPriority,
  { label: string; color: 'gray' | 'orange' | 'blue' | 'green' | 'red' }
> = {
  low: { label: 'Low', color: 'green' },
  medium: { label: 'Medium', color: 'blue' },
  high: { label: 'High', color: 'orange' },
  critical: { label: 'Critical', color: 'red' },
};

const statusOrder: TicketStatus[] = ['open', 'in_progress', 'resolved', 'overdue'];

const db = getFirestore(app);

const TicketPage: React.FC = () => {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [filters, setFilters] = React.useState<TicketFilters>(initialFilters);
  const [form, setForm] = React.useState<TicketFormValues>(emptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Ticket | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ticketsQuery = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        setTickets(
          snapshot.docs.map((ticketDoc) => {
            const ticketData = ticketDoc.data() as Partial<Ticket>;

            return {
              id: ticketDoc.id,
              title: ticketData.title ?? '',
              description: ticketData.description ?? '',
              status: ticketData.status ?? 'open',
              priority: ticketData.priority ?? 'medium',
              assignee: ticketData.assignee ?? '',
              requester: ticketData.requester ?? '',
              service: ticketData.service ?? '',
              createdAt: ticketData.createdAt,
              updatedAt: ticketData.updatedAt,
            };
          })
        );
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredTickets = React.useMemo(() => {
    const searchQuery = filters.query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
      const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
      const matchesQuery =
        !searchQuery ||
        [ticket.title, ticket.description, ticket.assignee, ticket.requester, ticket.service]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery);

      return matchesStatus && matchesPriority && matchesQuery;
    });
  }, [filters.priority, filters.query, filters.status, tickets]);

  const metrics = React.useMemo(() => {
    return statusOrder.reduce(
      (accumulator, status) => {
        accumulator[status] = tickets.filter((ticket) => ticket.status === status).length;
        return accumulator;
      },
      {} as Record<TicketStatus, number>
    );
  }, [tickets]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Submitting form:', form, 'Editing ID:', editingId);

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await updateDoc(doc(db, 'tickets', editingId), {
          ...form,
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'tickets'), {
          ...form,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save the ticket.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setForm({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignee: ticket.assignee,
      requester: ticket.requester,
      service: ticket.service,
    });
  };

  const handleToggleStatus = async (ticket: Ticket) => {
    const nextStatus: TicketStatus =
      ticket.status === 'open'
        ? 'in_progress'
        : ticket.status === 'in_progress'
          ? 'resolved'
          : ticket.status === 'resolved'
            ? 'open'
            : 'in_progress';

    try {
      setError(null);
      await updateDoc(doc(db, 'tickets', ticket.id), {
        status: nextStatus,
        updatedAt: Date.now(),
      });
    } catch (statusError) {
      setError(
        statusError instanceof Error ? statusError.message : 'Unable to update the ticket status.'
      );
    }
  };

  const handleDelete = async (ticketId: string) => {
    try {
      setSaving(true);
      setError(null);
      await deleteDoc(doc(db, 'tickets', ticketId));
      if (editingId === ticketId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete the ticket.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Tickets</h1>
            <Tag color="gray" label="Firestore-backed" />
          </div>
          <p className="max-w-3xl text-sm text-slate-600">
            Track incidents, priority work, and service requests stored in the{' '}
            <span className="font-medium">tickets</span> collection.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statusOrder.map((status) => (
            <div key={status} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {statusLabels[status].label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{metrics[status]}</p>
            </div>
          ))}
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="flex h-fit flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit ticket' : 'Create ticket'}
              </h2>
              <p className="text-sm text-slate-500">
                Create a new operational ticket or update the current record.
              </p>
            </div>

            <TextInput
              label="Title"
              value={form.title}
              onChange={(value) => setForm((current) => ({ ...current, title: value }))}
              placeHolder="Database lag investigation"
              className="w-full"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-description" className="text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="ticket-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Describe the work, the impact, and the current status."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as TicketStatus,
                    }))
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status].label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Priority
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as TicketPriority,
                    }))
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {Object.entries(priorityLabels).map(([priority, meta]) => (
                    <option key={priority} value={priority}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <TextInput
              label="Assignee"
              value={form.assignee}
              onChange={(value) => setForm((current) => ({ ...current, assignee: value }))}
              placeHolder="Platform Team"
            />

            <TextInput
              label="Requester"
              value={form.requester}
              onChange={(value) => setForm((current) => ({ ...current, requester: value }))}
              placeHolder="Monitoring"
            />

            <TextInput
              label="Service"
              value={form.service}
              onChange={(value) => setForm((current) => ({ ...current, service: value }))}
              placeHolder="PostgreSQL"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="submit"
                label={saving ? 'Saving...' : editingId ? 'Update ticket' : 'Add ticket'}
                disabled={saving || !form.title}
              />
              {editingId && (
                <Button
                  type="button"
                  variant="transparent"
                  label="Cancel"
                  onClick={resetForm}
                  disabled={saving}
                />
              )}
            </div>
          </form>

          <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ticket list</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredTickets.length} ticket
                  {filteredTickets.length === 1 ? '' : 's'} match the current filters.
                </p>
              </div>

              <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 lg:flex lg:flex-wrap">
                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                  Status
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        status: event.target.value as TicketStatus | 'all',
                      }))
                    }
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    <option value="all">All</option>
                    {statusOrder.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status].label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                  Priority
                  <select
                    value={filters.priority}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        priority: event.target.value as TicketPriority | 'all',
                      }))
                    }
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    <option value="all">All</option>
                    {Object.entries(priorityLabels).map(([priority, meta]) => (
                      <option key={priority} value={priority}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </label>

                <TextInput
                  label="Search"
                  value={filters.query}
                  onChange={(value) => setFilters((current) => ({ ...current, query: value }))}
                  placeHolder="Search tickets"
                  className="w-full min-w-0 sm:min-w-56"
                />

                <Button
                  type="button"
                  variant="transparent"
                  label="Reset"
                  onClick={() => setFilters(initialFilters)}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading tickets...</p>
              ) : (
                <>
                  {filteredTickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">
                              {ticket.title}
                            </h3>
                            <Tag
                              color={statusLabels[ticket.status].color}
                              label={statusLabels[ticket.status].label}
                            />
                            <Tag
                              color={priorityLabels[ticket.priority].color}
                              label={priorityLabels[ticket.priority].label}
                            />
                          </div>

                          <p className="max-w-3xl text-sm text-slate-600">{ticket.description}</p>

                          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>Service: {ticket.service}</span>
                            <span>Requester: {ticket.requester}</span>
                            <span>Assignee: {ticket.assignee}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              void handleToggleStatus(ticket);
                            }}
                          >
                            <ArrowPathIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="transparent"
                            onClick={() => handleEdit(ticket)}
                          >
                            <PencilSquareIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => setDeleteTarget(ticket)}
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}

                  {filteredTickets.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                      No tickets match the selected filters.
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </section>
      </div>

      <DangerModal
        show={Boolean(deleteTarget)}
        title="Delete ticket"
        description={
          deleteTarget ? `Remove ${deleteTarget.title} from the ticket list?` : undefined
        }
        label="Delete ticket"
        action={() => {
          if (deleteTarget) {
            void handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        close={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TicketPage;
