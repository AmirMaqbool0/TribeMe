"use client";
import React, { useState } from "react";
import Image from "next/image";
import images from "@/assets/images";
import CustomCheckbox from "@/components/component/checkBox";
import './style.css'
// NOTE: Backend integration for settings is not implemented because there is no settings endpoint in the backend (adminBE). All settings are currently local state only.
export const Settings = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [date,] = useState('04-07-2024');
    const [time,] = useState('17:46');
    const [checkboxState, setCheckboxState] = useState({ mobileRate: false, webRate: false, frequencyCapping: false, newUser: false, newRedemption: false, highValueRedemption: false, tribeSelected: false, referralBonus: false, systemAlerts: false });
    const notificationKeys = ["newUser", "newRedemption", "highValueRedemption", "tribeSelected", "referralBonus", "systemAlerts"] as const;
    type CheckboxKeys = keyof typeof checkboxState;

  // Revenue rates state
  const [revenueRates, setRevenueRates] = useState([
    { product: "Tier 1 Analytics", charge: "$0", frequency: "Monthly" },
    { product: "Tier 2 Analytics", charge: "$99", frequency: "Monthly" },
    { product: "Tier 3 Analytics", charge: "$299", frequency: "Monthly" },
    {
      product: "Deal Match Exposure",
      charge: "$0.00",
      frequency: "Per click of LIKE, DISLIKE, LEARN MORE, or IGNORE",
    },
    {
      product: "Offer Delivery",
      charge: "$0.25",
      frequency: "Per click of VIEW OFFER",
    },
    {
      product: "Offer Redemption",
      charge: "$0.56",
      frequency: "Per click of CONFIRMATION OF REDEMPTION",
    },
    {
      product: "Awareness Video",
      charge: "$0.29",
      frequency: "Per completed VIDEO VIEW",
    },
    {
      product: "Banner Ad Exposures",
      charge: "$0.0125",
      frequency: "Per banner AD EXPOSURE within Tribe Me",
    },
    {
      product: "Banner Ad Clicks",
      charge: "$0.25",
      frequency: "Per click to BANNER AD within Tribe Me",
    },
    {
      product: "Verified Redemption via Receipt or eCommerce/POS Linkage",
      charge: "0%",
      frequency: "Of retail sales amount after any discount, deal, or cashback",
    },
    {
      product: "Banner Ad Frequency / Member",
      charge: "5",
      frequency: "Editable",
    },
    {
      product: "Banner Ad Frequency / Day",
      charge: "5",
      frequency: "Editable",
    },
  ]);

  const [pointsCoins, setPointsCoins] = useState([
    {
      action: "Member's 1st Verified Redemption",
      points: "1000",
      coins: "20",
      frequency: "1st verified redemption for each user",
    },
    {
      action: "Member's Verified Redemption #2+",
      points: "500",
      coins: "2",
      frequency: "All member redemptions after the 1st",
    },
    {
      action: "Member's 1st Degree Referral Joins Tribe Me",
      points: "500",
      coins: "0",
      frequency: "Upon each referral registration confirmation",
    },
    {
      action: "Member's 2nd Degree Referral Joins Tribe Me",
      points: "250",
      coins: "0",
      frequency:
        "Upon registration confirmation of each 1st degree referral's referral",
    },
    {
      action: "Member's 1st Degree Referral Has 1st Verified Redemption",
      points: "1000",
      coins: "20",
      frequency:
        "Upon confirmation of each 1st degree referral's 1st verified redemption",
    },
    {
      action: "Member's 2nd Degree Referral Has 1st Verified Redemption",
      points: "750",
      coins: "20",
      frequency:
        "Upon confirmation of each 2nd degree referral's 1st verified redemption",
    },
    {
      action: "Member Shares a Redemption",
      points: "250",
      coins: "0",
      frequency: "Each time a member shares a redemption",
    },
    {
      action: "Member's Social Share Has 1st Verified Redemption",
      points: "500",
      coins: "10",
      frequency:
        "Upon confirmation of each member who clicked on a member's social post share, joined Tribe Me, and then made 1st redemption",
    },
    {
      action: "Member Completely Views Awareness Video",
      points: "100",
      coins: "0",
      frequency: "1st time a member completes a video view per business",
    },
  ]);

  // Function to handle checkbox state changes
  const handleCheckboxChange = (key: CheckboxKeys) => {
    setCheckboxState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  // Function to handle changes in revenue rates
  const handleRevenueRateChange = (
    index: number,
    field: "charge" | "frequency",
    value: string
  ) => {
    setRevenueRates((prevRates) => {
      const updatedRates = [...prevRates];
      updatedRates[index] = { ...updatedRates[index], [field]: value };
      return updatedRates;
    });
  };

  // Function to handle changes in points & coins
  const handlePointsCoinsChange = (
    index: number,
    field: "points" | "coins" | "frequency",
    value: string
  ) => {
    setPointsCoins((prevPointsCoins) => {
      const updatedPointsCoins = [...prevPointsCoins];
      updatedPointsCoins[index] = {
        ...updatedPointsCoins[index],
        [field]: value,
      };
      return updatedPointsCoins;
    });
  };

  return (
    // MAIN DIV
    <div className="rounded-xl">
      {/* CHILD DIV 1 */}
      <div className="flex flex-row justify-between mb-4">
        <h1 className="sm:text-[32px] text-2xl font-bold font-proxima text-Blackish">
          Settings
        </h1>

        <div className="flex items-center space-x-3 mr-5">
          <span className="text-Blackish font-proxima sm:text-[22px] text-base font-semibold leading-[32px] text-left underline decoration-skip-ink decoration-[from-font]">
            Preferences
          </span>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-10 h-5 flex items-center rounded-full p-1 ${
              isEnabled ? "bg-Red" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-primary w-4 h-4 rounded-full shadow-md transform ${
                isEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Revenue Rates Section */}
      <div className="bg-soft-gray w-full p-6 rounded-xl shadow-xl mb-6">
        <h2 className="font-proxima text-Blackish mb-4 text-[24px] font-semibold leading-[32px] text-left">
          Revenue Rates
        </h2>
        <div className="space-y-4">
          {revenueRates.map((rate, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row lg:space-x-4 items-start lg:items-center mb-4"
            >
              <span className="w-full lg:w-1/3 font-proxima text-[16px] font-semibold">
                {rate.product}
              </span>
              <input
                type="text"
                value={rate.charge}
                onChange={(e) =>
                  handleRevenueRateChange(index, "charge", e.target.value)
                }
                className="w-full lg:w-[200px] px-4 py-2 border border-[#E1E6EF] text-[#7F7F7F] font-proxima rounded-lg focus:outline-none focus:border-red-300"
              />
              <input
                type="text"
                value={rate.frequency}
                onChange={(e) =>
                  handleRevenueRateChange(index, "frequency", e.target.value)
                }
                className="w-full lg:w-[300px] mt-2 lg:mt-0 px-4 py-2 border border-[#E1E6EF] text-[#7F7F7F] font-proxima rounded-lg focus:outline-none focus:border-red-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Points & Coins Section */}
      <div className="bg-soft-gray w-full p-6 rounded-xl shadow-xl mb-6">
        <h2 className="font-proxima text-Blackish mb-4 text-[24px] font-semibold leading-[32px] text-left">
          Points & Coins
        </h2>
        <div className="space-y-4">
          {pointsCoins.map((item, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row lg:space-x-4 items-start lg:items-center mb-4"
            >
              <span className="w-full lg:w-1/3 font-proxima text-[16px] font-semibold">
                {item.action}
              </span>
              <input
                type="text"
                value={item.points}
                onChange={(e) =>
                  handlePointsCoinsChange(index, "points", e.target.value)
                }
                className="w-full lg:w-[100px] px-4 py-2 border border-[#E1E6EF] text-[#7F7F7F] font-proxima rounded-lg focus:outline-none focus:border-red-300"
              />
              <input
                type="text"
                value={item.coins}
                onChange={(e) =>
                  handlePointsCoinsChange(index, "coins", e.target.value)
                }
                className="w-full lg:w-[100px] mt-2 lg:mt-0 px-4 py-2 border border-[#E1E6EF] text-[#7F7F7F] font-proxima rounded-lg focus:outline-none focus:border-red-300"
              />
              <input
                type="text"
                value={item.frequency}
                onChange={(e) =>
                  handlePointsCoinsChange(index, "frequency", e.target.value)
                }
                className="w-full lg:w-[300px] mt-2 lg:mt-0 px-4 py-2 border border-[#E1E6EF] text-[#7F7F7F] font-proxima rounded-lg focus:outline-none focus:border-red-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CHILD DIV 2 */}
      <div className="space-y-5 ">
        {/* first div */}
        <div className="space-x-4 w-full flex flex-col space-y-2 lg:flex-row justify-center items-center ">
          {/* FIRST DIV */}
          <div className="w-full sm:w-[762px] h-[422px] sm:p-[28px_32px] sm:gap-[20px] bg-soft-gray rounded-xl shadow-xl content">
            {/* CPM Rates Section */}
            <div className="mb-6 ">
              <h2 className="font-proxima text-Blackish mb-4 h-[32px] gap-0 text-[24px] font-semibold leading-[32px] text-left">
                CPM Rates
              </h2>
              <div className="flex items-center mb-4">
                <CustomCheckbox
                  isChecked={checkboxState.mobileRate}
                  onChange={() => handleCheckboxChange("mobileRate")}
                />
                <input
                  type="text"
                  placeholder="Enter custom rate for mobile"
                  className="w-[401px] h-[46px] p-[12px_16px] gap-[13.45px]  px-4 py-2 border border-[#E1E6EF] text-[#7F7F7F] font-proxima rounded-lg focus:outline-none focus:border-red-300"
                />
              </div>

              <div className="flex items-center mb-4">
                <CustomCheckbox
                  isChecked={checkboxState.webRate}
                  onChange={() => handleCheckboxChange("webRate")}
                />
                <input
                  type="text"
                  placeholder="Enter custom rate for web"
                  className="w-[401px] h-[46px] p-[12px_16px] gap-[13.45px] px-4 py-2 border border-[#E1E6EF] text-[#7F7F7F] font-proxima rounded-lg focus:outline-none focus:border-red-300"
                />
              </div>
            </div>

            {/* Ad Frequency Section */}
            <div>
              <h2 className="font-proxima text-Blackish mb-4 h-[32px] gap-0 text-[24px] font-semibold leading-[32px] text-left">
                Ad Frequency
              </h2>

              <div className="mb-4">
                <label className="block  text-dark-gray text-[14px] font-semibold leading-[22px] text-left underline decoration-skip-ink decoration-[from-font]  h-[22px] gap-0 font-proxima mb-1">
                  {" "}
                  Maximum daily impressions{" "}
                </label>
                <select className="w-[432px] h-[48px] p-[12px_16px] gap-0 flex justify-between px-4 py-2 border border-[#E1E6EF] font-proxima text-[#7F7F7F] rounded-lg focus:outline-none focus:border-red-300">
                  <option>Choose desired value</option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              </div>

              <div className="flex items-center">
                <CustomCheckbox
                  isChecked={checkboxState.frequencyCapping}
                  onChange={() => handleCheckboxChange("frequencyCapping")}
                  label="Allow frequency capping"
                  labelClassName="h-[24px] gap-0 text-[17px]  font-normal leading-[28px] text-left text-[#4E4E4E] font-proxima"
                />
              </div>
            </div>
          </div>

          {/* SECOND DIV */}
          <div className="w-full sm:w-[762px] h-[422px] sm:p-[28px_32px] sm:gap-[20px] bg-soft-gray rounded-xl shadow-xl content">
            <h2 className="font-proxima text-Blackish mb-4 h-[32px] gap-0 text-[24px] font-semibold leading-[32px] text-left">
              Get Notified On
            </h2>
            <div className="space-y-4">
              {/* Each notification option */}
              {notificationKeys.map((key) => {
                const checkboxKey = key.charAt(0).toLowerCase() + key.slice(1);
                const formattedLabel = key
                  .replace(/([A-Z])/g, " $1")
                  .toLowerCase()
                  .replace(/^\w/, (char) => char.toUpperCase());

                return (
                  <div key={key} className="flex items-center">
                    <CustomCheckbox
                      isChecked={checkboxState[checkboxKey as CheckboxKeys]}
                      onChange={() =>
                        handleCheckboxChange(checkboxKey as CheckboxKeys)
                      }
                      label={formattedLabel}
                      labelClassName="text-[16px] font-normal leading-[28px] text-[#4E4E4E] font-proxima h-[24px] gap-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* second div */}
        <div className="">
          <div className="sm:space-x-0 w-full lg:space-x-4 flex justify-center flex-col space-y-5 lg:space-y-0 lg:flex-row">
            {/* second */}
            <div className="bg-soft-gray w-full sm:w-[762px] h-[156px] sm:p-[28px_32px] sm:gap-[20px] rounded-xl shadow-xl content">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="font-proxima text-Blackish mb-4 h-[32px] gap-0 text-[24px] font-semibold leading-[32px] text-left">
                    Sound
                  </span>
                  <span className="font-proxima h-[24px] gap-0 text-[16px] font-normal leading-[24px] text-left text-[#4E4E4E]">
                    Use sound for notifications
                  </span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-10 h-5 flex items-center rounded-full p-1 ${
                      soundEnabled ? "bg-Red" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-primary w-4 h-4 rounded-full shadow-md transform ${
                        soundEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Expiration Time */}
            <div className="bg-soft-gray  w-full sm:w-[762px] h-[156px] sm:p-[28px_32px] sm:gap-[20px] rounded-xl shadow-xl content">
              <div className="flex justify-start flex-col space-y-4">
                <h3 className="font-proxima text-Blackish h-[32px] gap-0 text-[24px] font-semibold leading-[32px] text-left">
                  Expiration Time
                </h3>
                <div className="flex space-x-4">
                  {/* Date Button */}
                  <button className="flex items-center px-4 py-2 border border-[#4E4E4E] rounded-md text-sm text-gray-700 hover:bg-gray-100">
                    <span>{date}</span>
                    <Image
                      src={images.settings.calendar}
                      alt={"Calendar"}
                      width={20}
                      height={20}
                      className="ml-4"
                    />
                  </button>

                  {/* Time Button */}
                  <button className="flex items-center justify-between px-5 py-2 border border-[#4E4E4E] rounded-md text-sm text-gray-700 hover:bg-gray-100">
                    <span>{time}</span>
                    <Image
                      src={images.settings.clock}
                      alt={"Clock"}
                      width={20}
                      height={20}
                      className="ml-4"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* FOOTER Buttons */}
          <div className="flex flex-row space-x-5">
            <div className="px-0 py-4 xl:py-4 flex justify-center items-center">
              <button
                onClick={() => console.log("RESET")}
                disabled={false}
                className="sm:w-[15vh] sm:h-[7vh] rounded-lg bg-primary text-Red border-Red border hover:bg-Red hover:text-primary text-[15px] md:text-[17px] lg:text-[17px] xl:text-[17px] leading-[6px] md:leading-[30px] lg:leading-[30px] xl:leading-[30px] px-2 py-2.5 lg:py-2 md:py-2.5 md:whitespace-nowrap text-center"
              >
                Reset
              </button>
            </div>
            <div className=" py-4 xl:py-4 flex justify-center items-center">
              <button
                onClick={() => console.log("SAVE")}
                disabled={false}
                className="sm:w-[15vh] sm:h-[7vh] bg-Red text-primary hover:bg-red-500 text-[15px] md:text-[17px] lg:text-[17px] xl:text-[17px] leading-[6px] md:leading-[30px] lg:leading-[30px] xl:leading-[30px] font-outfit px-2 py-2.5 lg:py-2   md:py-2.5 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
