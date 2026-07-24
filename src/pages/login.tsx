import { useNavigate } from '@tanstack/react-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React from 'react';

import Button from '@/components/buttons/button';
import TextInput from '@/components/inputs/textInput';
import { app, auth } from '@/firebase/config';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setTokens } from '@/redux/reducers/auth';
import { invalidateSession } from '@/utils/user-session';

const db = getFirestore(app);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dispatch = useAppDispatch();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      console.log('[Login] Signing in with email:', email);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[Login] Firebase signin successful, uid:', credential.user.uid);

      const access = await credential.user.getIdToken();
      const refresh = credential.user.refreshToken;
      console.log('[Login] Got access token and refresh token');

      const profileSnapshot = await getDoc(doc(db, 'users', credential.user.uid));
      console.log('[Login] Fetched profile snapshot');

      if (!profileSnapshot.exists()) {
        console.log('[Login] ❌ Profile document does not exist');
        await invalidateSession();
        setError('Your account profile does not exist yet. Contact an administrator.');
        return;
      }

      const profileData = profileSnapshot.data() as {
        email?: string;
        isAdmin?: boolean;
        active?: boolean;
      };
      console.log('[Login] Profile data from Firestore:', profileData);

      if (profileData.active === false) {
        console.log('[Login] ❌ Account is disabled');
        await invalidateSession();
        setError('Your account is disabled. Contact an administrator.');
        return;
      }

      console.log('[Login] ✅ Profile valid and active, dispatching setTokens');
      dispatch(
        setTokens({
          access,
          refresh,
          uid: credential.user.uid,
          email: profileData.email ?? credential.user.email ?? email,
          isAdmin: profileData.isAdmin ?? false,
          active: profileData.active ?? true,
        })
      );
      console.log('[Login] ✅ Navigating to dashboard');
      navigate({ to: '/' });
    } catch (loginError) {
      console.log('[Login] ❌ Error:', loginError);
      setError(
        loginError instanceof Error ? loginError.message : 'Unable to sign in with Firebase.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-white p-6 shadow-lg ring-1 ring-slate-200 sm:p-8"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Login</h2>
          <p className="text-sm text-slate-500">Sign in to access the dashboard.</p>
        </div>

        <TextInput
          label="Email"
          value={email}
          onChange={setEmail}
          placeHolder="mail@example.com"
          className="w-full"
        />

        <TextInput
          label="Password"
          value={password}
          onChange={setPassword}
          placeHolder="Azerty123@"
          secure
          className="w-full"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          label={loading ? 'Signing in...' : 'Login'}
          variant="primary"
          disabled={loading || !email || !password}
        />

        <p className="text-center text-sm text-slate-500">
          Access is managed by your administrator.
        </p>
      </form>
    </div>
  );
};

export default Login;
