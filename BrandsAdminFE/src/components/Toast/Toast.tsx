import React from 'react';

interface ToastProps {
  message: string;
  backgroundColor?: string;
  textColor?: string;
}

const Toast: React.FC<ToastProps> = ({ message, backgroundColor = 'red', textColor = 'white' }) => {
  return (
    <div
      className="p-4 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-center"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="flex items-center space-x-3">
        <p className="text-xs sm:text-sm md:text-base text-center">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
