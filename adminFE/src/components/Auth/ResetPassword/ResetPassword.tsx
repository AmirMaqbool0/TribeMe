'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ResetPassword = () => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [message, setMessage] = useState('');
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const handleInputChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus to the next field if a digit is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResetPassword = (e: { preventDefault: () => void }) => {
        e.preventDefault();

        // Validate OTP
        if (otp.some((digit) => digit === '') || otp.join('') !== '123456') {
            setMessage('Invalid OTP. Please try again.');
            return;
        }

        // Simulate successful password reset
        setMessage('Password successfully reset! Redirecting to login...');
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    };


    return (
        <div className='min-h-screen flex items-center justify-center bg-Red'>
            <div className="bg-light-gray p-8 rounded-xl shadow-lg max-w-md w-full">

                {/* Reset Password */}
                <h1 className="text-3xl font-bold font-proxima mb-6 text-Red text-center">Reset Password</h1>

                <form onSubmit={handleResetPassword}>

                    {/* New Password */}
                    <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block font-proxima w-full mb-3 px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-red-300" />

                    {/* Confirm Password */}
                    {/* <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="block font-proxima w-full mb-3 px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-red-300" /> */}


                    {/* OTP Input */}
                    <div className="mb-4">
                        <label className="block font-proxima text-sm mb-2 text-Blackish">OTP (6 Digits)</label>
                        <div className="flex gap-2 justify-center">
                            {otp.map((digit, index) => (
                                <input key={index} type="text" maxLength={1} value={digit} onChange={(e) => handleInputChange(e.target.value, index)} onKeyDown={(e) => handleKeyDown(e, index)} ref={(el) => { if (el) { inputRefs.current[index] = el; } }} required className="w-12 h-12 text-center font-proxima text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-red-300" />
                            ))}
                        </div>
                    </div>

                    {/* Button */}
                    <div className='flex justify-center items-center'>
                        <button type="submit" className="bg-Red text-primary font-proxima w-full text-center py-3 rounded-lg text-lg hover:bg-red-300"> Reset Password  </button>
                    </div>

                </form>
                {message && <p className="mt-3 text-Blackish text-base text-center">{message}</p>}
            </div>
        </div>
    );
};
export default ResetPassword