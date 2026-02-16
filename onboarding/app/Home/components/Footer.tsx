import React from "react";
import Image from "next/image";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa"; // Importing React Icons

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#eff3f8] text-gray-800 py-10 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto flex flex-wrap justify-between gap-8">
        {/* Column 1 */}

        <div className="w-full lg:w-1/6 flex flex-col items-center sm:items-center xl:items-start 2xl:items-start space-y-6 justify-around">
          <div className="flex flex-col items-center sm:items-center xl:items-start 2xl:items-start">
            <Image
              src="/navLogo copy.svg"
              alt="Logo"
              width={100}
              height={100}
              className="mb-4"
            />
            <p className="flex items-center text-center sm:text-left text-sm">
              <svg
                className="w-5 h-5 mr-2 text-gray-800"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10h-6.5A2.5 2.5 0 0 0 12 12.5V21h9V10zM3 21h9V12.5A2.5 2.5 0 0 0 9.5 10H3v11z"></path>
              </svg>
              Boulder, Colorado
            </p>
            <form className="mt-4 flex flex-col items-center sm:items-center xl:items-start 2xl:items-start w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-md text-gray-800 mb-2 w-full"
              />
              <button
                type="submit"
                className="bg-pink text-white font-semibold py-2 px-4 rounded-md hover:bg-white hover:text-black w-full sm:w-auto"
              >
                Subscribe
              </button>
              {/* Customer Support Email */}
              <p className="text-sm text-black-200 mt-4">
                For Customer Support, contact us at:
                <a
                  href="mailto:Contact@TribeMe.com"
                  className="text-pink font-semibold hover:underline ml-1"
                >
                  Contact@TribeMe.com
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* Column 2 */}
        <div className="w-full lg:w-1/6 flex flex-col items-center sm:items-center xl:items-start 2xl:items-start">
          <h4 className="font-bold mb-4 text-lg">Resources</h4>
          <ul className="space-y-2 text-center sm:text-center xl:text-left 2xl:items-left">
            <li>
              <a href="#" className="hover:underline text-sm">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-sm">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="w-full lg:w-1/6 flex flex-col items-center sm:items-center xl:items-start 2xl:items-start">
          <h4 className="font-bold mb-4 text-lg">Help</h4>
          <ul className="space-y-2 text-center sm:text-center xl:text-left 2xl:items-left">
            <li>
              <a href="#" className="hover:underline text-sm">
                Customer Support
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-sm">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-sm">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="w-full lg:w-1/6 flex flex-col items-center sm:items-center xl:items-start 2xl:items-start">
          <h4 className="font-bold mb-4 text-lg">Company</h4>
          <ul className="space-y-2 text-center sm:text-left">
            <li>
              <a href="#" className="hover:underline text-sm">
                About
              </a>
            </li>
          </ul>
        </div>

        {/* Column 5 */}
        <div className="w-full lg:w-1/6 flex flex-col items-center sm:items-center xl:items-start 2xl:items-start">
          <h4 className="font-bold mb-4 text-lg">Install App</h4>
          <div className="flex flex-col gap-2 items-center sm:items-center xl:items-start 2xl:items-start  w-full">
            <a href="#">
              <Image
                src="/buttons@2x.png"
                alt="App Image"
                width={150}
                height={100}
              />
            </a>
            <a href="#" className="sm:w-12 xl:w-12 2xl:w-12">
              <Image
                src="/appstore.png"
                alt="Button Image"
                width={75}
                height={100}
              />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright and Social Links */}
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center mt-10 border-t pt-4">
        <p className="text-sm text-gray-600">
          © Copyright 2024. All Rights Reserved by FBAmultitool
        </p>
        <div className="flex space-x-4 mt-4 lg:mt-0">
          <a
            href="#"
            className="flex justify-center items-center w-10 h-10 rounded-full bg-gray-500 text-white hover:bg-[#f9a825] hover:text-white transition-colors duration-300"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="#"
            className="flex justify-center items-center w-10 h-10 rounded-full bg-gray-500 text-white hover:bg-[#f9a825] hover:text-white transition-colors duration-300"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="#"
            className="flex justify-center items-center w-10 h-10 rounded-full bg-gray-500 text-white hover:bg-[#f9a825] hover:text-white transition-colors duration-300"
          >
            <FaFacebook size={20} />
          </a>
          <a
            href="#"
            className="flex justify-center items-center w-10 h-10 rounded-full bg-gray-500 text-white hover:bg-[#f9a825] hover:text-white transition-colors duration-300"
          >
            <FaLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
