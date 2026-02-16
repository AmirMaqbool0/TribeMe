import React from 'react';
import Image from 'next/image';
import images from '@/assets/images';

interface CustomCheckboxProps {
    isChecked: boolean;
    onChange: () => void;
    label?: string;
    labelClassName?: string;
    boxSize?: number;
    checkClassName?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ isChecked, onChange, label, labelClassName, boxSize = 20, checkClassName = '' }) => {
    return (
        <div className="flex items-center cursor-pointer" onClick={onChange}>
            <div className="relative w-[20px] h-[20px] mr-2" style={{ width: boxSize, height: boxSize }}>
                <Image src={images.settings.box} alt="Checkbox" layout="fill" objectFit="cover" className="absolute" />
                {isChecked && (<Image src={images.settings.check} alt="Checked" objectFit="cover" width={16} height={12} className={`absolute mt-0.5 ml-1 ${checkClassName}`} />)}
            </div>
            {label && <span className={`text-Blackish font-proxima ${labelClassName}`}>{label}</span>}
        </div>
    );
};

export default CustomCheckbox;