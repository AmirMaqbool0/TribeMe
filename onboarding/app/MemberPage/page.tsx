import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GoArrowUpRight } from "react-icons/go";
import Navbar from "../Home/components/Navbar";

const MemberPage: React.FC = () => {
  return (
    <>
      {/* Navbar Component */}
      <Navbar />
      <section className="w-full min-h-screen bg-[#FF3951] flex items-center justify-center relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">

        {/* <div className="absolute py-10 mt-10 inset-x-0 bottom-0 h-1/4 bg-white origin-bottom-right skew-y-[-4deg]"></div> */}

        <div className="relative mt-12 z-10 container mx-auto flex flex-col lg:flex-row items-center justify-around 2xl:mt-10 lg:mb-5">

          {/* HEADINGS & PARAGRAPHS */}
          <div className="w-full lg:w-3/5 text-center sm:text-left lg:text-left mb-8 mt-8 lg:mb-0 lg:mt-0 p-1">
            <h1 className="text-xl sm:text-2xl font-outfit md:text-3xl lg:text-4xl xl:text-3xl 2xl:text-4xl font-bold text-white leading-tight md:mb-1 2xl:mt-0">
              A MOVEMENT allowing Members to Profit from Their Usage Data!
            </h1>

            <div className="flex flex-col space-x-2 lg:space-x-0.5 sm:flex-row xl:space-x-4 mb-3 sm:mt-1">
              <div className="lg:mt-8 xl:mt-5 md:mt-5">
                {/* first para */}
                <p className="text-base sm:text-md md:text-lg lg:text-xl text-white font-extralight max-w-3xl xl:text-lg 2xl:text-xl mx-auto lg:mx-0 mb-1.5">
                  Once 1,000,000s are Members, YOU earn $1,000s! So share with <br />everyone you know to help us grow. 50% of all TRIBE ME profit is
                  <br /> shared with Members.
                </p>

                {/* second para */}
                <p className="text-base sm:text-md md:text-lg lg:text-xl text-white font-extralight max-w-3xl xl:text-lg 2xl:text-xl mx-auto lg:mx-0 mb-1.5">
                  TRIBE ME anonymizes your data then uses it to make YOU money. <br />1,000,000s of Members = $1,000s to YOU.
                </p>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center">
                <Image src='/member/my_data.png' width={100} height={60} alt="My data" className="object-contain sm:w-[30vh] md:w-[30vh] lg:w-[25vh]" />
              </div>

            </div>

            {/* third para */}
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl 2xl:text-2xl text-white font-semibold max-w-3xl xl:text-xl mx-auto lg:mx-0 mb-1.5">
              How much is possible? Once we reach ¼ the size of Instagram, you could easily earn $5000 per year!
            </p>
            {/* fourth para */}
            <p className="text-base sm:text-md md:text-lg lg:text-xl text-white font-extralight max-w-3xl xl:text-lg 2xl:text-xl mx-auto lg:mx-0">
              Until then, get Cash Back and Deals on what you LIKE! No more emails and texts clogged with irrelevant deals. Just "Like" Brands, Bands, Bars,
              Restaurants, Salons, Shops, etc., and receive deals from them in TRIBE ME.
            </p>
            {/* fifth para */}
            <p className="text-base sm:text-md md:text-lg lg:text-xl text-white font-extralight max-w-3xl xl:text-lg 2xl:text-xl mx-auto lg:mx-0">
              Discover new Brands, Bands, Bars, Restaurants, Salons, Shops, etc., liked by your TRIBE.(assigned after optional survey).
            </p>
            {/* sixth para */}
            <p className="text-base sm:text-md md:text-lg lg:text-xl text-white font-extralight max-w-3xl xl:text-lg 2xl:text-xl mx-auto lg:mx-0">
              Earn TRIBE ME Coins for helping grow the MOVEMENT. Coins can be used for purchases in the TRIBE ME Marketplace or cashed out to your bank account.
            </p>

            {/* WAITLIST */}
            <Link href="/Waitlist">
              <div className="flex justify-center lg:justify-start">
                <button className="px-6 py-3 my-4 bg-black xl:text-sm text-white font-bold rounded-md hover:bg-white hover:text-black flex items-center space-x-2 text-sm sm:text-base">
                  <span>Join the Waitlist</span>
                  <GoArrowUpRight />
                </button>
              </div>
            </Link>
          </div>

          {/*MOBILE IMAGE */}
          <div className="w-full lg:w-2/6 md:w-3/5 sm:w-4/12 xl:w-3/12 2xl:w-3/12 flex justify-center lg:justify-end items-end sm:hidden md:flex">
            <img src="/heroImg.png" alt="Hero Image" width={450} height={450} className="object-contain max-w-full h-auto" />
          </div>

        </div>

        {/* ARROW */}
        <div className="absolute bottom-0 right-0 hidden md:flex justify-end w-full mt-12">
          <img src="/vector-75.svg" alt="Line pattern" className="w-full max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]" />
        </div>

      </section>
    </>
  );
};

export default MemberPage;