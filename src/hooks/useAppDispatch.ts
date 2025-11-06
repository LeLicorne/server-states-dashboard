import { useDispatch } from 'react-redux';

import type { AppDispatch } from '../redux/store';

// Use throughout app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
