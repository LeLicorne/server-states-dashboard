import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Auth } from '@/models/auth';

import { authApi } from '../services/auth';

type AuthPayload = {
  access: string;
  refresh: string;
  uid?: string;
  email?: string;
  isAdmin?: boolean;
  active?: boolean;
};

interface AuthState {
  loading: boolean;
  error: string | null;
  access: string | null;
  refresh: string | null;
  uid: string | null;
  email: string | null;
  isAdmin: boolean;
  active: boolean;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  access: null,
  refresh: null,
  uid: null,
  email: null,
  isAdmin: false,
  active: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<Auth>) {
      const payload = action.payload as AuthPayload;
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.uid = payload.uid ?? state.uid;
      state.email = payload.email ?? state.email;
      state.isAdmin = payload.isAdmin ?? false;
      state.active = payload.active ?? true;
    },
    clearTokens(state) {
      state.access = null;
      state.refresh = null;
      state.uid = null;
      state.email = null;
      state.isAdmin = false;
      state.active = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.login.matchPending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      const payload = action.payload as AuthPayload;
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.uid = payload.uid ?? state.uid;
      state.email = payload.email ?? state.email;
      state.isAdmin = payload.isAdmin ?? false;
      state.active = payload.active ?? true;
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
