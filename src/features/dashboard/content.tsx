import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import React, { useMemo } from 'react';

import ChartCard from '@/components/commons/chart-card';
import Tag from '@/components/commons/tag';
import type { ZabbixHistoryPoint } from '@/models/zabbix';
import {
  useGetHostsQuery,
  useGetItemHistoryQuery,
  useGetItemsMetaQuery,
} from '@/redux/services/zabbixQuery';

const CPU_ITEM_ID = import.meta.env.VITE_ZABBIX_CPU_ITEM_ID as string | undefined;
const MEMORY_ITEM_ID = import.meta.env.VITE_ZABBIX_MEMORY_ITEM_ID as string | undefined;
// net.if.in / net.if.out of the interface to monitor.
const NET_IN_ITEM_ID = import.meta.env.VITE_ZABBIX_NET_IN_ITEM_ID as string | undefined;
const NET_OUT_ITEM_ID = import.meta.env.VITE_ZABBIX_NET_OUT_ITEM_ID as string | undefined;
// e.g. vfs.fs.size[/,pused]
const DISK_ITEM_ID = import.meta.env.VITE_ZABBIX_DISK_ITEM_ID as string | undefined;
// icmppingsec (seconds)
const PING_ITEM_ID = import.meta.env.VITE_ZABBIX_PING_ITEM_ID as string | undefined;

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

const CardHeader: React.FC<{ title: string; live: boolean }> = ({ title, live }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
    <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
    {live ? <LiveTag /> : <NotWiredTag />}
  </div>
);

// history.get returns points sorted DESC — put them back in chronological order.
function sortByClock(points: ZabbixHistoryPoint[]) {
  return [...points].sort((a, b) => Number(a.clock) - Number(b.clock));
}

/**
 * Builds LineChart props from one or two history series sharing the same x-axis.
 * Pass `transform` to convert raw Zabbix units (e.g. bytes/s, seconds) before plotting.
 */
function buildLineChartData(
  primary: ZabbixHistoryPoint[] | undefined,
  primaryLabel: string,
  secondary?: ZabbixHistoryPoint[],
  secondaryLabel?: string,
  transform: (value: number) => number = (value) => value
) {
  if (!primary?.length) return null;

  const sortedPrimary = sortByClock(primary);
  const series = [
    { label: primaryLabel, data: sortedPrimary.map((p) => transform(Number(p.value))) },
  ];

  if (secondary?.length && secondaryLabel) {
    const sortedSecondary = sortByClock(secondary);
    series.push({
      label: secondaryLabel,
      data: sortedSecondary.map((p) => transform(Number(p.value))),
    });
  }

  return {
    xAxis: [
      {
        scaleType: 'point' as const,
        data: sortedPrimary.map((p) => new Date(Number(p.clock) * 1000).toLocaleTimeString()),
      },
    ],
    series,
  };
}

// Builds a used/free PieChart dataset from a single "percentage used" value.
function buildUsagePieData(pusedValue: number) {
  const used = Math.round(pusedValue * 10) / 10;
  const free = Math.round((100 - used) * 10) / 10;
  return [
    { id: 0, value: used, label: 'Used' },
    { id: 1, value: free, label: 'Free' },
  ];
}

function resolveStatus(hasError: boolean, isLoading: boolean, hasData: boolean): ChartStatus {
  if (hasError) return 'error';
  if (isLoading) return 'loading';
  return hasData ? 'ready' : 'empty';
}

// net.if.in/out report bytes/s — convert to kbps for a more readable chart.
const toKbps = (bytesPerSec: number) => Math.round((bytesPerSec * 8) / 1000);

const ServerStatusCard: React.FC = () => {
  const { data: hosts, isLoading, isError } = useGetHostsQuery();

  const chartData = useMemo(() => {
    if (!hosts) return [];
    const available = hosts.filter((h) => h.interfaces?.some((i) => i.available === '1')).length;
    return [
      { id: 0, value: available, label: 'Available' },
      { id: 1, value: hosts.length - available, label: 'Unavailable' },
    ];
  }, [hosts]);

  const status = resolveStatus(isError, isLoading, !!hosts?.length);

  return (
    <ChartCard>
      <div className="flex w-full flex-col">
        <CardHeader title="Server Status" live />
        {status === 'ready' ? (
          <PieChart
            series={[
              {
                data: chartData,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              },
            ]}
            height={300}
          />
        ) : (
          <ChartStateOverlay status={status} />
        )}
      </div>
    </ChartCard>
  );
};

const NetworkTrafficCard: React.FC = () => {
  const configured = !!NET_IN_ITEM_ID && !!NET_OUT_ITEM_ID;
  const metaIds = [NET_IN_ITEM_ID, NET_OUT_ITEM_ID].filter(Boolean) as string[];

  const {
    data: meta,
    isLoading: metaLoading,
    isError: metaIsError,
  } = useGetItemsMetaQuery(metaIds, { skip: !configured });

  const inType = meta?.find((i) => i.itemid === NET_IN_ITEM_ID)?.value_type;
  const outType = meta?.find((i) => i.itemid === NET_OUT_ITEM_ID)?.value_type;

  const {
    data: netIn,
    isLoading: inLoading,
    isError: inIsError,
  } = useGetItemHistoryQuery(
    { itemId: NET_IN_ITEM_ID as string, historyType: inType, limit: 50 },
    { skip: !configured || inType === undefined }
  );
  const {
    data: netOut,
    isLoading: outLoading,
    isError: outIsError,
  } = useGetItemHistoryQuery(
    { itemId: NET_OUT_ITEM_ID as string, historyType: outType, limit: 50 },
    { skip: !configured || outType === undefined }
  );

  const chartData = useMemo(
    () => buildLineChartData(netIn, 'In (kbps)', netOut, 'Out (kbps)', toKbps),
    [netIn, netOut]
  );

  const hasError = !configured || metaIsError || inIsError || outIsError;
  const isLoading = metaLoading || inLoading || outLoading;
  const status = resolveStatus(hasError, isLoading, !!chartData);

  return (
    <ChartCard>
      <div className="flex w-full flex-col">
        <CardHeader title="Network Traffic" live={configured} />
        {status === 'ready' && chartData ? (
          <LineChart xAxis={chartData.xAxis} series={chartData.series} height={300} />
        ) : (
          <ChartStateOverlay status={status === 'ready' ? 'empty' : status} />
        )}
      </div>
    </ChartCard>
  );
};

const CpuMemoryCard: React.FC = () => {
  const metaIds = [CPU_ITEM_ID, MEMORY_ITEM_ID].filter(Boolean) as string[];
  const {
    data: meta,
    isLoading: metaLoading,
    isError: metaIsError,
  } = useGetItemsMetaQuery(metaIds, { skip: metaIds.length === 0 });

  const cpuType = meta?.find((i) => i.itemid === CPU_ITEM_ID)?.value_type;
  const memType = meta?.find((i) => i.itemid === MEMORY_ITEM_ID)?.value_type;

  const {
    data: cpu,
    isLoading: cpuLoading,
    isError: cpuIsError,
  } = useGetItemHistoryQuery(
    { itemId: CPU_ITEM_ID as string, historyType: cpuType, limit: 50 },
    { skip: !CPU_ITEM_ID || cpuType === undefined }
  );
  const {
    data: mem,
    isLoading: memLoading,
    isError: memIsError,
  } = useGetItemHistoryQuery(
    { itemId: MEMORY_ITEM_ID as string, historyType: memType, limit: 50 },
    { skip: !MEMORY_ITEM_ID || memType === undefined }
  );

  const chartData = useMemo(() => buildLineChartData(cpu, 'CPU %', mem, 'Memory %'), [cpu, mem]);

  const hasError = !CPU_ITEM_ID || !MEMORY_ITEM_ID || metaIsError || cpuIsError || memIsError;
  const isLoading = metaLoading || cpuLoading || memLoading;
  const status = resolveStatus(hasError, isLoading, !!chartData);

  return (
    <ChartCard>
      <div className="flex w-full flex-col">
        <CardHeader title="CPU & Memory Usage" live />
        {status === 'ready' && chartData ? (
          <LineChart xAxis={chartData.xAxis} series={chartData.series} height={300} />
        ) : (
          <ChartStateOverlay status={status === 'ready' ? 'empty' : status} />
        )}
      </div>
    </ChartCard>
  );
};

const IcmpPingCard: React.FC = () => {
  const configured = !!PING_ITEM_ID;

  const {
    data: meta,
    isLoading: metaLoading,
    isError: metaIsError,
  } = useGetItemsMetaQuery([PING_ITEM_ID as string], { skip: !configured });

  const pingType = meta?.find((i) => i.itemid === PING_ITEM_ID)?.value_type;

  const {
    data: ping,
    isLoading: pingLoading,
    isError: pingIsError,
  } = useGetItemHistoryQuery(
    { itemId: PING_ITEM_ID as string, historyType: pingType, limit: 50 },
    { skip: !configured || pingType === undefined }
  );

  const chartData = useMemo(
    () => buildLineChartData(ping, 'Ping (ms)', undefined, undefined, (v) => Math.round(v * 1000)),
    [ping]
  );

  const hasError = !configured || metaIsError || pingIsError;
  const isLoading = metaLoading || pingLoading;
  const status = resolveStatus(hasError, isLoading, !!chartData);

  return (
    <ChartCard>
      <div className="flex w-full flex-col">
        <CardHeader title="ICMP Ping (ms)" live={configured} />
        {status === 'ready' && chartData ? (
          <LineChart xAxis={chartData.xAxis} series={chartData.series} height={300} />
        ) : (
          <ChartStateOverlay status={status === 'ready' ? 'empty' : status} />
        )}
      </div>
    </ChartCard>
  );
};

const DiskUsageCard: React.FC = () => {
  const configured = !!DISK_ITEM_ID;

  const {
    data: meta,
    isLoading: metaLoading,
    isError: metaIsError,
  } = useGetItemsMetaQuery([DISK_ITEM_ID as string], { skip: !configured });

  const diskType = meta?.find((i) => i.itemid === DISK_ITEM_ID)?.value_type;

  // pused is a live gauge value — the latest point (limit: 1) is enough.
  const {
    data: disk,
    isLoading: diskLoading,
    isError: diskIsError,
  } = useGetItemHistoryQuery(
    { itemId: DISK_ITEM_ID as string, historyType: diskType, limit: 1 },
    { skip: !configured || diskType === undefined }
  );

  const chartData = useMemo(() => {
    if (!disk?.length) return null;
    return buildUsagePieData(Number(disk[0].value));
  }, [disk]);

  const hasError = !configured || metaIsError || diskIsError;
  const isLoading = metaLoading || diskLoading;
  const status = resolveStatus(hasError, isLoading, !!chartData);

  return (
    <ChartCard>
      <div className="flex w-full flex-col">
        <CardHeader title="Disk Usage" live={configured} />
        {status === 'ready' && chartData ? (
          <PieChart
            series={[
              {
                data: chartData,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              },
            ]}
            height={300}
          />
        ) : (
          <ChartStateOverlay status={status === 'ready' ? 'empty' : status} />
        )}
      </div>
    </ChartCard>
  );
};

// No realistic Zabbix equivalent without a configured Web scenario — left as a placeholder.
const RequestStatusCard: React.FC = () => (
  <ChartCard>
    <div className="flex w-full flex-col">
      <CardHeader title="Request Status Distribution" live={false} />
      <ChartStateOverlay status="not_wired" />
    </div>
  </ChartCard>
);

const DashboardContent: React.FC = () => (
  <div className="flex flex-col gap-4 sm:gap-6">
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <ServerStatusCard />
      <NetworkTrafficCard />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <CpuMemoryCard />
      <IcmpPingCard />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <RequestStatusCard />
      <DiskUsageCard />
    </div>
  </div>
);

export default DashboardContent;
