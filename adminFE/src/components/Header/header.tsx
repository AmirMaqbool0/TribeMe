"use client"
import React from "react";
import Image from "next/image";
import images from "@/assets/images";
import './style.css'
interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {

    return (
        // <div className={`flex flex-col sm:flex-row md:flex-row sm:h-[20em] md:h-[30em] lg:h-auto h-[25vh] w-full justify-between items-center rounded-xl bg-soft-gray sm:p-6 p-2 shadow-lg`}>

        //     {/* FIRST DIV */}
        //     <div className="flex flex-row items-center justify-between sm:space-x-5 space-x-4">
        //         {/* General Section */}
        //         <div className="flex items-center justify-center space-x-2 sm:space-x-5 cursor-pointer hover:bg-light-silver sm:px-3 rounded-lg sm:py-2 py-1 px-0.5">
        //             <span className="text-dark-gray font-proxima text-base sm:text-lg">General</span>
        //             <div className="sm:text-2xl text-sm">&gt;</div>
        //         </div>
        //         <div>
        //             <h1 className="inline sm:text-lg text-base font-semi-bold bg-soft-pink text-soft-gray px-1 sm:px-4 py-2 rounded-md font-proxima">{title}</h1>
        //         </div>
        //         <div className="relative block md:hidden">
        //             <span className="absolute right-0 top-0 h-2 w-2 bg-Red rounded-full"></span>
        //             <Image src={images.header.bellIcon} alt="Notifications" width={20} height={15} className="h-6 w-6" />
        //         </div>
        //     </div>

        //     {/* SECOND DIV */}
        //     <div className="flex items-center justify-start  space-x-4">
        //         <div className="relative md:block hidden ">
        //             <span className="absolute right-0 top-0 h-2 w-2 bg-Red rounded-full"></span>
        //             <Image src={images.header.bellIcon} alt="Notifications" width={20} height={15} className="h-6 w-6" />
        //         </div>
        //         <Image src={images.header.headerImage} alt="User" width={20} height={15} className="sm:h-12 sm:w-12 w-10 h-10 rounded-lg" />
        //         <span className="text-[#272727] font-proxima text-sm">Muhammad Faizan Adil</span>
        //     </div>
        // </div>
        <div className="w-full bg-gray-50 rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          {/* Left Section */}
          <div className="flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-4 lg:gap-6">
            {/* General Section */}
            <button className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-gray-800 text-sm sm:text-base lg:text-lg font-semibold">
                General
              </span>
              <span className="text-sm sm:text-lg lg:text-xl">&gt;</span>
            </button>
  
            {/* Title */}
            <div className="bg-[#FF8C9A] px-2 sm:px-4 py-1 sm:py-2 rounded-md">
              <h1 className="text-white text-sm sm:text-base lg:text-lg font-semibold whitespace-nowrap">
                {title}
              </h1>
            </div>
  
            {/* Mobile Bell Icon */}
            <div className="relative block sm:hidden">
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              <div className="h-6 w-6 relative">
                <Image
                  src={images.header.bellIcon}
                  alt="Notifications"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
  
          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop Bell Icon */}
            <div className="relative hidden sm:block">
              {/* <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" /> */}
              <div className="h-6 w-6 relative">
                <Image
                  src={images.header.bellIcon}
                  alt="Notifications"
                  layout="fill"
                  objectFit="contain"
                /> 
              </div>
            </div>
  
            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                <Image
                  src={images.header.headerImage}
                  alt="User"
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
              <span className="text-gray-800 text-sm sm:text-base font-semibold whitespace-nowrap">
                John Doe
              </span>
            </div>
          </div>
        </div>
      </div>
    );
}
