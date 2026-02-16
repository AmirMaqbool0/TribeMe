'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
export const OffersNavbar = () => {
  const pathName = usePathname();

  const offers = [
    { name: "New Offers", path: "/offers/new_offers" },
    { name: "Live Offers", path: "/offers/live_offers" },
    { name: "Past Offers", path: "/offers/past_offers" },
    { name: "Promo Code", path: "/offers/promo_code" },
  ];

  // Determine if we are on the "Live Offers" page or any of its subpages (like an edit page)
  const isLiveOffersPage = pathName.startsWith('/offers/live_offers') && !pathName.includes('/Edit');

  return (
    <div className="place-items-center sm:text-base text-sm tracking-wide">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5 gap-2 w-full max-w-[800px]">
        {offers.map((offer, index) => (
          <Link href={offer.path} key={index}>
            <div
              className={`relative px-2 md:px-6 h-[3.5rem] text-center flex items-center justify-center sm:px-6 font-outfit rounded-full font-medium transition-all duration-300 border-2 border-Red
              ${pathName === offer.path || (offer.name === "Live Offers" && isLiveOffersPage)
                  ? "bg-Red text-primary"
                  : "bg-primary text-silver-sand hover:bg-Red hover:text-primary"
                }`}
            >
              {offer.name}
              {(pathName === offer.path || (offer.name === "Live Offers" && isLiveOffersPage)) && (
                <span className="absolute inset-0 border-4 border-primary rounded-full "></span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
