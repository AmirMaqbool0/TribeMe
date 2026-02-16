import React, { useState, Suspense } from 'react';
import 'react-phone-input-2/lib/style.css'; // Import default styles
import './phoneInputStyles.css'; // Import custom styles

// Declare types for PhoneInput component props
interface PhoneInputProps {
  country?: string;
  value?: string;
  onChange: (
    value: string,
    data: object,
    event: React.ChangeEvent<HTMLInputElement>,
    formattedValue: string
  ) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

// Lazy load the PhoneInput component
const PhoneInput = React.lazy(() => import('react-phone-input-2'));

const MyPhoneInputComponent: React.FC = () => {
  const [phone, setPhone] = useState<string>('');

  return (
    <div className="phone-input-wrapper">
      <Suspense fallback={<div>Loading...</div>}>
        <PhoneInput
          country={'us'} // Set the default country
          value={phone}
          onChange={(phone: string) => setPhone(phone)}
          inputProps={{
            name: 'phone',
            required: true,
            autoFocus: true,
            className: 'form-control' // Apply custom class for styling
          }}
        />
      </Suspense>
    </div>
  );
};

export default MyPhoneInputComponent;
