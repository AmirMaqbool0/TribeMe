"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { useSelector } from "react-redux";
import { selectBrandDetails } from "@/redux/brandSlice";
import Image from "next/image";
import images from "@/src/assets/images";

function SubscriptionHistory() {
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [plans, setPlans] = useState([]);
  const [upgradeMode, setUpgradeMode] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', cardExpiry: '', cvv: '' });
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [paymentValidation, setPaymentValidation] = useState({ cardNumber: '', expiry: '', cvv: '' });

  // Add card validation and formatting helpers (copied from Subscription.tsx)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 16) {
      return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return value;
  };
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      if (cleaned.length >= 2) {
        const month = cleaned.slice(0, 2);
        const year = cleaned.slice(2);
        return month + (year ? '/' + year : '');
      }
      return cleaned;
    }
    return value;
  };
  const formatCVV = (value: string) => value.replace(/\D/g, '').slice(0, 4);
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

  // Get brandId from Redux (same as main Subscription component)
  const brandDetails = useSelector(selectBrandDetails);
  const brandId = brandDetails?.id;
  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_URI;
  const authToken = Cookies.get('authToken');

  useEffect(() => {
    if (!brandId) return;
    // Fetch current subscription
    axios.get(`${BASE_API_URL}/brand/getBrandSubscription?brandId=${brandId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => setSubscription(res.data.data)).catch((err) => {
      console.error('Error fetching subscription:', err);
      setSubscription(null);
    });
    // Fetch payment history
    axios.get(`${BASE_API_URL}/brand/getBrandSubscriptionHistory?brandId=${brandId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => setHistory(res.data.data || [])).catch((err) => {
      console.error('Error fetching history:', err);
      setHistory([]);
    });
    // Fetch plans
    axios.get(`${BASE_API_URL}/brand/getSubscriptions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => setPlans(res.data.data || [])).catch((err) => {
      console.error('Error fetching plans:', err);
      setPlans([]);
    });
  }, [brandId, BASE_API_URL, authToken]);

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${BASE_API_URL}/brand/subscribe`, {
        brandId,
        subscriptionPlanId: selectedPlanId,
        // No cardDetails: backend will use saved method
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setSuccess("Plan upgraded successfully!");
      setUpgradeMode(false);
      // Refresh subscription and history
      axios.get(`${BASE_API_URL}/brand/getBrandSubscription?brandId=${brandId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).then(res => setSubscription(res.data.data)).catch(() => setSubscription(null));
      axios.get(`${BASE_API_URL}/brand/getBrandSubscriptionHistory?brandId=${brandId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).then(res => setHistory(res.data.data || [])).catch(() => setHistory([]));
    } catch (err) {
      setError(err?.response?.data?.message || "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setPaymentError('');
    setPaymentSuccess('');
    const cardNumberError = validateCardNumber(paymentForm.cardNumber);
    const expiryError = validateExpiryDate(paymentForm.cardExpiry);
    const cvvError = validateCVV(paymentForm.cvv || '');
    setPaymentValidation({ cardNumber: cardNumberError, expiry: expiryError, cvv: cvvError });
    if (cardNumberError || expiryError || cvvError) return;
    try {
      await axios.post(`${BASE_API_URL}/brand/updatePaymentMethod`, {
        brandId,
        cardNumber: paymentForm.cardNumber.replace(/\s/g, ''),
        cardExpiry: paymentForm.cardExpiry,
        cardType: 'credit', // Always use credit
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setPaymentSuccess('Payment method updated!');
      setShowUpdatePayment(false);
      // Refresh subscription
      axios.get(`${BASE_API_URL}/brand/getBrandSubscription?brandId=${brandId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).then(res => setSubscription(res.data.data)).catch(() => setSubscription(null));
    } catch (err) {
      setPaymentError(err?.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleCancelSubscription = async () => {
    setCancelError('');
    setCancelSuccess('');
    try {
      await axios.post(`${BASE_API_URL}/brand/cancelSubscription`, {
        brandId
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setCancelSuccess('Subscription will be cancelled at the end of the current period.');
      setShowCancelModal(false);
      // Refresh subscription
      axios.get(`${BASE_API_URL}/brand/getBrandSubscription?brandId=${brandId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).then(res => setSubscription(res.data.data)).catch(() => setSubscription(null));
    } catch (err) {
      setCancelError(err?.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  if (!brandId) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-600 font-proxima">Please log in as a brand to view your subscription.</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 p-6 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Current Subscription Card */}
        <div className="bg-primary rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-dark-charcoal font-outfit">Your Subscription</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                subscription?.status === 'active' ? 'bg-green-500' : 
                subscription?.status === 'cancelled' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`}></div>
              <span className={`text-sm font-medium capitalize ${
                subscription?.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {subscription?.status || 'No subscription'}
              </span>
            </div>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Image src={images.subscription.tier1} alt="Plan Icon" width={24} height={24} className="w-6 h-6" />
                    <h3 className="text-lg font-semibold text-dark-charcoal font-outfit">{subscription.subscriptionPlan?.tier}</h3>
                  </div>
                  <p className="text-grayish-blue text-sm font-proxima">Current Plan</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Image src={images.subscription.creditCard} alt="Card Icon" width={24} height={24} className="w-6 h-6" />
                    <h3 className="text-lg font-semibold text-dark-charcoal font-outfit">Payment Method</h3>
                  </div>
                  <p className="text-grayish-blue text-sm font-proxima">
                    {subscription.brand?.maskedCardNumber || "No card saved"}
                  </p>
                  <button
                    className="mt-2 bg-Red text-primary font-medium font-proxima rounded-xl py-2 px-4 hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 transition-all duration-200"
                    onClick={() => setShowUpdatePayment(true)}
                  >
                    Update Payment
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-dark-charcoal font-outfit mb-2">Next Renewal</h3>
                  <p className="text-grayish-blue text-sm font-proxima">
                    {subscription.nextRenewalDate ? new Date(subscription.nextRenewalDate).toLocaleDateString() : "Not set"}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-dark-charcoal font-outfit mb-2">Card Expiry</h3>
                  <p className="text-grayish-blue text-sm font-proxima">
                    {subscription.brand?.cardExpiry || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-4">
                <button 
                  onClick={() => setUpgradeMode(true)}
                  disabled={subscription?.status === 'cancelled'}
                  className={`flex-1 font-medium font-proxima rounded-xl py-3 focus:outline-none focus:ring focus:ring-red-300 transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    subscription?.status === 'cancelled' 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-Red text-primary hover:bg-red-600'
                  }`}
                >
                  {subscription?.status === 'cancelled' ? 'Subscription Cancelled' : 'Upgrade Plan'}
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={subscription?.status === 'cancelled'}
                  className={`flex-1 font-medium font-proxima rounded-xl py-3 focus:outline-none focus:ring focus:ring-gray-300 transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    subscription?.status === 'cancelled' 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-white text-red-600 border border-red-400 hover:bg-red-50'
                  }`}
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image src={images.subscription.creditCard} alt="No Subscription" width={32} height={32} className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Subscription</h3>
              <p className="text-grayish-blue text-sm">You don't have an active subscription plan.</p>
            </div>
          )}
        </div>

        {/* Upgrade Mode */}
        {upgradeMode && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-dark-charcoal font-outfit mb-4">Select New Plan</h3>
            <div className="space-y-4">
              <select 
                value={selectedPlanId} 
                onChange={e => setSelectedPlanId(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-Red focus:border-transparent font-proxima"
              >
                <option value="">Select a plan</option>
                {plans.filter(p => p.id !== subscription?.subscriptionPlan?.id).map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.tier}</option>
                ))}
              </select>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleUpgrade} 
                  disabled={loading || !selectedPlanId}
                  className="flex-1 bg-green-600 text-white font-medium font-proxima rounded-xl py-3 hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Upgrading..." : "Confirm Upgrade"}
                </button>
                <button 
                  onClick={() => setUpgradeMode(false)}
                  className="flex-1 bg-gray-400 text-white font-medium font-proxima rounded-xl py-3 hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
              
              {error && <div className="text-red-500 text-sm font-proxima">{error}</div>}
              {success && <div className="text-green-600 text-sm font-proxima">{success}</div>}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-primary rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-dark-charcoal font-outfit mb-6">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-dark-charcoal font-outfit">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-charcoal font-outfit">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-charcoal font-outfit">Message</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-grayish-blue font-proxima">
                      No payment history found.
                    </td>
                  </tr>
                ) : (
                  history.map((h, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-grayish-blue font-proxima">
                        {h.attemptDate ? new Date(h.attemptDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          h.status === 'success' ? 'bg-green-100 text-green-800' : 
                          h.status === 'failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-grayish-blue font-proxima text-sm">
                        {h.message || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-primary rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-dark-charcoal font-outfit mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-Red text-primary font-medium font-proxima rounded-xl py-3 hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 transition-all duration-200">
              Download Invoice
            </button>
            <button className="w-full bg-gray-200 text-dark-charcoal font-medium font-proxima rounded-xl py-3 hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300 transition-all duration-200">
              Contact Support
            </button>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-primary rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-dark-charcoal font-outfit mb-4">Subscription Info</h3>
          <div className="space-y-3 text-sm font-proxima">
            <div className="flex justify-between">
              <span className="text-grayish-blue">Plan Type:</span>
              <span className="text-dark-charcoal font-medium">{subscription?.subscriptionPlan?.tier || "None"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-grayish-blue">Status:</span>
              <span className="text-dark-charcoal font-medium capitalize">{subscription?.status || "None"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-grayish-blue">Start Date:</span>
              <span className="text-dark-charcoal font-medium">
                {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : "None"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-grayish-blue">Last Payment:</span>
              <span className="text-dark-charcoal font-medium">
                {subscription?.lastPaymentStatus || "None"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Update Payment Modal */}
      {showUpdatePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowUpdatePayment(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 font-outfit">Update Payment Method</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Card Number (16 digits)"
                maxLength={19}
                value={paymentForm.cardNumber}
                onChange={e => setPaymentForm({ ...paymentForm, cardNumber: formatCardNumber(e.target.value) })}
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 font-proxima ${paymentValidation.cardNumber ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-Red'}`}
              />
              {paymentValidation.cardNumber && <div className="text-red-500 text-xs font-proxima">{paymentValidation.cardNumber}</div>}
              <input
                type="text"
                placeholder="Expiry (MM/YY)"
                maxLength={5}
                value={paymentForm.cardExpiry}
                onChange={e => setPaymentForm({ ...paymentForm, cardExpiry: formatExpiry(e.target.value) })}
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 font-proxima ${paymentValidation.expiry ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-Red'}`}
              />
              {paymentValidation.expiry && <div className="text-red-500 text-xs font-proxima">{paymentValidation.expiry}</div>}
              <input
                type="text"
                placeholder="CVV"
                maxLength={4}
                value={paymentForm.cvv || ''}
                onChange={e => setPaymentForm({ ...paymentForm, cvv: formatCVV(e.target.value) })}
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 font-proxima ${paymentValidation.cvv ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-Red'}`}
              />
              {paymentValidation.cvv && <div className="text-red-500 text-xs font-proxima">{paymentValidation.cvv}</div>}
              {paymentError && <div className="text-red-500 text-sm font-proxima">{paymentError}</div>}
              {paymentSuccess && <div className="text-green-600 text-sm font-proxima">{paymentSuccess}</div>}
              <button
                className="w-full bg-Red text-primary font-medium font-proxima rounded-xl py-3 hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 transition-all duration-200"
                onClick={handleUpdatePayment}
              >
                Update Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowCancelModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 font-outfit text-red-600">Cancel Subscription</h3>
            <p className="mb-4 text-gray-700 font-proxima">Are you sure you want to cancel your subscription? You will retain access until the end of the current billing period.</p>
            {cancelError && <div className="text-red-500 text-sm font-proxima">{cancelError}</div>}
            {cancelSuccess && <div className="text-green-600 text-sm font-proxima">{cancelSuccess}</div>}
            <div className="flex space-x-3 mt-6">
              <button
                className="flex-1 bg-gray-200 text-dark-charcoal font-medium font-proxima rounded-xl py-3 hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300 transition-all duration-200"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep Subscription
              </button>
              <button
                className="flex-1 bg-Red text-primary font-medium font-proxima rounded-xl py-3 hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 transition-all duration-200"
                onClick={handleCancelSubscription}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionHistory; 