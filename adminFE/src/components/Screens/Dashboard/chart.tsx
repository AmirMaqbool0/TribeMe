// import React from "react";
// import { Line, Bar, Pie } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartData,
//   ChartOptions,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// );

// interface DataPoint {
//   [key: string]: string | number;
// }

// interface ChartProps {
//   data: DataPoint[];
//   xKey: string;
//   yKey: string;
// }

// interface PieChartProps {
//   data: { label: string; value: number }[];
// }

// const createChartData = (
//   data: DataPoint[],
//   xKey: string,
//   yKey: string
// ): ChartData<"line" | "bar", number[], string> => ({
//   labels: data.map((d) => String(d[xKey])),
//   datasets: [
//     {
//       data: data.map((d) => Number(d[yKey])),
//       borderColor: "rgb(75, 192, 192)",
//       backgroundColor: "rgba(75, 192, 192, 0.6)",
//     },
//   ],
// });

// const chartOptions: ChartOptions<"line" | "bar"> = {
//   responsive: true,
//   scales: {
//     x: {
//       type: "category",
//       title: {
//         display: true,
//         text: "Date",
//       },
//     },
//     y: {
//       type: "linear",
//       title: {
//         display: true,
//         text: "Value",
//       },
//     },
//   },
// };

// export const LineChart: React.FC<ChartProps> = ({ data, xKey, yKey }) => {
//   const chartData = createChartData(data, xKey, yKey);
//   return <Line data={chartData} options={chartOptions} />;
// };

// export const BarChart: React.FC<ChartProps> = ({ data, xKey, yKey }) => {
//   const chartData = createChartData(data, xKey, yKey);
//   return <Bar data={chartData} options={chartOptions} />;
// };

// export const PieChart: React.FC<PieChartProps> = ({ data }) => {
//   const chartData: ChartData<"pie", number[], string> = {
//     labels: data.map((d) => d.label),
//     datasets: [
//       {
//         data: data.map((d) => d.value),
//         backgroundColor: [
//           "rgba(255, 99, 132, 0.6)",
//           "rgba(54, 162, 235, 0.6)",
//           "rgba(255, 206, 86, 0.6)",
//           "rgba(75, 192, 192, 0.6)",
//           "rgba(153, 102, 255, 0.6)",
//         ],
//       },
//     ],
//   };

//   return <Pie data={chartData} />;
// };
