"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const BASE_API_URI = process.env.NEXT_PUBLIC_BASE_API_URI;
      const response = await fetch(`${BASE_API_URI}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_id', data.admin_id.toString());
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Red">
      <div className="bg-soft-gray p-8 rounded-lg shadow-lg max-w-md w-full">
        {/* Login Section */}
        <h2 className="text-3xl font-bold font-proxima mb-6 text-Red text-center">Login</h2>
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full font-proxima px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-red-300" placeholder="Enter your email" required />
          </div>
          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full font-proxima px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-red-300" placeholder="Enter your password" required />
          </div>
          {/* Error */}
          {error && <div className="text-red-600 text-center mb-4">{error}</div>}
          {/* Button */}
          <div className='flex justify-center items-center'>
            <button type="submit" className="bg-Red text-primary font-proxima w-full text-center py-3 rounded-lg text-lg hover:bg-red-300" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-center text-base font-proxima text-gray-500 mt-4">
          Forgot your password?{" "}
          <a href="/forgot_password" className="text-Red font-outfit text-base">Create a new one</a>
        </p>
      </div>
    </div>
  );
}
