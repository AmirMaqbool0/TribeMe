"use client";
import React, { useState, useEffect } from "react";
import { DonutChart1 } from "@/components/component/DonutChart1";

// DONUT CHART DATA
const WinningOffersCategoryData = [
  { name: "McDonald's", value: 95, color: "#FF3951" },
  { name: "Health and wellness", value: 65, color: "#4C78FF" },
  { name: "Bars", value: 70, color: "#FC7900" },
  { name: "Food truck", value: 83, color: "#9C9C9C" },
];

const WinningOffersSubCategoryData = [
  { name: "BOGO", value: 95, color: "#FF3951" },
  { name: "Discount", value: 65, color: "#4C78FF" },
  { name: "Free Item", value: 70, color: "#FC7900" },
  { name: "Cashback", value: 83, color: "#9C9C9C" },
];

// TABLE DATA
const TopBrandOffersData = [
  {
    brand: "McDonald's",
    category: "Food",
    offerAmount: "$5",
    type: "BOGO",
    experience: "Great",
    redemptionRate: "82%",
    rewardsClaimed: 178,
    redeemCity: "New York",
    redeemTribe: "Food Lovers",
  },
  {
    brand: "Starbucks",
    category: "Beverages",
    offerAmount: "$3",
    type: "Discount",
    experience: "Good",
    redemptionRate: "75%",
    rewardsClaimed: 145,
    redeemCity: "Los Angeles",
    redeemTribe: "Coffee Enthusiasts",
  },
  {
    brand: "Walmart",
    category: "Retail",
    offerAmount: "$10",
    type: "Cashback",
    experience: "Excellent",
    redemptionRate: "90%",
    rewardsClaimed: 234,
    redeemCity: "Chicago",
    redeemTribe: "Shoppers",
  },
  {
    brand: "Sephora",
    category: "Beauty",
    offerAmount: "$15",
    type: "Free Item",
    experience: "Amazing",
    redemptionRate: "88%",
    rewardsClaimed: 167,
    redeemCity: "Miami",
    redeemTribe: "Beauty Gurus",
  },
  {
    brand: "Dunkin'",
    category: "Beverages",
    offerAmount: "$2",
    type: "BOGO",
    experience: "Good",
    redemptionRate: "78%",
    rewardsClaimed: 189,
    redeemCity: "Boston",
    redeemTribe: "Donut Lovers",
  },
];

export const Offers = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/analytics/offers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch offers analytics");
        const responseData = await res.json();
        setData(responseData.data || responseData);
      } catch (err: any) {
        setError(err.message || "Error fetching offers analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use backend data if available, otherwise fall back to mock data
  const topBrandOffersData = data?.topBrandOffers || TopBrandOffersData;
  const winningOffersCategoryData = data?.winningOffersByCategory || WinningOffersCategoryData;
  const winningOffersSubCategoryData = data?.winningOffersBySubCategory || WinningOffersSubCategoryData;

  // Data for Donut Chart - WinningOffersCategoryData
  const donutChartData = {
    labels: winningOffersCategoryData.map((item: any) => item.name),
    datasets: [
      {
        data: winningOffersCategoryData.map((item: any) => item.value),
        backgroundColor: winningOffersCategoryData.map((item: any) => item.color),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="rounded-xl mb-10 offers-container">
      <div className="mb-4">
        <h1 className="sm:text-[32px] text-2xl font-bold font-proxima text-Blackish">
          Offers
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading Offers Analytics...</div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-4">{error}</div>
      ) : (
        <>
          {/* Top Brand Offers Table */}
          <div className="bg-[#F9F9F9] rounded-xl p-4 overflow-x-auto w-full sm:max-w-[1552px] h-auto sm:p-[28px_32px] sm:gap-[20px] sm:mb-8 mb-5">
            <h2 className="text-xl font-semibold text-Blackish font-proxima mb-4">
              Top Brand Offers
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-[#E6E6E6]">
                <thead>
                  <tr className="bg-[#E6E6E6] text-[#272727] font-proxima text-center text-sm sm:text-base">
                    {[
                      "Business name",
                      "Category",
                      "Amount",
                      "Type",
                      "Offer experience",
                      "Redemption rate",
                      "Rewards claimed",
                      "Redeem city",
                      "Redeem tribe",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="px-3 py-2 border font-[800] border-[#E6E6E6] text-left sm:text-center"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topBrandOffersData.map((offer: any, index: number) => (
                    <tr
                      key={index}
                      className={`text-center text-[#4E4E4E] font-proxima text-sm sm:text-base ${
                        index % 2 === 0 ? "bg-[#FDFDFD]" : "bg-[#F9F9F9]"
                      }`}
                    >
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.brand}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.category}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.offerAmount}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.type}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.experience}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.redemptionRate}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.rewardsClaimed}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.redeemCity}
                      </td>
                      <td className="border-t px-4 py-2 text-left sm:text-center">
                        {offer.redeemTribe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="flex flex-col lg:flex-row gap-6 w-full mb-8">
            {/* Winning Offers Category */}
            <div className="w-full lg:w-1/2 bg-[#F9F9F9] rounded-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-Blackish font-proxima mb-4">
                Winning Offers Category
              </h2>
              
              <div className="flex flex-col sm:flex-row sm:items-center items-center gap-6">
                {/* Chart Container */}
                <div className="w-full sm:w-1/2 aspect-square max-w-[300px]">
                  <DonutChart1 data={donutChartData} />
                </div>
                
                {/* Legend List */}
                <ul className="w-full sm:w-1/2 space-y-3">
                  {winningOffersCategoryData.map((item: any, index: number) => (
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

            {/* Winning Offers Sub Category */}
            <div className="w-full lg:w-1/2 bg-[#F9F9F9] rounded-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-Blackish font-proxima mb-4">
                Winning Offers Sub Category
              </h2>
              
              <div className="flex flex-col sm:flex-row sm:items-center items-center gap-6">
                {/* Chart Container */}
                <div className="w-full sm:w-1/2 aspect-square max-w-[300px]">
                  <DonutChart1 data={donutChartData} />
                </div>
                
                {/* Legend List */}
                <ul className="w-full sm:w-1/2 space-y-3">
                  {winningOffersSubCategoryData.map((item: any, index: number) => (
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
          </div>

          {/* Top 5 Offers of the week */}
          <div
            className="bg-soft-gray rounded-xl p-4 w-full sm:p-[28px_32px] sm:gap-[20px] top-five-offers mx-auto"
            style={{ height: "fit-content" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 w-full">
              <h2 className="text-xl sm:text-2xl font-semibold font-proxima text-Blackish mb-4 sm:mb-0 w-full sm:w-auto">
                Top 5 Offers of the Week
              </h2>

              <div className="mt-4 sm:mt-0 flex justify-center items-center w-full sm:w-auto">
                <button className="bg-[#4C78FF] text-white py-2 px-6 rounded font-proxima w-full sm:w-auto">
                  Expand to View Last 30 Days
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-auto" style={{ height: "250px" }}>
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-[#E6E6E6] text-[#272727] font-proxima text-center">
                  {[
                    "Business Name",
                    "Category",
                    "Offer Type",
                    "Offer Amount",
                    "Redemption Rate",
                    "Top Redeeming Tribe",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="px-3 py-2 text-left sm:text-center whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                  {topBrandOffersData.map((offer: any, index: number) => (
                    <tr
                      key={index}
                      className="text-center text-[#4E4E4E] font-proxima"
                    >
                      <td className="border-t px-4 py-2">{offer.brand}</td>
                      <td className="border-t px-4 py-2">{offer.category}</td>
                      <td className="border-t px-4 py-2">{offer.type}</td>
                      <td className="border-t px-4 py-2">{offer.offerAmount}</td>
                      <td className="border-t px-4 py-2">
                        {offer.redemptionRate}
                      </td>
                      <td className="border-t px-4 py-2">{offer.redeemTribe}</td>
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
