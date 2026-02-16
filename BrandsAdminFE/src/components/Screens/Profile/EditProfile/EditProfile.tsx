"use client";
import images from "../../../../assets/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import "../profile.css";
import { RootState, AppDispatch } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { uploadImage } from "@/redux/uploadBrandImage";
import { toast } from "react-toastify";
import { updateBrandDetails } from "@/redux/updateBrandSlice";
import { fetchBrandDetails, selectBrandDetails } from "@/redux/brandSlice";
import Toast from "@/src/components/Toast/Toast";

// -----------Brand Video --------------
import { uploadBrandVideo } from "@/redux/brandVideoSlice";
import { resetUploadState } from "@/redux/brandVideoSlice";
const EditProfile = () => {
  const router = useRouter();
  const [isYesSelected, setIsYesSelected] = useState(false);
  const [isConnectYes, setIsConnectYes] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputImageRef = useRef<HTMLInputElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [brandDetail, setBrandDetail] = useState("");
  // ------------Brand Video ---------------
  const fileInputVideoRef = useRef<HTMLInputElement | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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
  const handleSaveEditProfile = () => {
    router.push("/profile");
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

  const handleChange = () => {
    fileInputImageRef.current?.click(); // Trigger the file input click
  };

  // const handleRemove = () => { }

  // const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileChangeImage2 = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);
      const img: HTMLImageElement = new window.Image(); // ✅ Explicit type to avoid TS error

      img.src = imageURL;

      img.onload = () => {
        if (img.width < 1000 || img.height < 1000) {
          // alert("Please upload an image of at least 1000x1000 pixels.");
          toast(
            <Toast
              message="Please upload an image of at least 1000x1000 pixels."
              backgroundColor="red"
              textColor="white"
            />,
            {
              closeButton: false,
            }
          );
          event.target.value = ""; // Reset file input
        } else {
          setSelectedImage(imageURL);

          const offerId = brandDetails?.id || "default-brand-id";

          dispatch(uploadImage({ file, brandId: offerId }))
            .unwrap()
            .then((response) => {
              console.log("Image uploaded successfully", response.imageUrl);
              // alert('Image uploaded successfully');
              toast(
                <Toast
                  message="Image uploaded successfully"
                  backgroundColor="green"
                  textColor="white"
                />,
                {
                  closeButton: false,
                }
              );
            })
            .catch((error) => {
              console.error("Error uploading image:", error.message || error);
              // alert(error.message);
              toast(
                <Toast
                  message={error.message}
                  backgroundColor="red"
                  textColor="white"
                />,
                {
                  closeButton: false,
                }
              );
            });
        }
      };

      img.onerror = () => {
        // alert("Invalid image file. Please try again.");
        toast(
          <Toast
            message="Invalid image file. Please try again."
            backgroundColor="red"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
        event.target.value = ""; // Reset file input on error
      };
    }
  };

  const handleRemove = () => {
    setSelectedImage(null); // Remove the selected image
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  //  Brnad Detail Update
  const dispatch: AppDispatch = useDispatch();
  const brandDetails = useSelector(selectBrandDetails);
  useEffect(() => {
    dispatch(fetchBrandDetails());
  }, [dispatch]);
  const [formData, setFormData] = useState({
    firstName: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
    // eCommerce: "",
    // offerAmount: "",
    // category:""
  });
  console.log("This is Form Data ", formData);
  // Initialize formData with brandDetails
  useEffect(() => {
    if (brandDetails) {
      setFormData({
        firstName: brandDetails.firstName || "",
        businessName: brandDetails.businessName || "",
        email: brandDetails.email || "",
        phone: brandDetails.phone || "",
        address: brandDetails.address || "",
      });
      setBrandDetail(brandDetails.brandDescription || "");
    }
  }, [brandDetails]);

  const handleUpdate = async () => {
    console.log("funtion Fired...................");
    try {
      const updateData = {
        id: brandDetails?.id || "",
        firstName: formData.firstName,
        category: selectedCategory,
        brandDescription: brandDetail,
        phone: countryCode + formData.phone,
        email: formData.email,
        businessName: formData.businessName,
      };
      // console.log("update data before update ", updateData);
      await dispatch(updateBrandDetails(updateData)).unwrap();
      console.log("Brand updated successfully!");
      toast(
        <Toast
          message="Brand updated successfully!"
          backgroundColor="green"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      // alert("Brand updated successfully!")
    } catch (error) {
      alert(error);
      console.error("Update failed:", error);
    }
  };

  // Handel DropDown Value
  const handleDropdownCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value); // Update the state with the selected value
  };

  const handleDropdownCountryCode = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCountryCode(e.target.value); // Update the state with the selected value
  };

  // ----------------Brand Video ------------

  const handleVideoChange = () => {
    fileInputVideoRef.current?.click();
  };

  const handleVideoRemove = () => {
    setSelectedVideo(null);
    dispatch(resetUploadState());
  };

  const handleFileChangeVideo = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast(
        <Toast
          message="Please upload a valid video file (MP4, MOV, etc.)"
          backgroundColor="red"
          textColor="white"
        />,
        { closeButton: false }
      );
      return;
    }

    // Validate file size (e.g., 50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast(
        <Toast
          message="Video file too large (max 50MB)"
          backgroundColor="red"
          textColor="white"
        />,
        { closeButton: false }
      );
      return;
    }

    const videoURL = URL.createObjectURL(file);
    setSelectedVideo(videoURL);

    const brandId = brandDetails?.id;
    if (!brandId) {
      toast(
        <Toast
          message="Brand ID not found"
          backgroundColor="red"
          textColor="white"
        />,
        { closeButton: false }
      );
      return;
    }

    console.log("Dispatching video upload...", {
      brandId,
      fileName: file.name,
    });
    dispatch(uploadBrandVideo({ video: file, brandId }))
      .unwrap()
      .then((response) => {
        console.log("Video upload successful:", response);
        toast(
          <Toast
            message="Video uploaded successfully"
            backgroundColor="green"
            textColor="white"
          />,
          { closeButton: false }
        );
      })
      .catch((error) => {
        console.error("Video upload error:", error);
        toast(
          <Toast
            message={`Video upload failed: ${error}`}
            backgroundColor="red"
            textColor="white"
          />,
          { closeButton: false }
        );
      });
  };
  return (
    <form
      onSubmit={handleFormSubmit}
      className="text-lg tracking-wider text-black grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 gap-5 mt-5 font-inter justify-center w-full"
    >
      {/* Business Profile Section */}
      <fieldset className="bg-primary w-full lg:col-span-3 xl:col-span-3 p-5 rounded-[30px] space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-4 h-full">
          {/*  Heading and Paragraph   */}
          <div className="flex flex-col justify-start sm:justify-start space-y-1">
            <legend className="text-[31px] md:text-2xl lg:text-2xl xl:text3xl font-[500] font-inter text-dark-charcoal">
              Business Profile
            </legend>
            {/* <p className=" text-slate-gray text-base opacity-70">Pretend not to be evil meow to be let out intently stare at the same.</p> */}
          </div>
          {/*  Save Button  */}
          <div className="flex justify-center items-center w-full">
            <button
              onClick={() => {
                handleUpdate();
                handleSaveEditProfile();
              }}
              type="submit"
              className="text-lg w-[120px] h-[40px]  lg:px-9 bg-Red rounded-lg hover:bg-primary hover:text-Red hover:border-Red hover:border text-primary"
            >
              {" "}
              Save{" "}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {/* Brand Name */}
          <div className="space-y-1 ">
            <label
              htmlFor="brand-name"
              className="block text-charcoal opacity-80"
            >
              Brand Name
            </label>
            <input
              disabled
              id="brand-name"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              type="text"
              placeholder="Ex. ABC Pvt. Ltd."
              className="form-input px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md"
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
                name="offerDescription"
                value={brandDetail}
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
                className={`px-10 py-2 rounded-md h-[37px] flex items-center justify-center ${
                  isYesSelected
                    ? "bg-Red text-primary"
                    : "bg-light-gray text-grayish-blue h-[37px] flex items-center justify-center"
                }`}
                onClick={handleYes}
              >
                {" "}
                Yes{" "}
              </button>
              <button
                type="button"
                id="ecommerce-no"
                className={`px-10 py-2 rounded-md h-[37px] flex items-center justify-center ${
                  isYesSelected
                    ? "bg-light-gray text-grayish-blue"
                    : "bg-Red text-primary h-[37px] flex items-center justify-center"
                }`}
                onClick={handleNo}
              >
                {" "}
                No{" "}
              </button>
            </div>
          </div>

          {/* Brand Logo */}
          {/* Brand Media Section */}
          <div className="space-y-4">
            {/* Brand Logo and Video Header */}
            <div className="flex justify-between items-center">
              <label className="block text-charcoal opacity-80">
                Brand Media
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Logo */}
              <div className="space-y-1">
                <label
                  htmlFor="brand-logo"
                  className="block text-charcoal opacity-80"
                >
                  Brand Logo
                </label>
                <div className="flex flex-col">
                  {/* Image Container */}
                  <div className="w-full h-[140px] rounded-xl bg-light-gray overflow-hidden flex items-center justify-center">
                    <Image
                      src={
                        brandDetails?.images?.[0]?.url || images.profile.donald
                      }
                      alt="Selected Image"
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Buttons Below Image */}
                  <div className="flex gap-4 justify-start mt-2">
                    <button
                      type="button"
                      id="offer-image-change"
                      className="rounded-md text-charcoal bg-light-gray w-[90px] h-[40px] text-[18px] flex items-center justify-center"
                      onClick={handleChange}
                    >
                      Change
                    </button>
                    <input
                      ref={fileInputImageRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChangeImage2}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      id="offer-image-remove"
                      className="rounded-md text-charcoal h-[40px] text-[18px] flex items-center justify-center"
                      onClick={handleRemove}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand Video */}
              <div className="space-y-1">
                <label
                  htmlFor="brand-video"
                  className="block text-charcoal opacity-80"
                >
                  Brand Video
                </label>
                <div className="flex flex-col">
                  {/* Video Container */}
                  <div className="w-full h-[140px] rounded-xl bg-light-gray overflow-hidden flex items-center justify-center">
                    {selectedVideo || brandDetails?.video ? (
                      <video className="w-full h-full object-cover" controls>
                        <source
                          src={selectedVideo || brandDetails.video}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
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
                        No video uploaded
                      </div>
                    )}
                  </div>

                  {/* Buttons Below Video */}
                  <div className="flex gap-4 justify-start mt-2">
                    <button
                      type="button"
                      className="rounded-md text-charcoal bg-light-gray w-[90px] h-[40px] text-[18px] flex items-center justify-center"
                      onClick={handleVideoChange}
                    >
                      Change
                    </button>
                    <input
                      ref={fileInputVideoRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChangeVideo}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className="rounded-md text-charcoal h-[40px] text-[18px] flex items-center justify-center"
                      onClick={handleVideoRemove}
                      disabled={!selectedVideo && !brandDetails?.video}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Primary Contact No. */}
          <div className="space-y-1 ">
            <label
              htmlFor="primary-contact-no"
              className="block text-charcoal opacity-80"
            >
              Primary Contact No.
            </label>
            <div className="flex items-center focus:outline-none focus:border-gray-300 border-2 border-pale-gray rounded-md bg-light-gray ">
              {/* Dropdown for phone codes */}
              <select
                id="primary-contact-no"
                value={countryCode}
                onChange={handleDropdownCountryCode}
                className="cursor-not-allowed opacity-60 sm:w-13 sm:ml-3 sm:mr-3 sm:pr-2 bg-light-gray text-charcoal focus:outline-none rounded-l-md"
                // defaultValue="+91"
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
                id="primary-contact-no"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ex. 99999 99999"
                className="flex-grow w-20 px-2 py-2 bg-light-gray text-grayish-blue focus:outline-none rounded-r-md"
              />
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
            <div className="relative">
              <select
                id="connect-pos-and-e-commerce"
                className="px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10"
                defaultValue="Select Option"
              >
                {/* Map through options */}
                {[
                  { label: "Select Options", value: "selectOptions" },
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
                <Image
                  src="/input-arrow.svg"
                  alt="arrow icon"
                  width={100}
                  height={100}
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
                type="button"
                className={`px-10 py-2 rounded-md h-[37px] flex items-center justify-center ${
                  isConnectYes
                    ? "bg-Red text-primary"
                    : "bg-light-gray text-grayish-blue h-[37px] flex items-center justify-center"
                }`}
                onClick={() => setIsConnectYes(true)}
              >
                {" "}
                Yes{" "}
              </button>
              <button
                type="button"
                className={`px-10 py-2 rounded-md  h-[37px] flex items-center justify-center ${
                  isConnectYes
                    ? "bg-light-gray text-grayish-blue"
                    : "bg-Red text-primary h-[37px] flex items-center justify-center"
                }`}
                onClick={() => setIsConnectYes(false)}
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
                id="primary-retail-address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter All Retail Addresses"
                className="cursor-not-allowed opacity-60 px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-[95%] border-pale-gray rounded-md"
              />
            </div>
            <div className="sm:col-span-5 md:col-span-4 lg:col-span-4 xl:col-span-2 text-sm flex justify-center items-center h-full">
              <button
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
                id="category"
                value={selectedCategory} // Controlled component
                onChange={handleDropdownCategory}
                className="px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10"
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
                className="px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10"
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
                          <select id="second-sub-category" className="px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue w-full border-pale-gray rounded-md appearance-none pr-10" defaultValue="">
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
      <fieldset className="bg-primary w-full lg:col-span-2 xl:col-span-2 p-5 rounded-[30px] space-y-5">
        {/* <!-- Heading and Paragraph  --> */}
        <div className="">
          <legend className="text-2xl font-bold text-dark-charcoal">
            Admin Profile
          </legend>
        </div>

        <div className="space-y-5">
          {/* Senior Admin Name */}
          <div className="space-y-2-1">
            <label
              htmlFor="senior-admin"
              className="block text-charcoal opacity-80"
            >
              Name
            </label>
            <input
              id="senior-admin"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              type="text"
              placeholder="Ex. Walter White"
              className="form-input px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
            />
          </div>

          {/* Senior Admin Email */}
          <div className="space-y-1">
            <label
              htmlFor="senior-admin-email"
              className="block text-charcoal opacity-80"
            >
              Email
            </label>
            <input
              disabled
              id="senior-admin-email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              placeholder="Ex. Xyz@gmail.com"
              required
              className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
            />
          </div>

          {/* Senior Admin Phone Number */}
          <div className="space-y-1">
            <label
              htmlFor="senior-admin-phone"
              className="block text-charcoal opacity-80"
            >
              Phone Number
            </label>
            <div className="flex items-center focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue border-pale-gray rounded-md">
              {/* Dropdown for phone codes */}
              <select
                id="phone-code"
                value={countryCode}
                onChange={handleDropdownCountryCode}
                className="sm:ml-4 sm:mr-3 sm:pr-2 bg-light-gray text-charcoal focus:outline-none rounded-l-md"
                // defaultValue="+91"
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
                id="primary-contact-no"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                type="tel"
                placeholder="Ex. 99999 99999"
                className="flex-grow px-2 py-2 w-20 bg-light-gray text-grayish-blue focus:outline-none rounded-md"
              />
            </div>
          </div>

          {/* First Party Cookie */}
          {/* <div className='space-y-1'>
                        <label htmlFor="first-party-cookie" className="block text-charcoal opacity-80">First Party Cookie</label>
                        <input id="first-party-cookie" type="text" placeholder="Enter here" className="px-4 py-2 focus:outline-none focus:border-gray-300  bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md" />
                      </div> */}

          {/* Invite Primary Admin */}
          {/* <div className='space-y-1'>
                        <label htmlFor="invite-primary-admin" className="block text-charcoal opacity-80">Invite Primary Admin</label>
                        <input id="invite-primary-admin" type="text" placeholder="Enter Email" className="px-4 py-2 focus:outline-none focus:border-gray-300  bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md" />
                      </div> */}

          {/* Invite Junior Admin */}
          {/* <div className='space-y-1'>
                        <label htmlFor="invite-junior-admin" className="block text-charcoal opacity-80">Invite Junior Admin</label>
                        <input id="invite-junior-admin" type="text" placeholder="Enter here" className="px-4 py-2 focus:outline-none focus:border-gray-300 border-2 bg-light-gray text-grayish-blue  w-full border-pale-gray rounded-md" />
                      </div> */}
        </div>
      </fieldset>
    </form>
  );
};

export default EditProfile;
