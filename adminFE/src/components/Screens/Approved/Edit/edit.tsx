"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import images from "@/assets/images";
import Image from "next/image";
import './style.css'

interface Brand {
  brand_id: number;
  firstName: string;
  lastName: string;
  businessName?: string;
  phoneNumber: string;
  businessEmail: string;
  city: string;
  category: string;
  subCategory?: string[];
  address: string;
  zipCode: string;
  status: string;
  profilePictureUrl?: string;
}

export const Edit = () => {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isSaveConfirmed, setSaveIsConfirmed] = useState(false);
  const [ecommerce, setEcommerce] = useState<boolean | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    phoneNumber: '',
    address: '',
    category: '',
    subCategory: '',
    ecommerce: false
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get('id');

  // Fetch brand details
  useEffect(() => {
    const fetchBrand = async () => {
      if (!brandId) {
        setError('Brand ID is required');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/brand/${brandId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch brand details');
        const brandData = await res.json();
        
        setBrand(brandData);
        setFormData({
          businessName: brandData.businessName || `${brandData.firstName} ${brandData.lastName}`,
          phoneNumber: brandData.phoneNumber,
          address: brandData.address,
          category: brandData.category,
          subCategory: Array.isArray(brandData.subCategory) ? brandData.subCategory.join(', ') : (brandData.subCategory || ''),
          ecommerce: false // Default value, you might want to add this field to your brand entity
        });
        setEcommerce(false); // Default value
      } catch (err: any) {
        setError(err.message || 'Error fetching brand details');
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [brandId]);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ConfirmSaveModal = () => {
    setSaveIsConfirmed(true);
    // Here you would typically save the changes to the backend
    setTimeout(() => {
      closeModal();
      router.push('/approved');
    }, 2000);
  };

  const Save = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setSaveModalOpen(true);
  };

  const closeModal = () => {
    setSaveModalOpen(false);
    setSaveIsConfirmed(false);
  };

  if (loading) return <div className="p-8">Loading brand details...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!brand) return <div className="p-8 text-red-600">Brand not found</div>;

  return (
    <div className="p-8 w-full mb-5 rounded-xl mx-auto bg-[#FAFAFA]">
      <button
        onClick={handleBack}
        className="text-blue-500 mb-4 w-[109px] h-[22px] gap-0 text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 md:text-[16px]"
      >
        <span onClick={handleBack} className="text-[3vh]">
          &larr;{" "}
        </span>
        Back
      </button>
      <h1 className="mb-1 text-[#2D3748] text-left text-[32px] font-bold leading-[40.32px] font-outfit md:text-[28px] sm:text-[24px]">
        Edit {brand.businessName || `${brand.firstName} ${brand.lastName}`}
      </h1>
      <p className="text-[#4A5568] font-inter mb-6 text-sm sm:text-base md:text-lg">
        Following are the details of {brand.businessName || `${brand.firstName} ${brand.lastName}`}
      </p>

      <form>
        {/* Brand Name */}
        <div className="mb-6">
          <label className="block text-[#1A202C] text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 font-inter mb-2">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Ex. ABC Pvt. Ltd."
            className="w-full max-w-full h-[44.92px] px-[15.85px] py-[6.61px] gap-0 rounded-tl-[5.28px] flex justify-between border rounded-lg text-[#718096] bg-[#EDF2F7] focus:outline-none"
          />
        </div>

        {/* Ecommerce Toggle */}
        <div className="mb-6">
          <label className="block text-[#1A202C] text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 font-inter mb-2">
            Ecommerce
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setEcommerce(true)}
              className={`w-[113px] h-[35.38px] px-[17.26px] py-[7.19px] gap-[17px] rounded-lg font-medium ${
                ecommerce === true ? 'bg-[#FF3951] text-[#FFFFFF]' : 'bg-[#EDF2F7] text-[#718096]'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setEcommerce(false)}
              className={`w-[113px] h-[35.38px] px-[17.26px] py-[7.19px] gap-[17px] rounded-lg font-medium ${
                ecommerce === false ? 'bg-[#FF3951] text-[#FFFFFF]' : 'bg-[#EDF2F7] text-[#718096]'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Brand Logo */}
        <div className="mb-6">
          <label className="block text-[#1A202C] text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 font-inter mb-2">
            Brand Logo
          </label>
          <div className="flex items-center space-x-4 brand-logo" >
            <div className="w-[135px] h-[126.09px] bg-gray-100 flex items-center justify-center rounded-md">
              {brand.profilePictureUrl ? (
              <Image
                  src={brand.profilePictureUrl}
                  alt={`${brand.businessName || `${brand.firstName} ${brand.lastName}`} Logo`}
                width={100}
                height={100}
                  className="object-cover w-full h-full rounded-md"
              />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏢</div>
                    <div>No Logo</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2 upload-btn">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 font-medium">
                Change
              </button>
              <button type="button" className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 font-medium">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Contact Number */}
        <div className="mb-6">
          <label className="text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 block text-[#1A202C] font-inter mb-2">
            Primary Contact No.
          </label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+91 | Ex. 99999 99999"
            className="w-full max-w-full h-[44.92px] px-[15.85px] py-[6.61px] gap-0 rounded-tl-[5.28px] flex justify-between border rounded-lg text-[#718096] bg-[#EDF2F7] focus:outline-none"
          />
        </div>

        {/* Primary Retail Address */}
        <div className="mb-6">
          <label className="block text-[#1A202C] text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 font-inter mb-2">
            Primary Retail Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Lorem ipsum"
            className="w-full max-w-full h-[44.92px] px-[15.85px] py-[6.61px] gap-0 rounded-tl-[5.28px] flex justify-between border rounded-lg text-[#718096] bg-[#EDF2F7] focus:outline-none"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-[#1A202C] text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 font-inter mb-2">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Lorem ipsum"
            className="w-full max-w-full h-[44.92px] px-[15.85px] py-[6.61px] gap-0 rounded-tl-[5.28px] flex justify-between border rounded-lg text-[#718096] bg-[#EDF2F7] focus:outline-none"
          />
        </div>

        {/* Sub Category */}
        <div className="mb-6">
          <label className="block text-[#1A202C] text-[18.49px] font-normal leading-[22.38px] text-left opacity-80 font-inter mb-2">
            Sub Category
          </label>
          <input
            type="text"
            value={formData.subCategory}
            onChange={(e) => handleInputChange('subCategory', e.target.value)}
            placeholder="Lorem ipsum"
            className="w-full max-w-full h-[44.92px] px-[15.85px] py-[6.61px] gap-0 rounded-tl-[5.28px] flex justify-between border rounded-lg text-[#718096] bg-[#EDF2F7] focus:outline-none"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          onClick={Save}
          className="w-full max-w-full h-[59px] px-[23.98px] py-[9.99px] gap-[23.62px] rounded-tl-[7.99px] mt-4 bg-Red text-primary rounded-lg font-medium text-lg"
        >
          Save
        </button>
      </form>

      {/* Save Modal */}
      {isSaveModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-primary p-5 px-4 shadow-xl relative w-[80%] max-h-[65vh] sm:w-[40%] md:w-[55%] md:h-[59vh] lg:w-[43%] lg:h-[60%] xl:w-[65vh] xl:h-[45vh] h-auto rounded-[30px]">
            <div className="flex text-center justify-center">
              <button
                onClick={closeModal}
                className="absolute top-0 right-0 w-[55px] h-[55px] xl:w-[55px] xl:h-[60px] lg:w-[55px] md:h-[60px] md:w-[55px] text-white text-[2rem] hover:text-black p-2 text-black flex items-center justify-center rounded-bl-[30px] rounded-tr-[30px] model-btn"
              >
                &times;
              </button>
            </div>
            {!isSaveConfirmed ? (
              <div>
                <div className="mb-14 text-center">
                  <h2 className="font-outfit text-[25px] xl:text-[32px] lg:text-[30px] md:text-[29px] font-bold tracking-wide leading-35 mt-8 text-[#000000]">
                    Do you want to save Changes?
                  </h2>
                </div>
                <div className="flex flex-row justify-between mt-5 md:mt-9 lg:mt-7 xl:mt-9 px-0 xl:px-2 md:px-0 lg:px-1">
                  <div className="px-0 py-4 xl:py-4 flex justify-center items-center">
                    <button
                      onClick={closeModal}
                      className="bg-Red text-primary hover:bg-primary hover:text-Red border hover:border-Red rounded-lg text-[15px] md:text-[17px] lg:text-[17px] xl:text-[17px] leading-[6px] md:leading-[30px] lg:leading-[30px] xl:leading-[30px] px-2 py-2.5 xl:py-2 xl:px-8 lg:px-2.5 md:py-2.5 md:whitespace-nowrap text-center"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="px-0 py-4 xl:py-4 flex justify-center items-center">
                    <button
                      onClick={ConfirmSaveModal}
                      className="bg-primary text-Red hover:bg-Red hover:text-primary border hover:border-primary rounded-lg text-[15px] md:text-[17px] lg:text-[17px] xl:text-[17px] leading-[6px] md:leading-[30px] lg:leading-[30px] xl:leading-[30px] px-2 py-2.5 xl:py-2 xl:px-8 lg:px-2.5 md:py-2.5 md:whitespace-nowrap text-center"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-[100%] flex items-center justify-center flex-col" > 
                  <Image
                    src={images.approved.successful}
                    alt="Successful"
                    width={150}
                    height={150}
                  />
                <div className="font-outfit text-[27px] lg:text-[32px] md:text-[30px] xl:text-[32px] font-bold text-center leading-[35px] " >
                  Changes Saved Successfully!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
