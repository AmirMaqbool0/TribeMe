import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ChartData } from "chart.js";

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// interface ChartData {
//     labels: string[];
//     datasets: {
//         label: string;
//         data: number[];
//     }[];
// }

export const LineChart = ({ chartData }: { chartData: ChartData<"line", (number | [number, number])[], unknown> }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allow dynamic resizing
        plugins: {
            tooltip: { enabled: true, backgroundColor: "rgba(255, 255, 255, 0.9)", titleColor: "#313131", bodyColor: "#313131", borderColor: "#FF8C9A", borderWidth: 0.5, padding: 10 },
            legend: { display: false, },
        },
        scales: {
            x: {
                ticks: {
                    color: "#313131",
                    font: { family: "proxima", size: 12, weight: 400, lineHeight: 1.2 },
                },
                grid: { display: false },
                border: { width: 0 },
                stacked: true,
            },
            y: {
                ticks: {
                    color: "#313131",
                    stepSize: 200,
                    font: { family: "proxima", size: 12.5, weight: 400, lineHeight: 1.2 },
                },
                border: { width: 0 },
                beginAtZero: true,
                min: 0,
                max: 800,
            },
        },
        elements: {
            point: { backgroundColor: "#FF8C9A", borderColor: "#FBFBFB", borderWidth: 1.5, radius: 5.5, hoverRadius: 2, hitRadius: 10, opacity: 0.9 },
            line: { borderColor: "#FF3951", borderWidth: 3, tension: 0.4, fill: true },
        },
    };

    return <Line data={chartData} options={options} />;
};

