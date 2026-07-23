import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import React, { useMemo } from 'react';

import ChartCard from '@/components/commons/chart-card';
import Tag from '@/components/commons/tag';
import {
  useGetHostsQuery,
  useGetItemHistoryQuery,
  useGetItemsMetaQuery,
} from '@/redux/services/zabbixQuery';

const CPU_ITEM_ID = import.meta.env.VITE_ZABBIX_CPU_ITEM_ID as string | undefined;
const MEMORY_ITEM_ID = import.meta.env.VITE_ZABBIX_MEMORY_ITEM_ID as string | undefined;

type ChartStatus = 'loading' | 'error' | 'empty' | 'not_wired' | 'ready';

/**
 * Placeholder shown instead of a chart when there's no real data to plot.
 * Keeps the card's height stable so the layout doesn't jump between states.
 */
const ChartStateOverlay: React.FC<{ status: Exclude<ChartStatus, 'ready'>; height?: number }> = ({
  status,
  height = 300,
}) => {
  const messages: Record<Exclude<ChartStatus, 'ready'>, string> = {
    loading: 'Loading data from Zabbix…',
    error: 'Could not reach Zabbix. Check the API connection.',
    empty: 'No data reported by Zabbix yet.',
    not_wired: 'Not connected to Zabbix yet — no data source configured for this chart.',
  };

  return (
    <div
      style={{ height }}
      className="flex w-full items-center justify-center rounded-lg bg-slate-50 px-4 text-center text-sm text-slate-400"
    >
      {messages[status]}
    </div>
  );
};

const LiveTag: React.FC = () => <Tag color="blue" label="Live" />;
const NotWiredTag: React.FC = () => <Tag color="gray" label="Not connected" />;

const DashboardContent: React.FC = () => {
  // --- Server Status (real data from Zabbix host.get) ---
  const { data: hosts, isLoading: hostsLoading, isError: hostsIsError } = useGetHostsQuery();

  const serverStatusChartData = useMemo(() => {
    if (!hosts) return [];
    const available = hosts.filter((h) =>
      h.interfaces?.some((iface) => iface.available === '1')
    ).length;
    const unavailable = hosts.length - available;
    return [
      { id: 0, value: available, label: 'Available' },
      { id: 1, value: unavailable, label: 'Unavailable' },
    ];
  }, [hosts]);

  const serverStatusStatus: ChartStatus = hostsIsError
    ? 'error'
    : hostsLoading
      ? 'loading'
      : !hosts || hosts.length === 0
        ? 'empty'
        : 'ready';

  // --- CPU & Memory Usage (real data from Zabbix history.get) ---
  const metaItemIds = [CPU_ITEM_ID, MEMORY_ITEM_ID].filter(Boolean) as string[];
  const {
    data: itemsMeta,
    isLoading: metaLoading,
    isError: metaIsError,
  } = useGetItemsMetaQuery(metaItemIds, { skip: metaItemIds.length === 0 });

  // value_type: 0=float, 1=char, 2=log, 3=unsigned, 4=text — history.get's
  // `history` param must match this exactly or it silently returns [].
  const cpuValueType = itemsMeta?.find((i) => i.itemid === CPU_ITEM_ID)?.value_type;
  const memoryValueType = itemsMeta?.find((i) => i.itemid === MEMORY_ITEM_ID)?.value_type;

  const {
    data: cpuHistory,
    isLoading: cpuLoading,
    isError: cpuIsError,
  } = useGetItemHistoryQuery(
    { itemId: CPU_ITEM_ID as string, historyType: cpuValueType, limit: 50 },
    { skip: !CPU_ITEM_ID || cpuValueType === undefined }
  );
  const {
    data: memoryHistory,
    isLoading: memoryLoading,
    isError: memoryIsError,
  } = useGetItemHistoryQuery(
    { itemId: MEMORY_ITEM_ID as string, historyType: memoryValueType, limit: 50 },
    { skip: !MEMORY_ITEM_ID || memoryValueType === undefined }
  );

  const cpuMemoryChartData = useMemo(() => {
    if (!cpuHistory?.length || !memoryHistory?.length) return null;

    const sortedCpu = [...cpuHistory].sort((a, b) => Number(a.clock) - Number(b.clock));
    const sortedMemory = [...memoryHistory].sort((a, b) => Number(a.clock) - Number(b.clock));

    return {
      xAxis: [
        {
          scaleType: 'point' as const,
          data: sortedCpu.map((p) => new Date(Number(p.clock) * 1000).toLocaleTimeString()),
        },
      ],
      series: [
        { label: 'CPU %', data: sortedCpu.map((p) => Number(p.value)) },
        { label: 'Memory %', data: sortedMemory.map((p) => Number(p.value)) },
      ],
    };
  }, [cpuHistory, memoryHistory]);

  const cpuMemoryLoading = metaLoading || cpuLoading || memoryLoading;
  const cpuMemoryHasError =
    !CPU_ITEM_ID || !MEMORY_ITEM_ID || metaIsError || cpuIsError || memoryIsError;

  const cpuMemoryStatus: ChartStatus = cpuMemoryHasError
    ? 'error'
    : cpuMemoryLoading
      ? 'loading'
      : !cpuMemoryChartData
        ? 'empty'
        : 'ready';

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <ChartCard>
          <div className="flex w-full flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">Server Status</h2>
              <LiveTag />
            </div>
            {serverStatusStatus === 'ready' ? (
              <PieChart
                series={[
                  {
                    data: serverStatusChartData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  },
                ]}
                height={300}
              />
            ) : (
              <ChartStateOverlay status={serverStatusStatus} />
            )}
          </div>
        </ChartCard>

        <ChartCard>
          <div className="flex w-full flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">Monthly Traffic</h2>
              <NotWiredTag />
            </div>
            <ChartStateOverlay status="not_wired" />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <ChartCard>
          <div className="flex w-full flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">CPU & Memory Usage</h2>
              <LiveTag />
            </div>
            {cpuMemoryStatus === 'ready' && cpuMemoryChartData ? (
              <LineChart
                xAxis={cpuMemoryChartData.xAxis}
                series={cpuMemoryChartData.series}
                height={300}
              />
            ) : (
              <ChartStateOverlay status={cpuMemoryStatus === 'ready' ? 'empty' : cpuMemoryStatus} />
            )}
          </div>
        </ChartCard>

        <ChartCard>
          <div className="flex w-full flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">Response Time (ms)</h2>
              <NotWiredTag />
            </div>
            <ChartStateOverlay status="not_wired" />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <ChartCard>
          <div className="flex w-full flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">Request Status Distribution</h2>
              <NotWiredTag />
            </div>
            <ChartStateOverlay status="not_wired" />
          </div>
        </ChartCard>
        <ChartCard>
          <div className="flex w-full flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">Geographic Distribution</h2>
              <NotWiredTag />
            </div>
            <ChartStateOverlay status="not_wired" />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardContent;
