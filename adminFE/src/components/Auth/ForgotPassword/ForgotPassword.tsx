'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Basic validation for email input
    const handleForgotPassword = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!email) {
            setMessage('Please enter an email address.');
            return;
        }

        // Simulate successful flow
        setMessage('A password reset OTP has been sent to your email.');
        setTimeout(() => {
            router.push('/reset_password');
        }, 3000);
    };


    return (
        <div className='min-h-screen flex items-center justify-center bg-Red'>
            <div className="bg-light-gray p-8 rounded-xl shadow-lg max-w-md w-full">

                {/* Forgot Password Section */}
                <h1 className="text-3xl text-center font-bold text-Red font-proxima mb-6">Forgot Password</h1>

                <form onSubmit={handleForgotPassword}>

                    {/* Email */}
                    <div className='mb-4'>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block font-proxima w-full mb-3 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-300" />
                    </div>

                    {/* Send OTP*/}
                    <div className='flex justify-center items-center'>
                        <button type="submit" className="bg-Red text-primary text-center font-proxima w-full py-3 rounded-lg text-lg hover:bg-red-300"> Send OTP </button>
                    </div>
                </form>
                {message && <p className="mt-3 text-base text-Blackish text-center">{message}</p>}

                {/* Login Back */}
                <p className="mt-6 text-sm text-center font-proxima text-gray-600">
                    Changed your mind?{" "}
                    <a href="/login" className="text-Red font-medium hover:underline" >  Back to Login   </a>
                </p>
            </div>

        </div>
    )
}

export default ForgotPassword;