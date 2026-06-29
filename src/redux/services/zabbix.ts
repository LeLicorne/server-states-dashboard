import { type BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';

import type { ZabbixRpcError } from '@/models/zabbix';

export interface ZabbixRpcArgs {
  method: string;
  params?: Record<string, unknown>;
}

interface ZabbixRpcResponse<T> {
  result?: T;
  error?: ZabbixRpcError;
}

interface ZabbixRuntimeEnv {
  VITE_ZABBIX_API_URL?: string;
  VITE_ZABBIX_API_TOKEN?: string;
}

let requestId = 0;

/**
 * Custom baseQuery for Zabbix's JSON-RPC API (single endpoint, method-based,
 * not a REST API — so fetchBaseQuery's path-based routing doesn't apply).
 *
 * Auth: uses the Authorization: Bearer header, supported since Zabbix 6.4+.
 * Confirmed working against Zabbix 7.4 (your setup).
 *
 * A Zabbix API token is a static credential (not a session), so there's no
 * reauth/refresh logic needed here unless you set an expiry on the token.
 */
export const zabbixBaseQuery: BaseQueryFn<ZabbixRpcArgs, unknown, ZabbixRpcError> = async ({
  method,
  params = {},
}) => {
  const { VITE_ZABBIX_API_URL: url, VITE_ZABBIX_API_TOKEN: token } = import.meta
    .env as ImportMetaEnv & ZabbixRuntimeEnv;

  if (!url || !token) {
    return {
      error: {
        code: -32000,
        message: 'Missing VITE_ZABBIX_API_URL or VITE_ZABBIX_API_TOKEN in environment',
      },
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json-rpc',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: ++requestId,
      }),
    });

    if (!response.ok) {
      return { error: { code: response.status, message: `HTTP error ${response.status}` } };
    }

    const json = (await response.json()) as ZabbixRpcResponse<unknown>;

    if (json.error) {
      return { error: json.error };
    }

    return { data: json.result };
  } catch (err) {
    return {
      error: {
        code: -32001,
        message: err instanceof Error ? err.message : 'Unknown network error',
      },
    };
  }
};

export const zabbixApi = createApi({
  reducerPath: 'zabbixApi',
  baseQuery: zabbixBaseQuery,
  refetchOnMountOrArgChange: 30,
  endpoints: () => ({}),
});
