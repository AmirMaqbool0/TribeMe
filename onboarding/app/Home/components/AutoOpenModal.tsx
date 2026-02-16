import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AutoOpenModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRedirect = () => {
    router.push('/ComingSoon');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex space-x-4">
          <div 
            className="w-1/2 p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition"
            onClick={handleClose}
          >
            <h2 className="text-xl font-bold mb-2 text-black">Brands, Bands, Bars, Restaurants, Salons, Shops, etc</h2>
            <p className="mb-4 text-black">Learn More</p>
            {/* <p className="text-sm">A Click Here goes to the Current Landing Page Content that Has been Developed</p> */}
          </div>
          <div 
            className="w-1/2 p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition"
            onClick={handleRedirect}
          >
            <h2 className="text-xl font-bold mb-2 text-black">Members - COMING SOON</h2>
            <p className="mb-4 text-black">Learn More</p>
            {/* <p className="text-sm">A Click Here goes to COMING SOON landing page; future content developed for this page will be similar to the App Welcome Screens</p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoOpenModal;