// Zabbix JSON-RPC API types
// Docs: https://www.zabbix.com/documentation/current/en/manual/api

export interface ZabbixRpcError {
  code: number;
  message: string;
  data?: string;
}

export interface ZabbixInterface {
  interfaceid: string;
  ip: string;
  available: '0' | '1' | '2'; // 0 = unknown, 1 = available, 2 = unavailable
}

export interface ZabbixHost {
  hostid: string;
  host: string;
  name: string;
  status: '0' | '1'; // 0 = enabled (monitored), 1 = disabled
  interfaces?: ZabbixInterface[];
}

export interface ZabbixProblem {
  eventid: string;
  objectid: string;
  name: string;
  severity: '0' | '1' | '2' | '3' | '4' | '5';
  clock: string; // unix timestamp, seconds, as string
}

export interface ZabbixItem {
  itemid: string;
  hostid: string;
  name: string;
  key_: string;
  lastvalue?: string;
  units?: string;
  value_type?: number;
}

export interface ZabbixHistoryPoint {
  itemid: string;
  clock: string; // unix timestamp, seconds, as string
  value: string;
}

export interface GetItemHistoryArgs {
  itemId: string;
  /** Zabbix value_type for this item: 0=float, 1=character, 2=log, 3=unsigned int, 4=text */
  historyType?: number;
  timeFrom?: number;
  limit?: number;
}

export interface GetItemsArgs {
  hostIds?: string[];
  search?: Record<string, string>;
}
