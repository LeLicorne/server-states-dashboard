import { ApiResponse } from '@/models/api';
import { Auth, AuthCreate } from '@/models/auth';

import { apiSlice } from './api';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<Auth, AuthCreate>({
      query: (credentials) => ({
        url: '/auth/access/',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<Auth>) => {
        return response.data;
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
