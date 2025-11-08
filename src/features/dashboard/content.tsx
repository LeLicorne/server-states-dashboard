import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import React from 'react';

import ChartCard from '@/components/commons/chart-card';
import {
  cpuUsageData,
  errorRateData,
  geographicDistributionData,
  monthlyTrafficData,
  responseTimeData,
  serverStatusData,
} from '@/const/chartData';

const DashboardContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <ChartCard>
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold">Server Status</h2>
            <PieChart
              series={[
                {
                  data: serverStatusData,
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
            <LineChart xAxis={cpuUsageData.xAxis} series={cpuUsageData.series} height={300} />
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
