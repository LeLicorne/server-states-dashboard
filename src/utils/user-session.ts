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
  console.log('[getUserProfileByUid] Fetching profile for uid:', uid);
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    console.log('[getUserProfileByUid] User document does not exist');
    return null;
  }

  const data = snapshot.data() as Partial<UserProfile>;
  console.log('[getUserProfileByUid] Raw Firestore data:', data);

  const profile = {
    uid,
    email: data.email ?? '',
    isAdmin: data.isAdmin ?? false,
    active: data.active ?? true,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  console.log('[getUserProfileByUid] Processed profile:', profile);
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
  console.log('[requireFirestoreSession] Session state:', session);
  console.log('[requireFirestoreSession] Require admin?', requireAdmin);

  if (!session.access || !session.uid) {
    console.log('[requireFirestoreSession] ❌ Missing access token or uid');
    throw redirect({ to: '/login' });
  }

  await waitForAuthState();

  if (!auth.currentUser || auth.currentUser.uid !== session.uid) {
    console.log('[requireFirestoreSession] ❌ Firebase auth user not ready or mismatched');
    await invalidateSession();
    throw redirect({ to: '/login' });
  }

  let profile: UserProfile | null = null;
  try {
    profile = await getUserProfileByUid(session.uid);
  } catch (error) {
    console.log('[requireFirestoreSession] ❌ Failed to fetch profile:', error);
    await invalidateSession();
    throw redirect({ to: '/login' });
  }
  console.log('[requireFirestoreSession] Retrieved profile:', profile);

  if (!profile || !profile.active) {
    console.log('[requireFirestoreSession] ❌ Profile missing or inactive:', profile);
    await invalidateSession();
    throw redirect({ to: '/login' });
  }

  if (requireAdmin && !profile.isAdmin) {
    console.log('[requireFirestoreSession] ❌ Admin required but user is not admin');
    throw redirect({ to: '/' });
  }

  console.log('[requireFirestoreSession] ✅ Authorization passed');
  return profile;
};
