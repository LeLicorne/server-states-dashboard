import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Auth } from '@/models/auth';

import { authApi } from '../services/auth';

interface AuthState {
  loading: boolean;
  error: string | null;
  access: string | null;
  refresh: string | null;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  access: null,
  refresh: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<Auth>) {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
    },
    clearTokens(state) {
      state.access = null;
      state.refresh = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.login.matchPending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.error = null;
      state.loading = false;
    });
    builder.addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'An error occurred';
    });
  },
});

export const { setTokens, clearTokens } = authSlice.actions;

export default authSlice.reducer;
