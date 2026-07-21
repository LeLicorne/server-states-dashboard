import { useEffect } from 'react';

import { setMode } from '@/redux/reducers/options';

import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';

export type ModeType = 'light' | 'dark' | 'auto';

export function useDarkMode(): { mode: ModeType; isDarkMode: boolean; toggleMode: () => void } {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((state) => state.options);

  function toggleMode() {
    switch (mode) {
      case 'light':
        dispatch(setMode('dark'));
        break;
      case 'dark':
        dispatch(setMode('auto'));
        break;
      case 'auto':
        dispatch(setMode('light'));
        break;
    }
  }

  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  const isDarkMode = mode === 'dark' || (mode === 'auto' && prefersDarkScheme.matches);

  useEffect(() => {
    const handleSystemModeChange = (event: MediaQueryListEvent) => {
      if (mode === 'auto') {
        document.documentElement.classList.toggle('dark', event.matches);
      }
    };

    if (mode === 'auto') {
      const darkOS = prefersDarkScheme.matches;
      document.documentElement.classList.toggle('dark', darkOS);
    } else {
      document.documentElement.classList.toggle('dark', mode === 'dark');
    }

    prefersDarkScheme.addEventListener('change', handleSystemModeChange);

    return () => {
      prefersDarkScheme.removeEventListener('change', handleSystemModeChange);
    };
  }, [mode, prefersDarkScheme, dispatch]);

  return { mode, isDarkMode, toggleMode };
}
