import React, { useState } from 'react';

interface CustomInputProps {
  label: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  type = 'text',
  required = false,
  value,
  onChange,
}) => {
  const [focused, setFocused] = useState<boolean>(false);

  return (
    <div className="relative flex flex-col">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(value !== '')}
        placeholder=" "
        required={required}
        className={`peer border border-gray-300 rounded-md p-3 pt-6 bg-white focus:border-blue-500 focus:outline-none transition-all duration-300 ${
          focused || value ? 'border-blue-500' : ''
        }`}
      />
      <label
        className={`absolute top-3 left-3 text-gray-500 transition-all duration-300 transform ${
          focused || value ? '-translate-y-4 text-xs text-blue-500' : 'text-base'
        } peer-placeholder-shown:top-4 peer-placeholder-shown:left-3 peer-placeholder-shown:text-gray-500`}
      >
        {label}
      </label>
    </div>
  );
};

export default CustomInput;
