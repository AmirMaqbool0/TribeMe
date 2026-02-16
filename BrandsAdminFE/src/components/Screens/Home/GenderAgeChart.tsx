// "use client"
import React from "react";
import { PieChart, Pie, Cell } from "recharts";

interface GenderAgeChartProps {
  data: { name: string; percentage: number; color: string }[];
}

const GenderAgeChart: React.FC<GenderAgeChartProps> = ({ data }) => {
  const COLORS = data.map((item) => item.color);

  return (
    <div className="flex items-center space-x-8">
      <div className="flex justify-center">
        <PieChart width={120} height={120}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="percentage"
            // id="pie"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="flex flex-col space-y-4 w-[50%] ">
        {data.map((item, idx) => (
          <div className="flex items-center justify-between space-x-4" key={idx}>
            <div className="flex items-center space-x-2">
              <span
                className="w-4 h-4 border-4 rounded-full"
                style={{ borderColor: item.color }}
              />
              <span className="text-sm text-eerie-black font-cairo">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-sm text-eerie-black font-cairo">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderAgeChart;
