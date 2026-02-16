// BAR CHART COMPONENT
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartOptions } from 'chart.js';

// Register chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

type BarChartProps = {
    data: {
        labels: string[];
        datasets: {
          label?: string;
          data: number[];
          backgroundColor: string[];
          borderWidth?: number;
          borderRadius?: number;
          barThickness?: number;
        }[];
      }
    options?: ChartOptions<'bar'>;
};

export const BarChart: React.FC<BarChartProps> = ({ data, options }) => {

    const defaultOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: { label: (tooltipItem) => `${tooltipItem.raw}%`, },
            },
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 }, color: '#4E4E4E'},
            },
            y: {
                grid: { color: '#E0E0E0', display: false, drawTicks: true },
                ticks: {
                    stepSize: 20,
                    callback: (value) => [0, 20, 60, 100].includes(value as number) ? `${value}%` : '',
                    font: { size: 12, weight: 400, family: 'proxima' },
                    color: '#313131',
                },
                title: {
                    display: true,
                    text: 'Redemption Rate',
                    font: { size: 13, weight: 400, lineHeight: 1.5, family: 'proxima' },
                    color: '#313131',
                },
            },
        },
    };

    return <Bar data={data} options={{ ...defaultOptions, ...options }} />;
};
