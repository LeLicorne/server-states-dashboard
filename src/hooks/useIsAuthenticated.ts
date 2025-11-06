import { store } from '@/redux/store';

const useIsAuthenticated = () => {
  const states = store.getState();
  const access = states.auth.access;
  if (access) {
    return true;
  }
  return false;
};

export default useIsAuthenticated;
