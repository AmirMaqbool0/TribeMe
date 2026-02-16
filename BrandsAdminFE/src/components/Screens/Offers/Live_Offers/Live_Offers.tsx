"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import images from "@/src/assets/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "../../../../../redux/store";
import { fetchLiveOffers } from "@/redux/LiveOfferFetchSlice";
import { format } from "date-fns";
import Link from "next/link";
import { fetchBrandDetails, selectBrandDetails, selectBrandStatus, selectBrandError } from '../../../../../redux/brandSlice';
const liveOffersData = [
  {
    id: 1,
    name: "Big Mac Combo",
    image: images.liveOffers.donald,
    code: "BIGMAC-5431",
    category: "Meal Deals",
    subCategory: "Fast Food", // Added Sub Category
    sales: "120",
    delivery: "$5.99",
    redemption: "15%",
    expiration: "10/01/2025",
    remaining: "20",
    ecommerce: "No", // Added Ecommerce
    offerDeliveryBudgetCapacity: "$50", // Added Offer Delivery Budget Capacity
    numberOfOffersToSend: "12", // Added Number of Offers to Send
    cities: ["New York", "New Jersey"], // Added Cities
    retailPrice: "$24", // Added Retail Price Of Offered Product
    offerType: "Buy 1 Get 1 Free", // Added Offer Type
    offerValidity: "From July 10, 2023, to Aug 10, 2024", // Added Offer Validity
    uses: "Unlimited", // Added Uses
  },
  {
    id: 2,
    name: "McChicken Special",
    image: images.liveOffers.donald,
    code: "MCCHICKEN-2024",
    category: "Burgers",
    subCategory: "Fast Food", // Added Sub Category
    sales: "85",
    delivery: "$3.99",
    redemption: "10%",
    expiration: "12/15/2024",
    remaining: "30",
    ecommerce: "Yes", // Added Ecommerce
    offerDeliveryBudgetCapacity: "$60", // Added Offer Delivery Budget Capacity
    numberOfOffersToSend: "10", // Added Number of Offers to Send
    cities: ["Los Angeles", "San Francisco"], // Added Cities
    retailPrice: "$22", // Added Retail Price Of Offered Product
    offerType: "Discount Offer", // Added Offer Type
    offerValidity: "From Jan 1, 2024, to Dec 31, 2024", // Added Offer Validity
    uses: "100 Uses", // Added Uses
  },
  {
    id: 3,
    name: "Family Feast",
    image: images.liveOffers.donald,
    code: "FAMILY-786",
    category: "Family Meals",
    subCategory: "Fast Food", // Added Sub Category
    sales: "150",
    delivery: "$12.99",
    redemption: "20%",
    expiration: "10/10/2028",
    remaining: "10",
    ecommerce: "No", // Added Ecommerce
    offerDeliveryBudgetCapacity: "$100", // Added Offer Delivery Budget Capacity
    numberOfOffersToSend: "25", // Added Number of Offers to Send
    cities: ["Chicago", "Houston"], // Added Cities
    retailPrice: "$50", // Added Retail Price Of Offered Product
    offerType: "Family Deal", // Added Offer Type
    offerValidity: "From Mar 1, 2023, to Mar 1, 2029", // Added Offer Validity
    uses: "Unlimited", // Added Uses
  },
  {
    id: 4,
    name: "Happy Meal Offer",
    image: images.liveOffers.donald,
    code: "HAPPY-101",
    category: "Kids Meals",
    subCategory: "Fast Food", // Added Sub Category
    sales: "200",
    delivery: "$4.99",
    redemption: "5%",
    expiration: "10/06/2026",
    remaining: "50",
    ecommerce: "Yes", // Added Ecommerce
    offerDeliveryBudgetCapacity: "$30", // Added Offer Delivery Budget Capacity
    numberOfOffersToSend: "15", // Added Number of Offers to Send
    cities: ["Miami", "Orlando"], // Added Cities
    retailPrice: "$18", // Added Retail Price Of Offered Product
    offerType: "Kids Special", // Added Offer Type
    offerValidity: "From Dec 1, 2022, to Dec 1, 2026", // Added Offer Validity
    uses: "Unlimited", // Added Uses
  },
  {
    id: 5,
    name: "Fries & Drink Combo",
    image: images.liveOffers.donald,
    code: "FRIES-500",
    category: "Snacks",
    subCategory: "Fast Food", // Added Sub Category
    sales: "300",
    delivery: "$2.99",
    redemption: "25%",
    expiration: "10/02/2027",
    remaining: "15",
    ecommerce: "No", // Added Ecommerce
    offerDeliveryBudgetCapacity: "$40", // Added Offer Delivery Budget Capacity
    numberOfOffersToSend: "20", // Added Number of Offers to Send
    cities: ["Seattle", "Portland"], // Added Cities
    retailPrice: "$10", // Added Retail Price Of Offered Product
    offerType: "Combo Deal", // Added Offer Type
    offerValidity: "From Jan 1, 2023, to Jan 1, 2028", // Added Offer Validity
    uses: "50 Uses", // Added Uses
  },
];
interface SelectedOffer {
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
  isShareable: string;
}


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
export const LiveOffers = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>(); // Dispatch is typed with AppDispatch
  const { offers, isLoading, error } = useSelector(
    (state: RootState) => state?.liveOfferFetch
  );

  const [isDataLoaded, setIsDataLoaded] = useState(false); // For checking if data is loaded
  const [isClient, setIsClient] = useState(false); // Track whether we're on the client
  // Fetch live offers on component mount
  useEffect(() => {
    dispatch(fetchLiveOffers(1)); // Pass the current page number
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

  const handleViewPreview = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
// Brand Dettail 
const brandDetails = useSelector(selectBrandDetails);
useEffect(() => {
    dispatch(fetchBrandDetails());
  }, [dispatch]);

  
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

  // Handle Edit Offer button click
  // const handleEditOffer = (offer: { id: number; name: string; image: string; code: string; sales: string; delivery: string; redemption: string; expiration: string; remaining: string; }) => {
  //   if (isClient && typeof window !== 'undefined') {
  //     localStorage.setItem('selectedOffer', JSON.stringify(offer));
  //   }
  //   router.push('/offers/live_offers/live_edit');
  // };

  // Function to truncate the offer name
  const handelOfferName = (name: string) => {
    const truncName = name.substring(0, 6);
    return truncName + "...";
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
  if (!isDataLoaded) {
    return <div>Loading...</div>; // You can replace this with a loader component
  }

  // Render content only when the component is client-side
  if (!isClient) return null; // This prevents hydration issues caused by client-side rendering

  return (
    <div>
      <div className="relative space-y-5 grid grid-cols-1 shadow-lg rounded-[30px] bg-primary p-5 font-outfit drop-shadow-lg overflow-hidden">
        <div className="space-y-1 py-3 px-3">
          <h2 className="text-[25px] md:text-2xl lg:text-3xl xl:text-4xl font-bold text-left text-dark-charcoal">
            Live Offers
          </h2>
          <p className="font-inter text-[12px] md:text-sm lg:text-md xl:text-lg text-slate-gray text-base font-normal text-left opacity-70">
            Following is the list of Live offers
          </p>
        </div>

        {/* LIVE OFFER TABLE && PAGINATION */}
        <div className="space-y-5 w-auto overflow-x-auto">
          {/* Offers Table */}
          <table className="w-auto text-center table-fixed border-separate border-spacing-0">
            <thead className="text-sm sticky top-0 bg-primary drop-shadow-md shadow-md">
              <tr className="border-solid border-0 gap-x-2 gap-y-3">
                {tableHeader.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 whitespace-nowrap sm:whitespace-normal text-dark-gray text-ellipsis"
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
                          handleViewPreview();
                          setSelectedOffer(data);
                        }}
                        className="whitespace-nowrap bg-Red text-primary hover:bg-primary hover:text-Red hover:border-Red hover:border  border-Red border rounded-md lg:py-2 lg:px-3 px-1 py-2 sm:py-1.5"
                      >
                        View Preview
                      </button>

                      {/* Edit */}
                      <Link
                        href={{
                          pathname: "/offers/live_offers/live_edit",
                          query: data,
                        }}
                      >
                        {" "}
                        <button
                          // onClick={() => handleEditOffer(data)}
                          className="text-Red border border-Red bg-white  rounded-md lg:py-2 px-5 sm:px-8 py-2 sm:py-1.5"
                        >
                          Edit
                        </button>{" "}
                      </Link>
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
                        : "text-[#272727]"
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
        <aside className="h-screen overflow-y-auto md:h-[100vh] sm:h-[100vh] rounded-tl-3xl rounded-bl-3xl">
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

              <div className="flex justify-center items-center">
                <div className="grid grid-cols-12 gap-4 justify-center items-center w-full mt-2 px-2 lg:p-4 md:p-4 sm:p-4 lg:mt-2 rounded-tl-xl">
                  <div className="col-span-10 grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 justify-center items-center ml-4 sm:ml-2 md:ml-2 xl:ml-2 xl:space-y-2">
                    <div className="col-span-1 flex justify-center items-center">
                      <Image
                        src={brandDetails?.images?.[0]?.url  || images.liveOffers.donald ||images.sidebar.mcDonald}
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
              </div>

              <div className="grid grid-cols-12 justify-center items-center mt-3 mb-5">
                <div className="col-span-12 flex justify-center item-center">
                  <Image
                    // src={
                    //   selectedOffer?.offerImages?.[0]?.url ||
                    //   images.liveOffers.donald
                    // }
                    src={
                      Array.isArray(selectedOffer?.offerImages) && selectedOffer?.offerImages.length > 0
                        ? selectedOffer.offerImages[0].url
                        : images.liveOffers.donald
                    }
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
                      {/* <div className="grid grid-cols-2 items-center">
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
                      </div> */}

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
                            {selectedOffer?.userLimit || "NA"}
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
                            {
                              // selectedOffer?.cities?.map((city: string,i: number)=>(
                              //    '  '+','+  city
                              // ))
                              selectedOffer?.cities
                            }
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
                            {"$ " + selectedOffer?.retailPrice}
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

                      {/* <div className="grid grid-cols-12 items-center">
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
                            {selectedOffer?.isShareable === 'yes'
                              ? "Unlimited"
                              : "1 time only"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="justify-center text-center px-5 grid grid-cols-1 py-4"></div>
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
    </div>
  );
};
