"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';
import images from '@/src/assets/images';
import { clearState, logout } from '@/redux/Auth Slices/loginSlice';
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/navigation';




export default function LogOut() {
    const router = useRouter();
    const dispatch = useDispatch();

 const handleLogout = () => {
    console.log("-------------->User Logout");
    dispatch(logout());
    dispatch(clearState());

    setTimeout(() => {
        router.replace('/');
    }, 100); 
};



    return (
        <button title='Logout' onClick={handleLogout} className="font-outfit flex items-center justify-center hover:bg-Red hover:text-primary border-2 hover:border-primary border-Red bg-primary text-silver-sand md:px-3 md:py-2 px-6 sm:text-base text-sm tracking-wide font-normal leading-[28px] text-left rounded-full transition-all sm:text-[22.86px] sm:leading-[32px] p-1 py-0 h-[3.5rem] group">
            <Image src={images.header.logout} alt="Logout" width={20} height={20} className="md:mr-2 transition-all " />
            <span className="hidden md:block transition-all group-hover:text-primary">Logout</span>
        </button>
    );
}

