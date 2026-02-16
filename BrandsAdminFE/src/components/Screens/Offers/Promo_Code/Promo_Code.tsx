'use client';
import React, { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchOffersByBrandId } from "@/redux/OffersName";
import { fetchRedemptionsRequest } from "@/redux/redemptionsRequestSlice";
import { handleOfferAction, clearState } from "@/redux/OfferApprovalSlice";
import {
  fetchBrandDetails,
  selectBrandDetails,
} from '../../../../../redux/brandSlice';
import { fetchPromoCodesByOfferId } from "@/redux/promoCodesSlice";
import Toast from "@/src/components/Toast/Toast";
import { toast } from "react-toastify";


const PromoCode = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedOfferID, setSelectedOfferID] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoCodesLoading, setIsPromoCodesLoading] = useState(false);
  const [isRedemptionsLoading, setIsRedemptionsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [searchPromoCode, setSearchPromoCode] = useState('');
  const [searchRedemption, setSearchRedemption] = useState('');

  const handleSelectChange = (event: any) => {
    setSelectedOfferID(event.target.value);
  };

  const handleSelectFilter = (event: any) => {
    setSelectedFilter(event.target.value);
  };

  const [promoDetails, setPromoDetails] = useState({
    offer: {
      name: ''
    },
    user: {
      name: ''
    },
    promoCodeUsed: '',
    paymentMethod: ''
  });

  const dispatch: AppDispatch = useDispatch();

  // Fetch Brand Details
  const brandDetails = useSelector(selectBrandDetails);
  useEffect(() => {
    dispatch(fetchBrandDetails());
  }, [dispatch]);

  // Fetch Offers Name 
  const { offers, error } = useSelector((state: RootState) => state.fetchOffersByBrandId);
  useEffect(() => {
    if (brandDetails?.id) {
      dispatch(fetchOffersByBrandId(brandDetails.id)).then(() => setIsLoading(false));
    }
  }, [dispatch, brandDetails?.id]);

  // Automatically select the first offer once offers are loaded
  useEffect(() => {
    if (offers.length > 0 && !selectedOfferID) {
      setSelectedOfferID(offers[0].offerId);
    }
  }, [offers, selectedOfferID]);

  // Fetch PromoCodes by using Offer Name 
  const { promoCodes, status } = useSelector((state: RootState) => state.promoCodes);
  useEffect(() => {
    if (selectedOfferID) {
      setIsPromoCodesLoading(true);
      dispatch(fetchPromoCodesByOfferId(selectedOfferID))
        .finally(() => setIsPromoCodesLoading(false));
    }
  }, [dispatch, selectedOfferID]);

  
  // Fetch Redemption Request 
  const { redemptions } = useSelector((state: RootState) => state.redemptionsRequest);
  useEffect(() => {
    const fetchRedemptions = async () => {
      setIsRedemptionsLoading(true);
      try {
        await dispatch(
          fetchRedemptionsRequest({
            status: selectedFilter,
            page: 1,
            limit: 10,
            startDate: new Date().toISOString().split('T')[0],
          })
        ).unwrap();
      } catch (error) {
        // toast(
        //   <Toast
        //     message='Failed to fetch redemptions. Please try again.'
        //     backgroundColor="red"
        //     textColor="white"
        //   />,
        //   {
        //     closeButton: false,
        //   }
        // );
      } finally {
        setIsRedemptionsLoading(false);
      }
    };

    fetchRedemptions();
  }, [dispatch, selectedFilter]);
  
  

  // Filter promoCodes based on search term
  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.promoCode.toLowerCase().includes(searchPromoCode.toLowerCase())
  );

  // Filter redemptions based on search term and status
  const filteredRedemptions = redemptions.filter((item) => {
    const matchesSearch = item.promoCodeUsed.toLowerCase().includes(searchRedemption.toLowerCase());
    const matchesStatus = item.status === selectedFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveClick = (promo: any) => {
    setPromoDetails(promo);
    setIsPopupVisible(true);
    setIsRejecting(false);
  };

  const handleRejectClick = (promo: any) => {
    setPromoDetails(promo);
    setIsPopupVisible(true);
    setIsRejecting(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setRejectionReason('');
  };

  // Approved Offer 
  const handleApprove = async (promo: any) => {
    setIsActionLoading(true);
    dispatch(clearState());
    let promoId = promo.id;
    try {
      await dispatch(
        handleOfferAction({
          redemptionId: promoId,
          approve: true,
        })
      ).unwrap();
      toast(
        <Toast
          message='Offer approved successfully!'
          backgroundColor="green"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
    } catch (err) {
      toast(
        <Toast
          message='Failed to approve the offer.'
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
    } finally {
      setIsActionLoading(false);
      handleClosePopup();
    }
  };

  // Reject Offer 
  const handleReject = async (promo: any) => {
    setIsActionLoading(true);
    dispatch(clearState());
    let promoId = promo.id;
    try {
      await dispatch(
        handleOfferAction({
          redemptionId: promoId,
          approve: false,
          rejectionReason: rejectionReason || 'No reason provided',
        })
      ).unwrap();
      toast(
        <Toast
          message='Offer rejected successfully!'
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
    } catch (err) {
      toast(
        <Toast
          message='Failed to reject the offer.'
          backgroundColor="red"
          textColor="white"
        />,
        {
          closeButton: false,
        }
      );
    } finally {
      setIsActionLoading(false);
      handleClosePopup();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white shadow-lg" style={{ marginTop: '100px', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left font-outfit">
          {selectedOfferID ? offers.find(offer => offer.offerId === selectedOfferID)?.offerName || 'Select an Offer' : 'Select an Offer'}
        </h1>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search promo code..."
              value={searchPromoCode}
              onChange={(e) => setSearchPromoCode(e.target.value)}
              className="flex-grow sm:flex-none w-full font-outfit sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-red-500 font-outfit text-white rounded-md hover:bg-red-600 transition-colors duration-200">
              Search
            </button>
          </div>

          {/* Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              className="w-full px-4 py-2 border font-outfit border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedOfferID}
              onChange={handleSelectChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <option>Loading offers...</option>
              ) : (
                offers?.map((offer, i) => (
                  <option value={offer.offerId} key={i}>{offer.offerName}</option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Promo Codes Table */}
        <div className="overflow-auto max-h-[60vh]">
          {isPromoCodesLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : filteredPromoCodes.length === 0 ? (
            <p className="text-center text-gray-600 font-outfit py-8">No promo codes available for this offer.</p>
          ) : (
            <table className="w-full table-auto bg-white border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-600 font-medium font-outfit">
                  <th className="p-4 border-b">#</th>
                  <th className="p-4 border-b">Promo Code</th>
                  <th className="p-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromoCodes.map((promo, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 font-outfit transition-colors duration-200">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{promo.promoCode}</td>
                    <td className={`p-4 ${promo.used ? "text-green-600" : "text-red-500"}`}>
                      {promo.used ? 'Used' : 'Unused'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 2nd Box */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg" style={{ marginTop: '40px', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px', overflow: 'auto' }}>
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left font-outfit">
          Brand Promo Codes
        </h1>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search redemption code..."
              value={searchRedemption}
              onChange={(e) => setSearchRedemption(e.target.value)}
              className="flex-grow sm:flex-none w-full font-outfit sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-red-500 font-outfit text-white rounded-md hover:bg-red-600 transition-colors duration-200">
              Search
            </button>
          </div>

          {/* Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              className="w-full px-4 py-2 border font-outfit border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedFilter}
              onChange={handleSelectFilter}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        {/* Promo Codes Table */}
        <div className="overflow-auto max-h-[60vh]">
          {isRedemptionsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <table className="w-full table-auto bg-white border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-600 font-medium font-outfit">
                  <th className="p-4 border-b">#</th>
                  <th className="p-4 border-b">Promo Code</th>
                  <th className="p-4 border-b">Offer Name</th>
                  <th className="p-4 border-b">Name</th>
                  <th className="p-4 border-b">Status</th>
                  <th className="p-4 border-b">Payment Method</th>
                  {selectedFilter === 'PENDING' && <th className="p-4 border-b text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRedemptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-600">
                      No {selectedFilter.toLowerCase()} redemptions found.
                    </td>
                  </tr>
                ) : (
                  filteredRedemptions.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 font-outfit transition-colors duration-200">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4">{item?.promoCodeUsed}</td>
                      <td className="p-4">{item.offer.name}</td>
                      <td className="p-4">{item.user.name}</td>
                      <td className={`p-4 ${item.status === "APPROVED" ? "text-green-600" : item.status === "REJECTED" ? "text-red-500" : "text-yellow-500"}`}>
                        {item.status}
                      </td>
                      <td className="p-4">{item.paymentMethod}</td>
                      {selectedFilter === 'PENDING' && (
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => handleApproveClick(item)}
                            className="px-4 py-1 bg-green-500 font-outfit text-white rounded-md hover:bg-green-600 transition-colors duration-200"
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectClick(item)}
                            className="px-4 py-1 bg-red-500 font-outfit text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? 'Processing...' : 'Reject'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Popup */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Promo Details</h3>
              <button
                onClick={handleClosePopup}
                className="text-gray-600 text-2xl font-bold focus:outline-none hover:text-gray-800 transition-colors duration-200"
                disabled={isActionLoading}
              >
                &times;
              </button>
            </div>
            {/* Popup Content */}
            <p className="text-center text-lg font-semibold text-black mb-8">
              User <strong>"{promoDetails.user.name}"</strong> wants to redeem the
              offer <strong>"{promoDetails.offer.name}"</strong> with promo code{" "}
              <strong>"{promoDetails.promoCodeUsed}"</strong> using{" "}
              <strong>"{promoDetails.paymentMethod}"</strong>.
            </p>
            {isRejecting && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rejection reason"
                  disabled={isActionLoading}
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleClosePopup}
                className="px-6 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50 transition-colors duration-200"
                disabled={isActionLoading}
              >
                Cancel
              </button>
              {isRejecting ? (
                <button 
                  onClick={() => handleReject(promoDetails)} 
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Rejecting...' : 'Reject'}
                </button>
              ) : (
                <button 
                  onClick={() => handleApprove(promoDetails)} 
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Approving...' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCode;