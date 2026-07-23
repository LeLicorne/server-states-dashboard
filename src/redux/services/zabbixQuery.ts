import {
  GetItemHistoryArgs,
  GetItemsArgs,
  ZabbixHistoryPoint,
  ZabbixHost,
  ZabbixItem,
  ZabbixProblem,
} from '@/models/zabbix';

import { zabbixApi } from './zabbix';

export const zabbixEndpoints = zabbixApi.injectEndpoints({
  endpoints: (builder) => ({
    getHosts: builder.query<ZabbixHost[], void>({
      query: () => ({
        method: 'host.get',
        params: {
          output: ['hostid', 'host', 'name', 'status'],
          selectInterfaces: ['interfaceid', 'ip', 'available'],
        },
      }),
    }),

    getProblems: builder.query<ZabbixProblem[], void>({
      query: () => ({
        method: 'problem.get',
        params: {
          output: 'extend',
          recent: true,
          sortfield: 'eventid',
          sortorder: 'DESC',
        },
      }),
    }),

    getItems: builder.query<ZabbixItem[], GetItemsArgs>({
      query: ({ hostIds, search } = {}) => ({
        method: 'item.get',
        params: {
          output: ['itemid', 'hostid', 'name', 'key_', 'lastvalue', 'units'],
          hostids: hostIds,
          search,
        },
      }),
    }),

    // Fetches value_type so callers can pick the correct `history` bucket
    // for history.get instead of hardcoding/guessing 0 (float) vs 3 (unsigned) etc.
    getItemsMeta: builder.query<ZabbixItem[], string[]>({
      query: (itemIds) => ({
        method: 'item.get',
        params: {
          output: ['itemid', 'hostid', 'name', 'key_', 'value_type'],
          itemids: itemIds,
        },
      }),
    }),

    getItemHistory: builder.query<ZabbixHistoryPoint[], GetItemHistoryArgs>({
      query: ({ itemId, historyType = 0, timeFrom, limit = 100 }) => ({
        method: 'history.get',
        params: {
          output: 'extend',
          itemids: [itemId],
          history: historyType,
          sortfield: 'clock',
          sortorder: 'DESC',
          time_from: timeFrom,
          limit,
        },
      }),
    }),
  }),
});

export const {
  useGetHostsQuery,
  useGetProblemsQuery,
  useGetItemsQuery,
  useGetItemsMetaQuery,
  useGetItemHistoryQuery,
} = zabbixEndpoints;
