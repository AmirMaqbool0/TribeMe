"use client";
import images from "@/src/assets/images";
// import { CustomCheckbox } from "@/src/components/component/CustomCheckBox";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateOffer, resetUpdateOfferState } from "@/redux/updateOfferSlice";
import { RootState, AppDispatch } from "@/redux/store";
import {
  fetchBrandDetails,
  selectBrandDetails,
  selectBrandStatus,
  selectBrandError,
} from "../../../../../../redux/brandSlice";
import { uploadImage } from "@/redux/uploadBrandLogo";
import Toast from "@/src/components/Toast/Toast";
import { uploadVideo } from "@/redux/uploadOfferVideo";

// const modalData = [
//     { id: "offerName", label: "Offer Name", value: "XYZ" },
//     { id: "offerCode", label: "Offer Code", value: "5431-TM" },
//     { id: "category", label: "Category", value: "Sports" },
//     { id: "costDelivery", label: "Cost Delivery Cost", value: "234$" },
// ];

const LiveEdit = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [eCommerceBtn, setECommerceBtn] = useState<boolean>(false);
  const [online, setOnline] = useState("");
  const [inStore, setInstore] = useState("");

  const [isShareable, setIsShareable] = useState<boolean>(false);
  const [termsConditions, setTermsConditions] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [selected, setSelected] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [endDate, setEndDate] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState(""); // State to track selected option
  const [customOffer, setCustomOffer] = useState(""); // State for custom offer input
  const [persentDiscount, setPersentDiscount] = useState(""); // State for Persent Discount offer input
  const [dollarDiscount, setDollarDiscount] = useState(""); // State for Dollar Discount offer input
  const [salePrice, setSalePrice] = useState(""); // State for sale Price offer input
  const [cashBack, setCashBack] = useState(""); // State for Cash Back offer input
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]); // for check box in store or online
  // const [paramsData, setParamsData] = useState({}); // State for getting params data

  const fileInputImageRef = useRef<HTMLInputElement | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const fileInputVideoRef = useRef<HTMLInputElement>(null);
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
  const searchParams = useSearchParams();
  const [paramsData, setParamsData] = useState<Record<
    string,
    string | null
  > | null>(null);

  // Parse searchParams into paramsData
  useEffect(() => {
    const paramsObject: Record<string, string | null> = {};
    searchParams.forEach((value, key) => {
      paramsObject[key] = value;
    });

    setParamsData(paramsObject);
  }, [searchParams]);
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

  // Initialize formData state
  const [formData, setFormData] = useState({
    name: "",
    retailPrice: "",
    numberOfOffer: "",
    offerCode: "",
    applyTo: "",
    offerAmount: "",
    startDate: "",
    endDate: "",
  });

  // Sync formData with paramsData
  useEffect(() => {
    if (paramsData) {
      setFormData({
        name: paramsData?.offerName || "",
        retailPrice: paramsData.retailPrice || "",
        offerCode: paramsData.offerCode || "",
        applyTo: paramsData.applyTo || "",
        offerAmount: paramsData.offerAmount || "",
        startDate: paramsData.startDate || "",
        endDate: paramsData.endDate || "",
        numberOfOffer: paramsData.userLimit || "",
      });
      setOfferDescription(paramsData.offerDescription || "");
      setTermsConditions(paramsData.offerTermsCondition || "");
      setSelectedCity(paramsData.cities || "");
      setSelectedOption(paramsData.offerType || ""); // Pre-fill the selected offer type
      setOnline(paramsData.online ? "yes" : "no");
      setInstore(paramsData.inStore ? "yes" : "no");
    }
  }, [paramsData]);

  // Debugging

  console.log("paramsData:", paramsData);
  console.log("formData:", formData);

  const dispatch: AppDispatch = useDispatch();
  // const router = useRouter();

  // Access the slice state for feedback (loading, error, success)
  const { loading, success, error } = useSelector(
    (state: RootState) => state.updateOffer
  );

  // Fetching Brand Id
  const brandDetails = useSelector(selectBrandDetails);
  useEffect(() => {
    dispatch(fetchBrandDetails());
  }, [dispatch]);

  // Update Offer
  const handleUpdateOffer = async () => {
    if (!paramsData?.id) {
      console.error("Offer ID is missing.");
      toast(
        <Toast
          message="Offer ID is missing."
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      // alert('Offer ID is missing.');
      return;
    }

    const startDate = formData.startDate
      ? formatDate(formData.startDate)
      : null;
    const endDate = formData.endDate ? formatDate(formData.endDate) : null;

    if (!startDate || !endDate) {
      // console.error('Start date or end date is missing or invalid.');
      // alert('Start date or end date is missing or invalid.');
      toast(
        <Toast
          message="Start date or end date is missing or invalid."
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      return;
    }

    // Determine offerType based on selectedOption
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
        offerType = customOffer; // Use custom offer value
        break;
      default:
        offerType = "";
        break;
    }

    // Ensure offerType is valid
    if (!offerType) {
      // console.error('Offer type is missing.');
      // alert('Offer type is missing.');
      toast(
        <Toast
          message="Offer type is missing."
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      return;
    }

    // Prepare the update data
    const updateData = {
      offerName: formData.name,
      offerDescription,
      offerTermsCondition: termsConditions,
      retailPrice: parseInt(formData.retailPrice),
      userLimit: "9",
      offerType,
      // eCommerce: eCommerceBtn,
      cities: [selectedCity],
      offerCode: formData.offerCode,
      applyTo: [formData.applyTo],
      offerAmount: formData.offerAmount,
      discountPercentage: parseInt(persentDiscount) || 2,
      startDate,
      endDate,
      inStore: inStore == "yes" ? true : false,
      // online: online == 'yes' ? true : false,
      setTimeUnlimited: false,
      isShareable: "yes",
      brandId: brandDetails?.id || "brandId",
    };

    try {
      const resultAction = await dispatch(
        updateOffer({ offerId: paramsData.id, updateData })
      );
      if (updateOffer.fulfilled.match(resultAction)) {
        // console.log('Offer updated successfully!');
        toast(
          <Toast
            message="Offer updated successfully!"
            backgroundColor="green"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );

        // Upload Video

        if (selectedVideoFile) {
          await handleUploadVideo(paramsData.id, selectedVideoFile);
          toast(
            <Toast
              message="Offer created successfully with an Video"
              backgroundColor="green"
              textColor="white"
            />,
            {
              closeButton: false,
            }
          );
        } else {
          toast(
            <Toast
              message="Offer Update successfully without an video"
              backgroundColor="green"
              textColor="white"
            />,
            {
              closeButton: false,
            }
          );
        }
        handleUpload();
      } else {
        // alert('Failed to update the offer.');
        toast(
          <Toast
            message="Failed to update the offer."
            backgroundColor="red"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast(
        <Toast
          message="An unexpected error occurred."
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
      // alert('An unexpected error occurred.');
    }
  };

  //  Handler Form Data input

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Dynamically update the state for the input
    });
  };

  const handleCancel = () => {
    router.back();
  };

  const maxWords = 200;

  const handleOfferDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= maxWords) {
      setOfferDescription(value);
    }
  };

  const handleTermsConditionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= maxWords) {
      setTermsConditions(value);
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
  // Handel DropDown Value
  const handleDropdownCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value); // Update the state with the selected value
  };
  const handleEcommerceYes = () => {};

  const handleEcommerceNo = () => {};

  const handleOfferChange = () => {};

  const handleOfferRemove = () => {};

  // Handle changing the "Offer is Shareable" state
  const handleShareableChange = (value: boolean) => {
    setIsShareable(value);
  };

  // For Input Image

  const handleChange = () => {
    fileInputImageRef.current?.click(); // Trigger the file input click
  };

  // Updated handleFileChangeImage2 with image size check
  const handleFileChangeImage2 = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);
      const img: HTMLImageElement = new window.Image(); // ✅ Explicit typing

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
          event.target.value = ""; // Reset file input if the image is too small
        } else {
          setSelectedImage(imageURL);

          const offerId = paramsData?.id || "default-brand-id";

          dispatch(uploadImage({ file, brandId: offerId }))
            .unwrap()
            .then((response) => {
              console.log("Image uploaded successfully:", response.imageUrl);
            })
            .catch((error) => {
              console.error("Error uploading image:", error.message || error);
            });
        }
      };

      img.onerror = () => {
        alert("Invalid image file. Please try again.");
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

        // Dispatch the uploadVideo action and wait for the response
        const resultAction = await dispatch(
          uploadVideo({ file: file, brandId: offerId })
        );

        if (uploadVideo.fulfilled.match(resultAction)) {
          const response = resultAction.payload; // Full API response
          console.log("Full Response:", response);

          // Extract video URL or any other information from the response
          const videoUrl = response.data?.[0]?.video?.url;

          toast(
            <Toast
              message={`Video uploaded successfully! Video URL: ${videoUrl}`}
              backgroundColor="green"
              textColor="white"
            />,
            { closeButton: false }
          );
        } else {
          const errorMessage =
            resultAction.payload?.message || "Failed to upload video.";
          toast(
            <Toast
              message={errorMessage}
              backgroundColor="red"
              textColor="white"
            />,
            { closeButton: false }
          );
        }
      } catch (error) {
        toast(
          <Toast
            message="An unexpected error occurred. Please try again."
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

  //  offer dropdown

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div>
      <div className="sm:text-base text-sm tracking-wider grid grid-cols-1 text-black font-inter lg:grid-cols-12 xl:grid-cols-12 gap-5">
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
                onClick={handleOpenModal}
                className="px-5 py-2 w-full  bg-primary border border-Red text-Red font-medium rounded-md hover:bg-Red hover:text-primary whitespace-nowrap"
              >
                Confirm Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-2 w-full bg-Red text-primary font-medium rounded-md hover:bg-red-400"
              >
                cancel
              </button>
            </div>
          </div>

          {/* Input fields && Others */}
          <div className="grid grid-cols-1 space-y-2">
            {/* Offer Name */}
            <div className="space-y-0">
              <label htmlFor="offer-name" className="text-charcoal opacity-80">
                Offer Name
              </label>
              <input
                id="offer-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex. ABC Pvt. Ltd."
                className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
              />
            </div>

            {/* Offer Description */}
            <div className="space-y-0">
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
                  className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md ${
                    isOfferDescriptionMaxReached
                      ? "border-Red animate-light-shake"
                      : ""
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
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-0">
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
                  className={`px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md ${
                    isTermsConditionsMaxReached
                      ? "border-Red animate-light-shake"
                      : ""
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
            </div>

            {/* Ecommerce && Offer Experience */}
            <div className="flex items-center gap-24  OfferExperience ">
              {/* Ecommerce */}
              {/* <div className="space-y-0">
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
              <div className="space-y-0 ">
                <label
                  htmlFor="offer-experience"
                  className="block text-charcoal opacity-80"
                >
                  Offer Experience
                </label>
                <div className="flex items-center gap-4">
                  {/* In-store */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="offer"
                      id="in-store"
                      checked={inStore == "yes"}
                      value={inStore}
                      onChange={() =>
                        setInstore(inStore == "yes" ? "no" : "yes")
                      }
                    />
                    <label
                      htmlFor="in-store"
                      className="text-[18px]   text-black font-outfit cursor-pointer"
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
                      checked={online=='yes'}
                      className="w-[20px] h-[20px] rounded-[5px] bg-red-500"
                      value={online}
                      onChange={() => setOnline( online == "yes" ? 'no' :'yes')}
                    />
                    <label
                      htmlFor="online"
                      className="text-[18px]    text-black font-outfit cursor-pointer"
                    >
                      Online
                    </label>
                  </div> */}

                  {/* In-store */}
                  {/* <div className="flex items-center justify-center space-x-1">
                                        <input
                                            type="checkbox"
                                            
                                            id="in-store"
                                            className="w-4 h-4 transition-colors duration-200 bg-primary border border-Red rounded-[2px] focus:ring-primary focus:ring-1 checked:bg-Red checked:border-transparent appearance-none"
                                            onChange={() => console.log('In-store clicked')}
                                        />
                                        <label  htmlFor="in-store" className=" text-black">In-store</label>
                                    </div> */}

                  {/* Online */}
                  {/* <div className="flex items-center justify-center space-x-1">
                                        <input
                                            type="checkbox"
                                            id="online"
                                            className="w-4 h-4 transition-colors duration-200 bg-primary border border-Red rounded-[2px] checked:bg-Red checked:border-transparent appearance-none"
                                            onChange={() => console.log('Online clicked')}
                                        />
                                        <label htmlFor="online" className="text-black">Online</label>
                                    </div> */}
                </div>
              </div>
            </div>

            {/* Brand Logo */}
            <div className="space-y-6">
              <div className="flex gap-[50px] max-[580px]:flex-col min-[580px]:flex-row">
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
                  className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md appearance-none pr-10"
                  // defaultValue="Select Cities"
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
                >
                  Map through options
                  {[
                    {
                      label: "Enter All Retail Addresses",
                      value: "enterAllRetailAddresses",
                    },
                  ].map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select> */}
                {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Image
                    src="/input-arrow.svg"
                    alt="arrow icon"
                    width={100}
                    height={100}
                    className="w-5 h-5"
                  />
                </div> */}
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
                    className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
                  />
                </div>
              </div>
              {/* <input id="select-cities" type="text" placeholder="retail-price-of-offered-product" className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md" /> */}
            </div>

            {/* Number of Offers to Send */}
            <div className="">
              <label htmlFor="offer-name" className="text-charcoal opacity-80 ">
                Number of Offers to Send*
              </label>
              <input
                id="offer-name"
                type="number"
                placeholder="12"
                name="numberOfOffer"
                value={formData.numberOfOffer}
                onChange={handleInputChange}
                className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
              />
            </div>
          </div>
        </fieldset>

        {/* About offers && Offer Validity Section */}
        <div className=" lg:col-span-5 xl:col-span-4 grid grid-cols-1 gap-5">
          {/* About offers */}
          <fieldset className="bg-primary rounded-[30px] p-5 space-y-5">
            <div className="">
              <legend className="text-2xl font-bold font-outfit text-dark-charcoal">
                About Offer
              </legend>
            </div>

            <div className="space-y-2">
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
                      className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md appearance-none pr-10"
                      value={selectedOption}
                      onChange={handleOptionChange} // Handle dropdown change
                    >
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
                          className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full border-pale-gray rounded-md"
                          value={customOffer}
                          onChange={(e) => setCustomOffer(e.target.value)} // Update custom offer state
                        />
                      </div>
                    )}
                    {/* Additional inputs for other offer types (discount, cashBack, etc.) */}
                    {/* Input for Persent Discount Offer */}
                    {selectedOption === "%discount" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter Your Discount %"
                          className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full border-pale-gray rounded-md"
                          value={persentDiscount}
                          onChange={(e) => setPersentDiscount(e.target.value)} // Update custom offer state
                        />
                      </div>
                    )}
                    {/* Input for Dollar Discount Offer */}
                    {selectedOption === "$discount" && (
                      <div className="mt-4">
                        <input
                          type="number"
                          placeholder="Enter Your Discount Value"
                          className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full border-pale-gray rounded-md"
                          value={dollarDiscount}
                          onChange={(e) => setDollarDiscount(e.target.value)} // Update custom offer state
                        />
                      </div>
                    )}
                    {/* Input for Sale Price Offer */}
                    {selectedOption === "salePrice" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter Your Sale Price"
                          className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full border-pale-gray rounded-md"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)} // Update custom offer state
                        />
                      </div>
                    )}
                    {/* Input for Sale Price Offer */}
                    {selectedOption === "cashBack" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter Your Cash Back"
                          className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-white text-gray-700 border-2 w-full border-pale-gray rounded-md"
                          value={cashBack}
                          onChange={(e) => setCashBack(e.target.value)} // Update custom offer state
                        />
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
                  required
                  name="offerCode"
                  onChange={handleInputChange}
                  value={formData.offerCode}
                  className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
                />
              </div>

              {/* Offer Name */}
              <div className="space-y-0">
                <label
                  htmlFor="offer-name"
                  className="block text-charcoal opacity-80"
                >
                  Offer Name
                </label>
                <input
                  id="offer-name"
                  placeholder="Ex. Bhayankar offer"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
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
                  onChange={handleInputChange}
                  value={formData.applyTo}
                  className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
                />
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
                  type="text"
                  placeholder="Enter here"
                  required
                  name="offerAmount"
                  onChange={handleInputChange}
                  value={formData.offerAmount}
                  className="px-4 py-2 focus:outline-none focus:border-gray-300 bg-light-gray text-grayish-blue border-2 w-full border-pale-gray rounded-md"
                />
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
              </div>

              {/* Limit Uses */}
              <div className="space-y-1">
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
              <div className="flex sm:flex-row flex-col gap-4">
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
                    className="w-full px-4 py-2 border text-grayish-blue border-Red rounded-md focus:outline-none focus:border-primary"
                  />
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
                    className="w-full px-4 py-2 border border-Red text-grayish-blue rounded-md focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Don’t set an end date */}
              {/* <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="share"
                  id="end-date"
                  className="w-[20px] h-[20px] rounded-[5px] bg-red-500"
                  onChange={(e) => {
                    setEndDate(true);
                  }}
                />
                <label
                  htmlFor="end-date"
                  className="text-[18px]     font-outfit cursor-pointer text-[#718096]"
                >
                  Don’t set an end date
                </label>
              </div> */}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Sidebar main DIV */}
      <div
        className={`w-full sm:max-w-[64vw] md:max-w-[55vw] lg:max-w-[45vw] xl:max-w-[34vw] fixed top-0 right-0 bg-primary rounded-tl-[24px] rounded-bl-[24px] shadow-lg transform transition-transform duration-300 ease-in z-50  ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }  `}
      >
        {/* Sidebar Content */}
        <aside className="h-screen overflow-y-auto md:h-[100vh] sm:h-[100vh] rounded-tl-3xl rounded-bl-3xl">
          {/* Close Sidebar Button for Smaller Screens & md screen */}
          <div className="flex items-start justify-start w-[20vh]">
            <button
              aria-label="Close sidebar"
              onClick={handleViewPreview}
              className="lg:hidden md:hidden sm:hidden text-primary  hover:bg-red-400 relative top-0 left-0 w-[40px] h-[50px] text-[2rem]  hover:text-gray-300 p-2 bg-Red flex items-center justify-center rounded-br-[30px] rounded-tl-[25px]"
            >
              &times;
            </button>
          </div>

          {/* Sidebar main DIV */}
          <div
            className={`w-full sm:max-w-[64vw] md:max-w-[55vw] lg:max-w-[45vw] xl:max-w-[34vw] fixed top-0 right-0 bg-primary rounded-tl-[24px] rounded-bl-[24px] shadow-lg transform transition-transform duration-300 ease-in z-50  ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }  `}
          >
            {/* Sidebar Content */}
            <aside className="h-screen overflow-y-auto md:h-[100vh] sm:h-[100vh] rounded-tl-3xl rounded-bl-3xl">
              {/* Close Sidebar Button for Smaller Screens & md screen */}
              <div className="grid grid-cols-12 w-full">
                <div className="items-start justify-start col-span-12 flex">
                  <button
                    aria-label="Close sidebar"
                    onClick={handleViewPreview}
                    className="lg:hidden md:hidden sm:hidden text-primary  hover:bg-red-400 relative top-0 left-0 w-25 h-[50px] text-[2rem]  hover:text-gray-300 p-2 bg-Red flex items-center justify-center rounded-br-[30px] rounded-tl-[25px]"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 justify-center items-center w-full mt-2 px-2 lg:p-4 md:p-4 sm:p-4 lg:mt-2 rounded-tl-xl">
                <div className="col-span-10 grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 justify-center items-center ml-4 sm:ml-2 md:ml-2 xl:ml-2 xl:space-y-2">
                  <div className="col-span-1 flex justify-center items-center">
                    <Image
                      src={images.sidebar.mcDonald}
                      alt="Free Burger Offer"
                      width={100}
                      height={100}
                      className="w-13 h-13 sm:w-16 sm:h-15 md:w-16 md:h-15 xl:w-[14vh] xl:h-[10vh]"
                    />
                  </div>
                  <div className="col-span-3 text-left">
                    <h2 className="xl:text-xl lg:text-[21px] md:text-lg sm:text-lg text-[19px] font-bold font-outfit text-dark-charcoal">
                      Free Burger Offer
                    </h2>
                    <p className="xl:text-sm lg:text-sm md:text-sm sm:text-sm text-[13px] font-proxima text-onyx h-[6vh]">
                      Get a free burger with your purchase of $10 or more
                    </p>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end h-full">
                  <button className="flex justify-center items-center text-sm py-1 h-8 w-24 px-1 font-proxima text-primary bg-Red hover:bg-red-400 rounded-full">
                    Live
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 justify-center items-center mt-3 mb-5">
                <div className="col-span-12 flex justify-center item-center">
                  <Image
                    src={images.sidebar.order}
                    alt="Free Burger Offer"
                    width={100}
                    height={100}
                    className="w-[80%] xl:w-[85%] lg:w-[87%] sm:w-[87%] md:w-[87%] max-w-[400px] max-h-[400px] h-auto"
                  />
                </div>
              </div>

              {/* Offer Details Section */}
              <div className="grid grid-cols-1 px-5 gap-5">
                <div className="w-full xl:text-left lg:text-left md:text-left text-center px-1">
                  <h3 className=" xl:text-[28px] text-[24px] md:text-[26px] font-bold leading-[32px] text-left w-[220px] h-[32px] gap-0 opacity-70 text-onyx font-proxima">
                    Offer Details
                  </h3>
                </div>

                {/* Offer Dashboard Section */}
                <div className="w-full max-w-[600px] h-[100%] px-2 xl:px-6 lg:px-6 md:px-6 py-4 bg-anti-flash-white rounded-[12px] opacity-100 space-y-0">
                  <div className="mb-2">
                    <h3 className="w-[200px] h-[32px] gap-0 opacity-80 text-[#0C0C0C] xl:text-[20px] font-bold leading-[32px] text-left font-proxima">
                      Offer Dashboard
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 text-sm">
                    <div className="grid grid-cols-2 items-center">
                      <div className="col-span-1 flex justify-start">
                        <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                          Ecommerce
                        </span>
                      </div>
                      <div className="col-span-1 w-full flex justify-end">
                        <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-Red">
                          No
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-10 flex justify-start">
                        <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                          Offer Delivery Budget Capacity
                        </span>
                      </div>
                      <div className="col-span-2 w-full flex justify-end">
                        <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                          $50
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
                          12
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
                          New York, New Jersey
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
                          $24
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
                          Food
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
                          Fast Food
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Offer Section */}

                <div className="w-full max-w-[600px] h-[100%] px-2 xl:px-6 lg:px-6 md:px-6 py-4 bg-anti-flash-white rounded-[12px] opacity-100 space-y-0">
                  <div className="mb-2">
                    <h3 className="w-[200px] h-[32px] gap-0 opacity-85 xl:text-[20px] font-bold leading-[32px] text-left text-[#0C0C0C] font-proxima">
                      About Offer
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 text-sm">
                    <div className="grid grid-cols-2 items-center">
                      <div className="col-span-1 flex justify-start">
                        <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                          Offer Type
                        </span>
                      </div>
                      <div className="col-span-1 w-full flex justify-end">
                        <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                          Buy 1 Get 1 Free
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-6 flex justify-start">
                        <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                          Offer Code
                        </span>
                      </div>
                      <div className="col-span-6 w-full flex justify-end">
                        <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                          5431-TM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Validity Section */}

                <div className="w-full max-w-[600px] h-[100%] px-2 xl:px-6 lg:px-6 md:px-6 py-4 bg-anti-flash-white rounded-[12px] opacity-100 space-y-0">
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
                          From July 10, 2023 to Aug 10, 2024
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
                          Unlimited
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="justify-center text-center px-5 grid grid-cols-1 py-4">
                <button
                  onClick={handleOpenModal}
                  className="col-span-1 py-3 sm:text-[15px] md:text-[15px] bg-Red text-primary font-inter rounded-lg transition-all duration-0"
                >
                  Save and Upload Live Offer
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
          className="font-outfit fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-5"
        >
          <div className="bg-primary relative p-5 shadow-2xl w-[95%] sm:h-[55%] sm:w-[55%] md:w-[50%] md:h-[58%] lg:w-[40%] lg:h-[45%] xl:w-[65vh] xl:h-[57%] 2xl:w-auto 2xl:h-auto rounded-[30px] h-auto max-h-[90vh] overflow-y-auto">
            <div className="flex text-center justify-center">
              <button
                onClick={handleCloseModal}
                className="... !text-[2rem] absolute top-0 right-0 w-[55px] h-[55px] xl:w-[60px] xl:h-[60px] lg:w-[55px] md:h-[60px] md:w-[55px] text-black hover:text-gray-300 p-2 flex items-center justify-center rounded-bl-[30px] rounded-tr-[30px]"
              >
                &times;
              </button>
            </div>
            {!isConfirmed ? (
              <div className="grid grid-cols-1 gap-5 px-2 pt-14 items-center justify-center text-center">
                <div className="flex items-center justify-center sm:m-4">
                  <h2 className="font-bold text-2xl md:text-3xl">
                    {" "}
                    Do you want to make the changes
                    <br /> in live offer?{" "}
                  </h2>
                </div>

                <div className="text-base md:text-lg">
                  <button
                    onClick={() => {
                      if (!loading) {
                        handleUpdateOffer();
                      }
                    }}
                    className={`md:text-lg text-base py-2 md:py-2.5 w-full rounded-md ${
                      loading
                        ? "bg-gray-400 text-white cursor-not-allowed" // Loading state style
                        : "hover:bg-primary hover:border hover:border-Red hover:text-Red text-primary bg-Red"
                    }`}
                    disabled={loading} // Disable the button when loading
                  >
                    {loading ? "Loading..." : "Confirm"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 px-2 mt-5 lg:mt-3 justify-center items-center text-center">
                <div className="flex items-center justify-center">
                  <Image
                    alt="Success"
                    width={100}
                    height={100}
                    src={images.success.success}
                    className="lg:w-32 lg:h-32"
                  />
                </div>

                <div className="text-2xl md:text-3xl">
                  <h2 className="font-bold ">
                    Successful <br /> Changes
                  </h2>
                </div>

                <div className="text-base md:text-lg w-full">
                  <button
                    onClick={handleCloseModal}
                    className="py-2 w-full  rounded-md hover:bg-primary hover:border hover:border-Red hover:text-Red text-primary bg-Red"
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
export default LiveEdit;
