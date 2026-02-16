"use client";
import React, { useState, useEffect } from "react";
import { DonutChart1 } from "@/components/component/DonutChart1";
import { BarChart } from "@/components/component/BarChart";

// DONUT CHART DATA
const WinningOffersData = [
  { name: "McDonald's", value: 95, color: "#FF3951" },
  { name: "Health and wellness", value: 65, color: "#4C78FF" },
  { name: "Bars", value: 70, color: "#FC7900" },
  { name: "Food truck", value: 83, color: "#9C9C9C" },
];

// BAR CHART DATA
const TopOffersData = [
  { name: ["BOGO", "(McDonald's)"], value: 60, color: "#B10016" },
  { name: ["BOGO", "(Starbucks)"], value: 70, color: "#FFB7C0" },
  { name: ["BOGO", "(Walmart)"], value: 80, color: "#FF687A" },
  { name: ["BOGO", "(Sephora)"], value: 90, color: "#FF3951" },
  { name: ["BOGO", "(Dunkin's)"], value: 50, color: "#FF122F" },
];

//TABLE DATA
const brandsData = [
  {
    brand: "McDonald's",
    category: "Food",
    totalOffers: 12,
    totalRedemptions: 23,
    redemptionRate: "82%",
    rewardsClaimed: 178,
  },
  {
    brand: "McDonald's",
    category: "Food",
    totalOffers: 45,
    totalRedemptions: 23,
    redemptionRate: "82%",
    rewardsClaimed: 178,
  },
  {
    brand: "McDonald's",
    category: "Food",
    totalOffers: 16,
    totalRedemptions: 23,
    redemptionRate: "82%",
    rewardsClaimed: 178,
  },
  {
    brand: "McDonald's",
    category: "Food",
    totalOffers: 32,
    totalRedemptions: 23,
    redemptionRate: "82%",
    rewardsClaimed: 178,
  },
  {
    brand: "McDonald's",
    category: "Food",
    totalOffers: 18,
    totalRedemptions: 23,
    redemptionRate: "82%",
    rewardsClaimed: 178,
  },
];

export const Brands_KPIs = () => {
  const [selectedCategory, setSelectedCategory] = useState("Automotive");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/analytics/brand-kpis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch brand KPIs");
        const responseData = await res.json();
        setData(responseData.data || responseData);
      } catch (err: any) {
        setError(err.message || "Error fetching brand KPIs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use backend data if available, otherwise fall back to mock data
  const winningOffersData = data?.winningOffersByCategory || WinningOffersData;
  const topOffersData = data?.topOffersOfWeek || TopOffersData;
  const brandsTableData = data?.brandsOffersData || brandsData;

  // Data for Donut Chart - WinningOffersData
  const donutChartData = {
    labels: winningOffersData.map((item: any) => item.name),
    datasets: [
      {
        data: winningOffersData.map((item: any) => item.value),
        backgroundColor: winningOffersData.map((item: any) => item.color),
        borderWidth: 0,
      },
    ],
  };

  // Data for Bar Chart - topOffersData
  const barChartData = {
    labels: topOffersData.map((item: any) => Array.isArray(item.name) ? item.name.join() : item.name),
    datasets: [
      {
        label: "Redemption Rate",
        data: topOffersData.map((item: any) => item.value),
        backgroundColor: topOffersData.map((item: any) => item.color),
        borderWidth: 0,
        borderRadius: 7,
        barThickness: 40,
      },
    ],
  };

  return (
    <div className="rounded-xl mb-5 shadow-lg">
      <div className="mb-4">
        <h1 className="sm:text-[32px] text-2xl p-1 font-bold font-proxima text-Blackish">
          Brand KPIs
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading Brand KPIs...</div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-4">{error}</div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Donut Chart and Tribe List */}
            <div className="w-full lg:w-1/2 bg-[#F9F9F9] rounded-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-Blackish font-proxima mb-4">
                Winning Offers Category
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
                {/* Chart Container */}
                <div className="w-full sm:w-1/2 aspect-square max-w-[300px]">
                  <DonutChart1 data={donutChartData} />
                </div>
                
                {/* Legend List */}
                <ul className="w-full sm:w-1/2 space-y-3">
                  {winningOffersData.map((item: any, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-700">
                        {item.value}%
                      </span>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-700 font-medium">
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Top 5 Offers of the Week */}
            <div className="bg-soft-gray rounded-xl w-full lg:w-1/2 p-6">
              <h2 className="text-xl font-semibold mb-4 font-proxima text-blackish">
                Top 5 Offers of the Week
              </h2>
              <div className="mt-4 flex justify-center items-center">
                <div className="w-full h-[200px] flex justify-center items-center">
                  <BarChart data={barChartData} />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-[#F9F9F9] mt-20 rounded-xl w-full max-w-[1552px] h-auto p-6 sm:p-[28px_32px]">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold text-Blackish font-proxima">
                Brands Offers and Categories
              </h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-[#9C9C9C] rounded-md px-4 py-2 font-nunito text-[#272727] text-sm"
              >
                <option value="Food">Food</option>
                <option value="Automotive">Automotive</option>
                <option value="Bars">Bars</option>
                <option value="Health">Health</option>
              </select>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#E6E6E6]">
                  <tr className="font-proxima text-[#272727] text-[16px] sm:text-[18px] font-semibold leading-[26px] text-center">
                    {[
                      "Brand Name",
                      "Category",
                      "Total Offers",
                      "Total Redemptions",
                      "Redemption Rate",
                      "Rewards Claimed",
                    ].map((header, index) => (
                      <th key={index} className="py-2 px-4">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {brandsTableData.map((brand: any, index: number) => (
                    <tr
                      key={index}
                      className="text-center text-[#4E4E4E] font-normal text-[14px] sm:text-[16px] font-proxima"
                    >
                      <td className="border-t border-[#C9C9C9] px-4 py-2">
                        {brand.brand}
                      </td>
                      <td className="border-t border-[#C9C9C9] px-4 py-2">
                        {brand.category}
                      </td>
                      <td className="border-t border-[#C9C9C9] px-4 py-2">
                        {brand.totalOffers}
                      </td>
                      <td className="border-t border-[#C9C9C9] px-4 py-2">
                        {brand.totalRedemptions}
                      </td>
                      <td className="border-t border-[#C9C9C9] px-4 py-2">
                        {brand.redemptionRate}
                      </td>
                      <td className="border-t border-[#C9C9C9] px-4 py-2">
                        {brand.rewardsClaimed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
