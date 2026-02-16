// "use client";
// import React, { useState } from 'react';

// export default function CreateNewPassword() {
//     const [email, setEmail] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');

//     const handleCreatePassword = (e: React.FormEvent) => {
//         e.preventDefault();

//         // Basic validation
//         if (newPassword !== confirmPassword) {
//             alert("Passwords do not match!");
//             return;
//         }

//         if (email === '' || newPassword === '') {
//             alert("Please fill out all fields");
//             return;
//         }

//         // Perform the logic for creating a new password here
//         console.log('Email: ', email, 'New Password: ', newPassword);

//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-Red">
//             <div className="bg-primary p-8 rounded-xl shadow-lg max-w-md w-full">
//                 <h2 className="text-2xl font-bold mb-6 text-Red text-center">Create New Password</h2>
//                 <form onSubmit={handleCreatePassword}>
//                     <div className="mb-4">
//                         <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
//                         <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter your email" required />
//                     </div>
//                     <div className="mb-4">
//                         <label className="block text-gray-700 font-medium mb-2" htmlFor="newPassword">New Password</label>
//                         <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter your new password" required />
//                     </div>
//                     <div className="mb-6">
//                         <label className="block text-gray-700 font-medium mb-2" htmlFor="confirmPassword">Confirm Password</label>
//                         <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Confirm your new password" required />
//                     </div>
//                     <button type="submit" className="w-full bg-Red text-white p-2 rounded-lg font-semibold hover:bg-red-200"> Create New Password </button>
//                 </form>
//                 <p className="text-sm text-center text-gray-500 mt-4">
//                     Remember your password?
//                     <a href="/login" className="text-Red"> Login</a>
//                 </p>
//             </div>
//         </div>
//     );
// }
