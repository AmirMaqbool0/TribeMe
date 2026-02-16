import React from "react";
import Image from "next/image";
import Link from "next/link";

const HomePage: React.FC = () => {
    return (
        <header className="bg-pink text-white py-4 px-6 sm:px-8 min-h-screen w-full flex flex-col">
            {/* Navigation */}
            <nav className="container max-w-7xl mx-auto flex justify-between items-center sm:mb-12 mb-8">
                {/* Logo */}
                <div className="flex items-center">
                    <Image src="/navLogo.svg" alt="Logo" width={100} height={100} className="w-24 h-auto sm:w-36" />
                </div>

                {/* Navigation Links */}
                <div className="hidden sm:flex space-x-8">
                    <Link href="/Home" className="text-white font-semibold hover:text-gray-200 transition">
                        Business
                    </Link>
                    <Link href="/MemberPage" className="text-white font-semibold hover:text-gray-200 transition">
                        Member
                    </Link>
                </div>

                {/* Sign In & Join Waitlist Buttons */}
                <div className="flex items-center space-x-4">
                    {/* <Link href="/Login" className="text-white font-semibold hover:text-gray-200 transition">
                        Sign In
                    </Link> */}
                    <Link href="/Waitlist" className="bg-black text-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition">
                        Join Waitlist
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="mx-auto flex-grow flex flex-col justify-center">

                {/* SECOND DIV */}
                <div className="flex flex-col sm:flex-row justify-between gap-8 md:gap-5">

                    {/* CONTENT */}
                    <div className="space-y-8">

                        {/* HEADING DIVS */}
                        <div className="text-center md:text-left ">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">Welcome to the TRIBE ME MOVEMENT</h1>
                        </div>

                        {/* PARAGRAPHS DIVS*/}
                        <div className="text-center md:text-left space-y-3">

                            {/* First paragraph */}
                            <p className="text-base sm:text-lg xl:text-[22px] leading-loose max-w-4xl mx-auto px-4 mb-1.5 xl:leading-relaxed">
                                Tribe Me is kinda like Ibotta meets Tinder plus a Movement for Radical Transparency. Members discover, match with,
                                and get deals and cash back from Businesses they like.
                            </p>

                            {/* Second paragraph */}
                            <p className="text-base sm:text-lg xl:text-[22px] max-w-4xl leading-loose mx-auto px-4 mb-1.5 xl:leading-relaxed">
                                Businesses easily earn new customers and maintain loyal customers with minimal expense or effort plus
                                learn from the added analytics layer.
                            </p>

                            {/* Third paragraph */}
                            <p className="text-base sm:text-lg xl:text-[22px] max-w-4xl mx-auto px-4 leading-loose mb-1.5 sm:mb-3 xl:leading-relaxed">
                                The Tribe Me business model is unique in that 50% of all profits are shared
                                with Members in exchange for the open, anonymized usage of their data.
                            </p>

                        </div>
                    </div>

                    {/* IMAGE */}
                    <div className="flex items-center justify-center">
                        <Image src='/member/my_data.png' width={100} height={100} alt="My data" className="object-contain h-auto sm:w-[30vh] md:w-[40vh] lg:w-[40vh]" />
                    </div>

                </div>


                {/* third div */}
                <div className="flex flex-col sm:flex-row justify-center items-center mb-10">

                    {/* Left Box */}
                    <div className="flex flex-col items-center justify-center w-full max-w-xs sm:max-w-md text-center m-6 bg-black bg-opacity-30 p-6 rounded-md">
                        <p className="text-base sm:text-lg mb-4 xl:text-sm">
                            To Join as a Brand, Band, Bar, Restaurant, Salon, Shop or other Business
                        </p>
                        <Link href="/Home" className="inline-block bg-black text-white  xl:text-sm px-6 py-3 rounded-md hover:bg-white hover:text-black transition">
                            Learn More &rarr;
                        </Link>
                    </div>

                    {/* Right Box */}
                    <div className="flex flex-col items-center justify-center w-full max-w-xs sm:max-w-md text-center m-6 bg-black bg-opacity-30 p-6 rounded-md">
                        <p className="text-base sm:text-lg xl:text-sm mb-4">
                            To Join as a Member to make money, get deals, and discover stuff you'll like
                        </p>
                        <Link href="/MemberPage" className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-white xl:text-sm hover:text-black transition">
                            Learn More &rarr;
                        </Link>
                    </div>
                </div>

            </div>


        </header>
    );
};

export default HomePage;
