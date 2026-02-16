'use client';
import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// Props for reusability
interface LineChartProps {
    labels: string[];
    data: number[];
}

export const LineChart: React.FC<LineChartProps> = ({ labels, data }) => {
    // Chart data structure
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Churn Rate",
                data: data,
            },
        ],
    };


    // Chart configuration
    const options = {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true, backgroundColor: "rgba(255, 255, 255, 0.9)", titleColor: "#313131", bodyColor: "#313131", borderColor: "#FF3951", borderWidth: 1, padding: 10,
            },
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: { color: "#BABABA", border: [5, 5], borderWidth: 0.4, },
                ticks: {
                    color: "#313131",
                    font: { family: "inter", color: '#131313', size: 12, weight: 400 },
                },
                offset: true,
            },
            y: {
                grid: { color: "#BABABA", border: [0.5], borderWidth: 0.53, },
                ticks: {
                    stepSize: 20,
                    color: "#313131",
                    font: { family: "inter", size: 12, weight: 400 },
                    callback: (tickValue: string | number) => `${tickValue}%`,
                },
                beginAtZero: true,
                max: 100,
            },
        },
        elements: {
            point: {
                backgroundColor: "#FBFBFB", borderColor: "#FF3951", borderWidth: 2, radius: 4, hoverRadius: 4,
            },
            line: {
                borderColor: "#FF3951", borderWidth: 2.5, tension: 0.1, fill: false,
            },
        },
    };



    return (
        <div className="w-full h-[250px] ">
            <Line data={chartData} options={options} />
        </div>
    );
};
