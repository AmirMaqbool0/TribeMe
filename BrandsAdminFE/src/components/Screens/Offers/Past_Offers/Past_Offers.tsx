"use client";
import images from "@/src/assets/images";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { RootState, AppDispatch } from "../../../../../redux/store";
import { fetchPastOffers } from "@/redux/pastOfferFetchSlice";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { updateOffer, resetUpdateOfferState } from "@/redux/updateOfferSlice";
import {
  fetchBrandDetails,
  selectBrandDetails,
  selectBrandStatus,
  selectBrandError,
} from "../../../../../redux/brandSlice";
import { renewOffer } from "@/redux/renewOfferSlice";
import { toast } from "react-toastify";
import Toast from "@/src/components/Toast/Toast";
const tableHeader = [
  "Name",
  "Image",
  "Code",
  "Category",
  "Sales",
  "Delivery Cost",
  "Redemption",
  "Expiry Date",
  "Remaining",
  "",
];


interface SelectedOffer {
  id:string;
  offerName: string;
  offerImages: string;
  eCommerce: string;
  offerDeliveryBudgetCapacity: string;
  numberOfOffersToSend: string;
  cities: string;
  retailPrice: string;
  applyTo: string;
  subCategory: string;
  offerType: string;
  offerCode: string;
  offerValidity: string;
  uses: string;
  sales: string;
  delivery: string;
  redemption: string;
  endDate: string;
  remaining: string;
  isShareable: boolean;
}

export const PastOffers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer | null >(
    null
  );
  const dispatch = useDispatch<AppDispatch>(); // Dispatch is typed with AppDispatch
  const { offers, isLoading, error } = useSelector(
    (state: RootState) => state?.pastOfferFetch
  );
  console.log('this is the error ......', error)
  const [isDataLoaded, setIsDataLoaded] = useState(false); // For checking if data is loaded
  const [isClient, setIsClient] = useState(false); // Track whether we're on the client
  // Fetch live offers on component mount
  useEffect(() => {
    dispatch(fetchPastOffers(1)); // Pass the current page number
  }, [dispatch]);

  // Set the loading state once offers are available
  useEffect(() => {
    if (offers && offers.length > 0) {
      setIsDataLoaded(true);
    }
  }, [offers]);

  // Track client-side rendering (important for `localStorage` usage)
  useEffect(() => {
    setIsClient(true);
  }, []);
  // brand Detail
  const brandDetails = useSelector(selectBrandDetails);
  useEffect(() => {
    dispatch(fetchBrandDetails());
  }, [dispatch]);
  //  update Formate Date
  const updateFormatDate = (dateString: string): string => {
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

  // Initialize state with empty values
  const [formData, setFormData] = useState({
    offerName: "",
    offerCode: "",
    category: "",
    deliveryCost: "",
    endDate: "",
  });

  // Update formData when selectedOffer changes
  useEffect(() => {
    if (selectedOffer) {
      setFormData({
        offerName: selectedOffer.offerName || "",
        offerCode: selectedOffer.offerCode || "",
        category: selectedOffer.applyTo || "",
        deliveryCost: selectedOffer.delivery || "",
        endDate: selectedOffer.endDate,
      });
    }
  }, [selectedOffer]);
  console.log("this is form data...", formData);

  // Renew Offers

  const handleUpdateOffer = async () => {
   setLoading(true)
    
    const endDate = formData.endDate ? updateFormatDate(formData.endDate) : null;
    if (!endDate) {
      console.error("End date is missing or invalid.");
      toast(
        <Toast  message="End date is missing or invalid" backgroundColor="red" textColor="white"/>,
        {
          closeButton: false,
        }
      )
      return;
    }
  
    const updateData = {
      offerName: formData.offerName,
      offerCode: formData.offerCode,
      applyTo: formData.category ? [formData.category] : [], // Ensure it's not undefined
      endDate: endDate,
    };
  
    console.log("Data before sending:", updateData);
  
    try {
      const resultAction = await dispatch(renewOffer({ 
        offerId: selectedOffer?.id || '', 
        renewData: updateData 
      }));
  
      if (renewOffer.fulfilled.match(resultAction)) {
        setLoading(false)
        console.log("Offer updated successfully!");
        handleConfirm();
      } else {
        setLoading(false)
        // console.error("Update failed:", resultAction.payload);
        toast(
          <Toast  message={resultAction.payload || ''} backgroundColor="red" textColor="white" />,{
            closeButton: false,
          }
        )
      }
    } catch (error) {
      // console.error("Unexpected error:", error);
      toast(
        <Toast  message={'An unexpected error occurred.'} backgroundColor="red" textColor="white" />,{
          closeButton: false,
        }

      )
      // alert("An unexpected error occurred.");
    }
  };
  
  // Handle change for input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value, // Dynamically update the field based on its id
    }));
  };

  const handleViewPreview = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleRenewOffer = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsConfirmed(false);
  };

  // Function to handle Offer Name

  const handelOfferName = (name: string) => {
    const truncName = name.substring(0, 6);
    return truncName + "...";
  };

  const handelOfferDescription = (name: string | undefined) => {
    if (!name) {
      return "..."; // Return a fallback if name is undefined
    }
    const truncName = name.substring(0, 60);
    return truncName + "...";
  };
  
  const ITEMS_PER_PAGE = 5; // Number of items per page

  // Handle page number clicks
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total pages based on the number of offers
  const totalPages = Math.ceil(offers.length / ITEMS_PER_PAGE);

  // Paginate offers for the current page
  const paginatedOffers = offers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "MM/dd/yyyy"); // Convert to "MM/dd/yyyy" format
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original date string if there's an error
    }
  };
   
  // Show loading state until data is loaded
  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a loader component
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!offers || offers.length === 0) {
    return <div>No data available for past offers.</div>;
  }
  if (error == 'null') {
    return <div>No data available for past offers.</div>;
  }
  // Render content only when the component is client-side
  if (!isClient) return null; // This prevents hydration issues caused by client-side rendering
  const modalData = [
    { id: "offerName", label: "Offer Name", value: selectedOffer?.offerName },
    { id: "offerCode", label: "Offer Code", value: selectedOffer?.offerCode },
    { id: "category", label: "Category", value: selectedOffer?.applyTo },
    {
      id: "costDelivery",
      label: "Cost Delivery Cost",
      value: selectedOffer?.delivery,
    },
  ];

  return (
    <div>
      <div className="relative space-y-5 grid grid-cols-1 shadow-lg rounded-[30px] bg-primary overflow-hidden p-5 font-outfit drop-shadow-lg">
        <div className="space-y-1 py-3 px-3">
          <h2 className="text-[25px] md:text-2xl lg:text-3xl xl:text-4xl font-bold text-left text-dark-charcoal">
            Past Offers
          </h2>
          <p className="font-inter text-[12px] md:text-sm lg:text-md xl:text-lg text-slate-gray text-base font-normal text-left opacity-70">
            Following is the list of Past offers
          </p>
        </div>

        {/* PAST OFFER TABLE && PAGINATION */}
        <div className="space-y-5 w-auto overflow-x-auto">
          {/* PAST OFFERS TABLE */}
          <table className="text-center max-w-full table-auto border-separate border-spacing-0 ">
            <thead className="text-sm sticky top-0 bg-primary drop-shadow-md shadow-md">
              <tr className="border-solid border-0 gap-x-2 gap-y-3">
                {tableHeader.map((header, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-2 whitespace-nowrap sm:whitespace-normal text-dark-gray text-ellipsis`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOffers.map((data, idx) => (
                <tr
                  key={idx}
                  className="border-t text-dim-gray hover:bg-gray-100 whitespace-nowrap"
                >
                  {/* Offer Name */}
                  <td className="px-4 py-2">
                    {handelOfferName(data?.offerName)}
                  </td>

                  {/* Offer Image */}
                  <td className="px-4 py-2 sm:px-1 flex items-center justify-center">
                    <div className="w-[120px] h-[60px]">
                      <Image
                        src={
                          data.offerImages?.[0]?.url || images.liveOffers.donald // Safely access the URL or use the dummy image
                        }
                        alt={data.offerName || "image"}
                        width={120}
                        height={60}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  </td>

                  {/* Offer Code */}
                  <td className="px-4 py-2 truncate max-w-[100px]">
                    {data.offerCode || "NA"}
                  </td>

                  {/* Apply To */}
                  <td className="px-4 py-2 truncate max-w-[100px]">
                    {data.applyTo || "NA"}
                  </td>

                  {/* Other Fields */}
                  <td className="px-4 py-2">{"NA"}</td>
                  <td className="px-4 py-2">{"NA"}</td>
                  <td className="px-4 py-2">{"NA"}</td>

                  {/* End Date */}
                  <td className="px-4 py-2">{formatDate(data.endDate)}</td>

                  {/* Other Fields */}
                  <td className="px-4 py-2">{"NA"}</td>

                  {/* Actions */}
                  <td className="px-4 py-2">
                    <div className="flex flex-row space-x-2 justify-center px-0">
                      {/* View Preview */}
                      <button
                        onClick={() => {
                          setSelectedOffer(data);
                          handleViewPreview();
                        }}
                        className="whitespace-nowrap bg-Red text-primary hover:bg-primary hover:text-Red hover:border-Red hover:border border-Red border rounded-md lg:py-2 lg:px-3 px-1 py-2 sm:py-1.5"
                      >
                        View Preview
                      </button>

                      {/* Renew */}
                      <button
                        onClick={() => {
                          handleRenewOffer();
                          setSelectedOffer(data);
                        }}
                        className="text-Red border border-Red bg-primary hover:bg-Red hover:text-primary rounded-md lg:py-2 px-5 sm:px-8 py-2 sm:py-1.5"
                      >
                        Renew
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pl-7 sm:pl-0 flex items-center place-items-end sm:justify-end">
            <nav aria-label="Page navigation">
              <ul className="inline-flex items-center rounded-full shadow-xs m-5 bg-[#F7F9FF] px-4 py-2.5 drop-shadow-lg">
                {/* Previous button */}
                <li>
                  <button
                    onClick={handlePreviousClick}
                    disabled={currentPage === 1}
                    className={`px-5 py-1 rounded-full ${
                      currentPage === 1
                        ? "text-gray-500 cursor-not-allowed disabled"
                        : "text-[#272727] hover:text-red-900"
                    }`}
                  >
                    <span className="text-[20px] font-bold">{"<"}</span>
                  </button>
                </li>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <li key={page} className="mx-1">
                      <button
                        onClick={() => handlePageClick(page)}
                        className={`px-3 py-2 rounded-full font-lato text-[13.5px] font-semibold leading-[14.4px] text-center ${
                          currentPage === page
                            ? "bg-[#FF3951] text-white"
                            : "text-[#272727]"
                        } hover:bg-[#FF3951] hover:text-white focus:outline-none`}
                      >
                        {page}
                      </button>
                    </li>
                  );
                })}

                {/* Next button */}
                <li>
                  <button
                    onClick={handleNextClick}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-1 rounded-full ${
                      currentPage === totalPages
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-[#272727] hover:text-red-900"
                    }`}
                  >
                    <span className="text-[20px] font-bold">{">"}</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar main DIV */}
      <div
        className={`w-full sm:max-w-[64vw] md:max-w-[55vw] lg:max-w-[45vw] xl:max-w-[34vw] 2xl:min-w-[25vw] 2xl:max-w-[20vw] fixed top-0 right-0 bg-primary rounded-tl-[24px] rounded-bl-[24px] shadow-lg transform transition-transform duration-300 ease-in z-50  ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }  `}
      >
        {/* Sidebar Content */}
        <aside className="h-screen overflow-y-auto md:h-[100vh] sm:h-[100vh]">
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
                        src={brandDetails?.images?.[0]?.url || images.sidebar.mcDonald}
                        alt="Free Burger Offer"
                        width={100}
                        height={100}
                        className="w-13 h-13 sm:w-16 sm:h-15 md:w-16 md:h-15 xl:w-[14vh] xl:h-[10vh]"
                      />
                    </div>
                    <div className="col-span-3 text-left">
                      <h2 className="xl:text-xl lg:text-[21px] md:text-lg sm:text-lg text-[19px] font-bold font-outfit text-dark-charcoal">
                        {selectedOffer?.offerName}
                      </h2>
                      <p className="xl:text-sm lg:text-sm md:text-sm sm:text-sm text-[13px] font-proxima text-onyx h-[6vh]">
                        {/* Get a free burger with your purchase of $10 or more */}
                        {handelOfferDescription(selectedOffer?.offerDescription )}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end h-full">
                    <button className="flex justify-center items-center text-sm py-1 h-8 w-24 px-1 font-proxima text-primary bg-Red hover:bg-red-400 rounded-full">
                      Past
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 justify-center items-center mt-3 mb-5">
                <div className="col-span-12 flex justify-center item-center">
                  <Image
                    src={selectedOffer?.offerImages?.[0]?.url || images.pastOffers.donald}
                    alt="Free Burger Offer"
                    width={100}
                    height={100}
                    className="w-[80%] xl:w-[85%] lg:w-[87%] sm:w-[87%] md:w-[87%] max-w-[400px] h-[200px] "
                    style={{ borderRadius: "12px" }}
                  />
                </div>
              </div>

              <div className="2xl:flex items-center justify-center">
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
                      <div className="grid grid-cols-2 items-center">
                        <div className="col-span-1 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Ecommerce
                          </span>
                        </div>
                        <div className="col-span-1 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-Red">
                            {selectedOffer?.eCommerce ? "Yes" : "No"}
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
                            {selectedOffer?.offerDeliveryBudgetCapacity || "NA"}
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
                            {selectedOffer?.numberOfOffersToSend || "NA"}
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
                            {/* {selectedOffer?.cities?.map(
                              (city: string, i: number) => "  " + "," + city
                            )} */}
                            {selectedOffer?.cities}
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
                            {selectedOffer?.retailPrice}
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
                            {selectedOffer?.applyTo}
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
                            {selectedOffer?.subCategory || "NA"}
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
                        <div className="col-span-1 flex justify-start">
                          <span className="w-full gap-0 opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-normal leading-[24px] text-left text-charcoal font-proxima">
                            Offer Type
                          </span>
                        </div>
                        <div className="col-span-1 w-full flex justify-end">
                          <span className="w-full text-right opacity-70 xl:text-[16px] lg:text-[16px] md:text-[16px] text-[15px] font-semibold font-proxima text-onyx">
                            {selectedOffer?.offerType}
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
                            {selectedOffer?.offerCode}
                          </span>
                        </div>
                      </div>
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
                            {selectedOffer?.endDate}
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
                            {/* {selectedOffer?.isShareable == 'yes'
                              ? "Unlimited"
                              : "1 time only"} */}
                            {selectedOffer?.isShareable === true
                              ? "Unlimited"
                              : "1 time only"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="justify-center text-center px-5 grid grid-cols-1 py-4 2xl:px-14">
                <button
                  onClick={() => {
                    // handleUpdateOffer();
                    handleRenewOffer();
                  }}
                  className="col-span-1 py-3 sm:text-[15px] md:text-[15px] bg-Red text-primary font-inter rounded-lg transition-all duration-0"
                >
                  {/* {loading ? 'loading.....' :'Renew Offer' }   */}
                  Renew Offer                 
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
          role="dialog"
          aria-modal="true"
          className={`font-outfit fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${
            isModalOpen ? "block" : "hidden"
          }`}
        >
          {/* Modal Content */}
          <div
            className="bg-white relative p-8 shadow-lg w-[95%] sm:w-[90%] md:w-[50%] lg:w-[40%] rounded-[20px] max-h-[90vh] overflow-y-auto"
            role="document"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-4xl text-black hover:text-gray-800 flex items-center justify-center w-10 h-10 rounded-full"
            >
              &times;
            </button>

            {!isConfirmed ? (
              <div className="space-y-2">
                {/* Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Renew Offer
                  </h2>
                </div>

                {/* Input Fields */}
                {[
                  {
                    id: "offerName",
                    label: "Offer Name",
                    placeholder: "Ex. ABC Pvt. Ltd.",
                  },
                  // {
                  //   id: "offerCode",
                  //   label: "Offer Code",
                  //   placeholder: "Ex. 5431-TM",
                  // },
                  {
                    id: "category",
                    label: "Category",
                    placeholder: "Ex. Sports",
                  },
                  {
                    id: "deliveryCost",
                    label: "Offer Delivery Cost",
                    placeholder: "Ex. $234",
                  },
                ].map(({ id, label, placeholder }) => (
                  <div key={id}>
                    <label
                      htmlFor={id}
                      className="block  font-light text-gray-600 mb-1 text-[18px] "
                    >
                      {label}
                    </label>
                    <input
                      id={id}
                      type="text"
                      placeholder={placeholder}
                      value={formData[id as keyof typeof formData]} // Dynamically set the value
                      onChange={handleChange} // Update state on change
                      className="w-full px-4 py-3 h-[40px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2  bg-[#EDF2F7]"
                    />
                  </div>
                ))}
                <div className="flex-1">
                  <label
                    htmlFor="valid-from"
                    className="block text-charcoal opacity-80"
                  >
                    Valid From
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 h-[40px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2  bg-[#EDF2F7]"
                  />
                </div>
                {/* Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-transparent text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateOffer();
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                     {loading ? 'loading.....' :'Renew Offer' }   
                  </button>
                </div>
              </div>
            ) : (
              // Success Confirmation Section
              <div className="grid grid-cols-1 gap-5 px-2 mt-5 lg:mt-3 justify-center items-center text-center">
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
                  <h2 className="font-bold">
                    Successful <br /> Confirmation
                  </h2>
                </div>
                <div className="text-base md:text-lg">
                  <button
                    onClick={handleCloseModal}
                    className="py-2 w-full rounded-lg hover:bg-primary hover:border hover:border-Red hover:text-Red text-primary bg-Red"
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
