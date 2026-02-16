// Navbar.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "../../../public/navLogo.svg";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 w-full z-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="flex items-center">
        <Link href="/">
          <Image src={logo} alt="Logo" width={150} height={150} />
          </Link>
        </div>
        <div className="hidden md:flex space-x-8">
          <Link href="/Home">
            <span className="text-white text-sm lg:text-base">Business</span>
          </Link>

          <Link href="/MemberPage">
            <span className="text-white text-sm lg:text-base">Member</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {/* <Link href="/Login">
            <button className="btn-neutral outline-none text-white text-sm lg:text-base py-2 px-4 rounded-md">
              Sign In
            </button>
          </Link> */}
          <Link href="/Waitlist">
            <button className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs lg:text-sm py-3 px-6 bg-gray-900 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none rounded-full">
              Join The Waitlist
            </button>
          </Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-pink text-center p-4 z-30 absolute top-0 left-0 right-0 mt-16 shadow-lg">
          <Link href="/Home">
            <button onClick={() => setIsMenuOpen(false)} className="block w-full text-black py-2">
              Business
            </button>
          </Link>

          <Link href="/MemberPage">
            <button onClick={() => setIsMenuOpen(false)} className="block w-full text-black py-2">
              Member
            </button>
          </Link>

          {/* <Link href="/Login">
            <button className="block w-full text-center py-2 mt-4 bg-gray-200 text-black">
              Sign In
            </button>
          </Link> */}

          <Link href="/Waitlist">
            <button className="block w-full text-center py-2 mt-2 bg-gray-900 text-white">
              Join The Waitlist
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
