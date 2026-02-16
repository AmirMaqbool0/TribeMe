'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, TooltipItem } from 'chart.js';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface WaveChartProps {
    labels: string[];
    dataPoints: number[];
}

export const WaveChart: React.FC<WaveChartProps> = ({ labels, dataPoints }) => {
    const createImageFill = (ctx: CanvasRenderingContext2D) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(255, 137, 154, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        return gradient;
    };

    const data = {
        labels,
        datasets: [
            {
                label: '', data: dataPoints, borderColor: '#FF3951', backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D; }; }) => createImageFill(ctx.chart.ctx), fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest' as const, intersect: false
        },
        plugins: {
            tooltip: {
                enabled: true, backgroundColor: "rgba(255, 255, 255, 0.9)", titleColor: "#313131", bodyColor: "#313131", borderColor: "#FF3951", borderWidth: 1, padding: 10, callbacks: {
                    label: (tooltipItem: TooltipItem<"line">) => {
                        return `Retention Rate: ${tooltipItem.raw}%`;
                    },
                    title: (tooltipItems: { label: string }[]) => {
                        return tooltipItems[0]?.label || '';
                    },
                },
            },
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: true, color: '#BABABA'
                },
                ticks: {
                    color: '#131313',
                    font: {
                        family: 'proxima', size: 12, weight: 400
                    },
                },
            },
            y: {
                grid: {
                    color: "#BABABA", borderColor: '#E0E0E0 ', border: [0.5], borderWidth: 0.53
                },
                ticks: {
                    stepSize: 20,
                    color: "#313131", font: { family: "inter", size: 12, weight: 400 },
                    callback: (value: string | number) => `${value}%`
                },
                beginAtZero: true,
                max: 100,
            },
        },
    };

    return (
        <div className="relative w-full h-[250px]">
            <Line data={data} options={options} />
        </div>
    );
};

