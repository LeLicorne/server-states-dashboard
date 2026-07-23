import { redirect } from '@tanstack/react-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

import { app, auth } from '@/firebase/config';
import { clearTokens } from '@/redux/reducers/auth';
import { store } from '@/redux/store';

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
  createdAt?: number;
  updatedAt?: number;
}

const db = getFirestore(app);

const waitForAuthState = async () =>
  new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      () => {
        unsubscribe();
        resolve();
      },
      () => {
        unsubscribe();
        resolve();
      }
    );
  });

export const getUserProfileByUid = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<UserProfile>;

  const profile = {
    uid,
    email: data.email ?? '',
    isAdmin: data.isAdmin ?? false,
    active: data.active ?? true,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  return profile;
};

export const invalidateSession = async () => {
  store.dispatch(clearTokens());
  await signOut(auth).catch(() => undefined);
};

export const requireFirestoreSession = async ({
  requireAdmin = false,
}: {
  requireAdmin?: boolean;
} = {}) => {
  const session = store.getState().auth;

  if (!session.access || !session.uid) {
    throw redirect({ to: '/login' });
  }

  await waitForAuthState();

  if (!auth.currentUser || auth.currentUser.uid !== session.uid) {
    await invalidateSession();
    throw redirect({ to: '/login' });
  }

  let profile: UserProfile | null = null;
  try {
    profile = await getUserProfileByUid(session.uid);
  } catch (error) {
    await invalidateSession();
    throw redirect({ to: '/login' });
  }

  if (!profile || !profile.active) {
    await invalidateSession();
    throw redirect({ to: '/login' });
  }

  if (requireAdmin && !profile.isAdmin) {
    throw redirect({ to: '/' });
  }

  return profile;
};
