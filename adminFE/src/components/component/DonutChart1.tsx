import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title, ChartOptions, Chart, TooltipItem, } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title);

ChartJS.register({
    id: 'variableThickness',
    beforeDatasetDraw(chart) {
        if ('type' in chart.config && chart.config.type === 'doughnut') {
            const { ctx, chartArea, data } = chart;
            const dataset = data.datasets[0];

            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;
            const baseRadius = Math.min(chartArea.width, chartArea.height) / 6;

            dataset.data.forEach((value, index) => {
                const meta = chart.getDatasetMeta(0).data[index] as ArcElement;
                const startAngle = meta.startAngle;
                const endAngle = meta.endAngle;

                const backgroundColors = dataset.backgroundColor as string[] | undefined;
                if (backgroundColors && Array.isArray(backgroundColors)) {
                    const color = backgroundColors[index];
                    let thickness = 0;

                    if (color === '#FF3951') thickness = 65;
                    else if (color === '#9C9C9C') thickness = 59;
                    else if (color === '#FC7900') thickness = 50;
                    else if (color === '#4C78FF') thickness = 40;

                    let innerColor = color;
                    if (color === '#FF3951') innerColor = '#FF122F';
                    else if (color === '#4C78FF') innerColor = '#2E5FF5';
                    else if (color === '#FC7900') innerColor = '#DF7412';
                    else if (color === '#9C9C9C') innerColor = '#7F7F7F';

                    const innerRadius = baseRadius;
                    const innerRingRadius = baseRadius + 5;
                    const outerRadius = baseRadius + thickness;

                    // Inner Arc with Shadow
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle);
                    ctx.arc(centerX, centerY, innerRingRadius, endAngle, startAngle, true);
                    ctx.closePath();

                    ctx.shadowBlur = 15;
                    ctx.shadowColor = innerColor;
                    ctx.fillStyle = innerColor;
                    ctx.fill();

                    ctx.shadowBlur = 0;

                    // Outer Ring with Gradient
                    const gradient = ctx.createRadialGradient(
                        centerX,
                        centerY,
                        innerRingRadius,
                        centerX,
                        centerY,
                        outerRadius
                    );
                    gradient.addColorStop(0, innerColor);
                    gradient.addColorStop(1, color);

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRingRadius, startAngle, endAngle);
                    ctx.arc(centerX, centerY, outerRadius, endAngle, startAngle, true);
                    ctx.closePath();

                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                }
            });

            return false;
        }
    },
});

// Override the default hit detection
// (ChartJS.defaults.elements.arc).hitRadius = 0;
// Example: For points in a line chart
Chart.defaults.elements.point.hitRadius = 0;



type DonutChartProps = {
    data: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor: string[];
            borderWidth?: number;
        }[];
    };
    options?: ChartOptions<'doughnut'>;
};

export const DonutChart1: React.FC<DonutChartProps> = ({ data, options }) => {
    const defaultOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true,
                // callbacks: {
                //     label: (tooltipItem: { label: string; raw: any }) =>
                //         `${tooltipItem.label}: ${tooltipItem.raw}%`,
                // },
                callbacks: {
                    label: (tooltipItem: TooltipItem<'doughnut'>) =>
                        `${tooltipItem.label}: ${tooltipItem.raw}%`,
                }

            },
            legend: { display: false },
        },
        cutout: '70%',
        hover: {
            mode: 'dataset',
            intersect: true,
        },
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    };

    return (
        <Doughnut
            data={data}
            options={{
                ...defaultOptions,
                ...options,
                onHover: (event, elements) => {
                    const canvas = event.native?.target as HTMLCanvasElement;
                    if (elements.length > 0) {
                        canvas.style.cursor = 'pointer';
                    } else {
                        canvas.style.cursor = 'default';
                    }
                },
            }}
        />
    );
};
