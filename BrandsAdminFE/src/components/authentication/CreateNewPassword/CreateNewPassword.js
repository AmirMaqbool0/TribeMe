"use client";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import images from "@/src/assets/images";

export default function AccountPassword() {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-Red px-3">

      <div className="w-full max-w-md sm:p-8 p-5 space-y-4 bg-primary rounded shadow">

        <div className="flex justify-center">
          <Image src={images.logo.tribeme} alt="Brand Logo" width={150} height={150} className="object-contain" />
        </div>

        <h2 className="text-2xl text-center font-bold font-proxima">Set Your Password</h2>

        <div className="text-center text-Red font-semibold font-inter">  Please submit without a password. </div>

        <form className="space-y-4">

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 font-outfit" > New Password </label>
            <input type="password" id="password" placeholder="New password" className="font-outfit w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" required minLength={6} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700 font-outfit"> Confirm Password </label>
            <input type="password" id="confirmPassword" className="font-outfit w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" required placeholder="Confirm password" minLength={6} />
          </div>

          
          <div className="flex justify-center items-center">
          <button onClick={navigateToLogin} type="submit" className="text-center flex items-center justify-center font-outfit w-full px-4 py-4 h-[7vh] text-primary rounded-md bg-Red hover:text-red-400">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}