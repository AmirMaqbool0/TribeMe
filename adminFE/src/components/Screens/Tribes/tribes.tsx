"use client";
import React, { useState, useEffect } from "react";
import { DonutChart1 } from "@/components/component/DonutChart1";

// DONUT CHART DATA
const TopTribesData = [
  { name: "Food Lovers", value: 35, color: "#FF3951" },
  { name: "Coffee Enthusiasts", value: 25, color: "#4C78FF" },
  { name: "Fitness Freaks", value: 20, color: "#FC7900" },
  { name: "Tech Geeks", value: 15, color: "#9C9C9C" },
  { name: "Art Lovers", value: 5, color: "#FFB7C0" },
];

// TRENDING TRIBES DATA
const TrendingTribesData = [
  {
    name: "Food Lovers",
    members: 1250,
    interest: "Food & Dining",
    categories: "Restaurants, Fast Food",
    subCategories: "Pizza, Burgers, Sushi",
  },
  {
    name: "Coffee Enthusiasts",
    members: 890,
    interest: "Beverages",
    categories: "Coffee Shops, Cafes",
    subCategories: "Espresso, Latte, Cappuccino",
  },
  {
    name: "Fitness Freaks",
    members: 756,
    interest: "Health & Fitness",
    categories: "Gyms, Yoga Studios",
    subCategories: "CrossFit, Pilates, Running",
  },
  {
    name: "Tech Geeks",
    members: 634,
    interest: "Technology",
    categories: "Electronics, Software",
    subCategories: "Gaming, Programming, AI",
  },
  {
    name: "Art Lovers",
    members: 445,
    interest: "Arts & Culture",
    categories: "Museums, Galleries",
    subCategories: "Painting, Sculpture, Photography",
  },
];

// ALL TRIBES DATA
const AllTribesData = [
  {
    name: "Food Lovers",
    members: 1250,
    interest: "Food & Dining",
    cities: ["New York", "Los Angeles", "Chicago", "Miami", "Boston", "Seattle", "Austin", "Denver", "Portland", "San Francisco"],
  },
  {
    name: "Coffee Enthusiasts",
    members: 890,
    interest: "Beverages",
    cities: ["Seattle", "Portland", "San Francisco", "New York", "Boston", "Austin", "Denver", "Chicago", "Los Angeles", "Miami"],
  },
  {
    name: "Fitness Freaks",
    members: 756,
    interest: "Health & Fitness",
    cities: ["Los Angeles", "Miami", "New York", "Austin", "Denver", "Portland", "Seattle", "San Francisco", "Chicago", "Boston"],
  },
  {
    name: "Tech Geeks",
    members: 634,
    interest: "Technology",
    cities: ["San Francisco", "Seattle", "Austin", "New York", "Boston", "Denver", "Portland", "Los Angeles", "Chicago", "Miami"],
  },
  {
    name: "Art Lovers",
    members: 445,
    interest: "Arts & Culture",
    cities: ["New York", "Los Angeles", "Chicago", "Miami", "Boston", "San Francisco", "Seattle", "Portland", "Austin", "Denver"],
  },
  {
    name: "Music Lovers",
    members: 389,
    interest: "Music",
    cities: ["Nashville", "Austin", "Los Angeles", "New York", "Chicago", "Miami", "Seattle", "Portland", "San Francisco", "Boston"],
  },
  {
    name: "Book Worms",
    members: 312,
    interest: "Literature",
    cities: ["New York", "Boston", "Chicago", "Los Angeles", "Seattle", "Portland", "San Francisco", "Austin", "Denver", "Miami"],
  },
  {
    name: "Pet Lovers",
    members: 298,
    interest: "Pets & Animals",
    cities: ["Los Angeles", "Miami", "New York", "Chicago", "Austin", "Seattle", "Portland", "San Francisco", "Boston", "Denver"],
  },
];

type Tribe = {
  name: string;
  members: number;
  interest: string;
  cities: string[];
};

export const Tribes = () => {
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [expandedTribes, setExpandedTribes] = useState<{ [key: string]: boolean }>({});
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/analytics/tribes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tribes analytics");
        const responseData = await res.json();
        setData(responseData.data || responseData);
      } catch (err: any) {
        setError(err.message || "Error fetching tribes analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use backend data if available, otherwise fall back to mock data
  const topTribesDataDynamic = data?.topTribesByMemberCount || TopTribesData;
  const trendingTribesDataDynamic = data?.trendingTribes || TrendingTribesData;
  const allTribesDataDynamic = data?.allTribes || AllTribesData;

  const toggleExpand = (tribeName: string) => {
    setExpandedTribes(prev => ({
      ...prev,
      [tribeName]: !prev[tribeName]
    }));
  };

  // Transform topTribesData to match the chart.js data structure
  const donutChartData = {
    labels: topTribesDataDynamic.map((item: any) => item.name),
    datasets: [
      {
        data: topTribesDataDynamic.map((item: any) => item.value),
        backgroundColor: topTribesDataDynamic.map((item: any) => item.color),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="rounded-lg mb-5">
      <div className="mb-4">
        <h1 className="sm:text-[32px] text-2xl p-1 font-bold font-proxima text-Blackish">
          Tribes
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading Tribes Analytics...</div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-4">{error}</div>
      ) : (
        <>
          {/* Top Sections Container */}
          <div className="flex flex-col lg:flex-row gap-5 w-full mb-5">
            {/* Members Per Tribe */}
            <div className="w-full lg:w-1/2 bg-[#F9F9F9] rounded-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-Blackish font-proxima mb-4">
                Members Per Tribe
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
                {/* Chart Container */}
                <div className="w-full sm:w-1/2 aspect-square max-w-[300px]">
                  <DonutChart1 data={donutChartData} />
                </div>
                
                {/* Legend List */}
                <ul className="w-full sm:w-1/2 space-y-3">
                  {topTribesDataDynamic.map((item: any, index: number) => (
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

            {/* Trending Tribes */}
            <div className="bg-soft-gray rounded-xl p-4 lg:p-7 w-full lg:w-[55%] h-auto lg:h-[331px]">
              <h2 className="text-xl font-semibold mb-4 font-proxima text-Blackish">
                Trending Tribes
              </h2>
              <div className="overflow-x-auto h-[90%] side-bar">
                <div className="max-h-[220px] sm:max-h-[240px] overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 bg-[#E6E6E6]">
                      <tr className="text-[#272727] font-proxima">
                        {["Tribe Name", "Number of Members", "Interest Type", "Categories", "Sub Categories"].map((header, index) => (
                          <th key={index} className="px-2 py-2 text-center whitespace-nowrap text-sm">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trendingTribesDataDynamic.map((tribe: any, index: number) => (
                        <tr key={index} className="font-proxima text-[#4E4E4E] text-center">
                          <td className="border-t px-4 py-2 whitespace-nowrap">{tribe.name}</td>
                          <td className="border-t px-4 py-2 whitespace-nowrap">{tribe.members}</td>
                          <td className="border-t px-4 py-2 whitespace-nowrap">{tribe.interest}</td>
                          <td className="border-t px-4 py-2 whitespace-nowrap">{tribe.categories}</td>
                          <td className="border-t px-4 py-2 whitespace-nowrap">{tribe.subCategories}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* All Tribes Table */}
          <div className="bg-[#F9F9F9] mt-8 lg:mt-20 rounded-xl w-full p-4 lg:p-7">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-Blackish font-proxima">
                All Tribes
              </h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto border border-[#9C9C9C] rounded-md px-4 py-2 font-nunito text-[#272727] text-sm"
              >
                <option value="Food">Food</option>
                <option value="Automotive">Automotive</option>
                <option value="Bars">Bars</option>
                <option value="Health">Health</option>
              </select>
            </div>
            
            <div className="overflow-x-auto side-bar">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-[#E6E6E6]">
                    <tr className="font-proxima text-[#272727]">
                      <th className="py-2 px-4 text-left whitespace-nowrap">Tribe Name</th>
                      <th className="py-2 px-4 text-center whitespace-nowrap">Number of Members</th>
                      <th className="py-2 px-4 text-center whitespace-nowrap">Interest Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTribesDataDynamic.map((tribe: any, index: number) => (
                      <React.Fragment key={index}>
                        <tr className="font-proxima text-[#4E4E4E]">
                          <td className="border-t border-[#C9C9C9] px-4 py-2 font-proxima text-[16px] font-normal leading-[24px] text-left">
                            {tribe.name}
                          </td>
                          <td className="border-t border-[#C9C9C9] px-4 py-2 font-proxima text-[16px] font-normal leading-[24px] text-center">
                            {tribe.members}
                          </td>
                          <td className="border-t border-[#C9C9C9] px-4 py-2 font-proxima text-[16px] font-normal leading-[24px] text-center">
                            {tribe.interest}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-4 py-2">
                            <button
                              onClick={() => toggleExpand(tribe.name)}
                              className="text-blue-500 hover:underline w-full text-center"
                            >
                              {expandedTribes[tribe.name] ? "Hide Cities" : "See Top 10 Cities"}
                            </button>
                            {expandedTribes[tribe.name] && (
                              <ul className="mt-2 text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                {tribe.cities.map((city, index) => (
                                  <li key={index} className="text-center">{city}</li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
