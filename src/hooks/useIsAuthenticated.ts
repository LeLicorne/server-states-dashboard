import { useAppSelector } from './useAppSelector';

const useIsAuthenticated = () => {
  const { access, active } = useAppSelector((state) => state.auth);
  if (access && active) {
    return true;
  }
  return false;
};

export default useIsAuthenticated;
