'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export const MainNavBar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Offers", href: "/offers/new_offers" },
    { name: "Profile", href: "/profile" },
    { name: "Subscription", href: "/subscription" },
  ];

  const isOffersPage = pathname.startsWith('/offers');
  const isProfilePage = pathname.startsWith('/profile');

  return (
     <nav className="sm:text-base text-sm tracking-wide overflow-hidden font-outfit bg-primary shadow-lg border-2 border-Red rounded-full p-1 py-0 h-[3.5rem] sm:w-[415px] w-full mx-auto ">
    
      <div className="h-full flex items-center pl-1 justify-around space-x-3">
      {/* pr-5 sm:pr-7 */}
        {navLinks.map((item, index) => (
          <Link href={item.href} key={index} className="flex items-center justify-center"> 
            {/* col-span-1 gap-0 */}
            <div
              className={`text-center  ${pathname === item.href ||
                  (isOffersPage && item.name === "Offers") ||
                  (isProfilePage && item.name === "Profile")
                  ? "text-Red font-medium"
                  : "text-silver-sand hover:text-Red"
                }`}
            >
              {item.name}
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};
