"use client";
import images from "@/src/assets/images";
import { CustomCheckbox } from "@/src/components/component/CustomCheckBox";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { uploadVideo } from "@/redux/uploadOfferVideo";
import {
  createOffer,
  selectOfferStatus,
  selectOfferError,
} from "@/redux/offerSlice";
import {
  fetchBrandDetails,
  selectBrandDetails,
  selectBrandStatus,
  selectBrandError,
} from "../../../../../redux/brandSlice";

import { AppDispatch, RootState } from "@/redux/store";
import { start } from "repl";
import { uploadImage } from "@/redux/uploadBrandLogo";
import Toast from "@/src/components/Toast/Toast";

const offersData = [
  {
    id: "offer_info",
    image: images.sidebar.mcDonald,
    title: "Free Burger Offer",
    description: "Get a free burger with your purchase of $10 or more",
    buttonText: "New",
  },
  {
    id: "order_image",
    image: images.sidebar.order,
    alt: "Free Burger Offer",
  },
  {
    id: "offer_details",
    title: "Offer Details",
  },
  {
    id: "offer_dashboard",
    title: "Offer Dashboard",
    labels: [
      { label: "Ecommerce", value: "No" },
      { label: "Offer Delivery Budget Capacity", value: "$50" },
      { label: "Number of Offers to Send", value: "12" },
      { label: "Cities", value: "New York, New Jersey" },
      { label: "Retail Price Of Offered Product", value: "$24" },
      { label: "Category", value: "Food" },
      { label: "Sub Category", value: "Fast Food" },
    ],
  },
  {
    id: "about_offer",
    title: "About Offer",
    labels: [
      { label: "Offer Type", value: "Buy 1 Get 1 Free" },
      { label: "Offer Code", value: "5431-TM" },
    ],
  },
  {
    id: "offer_validity",
    title: "Offer Validity",
    labels: [
      { label: "Offer Validity", value: "From July 10, 2023 to Aug 10, 2024" },
      { label: "Uses", value: "Unlimited" },
    ],
  },
];

export const NewOffers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isShareable, setIsShareable] = useState(false);
  const [termsConditions, setTermsConditions] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  // const [retailPrice, setRetailPrice] = useState("");
  const [selected, setSelected] = useState("no");
  const [online, setOnline] = useState("no");
  const [inStore, setInstore] = useState("");
  const [eCommerceBtn, setECommerceBtn] = useState<boolean>(false);
  const [unlimetedEndDate, setUnlimetedEndDate] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState(""); // State to track selected option
  const [customOffer, setCustomOffer] = useState(""); // State for custom offer input
  const [persentDiscount, setPersentDiscount] = useState(""); // State for Persent Discount offer input
  const [dollarDiscount, setDollarDiscount] = useState(""); // State for Dollar Discount offer input
  const [salePrice, setSalePrice] = useState(""); // State for sale Price offer input
  const [cashBack, setCashBack] = useState(""); // State for Cash Back offer input
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]); // for check box in store or online
  const fileInputImageRef = useRef<HTMLInputElement | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const fileInputVideoRef = useRef<HTMLInputElement>(null);

  console.log(selectedCity);
  // console.log(retailPrice)

  const [formData, setFormData] = useState({
    name: "",
    retailPrice: "",
    numberOfOffer: "",
    offerCode: "",
    offerCategory: "",
    applyTo: "",
    offerAmount: "",
    startDate: "",
    endDate: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    offerDescription: "",
    termsConditions: "",
    selectedCity: "",
    retailPrice: "",
    numberOfOffer: "",
    applyTo: "",
    offerAmount: "",
    inStore: "",
    startDate: "",
    endDate: "",
    selectedOption: "",
    customOffer: "",
    persentDiscount: "",
    dollarDiscount: "",
    salePrice: "",
    cashBack: "",
  });

  // Add function to clear specific field error
  const clearFieldError = (fieldName: string) => {
    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    clearFieldError(name);
  };

  // Handel DropDown Value
  const handleDropdownCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    // Clear error when user selects a city
    clearFieldError("selectedCity");
  };

  // Handel Offer Experience Check Boxes
  const handleCheckboxChange = (value: string) => {
    if (selectedOffers.includes(value)) {
      // If value already exists, remove it
      setSelectedOffers(selectedOffers.filter((offer) => offer !== value));
    } else {
      // Otherwise, add the value
      setSelectedOffers([...selectedOffers, value]);
    }
  };

  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectOfferStatus);
  const error = useSelector(selectOfferError);

  const formatDate = (dateString: string): string => {
    // Check if the input string is valid
    if (!dateString) {
      throw new Error("Date string is empty.");
    }

    // Create a Date object, adding a default time if the time is missing
    const date = new Date(
      dateString.includes("T") ? dateString : `${dateString}T00:00:00`
    );

    // Validate the created Date object
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string provided.");
    }

    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const day = date.getDate().toString().padStart(2, "0");

    // Format time as HH:mm:ss AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert to 12-hour format
    const formattedTime = `${hours
      .toString()
      .padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

    // Combine date and time
    return `${year}-${month}-${day} ${formattedTime}`;
  };
  //  Fetching Brand ID
  const brandDetails = useSelector(selectBrandDetails);
  useEffect(() => {
    dispatch(fetchBrandDetails());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {
      name: "",
      offerDescription: "",
      termsConditions: "",
      selectedCity: "",
      retailPrice: "",
      numberOfOffer: "",
      applyTo: "",
      offerAmount: "",
      inStore: "",
      startDate: "",
      endDate: "",
      selectedOption: "",
      customOffer: "",
      persentDiscount: "",
      dollarDiscount: "",
      salePrice: "",
      cashBack: "",
    };

    let isValid = true;

    // Validate Offer Name
    if (!formData.name.trim()) {
      errors.name = "Offer name is required";
      isValid = false;
    }

    // Validate Offer Description
    if (!offerDescription.trim()) {
      errors.offerDescription = "Offer description is required";
      isValid = false;
    }

    // Validate Terms and Conditions
    if (!termsConditions.trim()) {
      errors.termsConditions = "Terms and conditions are required";
      isValid = false;
    }

    // Validate City
    if (!selectedCity || selectedCity === "selectOptions") {
      errors.selectedCity = "Please select a city";
      isValid = false;
    }

    // Validate Retail Price
    if (!formData.retailPrice || Number(formData.retailPrice) <= 0) {
      errors.retailPrice = "Please enter a valid retail price";
      isValid = false;
    }

    // Validate Number of Offers
    if (!formData.numberOfOffer || Number(formData.numberOfOffer) <= 0) {
      errors.numberOfOffer = "Please enter a valid number of offers";
      isValid = false;
    }

    // Validate Apply To
    if (!formData.applyTo.trim()) {
      errors.applyTo = "Apply to field is required";
      isValid = false;
    }

    // Validate Offer Amount
    if (!formData.offerAmount.trim()) {
      errors.offerAmount = "Offer amount is required";
      isValid = false;
    }

    // Validate In-store checkbox with professional message
    if (inStore !== "yes") {
      errors.inStore =
        "Please select the in-store option to proceed with the offer";
      isValid = false;
    }

    // Validate Dates
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
      isValid = false;
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
      isValid = false;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      errors.endDate = "End date must be after start date";
      isValid = false;
    }

    // Validate Offer Type
    if (!selectedOption || selectedOption === "selectOptions") {
      errors.selectedOption = "Please select an offer type";
      isValid = false;
    }

    // Validate offer type specific fields
    switch (selectedOption) {
      case "customOffer":
        if (!customOffer.trim()) {
          errors.customOffer = "Please enter your custom offer";
          isValid = false;
        }
        break;
      case "%discount":
        if (!persentDiscount.trim()) {
          errors.persentDiscount = "Please enter discount percentage";
          isValid = false;
        }
        break;
      case "$discount":
        if (!dollarDiscount.trim()) {
          errors.dollarDiscount = "Please enter discount amount";
          isValid = false;
        }
        break;
      case "salePrice":
        if (!salePrice.trim()) {
          errors.salePrice = "Please enter sale price";
          isValid = false;
        }
        break;
      case "cashBack":
        if (!cashBack.trim()) {
          errors.cashBack = "Please enter cash back amount";
          isValid = false;
        }
        break;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateOffer = async () => {
    if (!validateForm()) {
      toast(
        <Toast
          message="Please fill all required fields correctly"
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      return false;
    }

    // Format dates
    const startDate = formData?.startDate
      ? formatDate(formData.startDate)
      : null;
    const endDate = formData?.endDate ? formatDate(formData.endDate) : null;

    // Parse retail price
    const retailNumber = Number.parseInt(formData.retailPrice);

    // Determine offer type
    let offerType = "";
    switch (selectedOption) {
      case "%discount":
        offerType = `% Discount ${persentDiscount}`;
        break;
      case "$discount":
        offerType = `$ Discount ${dollarDiscount}`;
        break;
      case "freeShipping":
        offerType = "Free Shipping";
        break;
      case "cashBack":
        offerType = `Cash Back ${cashBack}`;
        break;
      case "salePrice":
        offerType = `Sale Price ${salePrice}`;
        break;
      case "customOffer":
        offerType = customOffer;
        break;
      default:
        toast(
          <Toast
            message="Invalid offer type."
            backgroundColor="red"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
        return;
    }

    // Prepare offer data
    const offerData = {
      offerName: formData.name || "",
      offerDescription: offerDescription || "",
      offerTermsCondition: termsConditions || "",
      cities: selectedCity ? [selectedCity] : [],
      retailPrice: retailNumber,
      userLimit: formData.numberOfOffer || "",
      offerType: offerType,
      offerCode: formData.offerCode || undefined, // Make offerCode optional
      applyTo: formData.applyTo ? [formData.applyTo] : [],
      offerAmount: formData.offerAmount || "",
      discountPercentage: Number.parseInt(persentDiscount, 10) || 2,
      startDate: startDate,
      endDate: endDate,
      setTimeUnlimited: false,
      inStore: inStore === "yes",
      isShareable: isShareable ? "yes" : "no",
      // eCommerce: false, // Add required fields
      // online: false,
      // brandId: brandDetails?.id || "brandid"
    };

    // Check for empty fields (excluding setTimeUnlimited)
    for (const [key, value] of Object.entries(offerData)) {
      // Skip validation for excluded fields
      if (
        key === "setTimeUnlimited" ||
        key === "eCommerce" ||
        key === "discountPercentage" ||
        key === "offerCode" // Add offerCode to excluded fields
      )
        continue;

      // Special validation for inStore and online
      if (key === "inStore" || key === "online") {
        // Skip validation if at least one is true
        if (offerData.inStore || offerData.online) continue;
      }

      // Check other fields for empty values
      if (
        (Array.isArray(value) && value.length === 0) || // Empty array
        (!Array.isArray(value) && !value) // Null, undefined, or empty string
      ) {
        toast(
          <Toast
            message={`The field "${key}" is required and cannot be empty.`}
            backgroundColor="red"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
        return;
      }
    }

    if (selectedFile == null) {
      toast(
        <Toast
          message={"Offer Image is required Upload Image "}
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      return;
    }
    if (selectedVideoFile == null) {
      toast(
        <Toast
          message={"Offer Video is required Upload Video "}
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      return;
    }

    console.log("Data before sending:", offerData);

    try {
      // Dispatch createOffer action
      const resultAction = await dispatch(createOffer(offerData));

      // Check if the action was successful
      if (createOffer.fulfilled.match(resultAction)) {
        const createdOfferId = resultAction.payload.data.id;
        console.log("Offer created successfully with ID:", createdOfferId);

        // Handle image upload
        if (selectedFile) {
          await handleImageUpload(createdOfferId, selectedFile);
          setSelectedFile(null);
          setSelectedImage(null);
        }

        // Upload Video
        if (selectedVideoFile) {
          await handleUploadVideo(createdOfferId, selectedVideoFile);
          setSelectedVideoFile(null);
          setSelectedVideo(null);
        }

        // Show single success toast
        toast(
          <Toast
            message="Offer created successfully with image and video"
            backgroundColor="green"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );

        // Clear form or perform post-upload actions
        handleUpload();
      } else {
        // Handle backend error messages
        const errorMessage =
          resultAction.payload || // Check if the error payload exists
          "Failed to create offer. Please try again.";
        console.error("Offer creation failed:", errorMessage);

        toast(
          <Toast
            message={errorMessage}
            backgroundColor="red"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
      }
    } catch (error) {
      console.error("Error creating offer:", error);

      // Handle unexpected errors
      const errorMessage =
        error?.response?.data?.error?.errors || // Specific backend "errors" field
        error?.response?.data?.message || // Fallback to "message"
        error.message || // Axios error
        "An unexpected error occurred.";
      toast(
        <Toast
          message={errorMessage}
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
    }
  };

  const handleImageUpload = async (offerId: string, file: File) => {
    try {
      const resultAction = await dispatch(
        uploadImage({ file, brandId: offerId })
      );

      if (uploadImage.fulfilled.match(resultAction)) {
        // alert("Image uploaded successfully!");
        toast(
          <Toast
            message="Image uploaded successfully!"
            backgroundColor="green"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
        console.log("Uploaded image URL:", resultAction.payload.imageUrl);
      } else {
        // alert("Failed to upload image");
        // toast(
        //   <Toast
        //     message="Failed to upload image"
        //     backgroundColor="red"
        //     textColor="white"
        //   />,
        //   {
        //     closeButton: false,
        //   }
        // );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error);
    }
  };

  const modalData = [
    { id: "offerName", label: "Offer Name", value: formData.name },
    // { id: "offerCode", label: "Offer Code", value: formData.offerCode },
    { id: "category", label: "Category", value: formData.applyTo },
    { id: "costDelivery", label: "Delivery Cost", value: "34$" },
  ];
  console.log(formData);
  const maxWords = 200;

  const handleOfferDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= maxWords) {
      setOfferDescription(value);
      // Clear error when user starts typing
      clearFieldError("offerDescription");
    }
  };

  const handleTermsConditionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= maxWords) {
      setTermsConditions(value);
      // Clear error when user starts typing
      clearFieldError("termsConditions");
    }
  };

  const isOfferDescriptionMaxReached = offerDescription.length === maxWords;

  const isTermsConditionsMaxReached = termsConditions.length === maxWords;

  const handleViewPreview = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleUpload = () => {
    setIsConfirmed(true);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsConfirmed(false);
  };

  const handleEcommerceYes = () => {};

  const handleEcommerceNo = () => {};

  const handleOfferChange = () => {};

  const handleOfferRemove = () => {};

  // Handle changing the "Offer is Shareable" state
  const handleShareableChange = (value: boolean) => {
    setIsShareable(value);
    setSelected(value ? "yes" : "no");
  };

  // For Input Image

  const handleChange = () => {
    fileInputImageRef.current?.click(); // Trigger the file input click
  };

  const handleFileChangeImage2 = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      const img: HTMLImageElement = new window.Image();

      img.src = imageURL;

      img.onload = () => {
        if (img.width < 1000 || img.height < 1000) {
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

          // alert("Please upload an image of at least 1000x1000 pixels.");

          event.target.value = ""; // Reset the file input
        } else {
          setSelectedImage(imageURL);
          setSelectedFile(file); // Save the file for later upload
        }
      };
    }
  };

  const handleRemove = () => {
    setSelectedImage(null); // Remove the selected image
    setSelectedFile(null);
  };

  // Handel Video Upload
  const handleVideoChangeClick = () => {
    fileInputVideoRef.current?.click(); // Trigger the file input click
  };
  const handleVideoFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Generate a preview URL for the video
      const videoURL = URL.createObjectURL(file);

      // Create a video element for validation
      const video = document.createElement("video");
      video.src = videoURL;

      video.onloadedmetadata = () => {
        const { duration } = video;

        // Check if video duration is greater than 30 seconds
        if (duration > 30) {
          toast(
            <Toast
              message="Please upload a video with a duration of 30 seconds or less."
              backgroundColor="red"
              textColor="white"
            />,
            {
              closeButton: false,
            }
          );

          event.target.value = ""; // Reset the file input
        } else {
          setSelectedVideo(videoURL); // Set video preview
          setSelectedVideoFile(file); // Save the file for upload
        }
      };
    }
  };

  const handleVideoRemove = () => {
    setSelectedVideo(null); // Clear the video preview
    setSelectedVideoFile(null); // Clear the file
    fileInputVideoRef.current!.value = ""; // Reset the file input
  };

  const handleUploadVideo = async (offerId: string, file: File) => {
    if (selectedVideoFile) {
      try {
        const formData = new FormData();
        formData.append("video", selectedVideoFile);

        const resultAction = await dispatch(
          uploadVideo({ file: file, brandId: offerId })
        );
        if (uploadImage.fulfilled.match(resultAction)) {
          toast(
            <Toast
              message="Video uploaded successfully!"
              backgroundColor="green"
              textColor="white"
            />,
            { closeButton: false }
          );
        } else {
          // alert("failed to upload video");
        }
      } catch (error) {
        toast(
          <Toast
            message="Failed to upload video. Please try again."
            backgroundColor="red"
            textColor="white"
          />,
          { closeButton: false }
        );
      }
    } else {
      toast(
        <Toast
          message="Please select a video before uploading."
          backgroundColor="orange"
          textColor="white"
        />,
        { closeButton: false }
      );
    }
  };

  //    offer Drop Down
  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    clearFieldError("selectedOption");
  };

  // Update the in-store checkbox handler
  const handleInStoreChange = () => {
    setInstore("yes");
    clearFieldError("inStore");
  };

  // Update the custom offer handlers
  const handleCustomOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomOffer(e.target.value);
    clearFieldError("customOffer");
  };

  const handlePercentDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPersentDiscount(e.target.value);
    clearFieldError("persentDiscount");
  };

  const handleDollarDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDollarDiscount(e.target.value);
    clearFieldError("dollarDiscount");
  };

  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalePrice(e.target.value);
    clearFieldError("salePrice");
  };

  const handleCashBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCashBack(e.target.value);
    clearFieldError("cashBack");
  };

  return (
    <div className="">
      <div className="sm:text-base w-full text-sm tracking-wider grid grid-cols-1 text-black font-inter lg:grid-cols-12 xl:grid-cols-12 gap-5">
        {/* Offers dashboard Section */}
        <fieldset className="col-span-1 lg:col-span-7 xl:col-span-8 bg-primary rounded-[30px] p-5 space-y-5">
          {/*  Heading and Paragraph && View Preview and Upload Button */}
          <div className="grid grid-cols-1 xl:grid-cols-3 items-center justify-center gap-4 w-full">
            {/* Left Section: Heading and Paragraph */}
            <div className="space-y-1 xl:col-span-2 ">
              <legend className="text-[25px] md:text-2xl lg:text-2xl xl:text-3xl font-bold font-outfit text-dark-charcoal">
                Offer Dashboard
              </legend>
              {/* <p className="text-[12px] md:text-sm lg:text-md xl:text-[16px] font-inter font-[500] text-slate-gray opacity-70">Pretend not to be evil meow to be let out intently stare at the same .</p> */}
            </div>

            {/* Right Section: Buttons */}
            <div className="xl:col-span-1 flex justify-center xl:justify-end gap-4">
              <button
                onClick={handleViewPreview}
                className="px-5 py-2 w-full  bg-primary border border-Red text-Red font-medium rounded-md hover:bg-Red hover:text-primary whitespace-nowrap"
              >
                View Preview
              </button>
              <button
                onClick={handleOpenModal}
                className="px-5 py-2 w-full bg-Red text-primary font-medium rounded-md hover:bg-red-400"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Input fields && Others */}
          <div className="grid grid-cols-1 space-y-2 ">
            {/* Offer Name */}
            <div className="">
              <label htmlFor="offer-name" className="text-charcoal opacity-80 ">
                Offer Name
              </label>
              <input
                id="offer-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex. ABC Pvt. Ltd."
                className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md ${
                  formErrors.name ? "border-red-500" : "border-pale-gray"
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* Offer Description */}
            <div className="">
              <label
                htmlFor="offer-description"
                className="block text-charcoal opacity-80"
              >
                Offer Description
              </label>
              <div className="relative">
                <textarea
                  name="offerDescription"
                  value={offerDescription}
                  id="offer-description"
                  onChange={handleOfferDescriptionChange}
                  rows={3}
                  placeholder="Ex. ABC Pvt. Ltd."
                  aria-invalid={isOfferDescriptionMaxReached}
                  className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md ${
                    formErrors.offerDescription
                      ? "border-red-500"
                      : "border-pale-gray"
                  }`}
                ></textarea>
                <p
                  className={`absolute bottom-3 right-4 text-xs ${
                    isOfferDescriptionMaxReached
                      ? "text-Red"
                      : "text-grayish-blue"
                  }`}
                >
                  {" "}
                  {offerDescription.length}/{maxWords}{" "}
                </p>
              </div>
              {formErrors.offerDescription && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.offerDescription}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="">
              <label
                htmlFor="terms-and-conditions"
                className="block text-charcoal opacity-80"
              >
                Terms and Conditions
              </label>
              <div className="relative">
                <textarea
                  name="termsAndConditions"
                  value={termsConditions}
                  onChange={handleTermsConditionsChange}
                  id="terms-and-conditions"
                  aria-invalid={isTermsConditionsMaxReached}
                  rows={3}
                  placeholder="Ex. ABC Pvt. Ltd."
                  className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md ${
                    formErrors.termsConditions
                      ? "border-red-500"
                      : "border-pale-gray"
                  }`}
                ></textarea>
                <p
                  className={`absolute bottom-3 right-4 text-xs ${
                    isTermsConditionsMaxReached
                      ? "text-Red"
                      : "text-grayish-blue"
                  }`}
                >
                  {" "}
                  {termsConditions.length}/{maxWords}{" "}
                </p>
              </div>
              {formErrors.termsConditions && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.termsConditions}
                </p>
              )}
            </div>

            {/* Ecommerce && Offer Experience */}
            <div className=" flex items-center gap-24  OfferExperience  ">
              {/* Ecommerce */}
              {/* <div className="space-y-1">
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
                    className={` ${
                      eCommerceBtn
                        ? "px-10 py-2 rounded-md bg-Red text-primary"
                        : "px-10 py-2 rounded-md bg-light-gray text-grayish-blue"
                    }`}
                    onClick={() => setECommerceBtn(true)}
                  >
                    {" "}
                    Yes{" "}
                  </button>
                  <button
                    type="button"
                    id="ecommerce-no"
                    className={` ${
                      eCommerceBtn
                        ? "px-10 py-2 rounded-md bg-light-gray text-grayish-blue"
                        : "px-10 py-2 rounded-md bg-Red text-primary"
                    }`}
                    onClick={() => setECommerceBtn(false)}
                  >
                    {" "}
                    No{" "}
                  </button>
                </div>
              </div> */}

              {/* Offer Experience */}
              <div className="space-y-1">
                <label
                  htmlFor="offer-experience"
                  className="block text-charcoal opacity-80"
                >
                  Offer Experience
                </label>
                <div className="flex gap-4">
                  {/* In-store */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="offer"
                      id="in-store"
                      className={`w-[20px] h-[20px] rounded-[5px] ${
                        formErrors.inStore
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={inStore}
                      onChange={handleInStoreChange}
                    />
                    <label
                      htmlFor="in-store"
                      className="text-[18px] text-black font-outfit cursor-pointer"
                    >
                      In-store
                    </label>
                  </div>

                  {/* Online */}
                  {/* <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="offer"
                      id="online"
                      className="w-[20px] h-[20px] rounded-[5px] bg-red-500"
                      value={online}
                      onChange={() => setOnline("yes")}
                    />
                    <label
                      htmlFor="online"
                      className="text-[18px]    text-black font-outfit cursor-pointer"
                    >
                      Online
                    </label>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Brand Logo */}
            <div className="space-y-6 ">
              <div className="flex gap-[50px] flex-col md:flex-row">
                {/* Offer Image Section */}
                <div className="space-y-2 w-[fit-content]">
                  <label
                    htmlFor="offer-image"
                    className="block text-charcoal opacity-80"
                  >
                    Offer Image
                  </label>
                  <div className="flex flex-col">
                    {/* Display Image */}
                    <div className="w-[230px] h-[140px] sm:w-[180px] sm:h-[120px] rounded-xl bg-light-gray overflow-hidden flex items-center justify-center">
                      <Image
                        src={selectedImage || images.profile.profile}
                        alt="Selected Image"
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        id="offer-image-change"
                        className="rounded-md text-charcoal bg-light-gray w-[120px] h-[45px] text-[16px] flex items-center justify-center"
                        onClick={handleChange}
                      >
                        Add Image
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
                        className="rounded-md text-charcoal w-[90px] h-[40px] text-[16px] flex items-center justify-center"
                        onClick={handleRemove}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Offer Video Section */}
                <div className="space-y-2 w-[fit-content]">
                  <label
                    htmlFor="offer-video"
                    className="block text-charcoal opacity-80"
                  >
                    Offer Video
                  </label>
                  <div className="flex flex-col">
                    {/* Display Video */}
                    <div className="w-[230px] h-[140px] sm:w-[180px] sm:h-[120px] rounded-xl bg-light-gray overflow-hidden flex items-center justify-center">
                      {selectedVideo ? (
                        <video
                          src={selectedVideo}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">No Video Selected</span>
                      )}
                    </div>
                    {/* Buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        id="offer-video-change"
                        onClick={handleVideoChangeClick}
                        className="rounded-md text-charcoal bg-light-gray w-[120px] h-[45px] text-[16px] flex items-center justify-center"
                      >
                        Add Video
                      </button>
                      <input
                        type="file"
                        ref={fileInputVideoRef}
                        accept="video/*"
                        style={{ display: "none" }}
                        onChange={handleVideoFileChange}
                      />
                      <button
                        type="button"
                        id="offer-video-remove"
                        onClick={handleVideoRemove}
                        className="rounded-md text-charcoal w-[90px] h-[40px] text-[16px] flex items-center justify-center"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Select Cities */}
            <div className="space-y-1">
              <label
                htmlFor="select-cities"
                className="text-charcoal opacity-80"
              >
                Select Cities
              </label>
              <div className="relative">
                <select
                  id="select-cities"
                  className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md appearance-none pr-10 ${
                    formErrors.selectedCity
                      ? "border-red-500"
                      : "border-pale-gray"
                  }`}
                  value={selectedCity}
                  onChange={handleDropdownCity}
                >
                  {/* Map through options */}
                  {[
                    { label: "Select Cities", value: "selectOptions" },
                    { label: "BOULDER", value: "Boulder" },
                    { label: "COLORADO", value: "Colorado" },
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
              {formErrors.selectedCity && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.selectedCity}
                </p>
              )}
            </div>

            {/* Retail Price Of Offered Product */}
            <div className="space-y-1">
              {/* <label
                htmlFor="retail-price-of-offered-product"
                className="text-charcoal opacity-80"
              >
                Retail Price Of Offered Product
              </label> */}
              <div className="relative">
                {/* <select
                  id="retail-price-of-offered-product"
                  className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md appearance-none pr-10"
                  defaultValue="Enter All Retail Addresses"
                  value={retailPrice}
                  onChange={handleDropdownRetail}
                >
                  Map through options
                  {[
                    {
                      label: "Enter All Retail Addresses",
                      value: "enterAllRetailAddresses",
                    },
                    {
                      label: "$20",
                      value: "$20",
                    },
                    {
                      label: "$24",
                      value: "$24",
                    },
                    {
                      label: "$27",
                      value: "$27",
                    },
                  ].map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select> */}
                <div className="">
                  <label
                    htmlFor="offer-name"
                    className="text-charcoal opacity-80 "
                  >
                    Retail Price Of Offered Product
                  </label>
                  <input
                    id="retail-price"
                    type="number"
                    name="retailPrice"
                    value={formData.retailPrice}
                    onChange={handleInputChange}
                    placeholder="Retail Price Of Offered Product"
                    className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md ${
                      formErrors.retailPrice
                        ? "border-red-500"
                        : "border-pale-gray"
                    }`}
                  />
                  {formErrors.retailPrice && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.retailPrice}
                    </p>
                  )}
                </div>
                {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Image
                    src="/input-arrow.svg"
                    alt="arrow icon"
                    width={100}
                    height={100}
                    className="w-5 h-5"
                  />
                </div> */}
              </div>
            </div>

            {/* Number of Offers to Send */}
            <div className="">
              <label htmlFor="offer-name" className="text-charcoal opacity-80 ">
                Number of Offers to Send*
              </label>
              <input
                id="no-offer"
                type="number"
                min="1"
                placeholder="12"
                className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md ${
                  formErrors.numberOfOffer
                    ? "border-red-500"
                    : "border-pale-gray"
                }`}
                name="numberOfOffer"
                value={formData.numberOfOffer}
                onChange={handleInputChange}
              />
              {formErrors.numberOfOffer && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.numberOfOffer}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* About offers && Offer Validity Section */}
        <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 gap-5">
          {/* About offers */}
          <fieldset className="bg-primary rounded-[30px] p-5 space-y-5 w-full">
            <div className="">
              <legend className="text-2xl font-bold font-outfit text-dark-charcoal">
                About Offer
              </legend>
            </div>

            <div className="space-y-2 ">
              {/* Offer Type */}
              <div className="space-y-0">
                <label
                  htmlFor="offer-type"
                  className="block text-charcoal opacity-80"
                >
                  Offer Type
                </label>
                <div className="relative">
                  <div className="w-full">
                    <select
                      id="offer-type"
                      className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md appearance-none pr-10 ${
                        formErrors.selectedOption
                          ? "border-red-500"
                          : "border-pale-gray"
                      }`}
                      value={selectedOption}
                      onChange={handleOptionChange}
                    >
                      {/* Dropdown options */}
                      {[
                        {
                          label: "Ex. Buy 1 Get 1 Free",
                          value: "selectOptions",
                        },
                        { label: "% Discount", value: "%discount" },
                        { label: "$ Discount", value: "$discount" },
                        { label: "Free Shipping", value: "freeShipping" },
                        { label: "Cash Back", value: "cashBack" },
                        { label: "Sale Price", value: "salePrice" },
                      ].map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Input for Custom Offer */}
                    {selectedOption === "customOffer" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter your custom offer"
                          className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full rounded-md ${
                            formErrors.customOffer
                              ? "border-red-500"
                              : "border-pale-gray"
                          }`}
                          value={customOffer}
                          onChange={handleCustomOfferChange}
                        />
                        {formErrors.customOffer && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.customOffer}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Input for % Discount */}
                    {selectedOption === "%discount" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter Your Discount %"
                          className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full rounded-md ${
                            formErrors.persentDiscount
                              ? "border-red-500"
                              : "border-pale-gray"
                          }`}
                          value={persentDiscount}
                          onChange={handlePercentDiscountChange}
                        />
                        {formErrors.persentDiscount && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.persentDiscount}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Input for $ Discount */}
                    {selectedOption === "$discount" && (
                      <div className="mt-4">
                        <input
                          type="number"
                          placeholder="Enter Your Discount Value"
                          className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full rounded-md ${
                            formErrors.dollarDiscount
                              ? "border-red-500"
                              : "border-pale-gray"
                          }`}
                          value={dollarDiscount}
                          onChange={handleDollarDiscountChange}
                        />
                        {formErrors.dollarDiscount && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.dollarDiscount}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Input for Sale Price */}
                    {selectedOption === "salePrice" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter Your Sale Price"
                          className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full rounded-md ${
                            formErrors.salePrice
                              ? "border-red-500"
                              : "border-pale-gray"
                          }`}
                          value={salePrice}
                          onChange={handleSalePriceChange}
                        />
                        {formErrors.salePrice && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.salePrice}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Input for Cash Back */}
                    {selectedOption === "cashBack" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter Your Cash Back"
                          className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full rounded-md ${
                            formErrors.cashBack
                              ? "border-red-500"
                              : "border-pale-gray"
                          }`}
                          value={cashBack}
                          onChange={handleCashBackChange}
                        />
                        {formErrors.cashBack && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.cashBack}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <img
                      src="/input-arrow.svg"
                      alt="arrow icon"
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              </div>

              {/* Offer Code */}
              <div className="space-y-0">
                <label
                  htmlFor="offer-code"
                  className="block text-charcoal opacity-80"
                >
                  Offer Code
                </label>
                <input
                  id="offer-code"
                  placeholder="Ex. 5431-TM"
                  disabled={true}
                  name="offerCode"
                  value={formData.offerCode}
                  onChange={handleInputChange}
                  className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md border-pale-gray cursor-not-allowed"
                />
              </div>

              {/* Apply to */}
              <div className="space-y-0">
                <label
                  htmlFor="apply-to"
                  className="block text-charcoal opacity-80"
                >
                  Apply to
                </label>
                <input
                  id="apply-to"
                  placeholder="Enter here"
                  required
                  name="applyTo"
                  value={formData.applyTo}
                  onChange={handleInputChange}
                  className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md ${
                    formErrors.applyTo ? "border-red-500" : "border-pale-gray"
                  }`}
                />
                {formErrors.applyTo && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.applyTo}
                  </p>
                )}
              </div>

              {/* Amount of Offer */}
              <div className="space-y-0">
                <label
                  htmlFor="amount-of-offer"
                  className="block text-charcoal opacity-80"
                >
                  Amount of Offer
                </label>
                <input
                  id="amount-of-offer"
                  placeholder="Enter here"
                  required
                  name="offerAmount"
                  value={formData.offerAmount}
                  onChange={handleInputChange}
                  className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full rounded-md ${
                    formErrors.offerAmount
                      ? "border-red-500"
                      : "border-pale-gray"
                  }`}
                />
                {formErrors.offerAmount && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.offerAmount}
                  </p>
                )}
              </div>

              {/* Offer is Shareable */}
              <div className="space-y-0">
                <label
                  htmlFor="offer-experience"
                  className="block text-charcoal opacity-80"
                >
                  Offer is Shareable
                </label>
                <div className="flex gap-4">
                  {/* Yes */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="share"
                      id="yes"
                      className="w-[20px] h-[20px] rounded-[5px] bg-red-500"
                      checked={selected === "yes"}
                      onChange={() => {
                        handleShareableChange(true);
                        setSelected("yes"); // Ensure mutual exclusivity
                      }}
                    />
                    <label
                      htmlFor="yes"
                      className="text-[18px] font-outfit cursor-pointer text-[#718096]"
                    >
                      Yes
                    </label>
                  </div>

                  {/* No */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="share"
                      id="no"
                      className="w-[20px] h-[20px] rounded-[5px] bg-red-500"
                      checked={selected === "no"}
                      onChange={() => {
                        handleShareableChange(false);
                        setSelected("no"); // Ensure mutual exclusivity
                      }}
                    />
                    <label
                      htmlFor="no"
                      className="text-[18px] font-outfit cursor-pointer text-[#718096]"
                    >
                      No
                    </label>
                  </div>
                </div>

                {/* Limit Uses */}
                <div className="space-y-1 " style={{ marginTop: "8px" }}>
                  <label
                    htmlFor="limit-uses"
                    className="block text-charcoal opacity-80"
                  >
                    Limit Uses
                  </label>

                  {isShareable ? (
                    // {/* Unlimited */ }
                    <div className="">
                      <span className="text-[19px] text-[#757980]">
                        Unlimited
                      </span>
                    </div>
                  ) : (
                    // {/* 1 time only */}
                    <div className="">
                      <span className="text-[19px] text-[#757980]">
                        1 time only
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </fieldset>
          {/* Offer Validity Section */}
          <fieldset className="bg-primary rounded-[30px] p-5 space-y-5">
            <div className="">
              <legend className="text-2xl font-bold font-outfit text-dark-charcoal">
                Offer Validity
              </legend>
            </div>

            <div className="space-y-3">
              {/* Valid From && Valid To */}
              <div className="flex sm:flex-row flex-col gap-4 ">
                <div className="flex-1">
                  <label
                    htmlFor="valid-from"
                    className="block text-charcoal opacity-80"
                  >
                    Valid From
                  </label>
                  <input
                    id="valid-from"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border text-grayish-blue rounded-md focus:outline-none focus:border-primary ${
                      formErrors.startDate ? "border-red-500" : "border-Red"
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="valid-to"
                    className="block text-charcoal opacity-80"
                  >
                    Valid To
                  </label>
                  <input
                    id="valid-to"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-Red text-grayish-blue rounded-md focus:outline-none focus:border-primary ${
                      formErrors.endDate ? "border-red-500" : "border-Red"
                    }`}
                  />
                  {formErrors.endDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Don't set an end date */}
              {/* <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="share"
                  id="end-date"
                  className="w-[20px] h-[20px] rounded-[5px] bg-red-500"
                  onChange={() => {
                    setUnlimetedEndDate(!unlimetedEndDate);
                  }}
                />
                <label
                  htmlFor="end-date"
                  className="text-[18px]     font-outfit cursor-pointer text-[#718096]"
                >
                  Don't set an end date
                </label>
              </div> */}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Sidebar main DIV */}
      <div
        className={`w-full sm:max-w-[64vw] md:max-w-[55vw] lg:max-w-[45vw] xl:max-w-[34vw] 2xl:min-w-[25vw] 2xl:max-w-[20vw] fixed top-0 right-0 bg-primary rounded-tl-[24px] rounded-bl-[24px] shadow-lg transform transition-transform duration-300 ease-in z-50  ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }  `}
      >
        {/* Sidebar Content */}
        <aside className="h-screen overflow-y-auto md:h-[100vh] sm:h-[100vh] rounded-tl-3xl rounded-bl-3xl">
          {/* Sidebar main DIV */}
          <div
            className={`w-full sm:max-w-[64vw] md:max-w-[55vw] lg:max-w-[45vw] xl:max-w-[34vw] fixed top-0 right-0 bg-primary rounded-tl-[24px] rounded-bl-[24px] shadow-lg transform transition-transform duration-300 ease-in z-50  ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }  `}
          >
            {/* Sidebar Content */}
            <aside className="grid grid-cols-1 items-center justify-center h-screen overflow-y-auto md:h-[100vh] sm:h-[100vh] rounded-tl-3xl rounded-bl-3xl">
              {/* Close Sidebar Button for Smaller Screens & md screen */}
              <div className="grid grid-cols-12 w-full">
                <div className="items-start justify-start col-span-4 flex">
                  <button
                    aria-label="Close sidebar"
                    onClick={handleViewPreview}
                    className="pl-9 sm:hidden block text-black relative top-0 left-0 w-25 h-25 text-[2rem] hover:text-gray-300 p-2 rounded-tl-[30px] rounded-br-[30px]"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="grid grid-cols-12 gap-4 justify-center items-center w-full mt-2 px-2 lg:p-4 md:p-4 sm:p-4 lg:mt-2 rounded-tl-xl">
                  <div className="col-span-10 grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 justify-center items-center ml-4 sm:ml-2 md:ml-2 xl:ml-2 xl:space-y-2">
                    <div className="col-span-1 flex justify-center items-center">
                      <Image
                        src={images.sidebar.mcDonald}
                        alt="Free Burger Offer"
                        width={100}
                        height={100}
                        className="w-13 h-13 sm:w-16 sm:h-15 md:w-16 md:h-15 xl:w-[14vh] xl:h-[10vh] 2xl:w-20 "
                      />
                    </div>
                    <div className="col-span-3 text-left">
                      <h2 className="xl:text-xl lg:text-[21px] md:text-lg sm:text-lg text-[19px] font-bold font-outfit text-dark-charcoal">
                        {formData.name || "NA"}
                      </h2>
                      <p className="xl:text-sm lg:text-sm md:text-sm sm:text-sm text-[13px] font-proxima text-onyx h-[6vh]">
                        {offerDescription || "NA"}
                        {/* Get a free burger with your purchase of $10 or more */}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end h-full">
                    <button className="flex justify-center items-center text-sm py-1 h-8 w-24 px-1 font-proxima text-primary bg-Red hover:bg-red-400 rounded-full">
                      New
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-12 justify-center items-center mt-3 mb-5">
                <div className="col-span-12 flex justify-center item-center">
                  <Image
                    src={selectedImage || images.sidebar.order}
                    alt="Free Burger Offer"
                    width={100}
                    height={100}
                    className="w-[80%] xl:w-[85%] lg:w-[87%] sm:w-[87%] md:w-[87%] max-w-[400px] max-h-[400px] h-[200px] class"
                    style={{ borderRadius: "12px" }}
                  />
                </div>
              </div>

              <div className="2xl:flex justify-center items-center">
                {/* Offer Details Section */}
                <div className="grid grid-cols-1 px-5 gap-5">
                  <div className="w-full text-left px-1">
                    <h3 className=" xl:text-[28px] text-[24px] md:text-[26px] font-bold text-left opacity-70 text-onyx font-proxima">
                      Offer Details
                    </h3>
                  </div>
                  {/* Offer Dashboard Section */}
                  <div className="grid grid-cols-1  justify-center items-center w-full text-left max-w-[600px] h-[100%] px-4 sm:px-5 py-4 bg-anti-flash-white rounded-[12px] opacity-100 space-y-2">
                    <div className="">
                      <h3 className="opacity-80 text-[#0C0C0C] text-[20px] font-bold leading-[32px] font-proxima">
                        Offer Dashboard
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      {/* <div className="grid grid-cols-2 items-center">
                        <div className="col-span-1 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Ecommerce
                          </span>
                        </div>
                        <div className="col-span-1 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-Red">
                            {eCommerceBtn ? "Yes" : "No"}
                          </span>
                        </div>
                      </div> */}

                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-10 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Offer Delivery Budget Capacity
                          </span>
                        </div>
                        <div className="col-span-2 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            NA
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-10 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Number of Offers to Send
                          </span>
                        </div>
                        <div className="col-span-2 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {formData.numberOfOffer || "NA"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-3 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Cities
                          </span>
                        </div>
                        <div className="col-span-9 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {selectedCity || "NA"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-10 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Retail Price Of Offered Product
                          </span>
                        </div>
                        <div className="col-span-2 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            ${formData.retailPrice || "NA"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-10 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Category
                          </span>
                        </div>
                        <div className="col-span-2 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {formData.applyTo || "NA"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-6 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Sub Category
                          </span>
                        </div>
                        <div className="col-span-6 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {/* Kids Meals */} NA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About Offer Section */}

                  <div className="grid grid-cols-1 justify-center items-center w-full max-w-[600px] h-[100%] px-4 sm:px-5 py-4 bg-anti-flash-white rounded-[12px] opacity-100 space-y-0">
                    <div className="mb-2">
                      <h3 className="w-[200px] h-[32px] gap-0 opacity-85 xl:text-[20px] font-bold leading-[32px] text-left text-[#0C0C0C] font-proxima">
                        About Offer
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      <div className="grid grid-cols-2 items-center">
                        <div className="col-span-1 flex justify-start ">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Offer Type
                          </span>
                        </div>
                        <div className="col-span-1 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {/* Buy 1 Get 1 Free */}
                            {selectedOption || "NA"}
                          </span>
                        </div>
                      </div>
                      {/* 
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-6 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Offer Code
                          </span>
                        </div>
                        <div className="col-span-6 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {formData.offerCode || "NA"}
                          </span>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Offer Validity Section */}

                  <div className="grid grid-cols-1 justify-center items-center w-full max-w-[600px] h-[100%] px-4 sm:px-5 py-4 bg-anti-flash-white rounded-[12px] opacity-100 space-y-0">
                    <div className="mb-2">
                      <h3 className="w-[200px] h-[32px] gap-0 opacity-90 xl:text-[20px] font-bold leading-[32px] font-proxima">
                        Offer Validity
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-3 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Offer Validty
                          </span>
                        </div>
                        <div className="col-span-9 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {/* From Dec 24, 2024 to Jan 10, 2025 */}
                            {`From ${formData.startDate} to ${formData.endDate}`}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-6 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Uses
                          </span>
                        </div>
                        <div className="col-span-6 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {/* Unlimited */}
                            {isShareable ? "Unlimited" : "1 time only"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="justify-center text-center px-5 grid grid-cols-1 py-4 2xl:px-14">
                <button
                  onClick={handleOpenModal}
                  className="col-span-1 py-3  sm:text-[15px] md:text-[15px] bg-Red text-primary font-inter rounded-lg transition-all duration-0"
                >
                  Upload New Offer
                </button>
              </div>
            </aside>
          </div>
        </aside>
      </div>

      {isSidebarOpen && (
        <div
          onClick={handleViewPreview}
          className="fixed inset-0 bg-black opacity-60 z-40"
        />
      )}

      {/* Successful Modal */}
      {isModalOpen && (
        <div
          aria-hidden={!isModalOpen}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          className="font-outfit fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-5"
        >
          <div className="bg-primary relative p-5 shadow-2xl w-[95%] sm:h-[60%] sm:w-[30vw] md:w-[50%] md:h-[60vh] lg:w-[40%] lg:h-[45vh] xl:w-[33%] xl:h-[27vw] 2xl:w-auto 2xl:h-auto rounded-[30px] h-auto overflow-hidden overflow-y-auto">
            <div className="flex text-center justify-center">
              <button
                onClick={handleCloseModal}
                className="... !text-[1.5rem] absolute top-0 right-0 w-[55px] h-[55px] xl:w-[60px] xl:h-[60px] lg:w-[55px] md:h-[60px] md:w-[55px] text-black hover:text-gray-300 p-2 flex items-center justify-center rounded-bl-[30px] rounded-tr-[30px]"
              >
                &times;
              </button>
            </div>
            {!isConfirmed ? (
              <div className="grid grid-cols-1 gap-10 px-2 2xl:w-auto sm:mt-5 mt-6 2xl:mt-8 text-center ">
                <div className="">
                  <h2 className="font-bold text-2xl md:text-3xl">
                    {" "}
                    Offer Confirmation
                  </h2>
                </div>

                <div className="space-y-5">
                  {modalData.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex justify-between md:text-lg lg:text-xl text-base"
                    >
                      <span
                        id={`${item.id}-label`}
                        className="font-light leading-[25px] text-left text-dark-gray"
                      >
                        {item.label}
                      </span>
                      <span
                        id={`${item.id}-value`}
                        className="font-normal leading-[25px] text-right text-dim-gray"
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-base md:text-lg xl:mt-6">
                  <button
                    onClick={async () => {
                      const offerCreated = await handleCreateOffer(); // Wait for the result of offer creation

                      if (offerCreated) {
                        handleUpload(); // Run upload only if the offer is created successfully
                      }
                    }}
                    className="md:text-lg text-base py-2 md:py-2.5 w-full rounded-md order border-Red hover:bg-primary hover:border hover:border-Red hover:text-Red text-primary bg-Red"
                  >
                    {status === "loading" ? "Creating Offer..." : "Confirm"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 px-2 mt-5 lg:mt-3 justify-center items-center text-center">
                <div className="flex items-center justify-center">
                  <Image
                    alt="Success"
                    width={100}
                    height={100}
                    src={images.success.success}
                    className="md:w-32 md:h-32 lg:w-36 lg:h-36"
                  />
                </div>

                <div className="text-2xl md:text-3xl">
                  <h2 className="font-bold ">
                    Successful <br /> Confirmation
                  </h2>
                </div>

                <div className="text-base md:text-lg xl:mt-5">
                  <button
                    onClick={handleCloseModal}
                    className="py-2 w-full  rounded-md border  border-Red hover:bg-primary hover:border hover:border-Red hover:text-Red text-primary bg-Red "
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
