import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import React, { useMemo } from 'react';

import ChartCard from '@/components/commons/chart-card';
import {
  cpuUsageData,
  errorRateData,
  geographicDistributionData,
  monthlyTrafficData,
  responseTimeData,
  serverStatusData,
} from '@/const/chartData';
import { useGetHostsQuery, useGetItemHistoryQuery } from '@/redux/services/zabbixQuery';

const CPU_ITEM_ID = import.meta.env.VITE_ZABBIX_CPU_ITEM_ID as string | undefined;
const MEMORY_ITEM_ID = import.meta.env.VITE_ZABBIX_MEMORY_ITEM_ID as string | undefined;

const DashboardContent: React.FC = () => {
  // --- Server Status (real data from Zabbix host.get) ---
  const { data: hosts } = useGetHostsQuery();

  const serverStatusChartData = useMemo(() => {
    if (!hosts || hosts.length === 0) return serverStatusData; // fallback to mock while loading/unconfigured

    const available = hosts.filter((h) =>
      h.interfaces?.some((iface) => iface.available === '1')
    ).length;
    const unavailable = hosts.length - available;

    return [
      { id: 0, value: available, label: 'Available' },
      { id: 1, value: unavailable, label: 'Unavailable' },
    ];
  }, [hosts]);

  // --- CPU & Memory Usage (real data from Zabbix history.get) ---
  const { data: cpuHistory } = useGetItemHistoryQuery(
    { itemId: CPU_ITEM_ID as string, historyType: 0, limit: 50 },
    { skip: !CPU_ITEM_ID }
  );
  const { data: memoryHistory } = useGetItemHistoryQuery(
    { itemId: MEMORY_ITEM_ID as string, historyType: 0, limit: 50 },
    { skip: !MEMORY_ITEM_ID }
  );

  const cpuMemoryChartData = useMemo(() => {
    if (!cpuHistory?.length || !memoryHistory?.length) return cpuUsageData; // fallback to mock

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <ChartCard>
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold">Server Status</h2>
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
          </div>
        </ChartCard>
        <ChartCard>
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold">Monthly Traffic</h2>
            <BarChart
              xAxis={monthlyTrafficData.xAxis}
              series={monthlyTrafficData.series}
              height={300}
            />
          </div>
        </ChartCard>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <ChartCard>
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold">CPU & Memory Usage</h2>
            <LineChart
              xAxis={cpuMemoryChartData.xAxis}
              series={cpuMemoryChartData.series}
              height={300}
            />
          </div>
        </ChartCard>
        <ChartCard>
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold">Response Time (ms)</h2>
            <LineChart
              xAxis={[{ scaleType: 'point', data: responseTimeData.map((d) => d.time) }]}
              series={[
                {
                  data: responseTimeData.map((d) => d.value),
                  area: true,
                  color: '#ef4444',
                },
              ]}
              height={300}
            />
          </div>
        </ChartCard>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <ChartCard>
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold">Request Status Distribution</h2>
            <PieChart series={errorRateData.series} height={300} />
          </div>
        </ChartCard>
        <ChartCard>
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold">Geographic Distribution</h2>
            <BarChart
              xAxis={geographicDistributionData.xAxis}
              series={geographicDistributionData.series}
              height={300}
            />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardContent;
