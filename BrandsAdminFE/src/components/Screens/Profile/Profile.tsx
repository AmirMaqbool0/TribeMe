"use client";
import images from "@/src/assets/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandDetails,
  selectBrandDetails,
  selectBrandStatus,
  selectBrandError,
} from "../../../../redux/brandSlice";
// import { downloadFile } from '@/redux/CSVDownload';
export default function Profile() {
  const router = useRouter();
  const [isYesSelected, setIsYesSelected] = useState(false);
  const [brandDetail, setBrandDetail] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select Option");
  const dispatch: AppDispatch = useDispatch();
  const maxWords = 200;

  const handleBrandDetailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= maxWords) {
      setBrandDetail(value);
    }
  };
  const isBrandDetailMaxReached = brandDetail.length === maxWords;

  const handleSaveProfile = () => {
    router.push("/profile/edit_profile");
  };

  const handleFormSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };

  const handleYes = () => {
    setIsYesSelected(true);
  };

  const handleNo = () => {
    setIsYesSelected(false);
  };

  const handleChange = () => {};

  const handleRemove = () => {};

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadCSV = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
      // Perform further processing here
    }
  };
  // Fetch Brnds Detail
  const brandDetails = useSelector(selectBrandDetails);
  useEffect(() => {
    dispatch(fetchBrandDetails());
  }, [dispatch]);
  console.log("Profile Brands Detail", brandDetails);
  useEffect(() => {
    if (brandDetails) {
      setBrandDetail(brandDetails.brandDescription || "");
    }
  }, [brandDetails]);

  // Download CSV File
  // const { loading, errorcsv, success } = useSelector((state: any) => state.file);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <form
      onSubmit={handleFormSubmit}
      className="sm:text-base text-sm tracking-wide text-black grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 gap-5 font-inter justify-center w-full mt-5"
    >
      {/* Business Profile Section */}
      <fieldset className="text-lg tracking-wider bg-primary w-full sm:w-auto lg:col-span-3 xl:col-span-3 p-5 rounded-[30px] space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-4 h-full">
          {/*  Heading and Paragraph   */}
          <div className="flex flex-col justify-start sm:justify-start space-y-1">
            <legend className="text-[31px] md:text-2xl lg:text-2xl xl:text3xl font-[500] font-inter text-dark-charcoal">
              Business Profile
            </legend>
            {/* <p className="text-slate-gray text-base opacity-70">Pretend not to be evil meow to be let out intently stare at the same.</p> */}
          </div>
          {/*  Save Button  */}
          <div className="flex justify-center items-center w-full">
            <button
              onClick={handleSaveProfile}
              type="submit"
              className="text-lg px-5  w-[120px] h-[40px]  lg:px-9 bg-Red rounded-lg hover:bg-primary hover:text-Red hover:border-Red hover:border text-primary"
            >
              {" "}
              Edit{" "}
            </button>
          </div>
        </div>

        <div className="space-y-2 ">
          {/* Brand Name */}
          <div className="space-y-1">
            <label
              htmlFor="brand-name"
              className="block text-charcoal opacity-80"
            >
              Brand Name
            </label>
              <input
                id="brand-name"
                disabled
                type="text"
                readOnly
                value={isClient ? brandDetails?.businessName ?? "" :''}
                placeholder="Ex. ABC Pvt. Ltd."
                className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md"
              />
        
          </div>

          {/* Brand Detail  */}
          <div className="">
            <label
              htmlFor="offer-description"
              className="block text-charcoal opacity-80"
            >
              Brand Detail
            </label>
            <div className="relative">
              <textarea
                disabled
                name="offerDescription"
                readOnly
                value={brandDetail ?? ""}
                id="offer-description"
                onChange={handleBrandDetailChange}
                rows={3}
                placeholder="Ex. ABC Pvt. Ltd."
                aria-invalid={isBrandDetailMaxReached}
                className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md ${
                  isBrandDetailMaxReached
                    ? "border-Red animate-light-shake"
                    : ""
                }`}
              ></textarea>
              <p
                className={`absolute bottom-3 right-4 text-xs ${
                  isBrandDetailMaxReached ? "text-Red" : "text-grayish-blue"
                }`}
              >
                {" "}
                {brandDetail.length}/{maxWords}{" "}
              </p>
            </div>
          </div>
          {/* Ecommerce */}
          <div className="space-y-1">
            <label
              htmlFor="ecommerce"
              className="block text-charcoal opacity-80"
            >
              Ecommerce
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                id="ecommerce-yes"
                disabled
                className={`px-10 py-2 rounded-md ${
                  isYesSelected
                    ? "bg-Red text-primary"
                    : "bg-light-gray text-grayish-blue h-[37px]  flex items-center justify-center"
                }`}
                onClick={handleYes}
              >
                {" "}
                Yes{" "}
              </button>
              <button
                type="button"
                id="ecommerce-no"
                disabled
                className={`px-10 py-2 rounded-md ${
                  isYesSelected
                    ? "bg-light-gray text-grayish-blue"
                    : "bg-Red text-primary h-[37px]  flex items-center justify-center"
                }`}
                onClick={handleNo}
              >
                {" "}
                No{" "}
              </button>
            </div>
          </div>

      {/* Brand Media Display */}
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <label className="block text-charcoal opacity-80">Brand Media</label>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Brand Logo Display */}
    <div className="space-y-1">
      <label className="block text-charcoal opacity-80">Brand Logo</label>
      <div className="w-full h-[140px] rounded-xl bg-light-gray overflow-hidden flex items-center justify-center">
        <Image
          src={brandDetails?.images?.[0]?.url || images.profile.donald}
          alt="Brand Logo"
          width={150}
          height={150}
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Brand Video Display */}
    <div className="space-y-1">
      <label className="block text-charcoal opacity-80">Brand Video</label>
      <div className="w-full h-[140px] rounded-xl bg-light-gray overflow-hidden flex items-center justify-center">
        {brandDetails?.videos ? (
          <div className="relative w-full h-full">
            <video className="w-full h-full object-cover" controls>
              <source src={brandDetails.videos[0]?.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white opacity-80"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-charcoal opacity-50 flex flex-col items-center">
            <svg
              className="w-8 h-8 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            No video available
          </div>
        )}
      </div>
    </div>
  </div>
</div>

          {/* Primary Contact No. */}
          <div className="space-y-1">
            <label
              htmlFor="primary-contact-no"
              className="block text-charcoal opacity-80"
            >
              Primary Contact No.
            </label>
            <div className="cursor-not-allowed opacity-60 flex gap-0 w-full items-center focus:outline-none focus:border-gray-300 border-2 border-pale-gray rounded-md bg-light-gray">
              {/* Dropdown for phone codes */}
              <select
                disabled
                id="primary-contact-no"
                className="cursor-not-allowed opacity-60 sm:w-13 sm:ml-3 sm:mr-3 sm:pr-2 bg-light-gray text-charcoal focus:outline-none rounded-l-md"
                defaultValue="+91"
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+61">+61</option>
              </select>

              {/* Vertical Line */}
              <div className="w-[1px] h-full py-3 bg-charcoal"></div>

              {/* Input field for phone number */}
              <input
                disabled
                id="primary-contact-no"
                type="tel"
                readOnly
                value={brandDetails?.phone ?? ""}
                placeholder="Ex. 99999 99999"
                className="flex-grow w-20 px-4 py-2 bg-light-gray text-grayish-blue focus:outline-none rounded-r-md"
              />
            </div>
          </div>

          {/* Connect POS and e-commerce */}
          <div className="space-y-1">
            <label
              htmlFor="connect-pos-and-e-commerce"
              className="text-charcoal opacity-80"
            >
              Connect POS and e-commerce
            </label>
            <div className="relative">
              <select
                disabled
                id="connect-pos-and-e-commerce"
                className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {[
                  { label: "Select Options", value: "Select Option" },
                  { label: "Square", value: "Square" },
                  { label: "Shopify", value: "Shopify" },
                  { label: "Clover", value: "Clover" },
                  { label: "Lightspeed", value: "Lightspeed" },
                  { label: "Spot On", value: "Spot On" },
                  { label: "Toast", value: "Toast" },
                  { label: "Wix", value: "Wix" },
                  { label: "Wordpress", value: "Wordpress" },
                ].map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <img
                  src="/input-arrow.svg"
                  alt="arrow icon"
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>

          {/* Connect POS and e-commerce */}
          <div className="space-y-1">
            <label
              htmlFor="connect-pos-and-e-commerce"
              className="block text-charcoal opacity-80"
            >
              Connect POS and e-commerce
            </label>
            <div className="flex gap-4">
              <button
                disabled
                type="button"
                className="px-10 py-2 bg-light-gray text-grayish-blue rounded-md"
                onClick={handleYes}
              >
                {" "}
                Yes{" "}
              </button>
              <button
                disabled
                type="button"
                className="px-10 py-2 bg-Red text-primary rounded-md"
                onClick={handleNo}
              >
                {" "}
                No{" "}
              </button>
            </div>
          </div>

          {/* Primary Retail Address */}
          <div className="grid grid-cols-1 sm:gap-3 gap-5 sm:grid-cols-12 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-7 items-center justify-center w-full sm:space-y-4">
            <div className="space-y-1 sm:col-span-7 md:col-span-8 lg:col-span-8 xl:col-span-5">
              <label
                htmlFor="primary-retail-address"
                className="block text-charcoal opacity-80"
              >
                Primary Retail Address
              </label>
              <input
                disabled
                id="primary-retail-address"
                type="text"
                readOnly
                value={brandDetails?.address ?? ""}
                placeholder="Enter All Retail Addresses"
                className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-[95%] border-pale-gray rounded-md"
              />
            </div>
            <div className="sm:col-span-5 md:col-span-4 lg:col-span-4 xl:col-span-2 text-sm flex justify-center items-center h-full">
              <button
                disabled
                type="button"
                onClick={handleUploadCSV}
                className="px-2 lg:px-10 py-2 h-16 font-outfit rounded-[9.92px] bg-Red text-primary font-medium flex items-center justify-center space-x-2"
              >
                {/* Left Icon */}
                <Image
                  src={images.profile.download}
                  alt="CSV Icon"
                  width={24}
                  height={24}
                  className="w-auto h-auto lg:pl-2 xl:pl-0"
                />
                {/* Button Text */}
                <span className="whitespace-nowrap text-center text-xs xl:text-sm">
                  Upload CSV of <br /> All Your Addresses
                </span>
                {/* Right Icon */}
                <Image
                  src={images.profile.csv}
                  alt="Download Icon"
                  width={24}
                  height={24}
                  className="lg:pr-2 xl:pr-0 w-auto h-auto"
                />
              </button>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                readOnly
                type="file"
                accept=".csv, .xls, .xlsx, image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label
              htmlFor="category"
              className="block text-charcoal opacity-80"
            >
              Category
            </label>
            <div className="relative">
              <select
                disabled
                id="category"
                value={brandDetails?.category ?? ""}
                className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10"
                // defaultValue=""
              >
                <option value="" disabled>
                  Select Option
                </option>
                <option value="category1 bg-primary">Category 1</option>
                <option value="category2 bg-primary">Category 2</option>
                <option value="category3 bg-primary">Category 3</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <img
                  src="/input-arrow.svg"
                  alt="arrow icon"
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>
          {/* Sub Category  */}
          <div className="space-y-1">
            <label
              htmlFor="sub-category"
              className="block text-charcoal opacity-80"
            >
              Sub Category
            </label>
            <div className="relative">
              <select
                id="sub-category"
                disabled
                className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Option
                </option>
                <option value="category1 bg-primary">Category 1</option>
                <option value="category2 bg-primary">Category 2</option>
                <option value="category3 bg-primary">Category 3</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <img
                  src="/input-arrow.svg"
                  alt="arrow icon"
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>

          {/* Second Sub Category  */}
          {/* <div className='space-y-1'>
            <label htmlFor="second-sub-category" className="block text-charcoal opacity-80">Second Sub Category</label>
            <div className="relative">
              <select id="second-sub-category" className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10" defaultValue="">
                <option value="" disabled>Select Option</option>
                <option value="category1 bg-primary">Category 1</option>
                <option value="category2 bg-primary">Category 2</option>
                <option value="category3 bg-primary">Category 3</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <img src="/input-arrow.svg" alt="arrow icon" className="w-5 h-5" />
              </div>
            </div>
          </div> */}
        </div>
      </fieldset>

      {/* Admin Profile Section */}
      <fieldset className="text-lg tracking-wider bg-primary w-full sm:w-auto lg:col-span-2 xl:col-span-2 p-5 rounded-[30px] space-y-5">
        {/* Heading */}
        <div className="">
          <legend className="text-2xl font-bold text-dark-charcoal">
            Admin Profile
          </legend>
        </div>

        <div className="space-y-5">
          {/*  Admin Name */}
          <div className="space-y-2-1">
            <label
              htmlFor="admin-name"
              className="block text-charcoal opacity-80"
            >
               Name
            </label>
            <input
              id="admin-name"
              type="text"
              readOnly
              value={brandDetails?.firstName ?? ''}
              placeholder="Ex. Walter White"
              className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
            />
          </div>

          {/*  Admin Email */}
          <div className="space-y-1">
            <label
              htmlFor="admin-email"
              className="block text-charcoal opacity-80"
            >
               Email
            </label>
            <input
              disabled
              id="admin-email"
              type="email"
              readOnly
              value={brandDetails?.email ?? ""}
              placeholder="Ex. Xyz@gmail.com"
              required
              className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
            />
          </div>

          {/* Admin Phone Number */}
          <div className="space-y-1">
            <label
              htmlFor="admin-phone"
              className="block text-charcoal opacity-80"
            >
               Phone Number
            </label>
            <div className="cursor-not-allowed opacity-60 flex items-center focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue border-pale-gray rounded-md">
              {/* Dropdown for phone codes */}
              <select
                disabled
                id="admin-phone"
                className="sm:ml-4 sm:mr-3 sm:pr-2 bg-light-gray text-charcoal focus:outline-none rounded-l-md"
                defaultValue="+91"
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+61">+61</option>
              </select>

              {/* Vertical Line */}
              <div className="w-[1px] h-full py-3 bg-charcoal"></div>

              {/* Input field for phone number */}
              <input
                disabled
                id="primary-contact-no"
                readOnly
                type="tel"
                // defaultValue="+91"
                value={brandDetails?.phone ?? ""}
                placeholder="Ex. 99999 99999"
                className="cursor-not-allowed opacity-60 flex-grow w-20 sm:w-full px-2 py-2 bg-light-gray text-grayish-blue focus:outline-none rounded-md"
              />
            </div>
          </div>

          {/* First Party Cookie */}
          {/* <div className='space-y-1'>
            <label htmlFor="first-party-cookie" className="text-charcoal opacity-80">First Party Cookie</label>
            <input id="first-party-cookie" type="text" placeholder="Enter here" className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300  bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md" />
          </div> */}

          {/* Invite Primary Admin */}
          {/* <div className='space-y-1'>
            <label htmlFor="invite-primary-admin" className="text-charcoal opacity-80">Invite Primary Admin</label>
            <input id="invite-primary-admin" type="text" placeholder="Enter Email" className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300  bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md" />
          </div> */}

          {/* Invite Junior Admin */}
          {/* <div className='space-y-1'>
            <label htmlFor="invite-junior-admin" className="text-charcoal opacity-80">Invite Junior Admin</label>
            <input id="invite-junior-admin" type="text" placeholder="Enter here" className="px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue  w-full border-pale-gray rounded-md" />
          </div> */}
        </div>
      </fieldset>
    </form>
  );
}
