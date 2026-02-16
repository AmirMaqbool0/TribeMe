"use client";
import React, { useState, useEffect } from "react";
import { LineChart } from "@/components/component/LineChart1";
import { PieChart, Pie, Cell } from "recharts";
const MemberSignUpData = [
  { month: "1st", count: 0, city: "London" },
  { month: "2nd", count: 210, city: "New York" },
  { month: "3rd", count: 360, city: "Karachi" },
  { month: "4th", count: 450, city: "London" },
  { month: "5th", count: 360, city: "New York" },
  { month: "6th", count: 210, city: "Karachi" },
  { month: "7th", count: 250, city: "London" },
  { month: "8th", count: 350, city: "New York" },
  { month: "9th", count: 400, city: "Karachi" },
  { month: "10th", count: 500, city: "London" },
  { month: "11th", count: 790, city: "New York" },
];

const MemberInTopTribesData = [
  { name: "Retail", value: 95, color: "#FF3951" },
  { name: "Health and wellness", value: 65, color: "#4C78FF" },
  { name: "Bars", value: 70, color: "#FC7900" },
  { name: "Food truck", value: 83, color: "#9C9C9C" },
];

const referralActivity = [
  { activity: "Referral", members: 1200, percentage: "82%" },
  { activity: "Sharing", members: 1798, percentage: "82%" },
];

export const Member_KPIs = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All"); // For City Selection
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/analytics/member-kpis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch member KPIs");
        const responseData = await res.json();
        setData(responseData.data || responseData);
      } catch (err: any) {
        setError(err.message || "Error fetching member KPIs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use backend data if available, otherwise fall back to mock data
  const memberSignUpData = data?.memberSignUpRates || MemberSignUpData;
  const membersInTopTribesData = data?.membersInTopTribes || MemberInTopTribesData;
  const referralActivityData = data?.memberActivity || referralActivity;

  // Sort data by city
  const sortedData =
    selectedCity === "All"
      ? memberSignUpData
      : memberSignUpData.filter((item: any) => item.city === selectedCity);

  /**
   * Handles month selection change and updates the selectedMonth state.
   * @param {{ target: { value: React.SetStateAction<string>; }; }} event
   * @returns {void}
   */
  const handleMonthChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSelectedMonth(event.target.value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const filteredData =
    selectedMonth === "All"
      ? memberSignUpData
      : memberSignUpData.slice(
          0,
          Math.max(
            0,
            memberSignUpData.findIndex((item: any) => item.month === selectedMonth) -
              0
          )
        );

  // Dynamically generate chart data
  const lineChartData = {
    labels: filteredData.map((item) => item.month),
    datasets: [
      {
        label: "Sign Ups",
        data: filteredData.map((item) => item.count),
      },
    ],
  };

  // Data for Donut Chart - WinningOffersData
  // Extract colors for chart segments
  const COLORS = membersInTopTribesData.map((item: any) => item.color);
  return (
    <div className="rounded-xl mb-5 shadow-lg">
      {/* Member KPIs */}
      <div className="mb-4">
        <h1 className="sm:text-[32px] text-2xl p-1 font-bold font-proxima text-Blackish">
          Member KPIs
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading Member KPIs...</div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-4">{error}</div>
      ) : (
        <>
          <div className="w-full flex flex-wrap lg:flex-nowrap items-start justify-between lg:gap-5 gap-3">
  {/* Left Section: Line Chart */}
  <div className="flex flex-col gap-3 lg:w-[53%] w-full">
    <div className="bg-soft-gray rounded-xl p-4 lg:p-[28px_32px] sign-up-rates h-full w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] lg:text-[24px] font-semibold font-proxima text-blackish">
          Member Sign Up Rates
        </h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="p-2 border bg-[#FCFDFD] border-[#9C9C9C] rounded text-[#272727] text-sm outline-none"
          >
            <option value="All">All Cities</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
            <option value="Karachi">Karachi</option>
          </select>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="p-2 border bg-[#FCFDFD] border-[#9C9C9C] rounded text-[#272727] text-sm outline-none"
          >
            <option value="All">All Months</option>
            {sortedData.map((item: any) => (
              <option key={item.month} value={item.month}>
                {item.month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-center h-[200px] lg:h-[calc(100%-50px)] mt-4">
        <div className="relative w-full h-full">
          <LineChart chartData={lineChartData} />
        </div>
      </div>
    </div>
  </div>

  {/* Right Section: Pie Chart */}
  <div className="flex flex-col lg:w-[45%] w-full bg-soft-gray rounded-xl p-4 lg:p-[28px_32px] h-full">
    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 items-center w-full h-full">
      {/* Pie Chart */}
      <div className="flex justify-center lg:w-1/2 w-full lg:h-full">
        <PieChart width={200} height={200}>
          <Pie
            data={membersInTopTribesData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {membersInTopTribesData.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </div>

      {/* Legend */}
      <div className="flex flex-col space-y-2 lg:w-1/2 w-full lg:mt-0 mt-4">
        {membersInTopTribesData.map((item: any, idx: number) => (
          <div
            className="flex items-center justify-between"
            key={idx}
          >
            <div className="flex items-center space-x-2">
              <span
                className="w-4 h-4 border-4 rounded-full"
                style={{ borderColor: item.color }}
              />
              <span className="text-sm text-gray-700 font-medium">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-sm text-gray-700">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>



      {/* Member Referral and Sharing Activity */}
      <div className="bg-[#F9F9F9] mt-20 rounded-xl w-full max-w-[1552px] h-auto p-6 md:p-[28px_32px] gap-5 overflow-hidden">
  <h2 className="text-lg md:text-xl font-semibold text-blackish font-proxima mb-4">
    Member Activity
  </h2>
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse">
      <thead className="bg-[#E6E6E6]">
        <tr className="font-proxima text-[#272727]">
          {["Tribe Name", "Number of Members", "Interest Type"].map(
            (header, index) => (
              <th
                key={index}
                className={`py-3 px-4 ${
                  index === 0
                    ? "text-left"
                    : "text-center"
                }`}
              >
                {header}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {referralActivityData.map((tribe: any, index: number) => (
          <tr
            key={index}
            className="font-proxima text-[#4E4E4E] even:bg-[#F2F2F2] odd:bg-white"
          >
            <td className="border-t border-[#C9C9C9] px-4 py-3 text-left text-[14px] md:text-[16px]">
              {tribe.activity}
            </td>
            <td className="border-t border-[#C9C9C9] px-4 py-3 text-center text-[14px] md:text-[16px]">
              {tribe.members}
            </td>
            <td className="border-t border-[#C9C9C9] px-4 py-3 text-center text-[14px] md:text-[16px]">
              {tribe.percentage}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


      {/* Redeeming */}
      {/* <div className="bg-[#F9F9F9] rounded-xl w-full max-w-[1552px] h-auto p-[28px_32px] gap-[20px]">
        <h2 className="text-xl font-semibold text-Blackish font-proxima mb-2">
          Redeeming
        </h2>
        <div>
          <h3 className="font-proxima text-[#272727] font-semibold text-base mb-2">
            LIST OF TOP 100 REFERRING MEMBERS based on their Total # of 1st
            Degree Referrals + Total # 2nd Degree Referrals
          </h3>
          <div>
            <p className="font-proxima text-[#4E4E4E] text-base">
              AVG TIME (SECONDS) SPEND ON APP PER MEMBER PER WEEK
            </p>
            <p className="font-proxima text-[#4E4E4E] text-base">
              AVG TIME (SECONDS) SPEND ON APP PER SESSION
            </p>
            <p className="font-proxima text-[#4E4E4E] text-base">
              AVG # OF SESSIONS PER MEMBER PER WEEK
            </p>
            <p className="font-proxima text-[#4E4E4E] text-base">
              % OF MEMBERS WITH A REDEMPTION
            </p>
            <p className="font-proxima text-[#4E4E4E] text-base">
              % OF MEMBERS WITH 2+ REDEMPTIONS
            </p>
            <p className="font-proxima text-[#4E4E4E] text-base">
              % OF MEMBERS WITH 3+ REDEMPTIONS
            </p>
            <p className="font-proxima text-[#4E4E4E] text-base">
              AVG # OF REDEMPTIONS PER MEMBER
            </p>
          </div>
        </div>
      </div> */}
        </>
      )}
    </div>
  );
};
