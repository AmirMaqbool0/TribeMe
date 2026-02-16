"use client";
import images from "@/src/assets/images";
import Image from "next/image";
import React, { useState } from "react";
import "./style.css";
import { downloadFile } from "@/redux/CSVDownload";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandDetails, selectBrandDetails, selectBrandStatus, selectBrandError, } from "../../../../redux/brandSlice";
// import { fetchBrandDetails, selectBrandDetails, } from '../../../../redux/brandSlice';
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import axios from "axios";
import Cookies from 'js-cookie';
const GenderAgeChart = dynamic(() => import('./GenderAgeChart'), { ssr: false });

// Define subscription type
interface SubscriptionData {
  id: string;
  status: string;
  retryCount: number;
  nextRenewalDate: string;
  lastPaymentAttempt: string;
  subscriptionPlan: {
    tier: string;
  };
  brand: {
    id: string;
  };
}

export default function Home() {
  const [showSubscriptionCard, setShowSubscriptionCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionData | null>(null);
  const [showFailureBanner, setShowFailureBanner] = useState(false);
  
  const handleManageSubscription = () => {
    setShowSubscriptionCard((prev) => !prev);
  };

  const dispatch = useDispatch<AppDispatch>();
  const { loading, errorcsv, success } = useSelector((state: any) => state.file);
  const brandDetails = useSelector(selectBrandDetails);
  const status = useSelector((state: RootState) => selectBrandStatus(state));
  const error = useSelector((state: RootState) => selectBrandError(state));
  
  useEffect(() => {
    setIsLoading(true); // Ensure loading state is active on mount
    dispatch(fetchBrandDetails()).finally(() => {
      setIsLoading(false); // Set loading to false after fetching
    });
  }, [dispatch]);

  // Check subscription status
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!brandDetails?.id) return;
      
      try {
        const authToken = Cookies.get('authToken');
        const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_URI;
        
        const response = await axios.get(`${BASE_API_URL}/brand/getBrandSubscription?brandId=${brandDetails.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const subscription = (response.data as any).data as SubscriptionData;
        setSubscriptionStatus(subscription);
        
        // Show banner if subscription is past_due
        if (subscription && subscription.status === 'past_due') {
          setShowFailureBanner(true);
        }
      } catch (err) {
        // No subscription found or other error - don't show banner
        setSubscriptionStatus(null);
      }
    };

    if (brandDetails?.id) {
      checkSubscriptionStatus();
    }
  }, [brandDetails]);

  const handleDownload = () => {
    dispatch(downloadFile())
      .unwrap()
      .then(() => console.log('File downloaded successfully'))
      .catch((err) => console.error('Error downloading file:', err));
  };

  return (
    // MAIN DIV
    <div className="grid grid-cols-1 items-center justify-center font-outfit p-1 w-full gap-7">
      {/* Subscription Failure Banner */}
      {showFailureBanner && subscriptionStatus && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 border border-red-400 p-6 mb-6 rounded-2xl shadow-xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/5"></div>
          
          <div className="relative flex items-start">
            {/* Icon */}
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white font-outfit mb-2">
                Payment Failed - {subscriptionStatus.subscriptionPlan?.tier}
              </h3>
              <div className="text-white/90 font-proxima space-y-2">
                <p className="text-sm">
                  Your subscription payment has failed. 
                  {subscriptionStatus.retryCount > 0 && (
                    <span className="font-semibold"> This is attempt {subscriptionStatus.retryCount} of 3.</span>
                  )}
                </p>
                {subscriptionStatus.nextRenewalDate && (
                  <div className="bg-white/10 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium">
                      Next retry: {new Date(subscriptionStatus.nextRenewalDate).toLocaleDateString()} at {new Date(subscriptionStatus.nextRenewalDate).toLocaleTimeString()}
                    </p>
                  </div>
                )}
                {subscriptionStatus.lastPaymentAttempt && (
                  <p className="text-xs opacity-75">
                    Last attempt: {new Date(subscriptionStatus.lastPaymentAttempt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex-shrink-0 ml-4 flex flex-col space-y-2">
              <button
                onClick={() => window.location.href = '/subscription'}
                className="bg-white hover:bg-gray-100 text-red-600 font-semibold text-sm px-4 py-2 rounded-xl transition duration-200 transform hover:scale-105 shadow-lg font-outfit"
              >
                Fix Payment
              </button>
              <button
                onClick={() => setShowFailureBanner(false)}
                className="text-white/80 hover:text-white text-sm font-medium px-3 py-1 rounded-lg transition duration-200 font-proxima"
              >
                Dismiss
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      )}

      {/* DIV 1 */}
      <div className="grid grid-cols-1 w-full justify-between items-center relative">
        {/* UP */}
        <div className="w-full p-5 bg-Red rounded-t-3xl justify-end flex items-center text-primary text-3xl h-full">
          {/* Content */}
          {isLoading || status === "loading" ? (
            <div className="w-48 h-6 bg-gray-300 animate-pulse rounded"></div>
          ) : subscriptionStatus ? (
            <p className="text-cultured text-base py-5">
              {subscriptionStatus.subscriptionPlan?.tier || 'No Subscription'}
            </p>
          ) : (
            <p className="text-cultured text-base py-5">
              No Subscription
            </p>
          )}
        </div>

        {/* Rounded Image Positioned at Center */}
        <div className="">
          {isLoading || status === "loading" ? (
            // Loading Skeleton
            <div className="absolute left-14 sm:left-5 sm:top-[20%] lg:translate-x-9 lg:-translate-y-1 transform -translate-x-1/5 top-[13%] z-10">
              <div className="w-24 h-24 rounded-full bg-gray-300 animate-pulse"></div>
            </div>
          ) : (
            // Loaded Content
            <div className="absolute left-14 sm:left-5 sm:top-[20%] lg:translate-x-9 lg:-translate-y-1 transform -translate-x-1/5 top-[13%] z-10">
              <div className="w-24 h-24 rounded-full overflow-hidden Image">
                <img
                  src={
                    brandDetails?.images?.[0]?.url || images.liveOffers.donald
                  }
                  alt="Image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
                {/* Edit Icon Positioned at Bottom-Right */}
                <div className="absolute bottom-0 -right-7 rounded-full p-1">
                  <Image
                    src={images.home.edit}
                    alt="Edit Icon"
                    width={25}
                    height={25}
                  />
                </div>
              </div>
            </div>
          )}
          {/* {error && <p className="text-red-500">Error: {error}</p>} */}
        </div>
        {/* DOWN */}
        <div className="bg-primary border-Red border gap-0 p-5 w-full rounded-b-3xl">
          <div className="sm:grid-cols-[2fr_1fr] grid grid-cols-1 sm:gap-5 xl:grid-cols-2">
            {/* Left Section */}
            <div className="p-5 sm:p-0 xl:col-span-1 ">
              <div className="flex flex-row sm:justify-start justify-center w-full gap-4 ">
                {/* DIV 1 */}
                <div className="sm:mt-7 mt-8 lg:pl-9 sm:pl-0  flex flex-col text-center sm:text-left w-[80%] rounded-bl-3xl ">
                  <div className="flex flex-row gap-2 items-center sm:justify-start justify-center space-y-2">
                    {/* Title */}
                    <div className="">
                      {isLoading || status === "loading" ? (
                        <div className="w-48 h-8 bg-gray-300 animate-pulse rounded"></div>
                      ) : (
                        <h1 className="text-3xl font-extrabold font-outfit heading">
                          {brandDetails?.businessName || "McDonald's"}
                        </h1>
                      )}
                    </div>
                    {/* Edit Image */}
                    <div className="cursor-pointer">
                      <Image
                        src={images.home.edit}
                        alt="Edit Brand"
                        width={25}
                        height={25}
                      />
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="">
                    {isLoading || status === "loading" ? (
                      <div className="w-48 h-4 mt-2 bg-gray-300 animate-pulse rounded"></div>
                    ) : (
                      <p className="font-outfit text-[14px] font-[500]">
                        Registered at{" "}
                        {brandDetails?.createdAt
                          ? new Date(
                            brandDetails.createdAt
                          ).toLocaleDateString()
                          : "July 10, 2024"}{" "}
                      </p>
                    )}
                  </div>
                </div>

                {/* SEPARATOR */}
                <div className="w-[5px] bg-[#D2D2D2] mx-1 h-[90px] mt-3"></div>

                {/* DIV 2 */}
                <div className="flex flex-col w-full text-center sm:text-left  mt-3">
                  <div className="flex flex-col gap-0 justify-center items-center sm:items-start">
                    <Image
                      src={images.home.heart}
                      alt="Heart Icon"
                      width={100}
                      height={100}
                      className="w-7 h-7 "
                    />
                    {/* Title */}
                    <h1 className="text-3xl font-semibold text-space-cadet heading">
                      1,124,653
                    </h1>
                  </div>

                  {/* Subtitle */}
                  <p className="text-lg mt-[-10px] text-[14px] font-[500]">
                    Likes
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="sm:text-right xl:col-span-1 text-center justify-end flex flex-col gap-2 ">
              {isLoading || status === "loading" ? (
                <>
                  <div className="w-48 h-4 bg-gray-300 animate-pulse rounded mb-2"></div>
                  <div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div>
                </>
              ) : subscriptionStatus ? (
                <>
              <strong className="text-spanish-gray font-outfit font-[500]">
                    {subscriptionStatus.status === 'active' && subscriptionStatus.nextRenewalDate
                      ? `Next invoice: ${new Date(subscriptionStatus.nextRenewalDate).toLocaleDateString()}`
                      : subscriptionStatus.status === 'past_due' && subscriptionStatus.nextRenewalDate
                        ? `Next retry: ${new Date(subscriptionStatus.nextRenewalDate).toLocaleDateString()}`
                        : 'No upcoming invoice'}
              </strong>
                  <p className="font-outfit">
                    {subscriptionStatus.subscriptionPlan?.tier || 'No Plan'}
                    {subscriptionStatus.status === 'active' && subscriptionStatus.nextRenewalDate && (
                      <>
                        {` renewal on ${new Date(subscriptionStatus.nextRenewalDate).toLocaleDateString()}`}
                      </>
                    )}
                  </p>
              <div className="flex sm:justify-end sm:items-center justify-center items-center">
                <Link
                      href={"/subscription"}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <button className="bg-Red hover:bg-primary hover:border-dashed hover:border-Red flex items-center justify-center hover:text-Red text-primary border rounded-lg p-2 text-xs lg:text-sm font-outfit w-full sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[30%] gap-2 whitespace-nowrap">
                    <Image
                      src={images.home.subsbutton}
                      alt="Icon"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    Manage Subscription
                  </button>
                </Link>
              </div>
                </>
              ) : (
                <>
                  <strong className="text-spanish-gray font-outfit font-[500]">
                    No active subscription
                  </strong>
                  <p className="font-outfit">Subscribe to unlock features</p>
                  <div className="flex sm:justify-end sm:items-center justify-center items-center">
                    <Link
                      href={"/subscription"}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "end",
                      }}
                    >
                      <button className="bg-Red hover:bg-primary hover:border-dashed hover:border-Red flex items-center justify-center hover:text-Red text-primary border rounded-lg p-2 text-xs lg:text-sm font-outfit w-full sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[30%] gap-2 whitespace-nowrap">
                        <Image
                          src={images.home.subsbutton}
                          alt="Icon"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        Subscribe
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DIV 2 */}
      <div className="flex font-proxima gap-5 text-alice-blue w-full h-[90.42%] overflow-x-auto analytics-boxes">
        {/* WIDGET 1 */}
        <div className="bg-Red rounded-[18.64px] grid gap-0 place-content-center grid-cols-[2fr_1fr] min-w-[250px] h-[100%] p-5  widget-box">
          <div className="font-medium text-sm leading-4">
            <p className="">Total Redemption</p>
            <p className="">Rate</p>
            <h1 className="font-bold leading-6 text-[22.37px] text-primary font-dm-sans">
              540.50%
            </h1>
          </div>
          {/* IMAGE */}
          <div className="flex items-center justify-center w-full h-full ">
            <Image
              src={images.home.chart}
              alt="Line Chart"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full object-cover"
              priority
            />
          </div>
        </div>

        {/* WIDGET 2 */}
        <div className="bg-primary text-wild-blue-younder place-content-center rounded-[18.64px] grid gap-0 grid-cols-[2fr_1fr] min-w-[250px] h-[100%] p-5 widget-box">
          <div className="font-medium text-sm leading-4">
            <p className="font-dm-sans">Return On</p>
            <p className="font-dm-sans">Investment</p>
            <h1 className="font-[600] leading-6 text-[22.37px] text-space-cadet font-dm-sans">
              $682.5
            </h1>
          </div>
          {/* IMAGE */}
          <div className="place-items-center mt-1">
            <Image src={images.home.bar2} width={55} height={55} alt="Bars" />
          </div>
        </div>

        {/* WIDGET 3 */}
        <div className="bg-primary text-wild-blue-younder place-content-center rounded-[18.64px] grid gap-0 grid-cols-[1fr_2fr] min-w-[250px] h-[100%] p-5 widget-box">
          <div className="div">
            <Image
              src={images.home.bar1}
              width={50}
              height={50}
              alt="Bar"
              className=""
              priority
            />
          </div>
          <div className="font-medium text-sm leading-4">
            <p className="font-dm-sans">Total Cost Of</p>
            <p className="">Redeemed</p>
            <h1 className="font-bold leading-6 text-[22.37px] text-space-cadet font-dm-sans">
              $350.40
            </h1>
          </div>
        </div>

        {/* WIDGET 4 */}
        <div className="bg-Red rounded-[18.64px] grid gap-0 place-content-center grid-cols-[2fr_1fr] min-w-[250px] place-items-center h-[100%] p-5 widget-box">
          <div className="font-medium text-base leading-4 whitespace-nowrap">
            <p className="mt-1 font-dm-sans">Total Offers Sent</p>
            <h1 className="font-bold leading-9 text-[22.37px] text-primary font-dm-sans">
              50
            </h1>
          </div>
          {/* IMAGE */}
          <div className="flex items-center justify-center w-full h-full">
            <Image
              src={images.home.chart}
              alt="Line Chart"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full object-contain"
              priority
            />
          </div>
        </div>

        {/* WIDGET 5 */}
        <div className="bg-primary text-wild-blue-younder place-content-center rounded-[18.64px] grid gap-0 grid-cols-[1fr_2fr] min-w-[250px] h-[100%] p-5 widget-box">
          {/* IMAGE */}
          <div className="">
            <Image
              src={images.home.bar1}
              width={50}
              height={50}
              alt="Bar"
              className=""
              priority
            />
          </div>
          <div className="font-medium text-base whitespace-nowrap leading-4 mt-1">
            <p className="font-dm-sans">Total Fee For Delivery</p>
            <h1 className="font-bold leading-9 text-[22.37px] text-space-cadet font-dm-sans">
              $350.40
            </h1>
          </div>
        </div>

        {/* WIDGET 6 */}
        <div className="bg-Red rounded-[18.64px] place-content-center grid gap-2 grid-cols-[2fr_1fr] h-[100%] min-w-[250px] p-5 widget-box">
          <div className="font-medium text-sm leading-4">
            <p className="font-dm-sans">Total Fee Of</p>
            <p className="">Redemption</p>
            <h1 className="font-bold leading-6 text-[22.37px] text-primary font-dm-sans">
              $540.50
            </h1>
          </div>
          {/* IMAGE */}
          <div className="flex items-center justify-center w-full h-full">
            <Image
              src={images.home.chart}
              alt="Line Chart"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* DIV 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 text-primary text-2xl h-[100%]">
        {/* Left Section */}
        <div className="order-2 sm:order-1 lg:col-span-2 text-black grid grid-cols-1 gap-4">
          {/* Brand Details & Subscription Cards */}
          <div
            className={`w-full grid grid-cols-1 lg:grid-cols-2 gap-4 ${!showSubscriptionCard && "lg:grid-cols-2"
              }`}
          >
            {/* Brand Details Card */}
            <div
              className={`bg-primary grid grid-rows-[auto_1fr] rounded-2xl drop-shadow-lg shadow-lg p-5 w-full gap-5 h-[330px] ${!showSubscriptionCard && "lg:col-span-2"
                }`}
            >
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto] items-center p-2 rounded-lg ">
                <h2 className="text-xl font-[600] tracking-[-0.01em]">
                  Brand Details
                </h2>
                <div className="cursor-pointer">
                  <Image
                    src={images.home.edit}
                    alt="Edit Brand"
                    width={22}
                    height={22}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 rounded-lg p-2 gap-4">
                <div className="grid grid-cols-2">
                  <span className="text-spanish-gray text-base">
                    Brand Name
                  </span>
                  <span className="text-raisin-black text-base">
                    {brandDetails?.businessName || "McDonald's"}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-spanish-gray text-base">
                    Brand Website URL
                  </span>
                  <a
                    href={brandDetails?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-facebook-blue underline overflow-hidden text-ellipsis max-w-xs sm:max-w-full text-base"
                  >
                    {brandDetails?.website || "https://www.mcdonalds.com/"}
                  </a>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-spanish-gray text-base">
                    Registration Date
                  </span>
                  <span className="text-raisin-black text-base">
                    {brandDetails?.createdAt
                      ? new Date(brandDetails.createdAt).toLocaleDateString()
                      : "July 10, 2024"}
                  </span>
                </div>
              </div>
            </div>
            {/* Subscription Card */}
            {/* {showSubscriptionCard && (
            <div className="bg-primary grid grid-rows-[auto_1fr] rounded-2xl drop-shadow-lg shadow-lg p-5 w-full gap-5 h-[330px]">
              <div className="grid grid-cols-[3fr_auto] items-center rounded-lg gap-5">
                <h2 className="text-xl font-semibold tracking-[-0.01em]">Subscription</h2>
                <button
                  className="flex items-center justify-center bg-Red hover:bg-primary hover:border-dashed hover:border-Red hover:text-Red text-primary border rounded-lg p-2 text-xs lg:text-sm whitespace-nowrap"
                >
                  Manage Subscription
                </button>
              </div>
              <div className="grid grid-cols-1 rounded-lg p-2 gap-4">
                {['Tier 3', 'Tier 2', 'Tier 1'].map((tier, idx) => (
                  <div className="grid grid-cols-2" key={idx}>
                    <div className="flex gap-3 items-center ">
                      <Image
                        src={
                          images.home[
                            `medal${3 - idx}` as keyof typeof images.home
                          ]
                        }
                        alt={tier}
                        width={16}
                        height={16}
                      />
                      <span className="text-spanish-gray text-base">{tier}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <button className="flex items-center justify-center border border-Red border-dashed hover:text-primary hover:bg-Red text-Red font-light rounded-md text-xs px-3 py-1 w-24 h-8">
                        Subscribe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
          </div>

          {/* Switched to Likes and CSV Download */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            <div className="bg-primary rounded-2xl flex justify-start items-center shadow-lg p-5 space-y-4 sm:space-x-5 w-full h-[120px] ">
              <div className="flex gap-1">
                <div className="flex items-baseline space-x-2 ">
                  <Image
                    src={images.home.heart}
                    alt="Heart Icon"
                    width={40}
                    height={40}
                  />
                  <span className="text-5xl">43%</span>
                </div>

                <span className="text-[#A3AED0] font-[20px]  mt-4 bottom-box-text">
                  Switched to Likes
                </span>
              </div>
            </div>
            <div className="bg-primary rounded-2xl flex justify-between items-center shadow-lg p-5 h-[120px] cursor-pointer " onClick={handleDownload}>
              <Image
                src={images.home.download}
                alt="Download Icon"
                width={40}
                height={40}
              />
              <h1 className="text-[#A3AED0] text-xl bottom-box-text">
                Download CSV of All Your Data
              </h1>
              <Image
                src={images.home.csv}
                alt="CSV Icon"
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="order-1 sm:order-2 bg-primary text-black rounded-2xl drop-shadow-xl shadow-lg w-full space-y-4 mb-4 sm:mb-0">
          {/* Redeem Gender */}
          <div className="p-5 space-y-5">
            <h2 className="text-xl font-semibold">Redeem Gender</h2>
            <GenderAgeChart
              data={[
                { name: "Male", percentage: 55, color: "#FF3B57" },
                { name: "Female", percentage: 45, color: "#2D3748" },
                { name: "Other", percentage: 45, color: "#F56565" },
              ]}
            />

          </div>

          <div className="bg-Red mx-5 h-[2px]"></div>

          {/* Redeemer Age */}
          <div className="p-5 space-y-5">
            <h2 className="text-xl font-semibold">Redeemer Age</h2>
            <GenderAgeChart
              data={[
                { name: "Male", percentage: 55, color: "#FF3B57" },
                { name: "Female", percentage: 45, color: "#2D3748" },
                { name: "Other", percentage: 45, color: "#F56565" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
