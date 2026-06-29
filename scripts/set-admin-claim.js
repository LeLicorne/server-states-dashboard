import 'dotenv/config';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountPath = path.resolve(
  process.cwd(),
  'src/firebase/serverstatedashboard-firebase-adminsdk-fbsvc-6a1aba232a.json'
);

const credential = cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8')));

if (!getApps().length) {
  initializeApp({
    credential,
  });
}

const auth = getAuth();
const db = getFirestore();

const uid = process.env.FIREBASE_ADMIN_UID;
const email = process.env.FIREBASE_ADMIN_EMAIL;

if (!uid && !email) {
  throw new Error('Set FIREBASE_ADMIN_UID or FIREBASE_ADMIN_EMAIL to choose the target user.');
}

const user = uid ? await auth.getUser(uid) : await auth.getUserByEmail(email);

await db
  .collection('users')
  .doc(user.uid)
  .set(
    {
      uid: user.uid,
      email: user.email ?? email ?? '',
      isAdmin: true,
      active: true,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

console.log(`Admin flag set for ${user.email ?? user.uid}`);
