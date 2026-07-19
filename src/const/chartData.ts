// Dummy data for various chart types

export const serverStatusData = [
  { id: 0, value: 75, label: 'Online' },
  { id: 1, value: 15, label: 'Warning' },
  { id: 2, value: 10, label: 'Offline' },
];

export const monthlyTrafficData = {
  xAxis: [
    {
      scaleType: 'band' as const,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
  ],
  series: [
    {
      data: [4000, 3000, 2000, 2780, 1890, 2390, 3490, 4200, 3800, 4100, 3900, 4500],
      label: 'Requests (k)',
      color: '#3b82f6',
    },
  ],
};

export const cpuUsageData = {
  xAxis: [
    {
      scaleType: 'band' as const,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    },
  ],
  series: [
    {
      data: [45, 52, 68, 75, 62, 58],
      label: 'CPU %',
      color: '#10b981',
      area: true,
    },
    {
      data: [35, 42, 55, 68, 58, 48],
      label: 'Memory %',
      color: '#8b5cf6',
      area: true,
    },
  ],
};

export const responseTimeData = [
  { time: '00:00', value: 120 },
  { time: '01:00', value: 115 },
  { time: '02:00', value: 110 },
  { time: '03:00', value: 108 },
  { time: '04:00', value: 125 },
  { time: '05:00', value: 135 },
  { time: '06:00', value: 145 },
  { time: '07:00', value: 165 },
  { time: '08:00', value: 180 },
  { time: '09:00', value: 195 },
  { time: '10:00', value: 210 },
  { time: '11:00', value: 205 },
  { time: '12:00', value: 198 },
  { time: '13:00', value: 190 },
  { time: '14:00', value: 185 },
  { time: '15:00', value: 175 },
  { time: '16:00', value: 165 },
  { time: '17:00', value: 155 },
  { time: '18:00', value: 145 },
  { time: '19:00', value: 135 },
  { time: '20:00', value: 130 },
  { time: '21:00', value: 125 },
  { time: '22:00', value: 120 },
  { time: '23:00', value: 118 },
];

export const errorRateData = {
  series: [
    {
      data: [
        { id: 0, value: 85, label: 'Success (2xx)' },
        { id: 1, value: 8, label: 'Client Error (4xx)' },
        { id: 2, value: 5, label: 'Server Error (5xx)' },
        { id: 3, value: 2, label: 'Timeout' },
      ],
    },
  ],
};

export const geographicDistributionData = {
  xAxis: [
    {
      scaleType: 'band' as const,
      data: ['US', 'EU', 'ASIA', 'SA', 'AF', 'OCE'],
    },
  ],
  series: [
    {
      data: [45000, 38000, 32000, 12000, 8000, 5000],
      label: 'Active Users',
      color: '#f59e0b',
    },
  ],
};
