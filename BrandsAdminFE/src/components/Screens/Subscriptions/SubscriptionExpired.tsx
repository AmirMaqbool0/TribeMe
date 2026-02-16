import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import images from '@/src/assets/images';
import axios from 'axios';
import Cookies from 'js-cookie';

interface SubscriptionExpiredProps {
  subscriptionData?: any;
}

export default function SubscriptionExpired({ subscriptionData }: SubscriptionExpiredProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribeAgain = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = Cookies.get('authToken');
      const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_URI;
      // Call backend to delete/reset cancelled subscription
      await axios.delete(`${BASE_API_URL}/brand/deleteCancelledSubscription`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { brandId: subscriptionData?.brand?.id },
      });
      // After deletion, refresh the page to show the subscription form
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not reset subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center font-outfit">
            Subscription Expired
          </h1>
          <p className="text-red-100 text-center mt-2 font-proxima">
            Your subscription has been cancelled
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 leading-relaxed font-proxima">
              Your subscription has been cancelled due to payment issues. 
              To continue accessing premium features, please renew your subscription.
            </p>
          </div>

          {/* Subscription Details */}
          {subscriptionData && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <h3 className="font-semibold text-dark-charcoal font-outfit mb-3 flex items-center">
                <Image src={images.subscription.creditCard} alt="Card Icon" width={20} height={20} className="w-5 h-5 mr-2" />
                Previous Subscription
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-grayish-blue font-proxima">Plan:</span>
                  <span className="font-medium text-dark-charcoal font-outfit">{subscriptionData.subscriptionPlan?.tier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-grayish-blue font-proxima">Status:</span>
                  <span className="text-red-600 font-medium font-outfit">Cancelled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-grayish-blue font-proxima">Ended:</span>
                  <span className="font-medium text-dark-charcoal font-outfit">
                    {new Date(subscriptionData.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Subscribe Again Button */}
          <button
            onClick={handleSubscribeAgain}
            disabled={loading}
            className="w-full bg-Red hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg font-proxima disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Image src={images.subscription.creditCard} alt="Card Icon" width={20} height={20} className="w-5 h-5 mr-2" />
              {loading ? 'Please wait...' : 'Subscribe Again'}
            </div>
          </button>
          {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 font-proxima">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <Image src={images.tribeme} alt="TribeMe Logo" width={24} height={24} className="w-6 h-6" />
            <span className="text-xs text-gray-500 font-proxima">TribeMe Subscription Service</span>
          </div>
        </div>
      </div>
    </div>
  );
} 