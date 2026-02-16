"use client";
import Image from "next/image";
import images from "@/src/assets/images";
import React, { useEffect, useState } from "react";
import SubscriptionModal from "./Modal";
import { useSelector, useDispatch } from "react-redux";
import { selectBrandDetails, selectBrandStatus, selectBrandError, fetchBrandDetails } from "@/redux/brandSlice";
import axios from "axios";
import Cookies from 'js-cookie';
import SubscriptionHistory from './SubscriptionHistory';
import SubscriptionExpired from './SubscriptionExpired';

export default function Subscription() {
  const [activeButton, setActiveButton] = useState('Credit Card');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTier, setActiveTier] = useState<string>('Tier One');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Form fields state
  const [formData, setFormData] = useState({
    billedTo: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    country: '',
    zipCode: ''
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    billedTo: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    country: '',
    zipCode: ''
  });

  const brandDetails = useSelector(selectBrandDetails);
  const brandStatus = useSelector(selectBrandStatus);
  const brandError = useSelector(selectBrandError);
  const dispatch = useDispatch();
  const brandId = brandDetails?.id;
  const email = brandDetails?.email;

  // Fix: Use process.env for Vite/Next.js environment variable access
  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_URI;

  // Fetch brand details if not already loaded
  useEffect(() => {
    if (brandStatus === 'idle') {
      dispatch(fetchBrandDetails());
    }
  }, [dispatch, brandStatus]);

  useEffect(() => {
    const authToken = Cookies.get('authToken');
    
    // Wait for brand details to be loaded
    if (brandStatus === 'loading') {
      return;
    }
    
    if (brandStatus === 'failed') {
      setError("Failed to load brand details. Please log in again.");
      setIsLoadingSubscription(false);
      return;
    }
    
    // Only proceed if brand details are successfully loaded
    if (brandStatus !== 'succeeded' || !brandDetails) {
      return;
    }
    
    if (!authToken || !brandId) {
      setError("Not authenticated. Please log in again.");
      setIsLoadingSubscription(false);
      return;
    }

    // Check if user already has a subscription
    axios.get(`${BASE_API_URL}/brand/getBrandSubscription?brandId=${brandId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => {
      setCurrentSubscription(res.data.data);
      setIsLoadingSubscription(false);
    }).catch((err) => {
      setCurrentSubscription(null);
      setIsLoadingSubscription(false);
    });

    // Fetch plans for new subscription
    axios.get(`${BASE_API_URL}/brand/getSubscriptions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => {
      const plansData = (res as any)?.data?.data;
      if (Array.isArray(plansData)) {
        setPlans(plansData);
      }
    }).catch(err => {
      setError(err?.response?.data?.error?.errors || "Failed to fetch plans");
    });
  }, [brandId, brandStatus, brandDetails, dispatch]);

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Format card number with spaces - only allow digits, max 16 digits
    if (field === 'cardNumber') {
      const cleaned = value.replace(/\D/g, ''); // Remove all non-digits
      if (cleaned.length <= 16) {
        formattedValue = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
      } else {
        formattedValue = value; // Don't format if too long
      }
    }
    
    // Format expiry date - only allow digits
    if (field === 'expiryDate') {
      const cleaned = value.replace(/\D/g, ''); // Remove all non-digits
      if (cleaned.length <= 4) {
        if (cleaned.length >= 2) {
          const month = cleaned.slice(0, 2);
          const year = cleaned.slice(2);
          // Ensure month is 01-12
          const monthNum = parseInt(month);
          if (monthNum >= 1 && monthNum <= 12) {
            formattedValue = month + '/' + year;
          } else {
            // If invalid month, just show what user typed
            formattedValue = month + '/' + year;
          }
        } else {
          formattedValue = cleaned;
        }
      } else {
        formattedValue = value; // Don't format if too long
      }
    }
    
    // CVV - only allow digits, max 4 digits
    if (field === 'cvv') {
      const cleaned = value.replace(/\D/g, ''); // Remove all non-digits
      if (cleaned.length <= 4) {
        formattedValue = cleaned;
      } else {
        formattedValue = value; // Don't format if too long
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation functions
  const validateCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!cleaned) return 'Card number is required';
    if (!/^\d{16}$/.test(cleaned)) return 'Card number must be exactly 16 digits';
    return '';
  };

  const validateExpiryDate = (expiry: string) => {
    if (!expiry) return 'Expiry date is required';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Use format MM/YY';
    
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) return 'Invalid month (01-12)';
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      return 'Card has expired';
    }
    return '';
  };

  const validateCVV = (cvv: string) => {
    if (!cvv) return 'CVV is required';
    if (!/^\d{3,4}$/.test(cvv)) return 'CVV must be 3-4 digits';
    return '';
  };

  const validateForm = () => {
    const errors = {
      billedTo: !formData.billedTo ? 'Billed to name is required' : '',
      cardNumber: validateCardNumber(formData.cardNumber),
      expiryDate: validateExpiryDate(formData.expiryDate),
      cvv: validateCVV(formData.cvv),
      country: !formData.country ? 'Country is required' : '',
      zipCode: !formData.zipCode ? 'ZIP code is required' : ''
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const getHeading = () => {
    if (activeTier === 'Tier One') return 'Upgrade to Tier Two';
    if (activeTier === 'Tier Two') return 'Upgrade to Tier Three';
    if (activeTier === 'Tier Three') return 'Upgrade to Tier Three';
    return 'Upgrade to Tier Two';
  };

  const getPlanId = () => {
    const tierMap: Record<string, string> = {
      "Tier One": "Tier One",
      "Tier Two": "Tier Two",
      "Tier Three": "Tier Three"
    };
    const plan = plans.find((p: any) => p.tier === tierMap[activeTier]);
    return plan?.id;
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate form before proceeding
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Debug: Log plans and activeTier before getting planId
    const subscriptionPlanId = getPlanId();
    const authToken = Cookies.get('authToken');
    // Debug: Log values before checking
    if (!brandId || !subscriptionPlanId || !email) {
      setError("Missing brand or plan info");
      setLoading(false);
      return;
    }
    if (!authToken) {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    // Prepare payment details
    const cardDetails = {
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      expiryDate: formData.expiryDate,
      cvv: formData.cvv,
      cardholderName: formData.billedTo,
      country: formData.country,
      zipCode: formData.zipCode
    };

    try {
      const res = await axios.post(`${BASE_API_URL}/brand/subscribe`, {
        brandId,
        subscriptionPlanId,
        email,
        cardDetails
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setSuccess((res as any)?.data?.message || "Subscribed!");
      
      // Refresh subscription status after successful subscription
      setTimeout(async () => {
        try {
          const subscriptionRes = await axios.get(`${BASE_API_URL}/brand/getBrandSubscription?brandId=${brandId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          setCurrentSubscription(subscriptionRes.data.data);
        } catch (err) {
          console.log('Error refreshing subscription status:', err);
        }
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while brand details are being fetched
  if (brandStatus === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-grayish-blue text-lg font-proxima mb-2">Loading subscription details...</div>
          <div className="text-grayish-blue text-sm">Please wait while we fetch your information.</div>
        </div>
      </div>
    );
  }

  // Show error if brand details failed to load
  if (brandStatus === 'failed' || error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-proxima mb-2">Authentication Error</div>
          <div className="text-grayish-blue text-sm">{error || "Please log in again to continue."}</div>
        </div>
      </div>
    );
  }

  // Check if user has a subscription
  if (currentSubscription) {
    // Check if subscription is cancelled
    if (currentSubscription.status === 'cancelled') {
      // Only show SubscriptionExpired if endDate has passed
      const now = new Date();
      const endDate = currentSubscription.endDate ? new Date(currentSubscription.endDate) : null;
      if (endDate && now > endDate) {
        return <SubscriptionExpired subscriptionData={currentSubscription} />;
      }
      // Otherwise, show manage subscription page until end of billing period
      return <SubscriptionHistory />;
    }
    return <SubscriptionHistory />;
  }

  // If no subscription found, check if there was an error or if we're still loading
  if (isLoadingSubscription) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-grayish-blue text-lg font-proxima mb-2">Checking subscription status...</div>
          <div className="text-grayish-blue text-sm">Please wait while we verify your subscription.</div>
        </div>
      </div>
    );
  }

  // If no subscription and not loading, show the subscription form
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] space-y-8 gap-4 mt-5">

        {/* First Column */}
        <div className="flex flex-col justify-center items-center md:items-start rounded-xl p-4">
          {/* Content for the first column */}
          <div className="w-full text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-4xl font-outfit text-dark-charcoal font-bold">{getHeading()}</h2>
          </div>

          <div className="w-full pb-9 pt-10">

            <div className="space-y-3 mb-5">
              <label htmlFor="billedTo" className="text-grayish-blue md:text-[18px] text-base font-proxima">Billed To</label>
              <input 
                type="text" 
                id="billedTo" 
                placeholder="Jane Smith" 
                className={`w-full bg-primary p-2 rounded-lg shadow-md border focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-400 h-[50px] ${
                  formData.billedTo && !validationErrors.billedTo 
                    ? 'border-green-500' 
                    : validationErrors.billedTo 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                }`}
                name="billedTo" 
                value={formData.billedTo}
                onChange={(e) => handleInputChange('billedTo', e.target.value)} 
              />
              {validationErrors.billedTo && <p className="text-red-500 text-xs mt-1">{validationErrors.billedTo}</p>}
            </div>

            {/* Credit Button */}
            <div className="space-y-4 mb-6">
              <div className="">
                <h2 className="text-grayish-blue md:text-[18px] text-base font-proxima">Payment Details</h2>
              </div>

              <button onClick={() => setActiveButton('Credit Card')} className={`font-proxima w-full sm:w-[55%] lg:w-[50%] h-20 sm:h-24 border-Red border-2 rounded-xl ${activeButton === 'Credit Card' ? 'border-Red bg-red-100' : 'border-gray-300 bg-primary'}`} >
                <div className="flex flex-col items-start justify-center px-6 space-y-2">
                  <Image src={images.subscription.creditCard} alt="Credit Icon" width={30} height={30} className="w-auto h-auto" />
                  <span className="px-0.5">Credit Card</span>
                </div>
              </button>
            </div>


            {/* Credit input field */}
            <div className="w-full relative mb-6">
              <input 
                type="text" 
                placeholder="6508 8234 3354 7832" 
                className={`w-full bg-primary shadow-md p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-400 h-[50px] ${
                  formData.cardNumber && !validationErrors.cardNumber 
                    ? 'border-green-500' 
                    : validationErrors.cardNumber 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                }`}
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                maxLength={19} // 16 digits + 3 spaces
              />
              <div className="absolute top-1/2 right-5 transform -translate-y-1/2 flex items-center ">
                <Image src={images.subscription.master} alt="Master Icon" width={25} height={20} className="w-auto h-auto" />
              </div>
              {validationErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.cardNumber}</p>}
              {formData.cardNumber && !validationErrors.cardNumber && formData.cardNumber.replace(/\s/g, '').length === 16 && (
                <p className="text-green-500 text-xs mt-1">✓ Valid card number</p>
              )}
            </div>

            {/* Date && Code input field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 w-full mb-6">
              {/* First Input Field */}
              <div className="w-full">
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className={`bg-primary p-2 rounded-lg w-full border shadow-md focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-400 h-[50px] ${
                    formData.expiryDate && !validationErrors.expiryDate 
                      ? 'border-green-500' 
                      : validationErrors.expiryDate 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                  }`}
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  maxLength={5} // MM/YY format
                />
                {validationErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{validationErrors.expiryDate}</p>}
              </div>
              {/* Second Input Field */}
              <div className="w-full">
                <input 
                  type="text" 
                  placeholder="786" 
                  className={`bg-primary p-2 rounded-lg w-full border shadow-md focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-400 h-[50px] ${
                    formData.cvv && !validationErrors.cvv 
                      ? 'border-green-500' 
                      : validationErrors.cvv 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                  }`}
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  maxLength={4}
                />
                {validationErrors.cvv && <p className="text-red-500 text-xs mt-1">{validationErrors.cvv}</p>}
              </div>
            </div>

            {/*  Country input field */}
            <div className="mb-6">
              <input type="text" placeholder="United States" className="w-full bg-primary p-2 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-400 h-[50px]" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} />
              {validationErrors.country && <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>}
            </div>


            <div className="">
              <input type="text" placeholder="102258" className="w-full bg-primary p-2 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-400 h-[50px]" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} />
              {validationErrors.zipCode && <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>}
            </div>

          </div>

          <div className="space-y-6">

            <div className="grid grid-cols-5 gap-4 w-full justify-center items-center">

              <button className="col-span-2 bg-[#E4E8EB] font-proxima flex items-center justify-center rounded-lg py-2 px-4  h-[50px]">       Cancel     </button>

              <button
                className="col-span-3 bg-Red font-proxima text-primary flex items-center justify-center rounded-lg py-2 px-4  h-[50px]"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}


            <div className="flex justify-start px-0.5 md:px-3 md:tracking-wide lg:tracking-wide xl:tracking-wide">
              <p className="text-slate-gray text-[13.5px] md:leading-normal lg:leading-relaxed xl:leading-normal font-proxima xl:text-[15px] md:text-[15px] sm:text-[15px] lg:text-[14px] font-normal leading-[16px] text-center md:text-left lg:text-left xl:text-left ">
                By providing your card information, you allow us to charge your card for future payments in
                <span className="hidden xl:hidden break-after-xl"> accordance with their terms.</span>
                <span className="hidden lg:inline break-after-lg"> accordance with their terms.</span>
                <span className="hidden md:inline lg:hidden xl:hidden"> accordance with their terms.</span>
                <span className="inline md:hidden"> accordance with their terms.</span>
              </p>
            </div>

          </div>

        </div>

        {/* Second Column */}
        <div className="bg-primary drop-shadow-xl flex flex-col items-center md:items-start rounded-2xl p-8">
          {/* Content for the second column */}

          <div className="mb-3">
            <h2 className="text-xl md:text-2xl  font-bold mb-2 text-dark-charcoal font-inter px-1">Our All Plans</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full items-center mb-5">
            {/* Tier One Button */}
            <button onClick={() => setActiveTier('Tier One')} className={`flex justify-between items-center border rounded-xl w-full h-20 sm:h-24 lg:h-28  px-4 ${activeTier === 'Tier One' ? 'border-Red bg-red-100' : 'border-gray-300 bg-primary'}`}>
              <div className="flex items-center space-x-2">
                <Image src={activeTier === 'Tier One' ? images.subscription.filledCircle : images.subscription.circle} alt={activeTier === 'Tier One' ? 'Radio' : 'Circle'} width={activeTier === 'Tier One' ? 20 : 16} height={20} className="w-auto h-auto" />
              </div>
              <div className="flex flex-col items-center justify-center font-outfit">
                <label className="text-Blackish text-base md:text-lg">Tier One</label>
                <span className="text-grayish-blue text-sm md:text-base">$20 / Month / Brand</span>
              </div>
              <Image src={images.subscription.tier1} alt="Discount Icon" width={24} height={24} className="h-16 w-16 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16" />
            </button>

            {/* Tier Two Button */}
            <button onClick={() => setActiveTier('Tier Two')} className={`flex justify-between items-center border rounded-xl w-full h-20 sm:h-24 lg:h-28  px-4 ${activeTier === 'Tier Two' ? 'border-Red bg-red-100' : 'border-gray-300 bg-primary'}`}>
              <div className="flex items-center space-x-2">
                <Image src={activeTier === 'Tier Two' ? images.subscription.filledCircle : images.subscription.circle} alt={activeTier === 'Tier Two' ? 'Radio' : 'Circle'} width={activeTier === 'Tier Two' ? 25 : 10} height={20} className="w-auto h-auto" />
              </div>
              <div className="flex flex-col items-center font-outfit">
                <label className="text-Blackish text-base md:text-lg">Tier Two</label>
                <span className="text-grayish-blue text-sm md:text-base">$30 / Month / Brand</span>
              </div>
              <Image src={images.subscription.tier2} alt="Discount Icon" width={20} height={20} className="h-16 w-16 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16" />
            </button>

            {/* Tier Three Button */}
            <button onClick={() => setActiveTier('Tier Three')} className={`flex justify-between items-center border rounded-xl w-full h-20 sm:h-24 lg:h-28  px-4 ${activeTier === 'Tier Three' ? 'border-Red bg-red-100' : 'border-gray-300 bg-primary'}`}>
              <div className="flex items-center justify-center space-x-2">
                <Image src={activeTier === 'Tier Three' ? images.subscription.filledCircle : images.subscription.circle} alt={activeTier === 'Tier Three' ? 'Radio' : 'Circle'} width={activeTier === 'Tier Three' ? 20 : 16}
                  height={16}
                  className="w-auto h-auto"
               />
              </div>
              <div className="flex flex-col items-center justify-center font-outfit">
                <label className="text-Blackish text-base md:text-lg">Tier Three</label>
                <span className="text-grayish-blue text-sm md:text-base">$50 / Month / Brand</span>
              </div>
              <Image src={images.subscription.tier2} alt="Discount Icon" width={24} height={24} className="h-16 w-16 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16" />
            </button>
          </div>

          <div className="mb-3">
            <h2 className="text-xl md:text-2xl  font-bold mb-2 text-dark-charcoal font-inter px-1">What You Get??</h2>
          </div>

          <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 p-4 sm:p-6 md:p-8 rounded-2xl">
            {/* Page Header */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-outfit mb-4 text-dark-charcoal text-center">
              Upgrade Your Plan
            </h1>
            <p className="text-sm sm:text-md md:text-lg text-gray-600 mb-6 font-proxima text-center">
              Compare our plans and choose the one that fits your needs.
            </p>

            {/* Button to Open Modal */}
            <button onClick={() => setIsModalOpen(true)} className="px-4 sm:px-6 py-2 sm:py-3 bg-Red text-primary font-medium font-proxima rounded-lg hover:bg-red-500 focus:outline-none focus:ring focus:ring-red-300 transition-transform transform hover:scale-105 drop-shadow-2xl shadow-xl">
              View Subscription Plans
            </button>
          </div>

        </div>
        {/* <div className="space-y-2 sm:space-y-4 mt-2 xl:ml-9 sm:px-8 sm:mt-0 px-2">

            <CustomCheckbox label="Age view" className="flex items-center space-x-2 text-[#2D3748] font-outfit" onChange={() => console.log('clicked Age view')} />

                <CustomCheckbox label="Gender view" className="flex items-center space-x-2 text-[#2D3748]  font-outfit" onChange={() => console.log('clicked Gender view')} />

               <CustomCheckbox label="Sort all views by likes" className="flex items-center space-x-2 text-[#2D3748]  font-outfit" onChange={() => console.log('clicked Sort all views by likes')} />

               <CustomCheckbox label="Sort all views by redemptions" className="flex items-center space-x-2 text-[#2D3748]  font-outfit" onChange={() => console.log('clicked Sort all views by redemptions')} />

               <CustomCheckbox label="3 city view" className="flex items-center space-x-2 text-[#2D3748]  font-outfit" onChange={() => console.log('clicked 3 city view')} />

          </div> */}

      </div>

      {/* Subscription Modal */}
      <SubscriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </>
  )

}