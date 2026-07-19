import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import React from 'react';

import Button from '@/components/buttons/button';
import Tag from '@/components/commons/tag';
import TextInput from '@/components/inputs/textInput';
import { app } from '@/firebase/config';

interface UserRecord {
  id: string;
  uid?: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
  createdAt?: number;
  updatedAt?: number;
}

interface UserFormState {
  email: string;
  isAdmin: boolean;
  active: boolean;
}

const initialFormState: UserFormState = {
  email: '',
  isAdmin: false,
  active: true,
};

const db = getFirestore(app);

const createRandomPassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}<>?';
  const allChars = `${lower}${upper}${numbers}${symbols}`;

  const pickChar = (characters: string) =>
    characters[crypto.getRandomValues(new Uint32Array(1))[0] % characters.length];

  const passwordChars = [
    pickChar(lower),
    pickChar(upper),
    pickChar(numbers),
    pickChar(symbols),
    ...Array.from({ length: 12 }, () => pickChar(allChars)),
  ];

  for (let index = passwordChars.length - 1; index > 0; index -= 1) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
    [passwordChars[index], passwordChars[randomIndex]] = [
      passwordChars[randomIndex],
      passwordChars[index],
    ];
  }

  return passwordChars.join('');
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [form, setForm] = React.useState<UserFormState>(initialFormState);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = React.useState<string | null>(null);
  const [copyStatus, setCopyStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('email', 'asc'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        setUsers(
          snapshot.docs.map((userDoc) => {
            const userData = userDoc.data() as Partial<UserRecord>;

            return {
              id: userDoc.id,
              uid: userData.uid ?? userDoc.id,
              email: userData.email ?? '',
              isAdmin: userData.isAdmin ?? false,
              active: userData.active ?? true,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
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

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
    setCopyStatus(null);
  };

  const createFirebaseUser = async (email: string, password: string) => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string;
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: false,
        }),
      }
    );

    const data = (await response.json()) as {
      localId?: string;
      error?: { message?: string };
    };

    if (!response.ok || !data.localId) {
      throw new Error(data.error?.message || 'Unable to create the Firebase Auth user.');
    }

    return data.localId;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        const payload = {
          ...form,
          updatedAt: Date.now(),
        };

        await updateDoc(doc(db, 'users', editingId), payload);
      } else {
        const password = createRandomPassword();
        const uid = await createFirebaseUser(form.email, password);
        const payload = {
          uid,
          ...form,
          updatedAt: Date.now(),
          createdAt: Date.now(),
        };

        await setDoc(doc(db, 'users', uid), payload);

        setGeneratedPassword(password);
        setCopyStatus('Password generated. Copy it now, then share it securely.');
      }

      resetForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to save the user profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: UserRecord) => {
    setEditingId(user.id);
    setForm({
      email: user.email,
      isAdmin: user.isAdmin,
      active: user.active,
    });
  };

  const handleDelete = async (userId: string) => {
    const shouldDelete = window.confirm('Delete this user profile?');

    if (!shouldDelete) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await deleteDoc(doc(db, 'users', userId));
      if (editingId === userId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete the user.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!generatedPassword) {
      return;
    }

    await navigator.clipboard.writeText(generatedPassword);
    setCopyStatus('Password copied to clipboard.');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <Tag color="blue" label="Admin only" />
          </div>
          <p className="max-w-3xl text-sm text-slate-600">
            This page manages Firestore user profiles. Firebase Auth accounts are created here.
            Permissions and active state come from the Firestore user document.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="flex h-fit flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit user' : 'Create user'}
              </h2>
              <p className="text-sm text-slate-500">
                Update profile data stored in the <span className="font-medium">users</span>{' '}
                collection.
              </p>
            </div>

            <TextInput
              label="Email"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              placeHolder="user@example.com"
              disabled={Boolean(editingId)}
              className="w-full"
            />

            {editingId && (
              <p className="text-sm text-slate-500">
                Email is tied to the Firebase Auth account and cannot be edited here. Delete and
                recreate the user if you need to change it.
              </p>
            )}

            <p className="text-sm text-slate-500">
              Password is generated automatically when creating a new user and shown below for
              copying.
            </p>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isAdmin}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isAdmin: event.target.checked }))
                }
                className="size-4 rounded border-slate-300"
              />
              Admin
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({ ...current, active: event.target.checked }))
                }
                className="size-4 rounded border-slate-300"
              />
              Active
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {generatedPassword && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-900">Generated password</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <code className="break-all rounded bg-white px-3 py-2 font-mono text-sm text-slate-900 ring-1 ring-emerald-200">
                    {generatedPassword}
                  </code>
                  <Button
                    type="button"
                    label="Copy password"
                    variant="secondary"
                    onClick={() => {
                      void handleCopyPassword();
                    }}
                  />
                </div>
                {copyStatus && <p className="mt-2 text-sm text-emerald-800">{copyStatus}</p>}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                label={saving ? 'Saving...' : editingId ? 'Update user' : 'Create auth user'}
                variant="primary"
                disabled={saving || !form.email}
                className="flex-1"
              />
              <Button
                type="button"
                label="Reset"
                variant="transparent"
                onClick={resetForm}
                disabled={saving && !editingId}
                className="flex-1"
              />
            </div>
          </form>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Current users</h2>
                <p className="text-sm text-slate-500">Stored in Firestore and sorted by email.</p>
              </div>
              <Tag color="gray" label={`${users.length} users`} />
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-slate-500">No user profiles found yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="align-top">
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-slate-500">{user.email}</p>
                            <p className="text-xs text-slate-400">UID: {user.uid ?? user.id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Tag
                            color={user.isAdmin ? 'blue' : 'gray'}
                            label={user.isAdmin ? 'Admin' : 'Member'}
                          />
                        </td>
                        <td className="p-4">
                          <Tag
                            color={user.active ? 'green' : 'red'}
                            label={user.active ? 'Active' : 'Inactive'}
                          />
                        </td>
                        <td className="p-4 text-slate-500">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              label="Edit"
                              variant="secondary"
                              onClick={() => handleEdit(user)}
                            />
                            <Button
                              type="button"
                              label="Delete"
                              variant="danger"
                              onClick={() => {
                                void handleDelete(user.id);
                              }}
                              disabled={saving}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminUsersPage;
