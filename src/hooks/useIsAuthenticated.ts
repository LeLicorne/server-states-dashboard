import { store } from '@/redux/store';

const useIsAuthenticated = () => {
  const states = store.getState();
  const access = states.auth.access;
  const active = states.auth.active;
  if (access && active) {
    return true;
  }
  return false;
};

export default useIsAuthenticated;
