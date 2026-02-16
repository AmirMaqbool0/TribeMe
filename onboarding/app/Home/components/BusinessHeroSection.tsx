// import React from "react";
// import Image from "next/image";
// import sectionImage1 from "../../../public/heroImg.png";
// import Link from "next/link";
// import { GoArrowUpRight } from "react-icons/go";

// const HeroSection: React.FC = () => {
//   return (
//     <section className="w-full min-h-screen bg-[#ff3951] flex items-center justify-center relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
//       <div className="absolute py-10 mt-10 inset-x-0 bottom-0 h-1/4 bg-white origin-bottom-right skew-y-[-4deg]"></div>

//       <div className="relative z-10 container mx-auto flex flex-col lg:flex-row items-center justify-around mt-10">
//         <div className="w-full lg:w-3/5 text-center lg:text-left mb-8 lg:mb-0">
//           <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl 2xl:text-3xl font-medium text-white leading-tight mb-1 mt-6 py-6 xl:mt-0">
//             A MOVEMENT for Effortless Brand <br/> Growth - Providing Simplified and Integrated New Customer Acquisition, Loyalty, and Learning
//           </h1>

//           <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-xl 2xl:text-xl mb-6 text-white font-extralight max-w-3xl mx-auto lg:mx-0">
//             TRIBE ME empowers Brands, Bands, Bars, Restaurants, Salons, Shops & Businesses of any kind to more easily and economically find, connect with, and secure new and loyal customers. Simplicity, ease, and cost-effectiveness are the tenets upon which TRIBE ME is built for businesses. We provide a suite of tools and features designed to enhance your visibility, engagement, and customer understanding - all while keeping things simple and costs low.
//           </p>
//           <Link href="/Waitlist">
//             <div className="flex justify-center lg:justify-start">
//               <button className="px-6 py-3 bg-black text-white font-bold rounded-md hover:bg-white hover:text-black flex items-center space-x-2 text-sm sm:text-base">
//                 <span>Join the waitlist</span>
//                 <GoArrowUpRight />
//               </button>
//             </div>
//           </Link>
//         </div>

//         <div className="w-full lg:w-2/5 md:w-3/5 sm:w-4/12 xl:w-3/12 2xl:w-3/12 flex justify-center lg:justify-end items-end sm:hidden md:flex">
//           <Image
//             src={sectionImage1}
//             alt="Hero Image"
//             width={450}
//             height={450}
//             className="object-contain max-w-full h-auto"
//           />
//         </div>
//       </div>

//       <div className="absolute bottom-0 right-0 hidden md:flex justify-end w-full mt-12">
//         <img
//           src="/vector-75.svg"
//           alt="Line pattern"
//           className="w-full max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]"
//         />
//       </div>
//     </section>
//   );
// };

// export default HeroSection;

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
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl 2xl:text-3xl font-bold text-white leading-tight mb-1 mt-6 py-6 xl:mt-0">
            A MOVEMENT for Economical Brand <br /> Growth - Providing Simplified and Integrated New Customer Acquisition, Loyalty, and Learning
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-xl 2xl:text-xl mb-6 text-white font-extralight max-w-3xl mx-auto lg:mx-0">
            TRIBE ME empowers Brands, Bands, Bars, Restaurants, Salons, Shops & Businesses of any kind to more easily and economically find, connect with, and secure new and loyal customers.
          </p>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-xl 2xl:text-xl mb-6 text-white font-extralight max-w-3xl mx-auto lg:mx-0">
            Simplicity, ease, and cost-effectiveness are the tenets upon which TRIBE ME is built for businesses.
          </p>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-xl 2xl:text-xl mb-6 text-white font-extralight max-w-3xl mx-auto lg:mx-0">
            We provide a suite of tools and features designed to enhance your visibility, engagement, and customer understanding - all while keeping things simple and costs low.
          </p>

          <Link href="/Waitlist">
            <div className="flex justify-center lg:justify-start">
              <button className="px-6 py-3 bg-black text-white font-bold rounded-md hover:bg-white hover:text-black flex items-center space-x-2 text-sm sm:text-base">
                <span>Join the waitlist</span>
                <GoArrowUpRight />
              </button>
            </div>
          </Link>
        </div>

        <div className="w-full lg:w-2/5 md:w-3/5 sm:w-4/12 xl:w-3/12 2xl:w-3/12 flex justify-center lg:justify-end items-end sm:hidden md:flex">
          <Image src={sectionImage1} alt="Hero Image" width={450} height={450} className="object-contain max-w-full h-auto" />
        </div>
      </div>

      <div className="absolute bottom-0 right-0 hidden md:flex justify-end w-full mt-12">
        <img src="/vector-75.svg" alt="Line pattern" className="w-full max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]" />
      </div>
    </section>
  );
};

export default HeroSection;
