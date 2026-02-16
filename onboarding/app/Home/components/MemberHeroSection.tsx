import React from "react";
import Image from "next/image";
import sectionImage1 from "../../../public/heroImg.png";
import Link from "next/link";
import { GoArrowUpRight } from "react-icons/go";

const HeroSection: React.FC = () => {
  return (
    <section className="w-full min-h-screen bg-[#ff3951] flex items-center justify-center relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      <div className="absolute py-10 mt-10 inset-x-0 bottom-0 h-1/4 bg-white origin-bottom-right skew-y-[-4deg]"></div>

      <div className="relative z-10 container mx-auto flex flex-col lg:flex-row items-center justify-around mt-10">
       
        <div className="w-full lg:w-3/5 text-center lg:text-left mb-8 lg:mb-0">
        
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white leading-tight mb-1 mt-6 py-6">
          A MOVEMENT allowing Members to Profit from Their Usage Data!
          </h1>

          <p className="text-base sm:text-md md:text-lg lg:text-xl text-white font-extralight max-w-3xl mx-auto lg:mx-0">
          Once 1,000,000s are Members, YOU earn $1,000s!  So share with everyone  you know to help us grow. 50% of all TRIBE ME profit is shared with Members.  TRIBE ME anonymizes  your data then uses it to make YOU money.  1,000,000s of Members = $1,000s to  YOU. Get Cash Back and Deals on what you LIKE!  No more emails and texts  clogged with irrelevant deals.  Just “Like” Brands, Bands, Bars, Restaurants,  Salons, Shops etc. and receive deals from them in TRIBE ME Your Choices Determine Your Tribe.  Usage determines your Tribal Assignment -  typically in 30 days.  Discover new Brands, Bands, Bars, Restaurants,  Salons, Shops etc. Liked by Your Tribe Earn TRIBE ME Coins for helping grow the MOVEMENT.  Coins can be used for  purchases in the TRIBE ME Marketplace or Cashed out to your bank account.
          </p>

          <p className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white font-semiboldx` max-w-3xl mx-auto lg:mx-0">
          <br/>How much is possible?  Once we reach ¼ the size of  instagram, you’ll could easily earn $5000 per year!
          </p>

          <Link href="/Waitlist">
            <div className="flex justify-center lg:justify-start">
              <button className="px-6 py-3 my-4 bg-black text-white font-bold rounded-md hover:bg-white hover:text-black flex items-center space-x-2 text-sm sm:text-base">
                <span>Join the waitlist</span>
                <GoArrowUpRight />
              </button>
            </div>
          </Link>
        </div>

        <div className="w-full lg:w-2/5 md:w-3/5 sm:w-4/12 flex justify-center lg:justify-end items-end sm:hidden md:flex">
          <Image
            src={sectionImage1}
            alt="Hero Image"
            width={450}
            height={450}
            className="object-contain max-w-full h-auto"
          />
        </div>
      </div>

      <div className="absolute bottom-0 right-0 hidden md:flex justify-end w-full mt-12">
        <img
          src="/vector-75.svg"
          alt="Line pattern"
          className="w-full max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]"
        />
      </div>
    </section>
  );
};

export default HeroSection;
