import React from "react";
import Image from "next/image";
import Link from "next/link";

const RequestSent: React.FC = () => {
  return (
    <div className="flex flex-col bg-white items-center justify-center min-h-screen relative font-outfit">
      {/* Responsive logo positioning */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 sm:left-5 sm:transform-none mt-4 sm:mt-0">
        <Link href="/" passHref>
          
            <Image src="/logo.svg" alt="Logo" width={200} height={100} />
          
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-center text-center mt-10">
        <Image
          src="/requestSent.svg"
          alt="Illustration"
          width={400}
          height={400}
          className="mb-0 mt-10"
        />
        <h1 className="text-4xl font-bold mb-3 max-w-3xl text-black">
          Request Sent to <br />
          Tribe Me Headquarters
        </h1>
        <p className="text-lg text-gray-500 max-w-3xl w-full leading-6">
          Your request has been successfully sent to the TRIBE ME Headquarters.
          <br />
          Our team is reviewing it, and you’ll hear from us shortly. <br />
          Thank you for reaching out!
        </p>
      </div>
    </div>
  );
};

export default RequestSent;
