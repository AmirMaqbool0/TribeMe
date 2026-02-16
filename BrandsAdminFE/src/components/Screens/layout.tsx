"use client";
import React from 'react';
import Image from "next/image";
import { MainNavBar } from '@/src/index';
import images from '@/src/assets/images';
import Link from "next/link";
import LogOut from '../authentication/LogOut/LogOut';

export default function MainLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="p-5 pb-5 grid grid-cols-1 place-items-center" style={{ background: '#FAFAFA' }}>

            {/* Grid Container */}
            <div
                className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-3 sm:gap-x-10 gap-5 w-full lg:w-[100%] items-center"
                style={{ justifyContent: 'space-between' }} // Apply space-between layout
            >
                {/* LOGO */}
                <div className="sm:col-span-1 col-span-1 lg:col-span-1 h-full flex items-center justify-center sm:justify-start">
                    <Link href={'/home'}>
                        <Image
                            src={images.logo.tribeme}
                            alt="Brand Logo"
                            sizes="100vw"
                            width={0}
                            height={0}
                            className="w-[150px] sm:w-[150px] md:w-[150px] lg:w-[200px] xl:w-[210px] object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* TOP NAVBAR */}
                <div className="col-span-1 sm:col-span-3 lg:col-span-1 flex justify-center w-full items-center">
                    <MainNavBar />
                </div>

                {/* LOGOUT */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-1 flex sm:justify-end justify-center items-center">
                    <LogOut />
                </div>
            </div>

            {/* Dynamic content (children) */}
            <main className="rounded-2xl mt-5 flex items-center justify-center 2xl:w-auto w-full">
                {children}
            </main>
        </div>
    );
}
