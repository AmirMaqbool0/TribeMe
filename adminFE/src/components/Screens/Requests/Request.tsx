'use client';
import React, { useEffect, useState } from 'react';

interface BusinessWaitlist {
  id: number;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessEmail: string;
  phoneNumber: string;
  city: string;
  category: string;
  subCategory?: string;
  address: string;
  zipCode: string;
  status: string;
}

export const Requests = () => {
  const [businesses, setBusinesses] = useState<BusinessWaitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch waitlist entries on mount
  useEffect(() => {
    const fetchWaitlist = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/waitlist/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch waitlist');
        const data = await res.json();
        setBusinesses(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching waitlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWaitlist();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/waitlist/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve waitlist entry');
      setBusinesses(businesses => businesses.filter(b => b.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error approving waitlist entry');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/waitlist/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to reject waitlist entry');
      setBusinesses(businesses => businesses.filter(b => b.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error rejecting waitlist entry');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-8">Loading businesses...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 bg-[#F9F9F9] rounded-xl mb-5 shadow-lg">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 text-[#2D3748]">Business Waitlist</h1>
        <p className="text-sm sm:text-base text-[#4A5568] opacity-70">Following is the list of businesses waiting for approval</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-separate border-spacing-y-2">
          <thead>
            <tr>
              {['Business Name', 'Email', 'Phone', 'City', 'Category', 'Sub-category', 'Address', 'Zip Code', 'Actions'].map((header, index) => (
                <th key={index} className="bg-[#E6E6E6] py-2 px-4 sm:px-6 lg:px-9 font-medium text-[#272727]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {businesses.length === 0 ? (
              <tr><td colSpan={9} className="py-6 text-gray-500">No businesses in the waitlist.</td></tr>
            ) : businesses.map((b) => (
              <tr key={b.id} className="border-t border-[#C9C9C9] hover:bg-gray-100">
                <td className="px-2 py-3">{b.businessName || `${b.firstName} ${b.lastName}`}</td>
                <td className="px-2 py-3">{b.businessEmail}</td>
                <td className="px-2 py-3">{b.phoneNumber}</td>
                <td className="px-2 py-3">{b.city}</td>
                <td className="px-2 py-3">{b.category}</td>
                <td className="px-2 py-3">{b.subCategory || '-'}</td>
                <td className="px-2 py-3">{b.address}</td>
                <td className="px-2 py-3">{b.zipCode}</td>
                <td className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleApprove(b.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={actionLoading === b.id}
                  >
                    {actionLoading === b.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(b.id)}
                    className="px-3 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
                    disabled={actionLoading === b.id}
                  >
                    {actionLoading === b.id ? 'Processing...' : 'Reject'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

