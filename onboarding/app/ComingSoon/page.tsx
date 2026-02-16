import React from 'react';
import Link from 'next/link';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-4 text-black">
      <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
      <p className="text-xl mb-8">We're working hard to bring you something amazing. Stay tuned!</p>
     <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition">
        Go Back Home
      </Link>
    </div>
  );
};

export default ComingSoon;