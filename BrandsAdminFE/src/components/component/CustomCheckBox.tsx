import images from "@/src/assets/images";
import Image from "next/image";

interface CustomCheckboxProps {
  isChecked: boolean;
  onChange: () => void;
  label?: string;
  labelClassName?: string;
  boxSize?: number;
  checkClassName?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ isChecked, onChange, label, labelClassName, boxSize = 20, checkClassName = '' }) => {

  return (

    <div className="flex place-items-center justify-start cursor-pointer" onClick={onChange}>
      <div className="relative w-[20px] h-[20px] mr-2" style={{ width: boxSize, height: boxSize }}>
        <Image src={images.checkbox.checkbox} alt="Checkbox" layout="fill" objectFit="cover" className="absolute" />
        {isChecked && (<Image src={images.checkbox.tick} alt="Checked" objectFit="cover" width={16} height={12} className={`absolute mt-0.5 ml-1 ${checkClassName}`} />)}
      </div>
      {label && <span className={`text-[#718096] font-outfit lg:text-md sm:text-xl flex items-center justify-center ${labelClassName}`}>{label}</span>}
    </div>
  );
};

