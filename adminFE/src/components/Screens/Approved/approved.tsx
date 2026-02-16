"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import images from "@/assets/images";

const approved = [
  {
    name: "Walmart",
    image: "/request/walmart.png",
    contact: "99999 99999",
    category: "Sports",
    subcategory: "Sports",
  },
  {
    name: "Dunkin’ Donuts",
    image: "/request/dunkin.png",
    contact: "99999 99999",
    category: "Sports",
    subcategory: "Sports",
  },
  {
    name: "McDonald's",
    image: "/request/mcdonalds.png",
    contact: "99999 99999",
    category: "Sports",
    subcategory: "Sports",
  },
  {
    name: "Sephora",
    image: "/request/sephora.png",
    contact: "99999 99999",
    category: "Sports",
    subcategory: "Sports",
  },
  {
    name: "Starbucks",
    image: "/request/starbucks.png",
    contact: "99999 99999",
    category: "Sports",
    subcategory: "Sports",
  },
];

export const Approved = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setDeleteIsModalOpen] = useState(false);
  const [isDeleteConfirmed, setDeleteIsConfirmed] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<any>(null);
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/brand/approved-brand`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch approved brands");
        const data = await res.json();
        setBrands(data);
      } catch (err: any) {
        setError(err.message || "Error fetching brands");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  /**
   * Navigates to the 'approved/edit' page when called.
   */
  const Edit = (brandId: number) => {
    router.push(`approved/edit?id=${brandId}`);
  };

  /**
   * Opens the delete modal when called.
   */
  const openDeleteModal = (brand: any) => {
    setBrandToDelete(brand);
    setDeleteIsModalOpen(true);
  };

  /**
   * Closes the delete modal and resets the confirmation state.
   * Should be called when the modal is closed or canceled.
   */
  const handleCloseModal = () => {
    setDeleteIsModalOpen(false);
    setDeleteIsConfirmed(false);
    setBrandToDelete(null);
  };

  /**
   * Confirm delete and show success
   * @description This function is called when the user confirms the delete
   *              action. It sets the confirmation state to true and can be
   *              used to add delete logic in the future if needed.
   */
  const handleConfirmDelete = async () => {
    setDeleteIsConfirmed(true);
    
    if (brandToDelete) {
      try {
        await handleDelete(brandToDelete.brand_id);
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/brand/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete brand");
      }
      
      // Remove the brand from the local state
      setBrands(prevBrands => prevBrands.filter(brand => brand.brand_id !== id));
      
      // Show success message
      alert("Brand deleted successfully!");
    } catch (err: any) {
      alert(err.message || "Error deleting brand");
    }
  };

  const totalPages = 4;

  /**
   * Handles page number clicks.
   * @param {number} page - The page number to navigate to.
   */
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handles the "Previous" button click.
   * Decrements the current page number if the current page is not the first
   * page.
   */
  const handlePreviousClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Handles the "Next" button click.
   * Increments the current page number if the current page is not the last
   * page.
   */

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-8 shadow-lg mb-5 rounded-xl bg-[#F9F9F9]">
      {/* Header, Paragraph Section */}
      <div className="mb-4">
        <h1 className="sm:text-[32px] text-2xl p-1 font-bold mb-1 font-proxima text-[#2D3748]">
          Approved Brands
        </h1>
        <p className="w-full h-[19px] gap-0 font-inter text-[15px] font-normal leading-[19.19px] text-left opacity-70 text-[#4A5568]">
          Following is the list of approved brands
        </p>
      </div>

      {/* Table Section */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-center border-separate border-spacing-y-2">
            <thead>
              <tr className="w-full border-b border ">
                {[
                  "Name",
                  "Image",
                  "Contact",
                  "Category",
                  "Sub-category",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="text-dark-gray bg-[#E6E6E6] py-2 px-6 md:px-9 text-center font-outfit"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="border-b">
              {brands.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-gray-500">No approved brands found.</td></tr>
              ) : brands.map((brand, index) => (
                <tr
                  key={brand.brand_id || index}
                  className="border-b text-gray-4b4b4b font-outfit hover:bg-soft-gray"
                >
                  <td className="p-4">{brand.businessName || brand.name}</td>
                  <td className="flex justify-center items-center text-center">
                    <Image
                      src={brand.image || "/request/default.png"}
                      alt={brand.businessName || brand.name}
                      width={50}
                      height={50}
                      className="items-center flex justify-center w-24 h-24 object-contain rounded-lg"
                    />
                  </td>
                  <td className="p-4">{brand.phoneNumber || brand.contact}</td>
                  <td className="p-4">{brand.category}</td>
                  <td className="p-4">{brand.subCategory || brand.subcategory}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-row space-x-2 justify-center items-center">
                      <div className="py-4 flex justify-center items-center">
                        <button
                          onClick={() => Edit(brand.brand_id)}
                          disabled={false}
                          className="bg-Red text-primary hover:bg-primary hover:text-Red border hover:border-Red rounded-lg text-[16px] leading-[24px] px-4 py-2 text-center"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="py-4 flex justify-center items-center">
                        <button
                          onClick={() => openDeleteModal(brand)}
                          disabled={false}
                          className="bg-primary text-Red border-Red border hover:bg-Red hover:text-primary rounded-lg text-[16px] leading-[24px] px-4 py-2 text-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center lg:justify-end xl:justify-end">
        <nav aria-label="Page navigation">
          <ul className="inline-flex items-center rounded-full shadow-md bg-[#F7F9FF] px-4 py-2.5 drop-shadow-lg">
            {/* Previous button */}
            <li>
              <button
                onClick={handlePreviousClick}
                disabled={currentPage === 1}
                className={`px-5 py-1 rounded-full ${
                  currentPage === 1
                    ? "text-gray-500 cursor-not-allowed disabled"
                    : "text-dark-gray hover:text-red-900"
                }`}
              >
                <span className="text-[20px] font-bold">{"<"}</span>
              </button>
            </li>

            {/* Page numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <li key={page} className="mx-1">
                  <button
                    onClick={() => handlePageClick(page)}
                    className={`px-3 py-2 rounded-full font-lato text-[13.5px] font-semibold leading-[14.4px] text-center ${
                      currentPage === page
                        ? "bg-Red text-primary"
                        : "text-dark-gray"
                    } hover:bg-Red hover:text-primary focus:outline-none`}
                  >
                    {page}
                  </button>
                </li>
              );
            })}

            {/* Next button */}
            <li>
              <button
                onClick={handleNextClick}
                disabled={currentPage === totalPages}
                className={`px-5 py-1 rounded-full ${
                  currentPage === totalPages
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-dark-gray hover:text-Red"
                }`}
              >
                <span className="text-[20px] font-bold">{">"}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-secondary bg-opacity-20 z-50">
          <div className="bg-primary p-5 px-4 shadow-xl relative w-[80%] max-h-[65vh] sm:w-[40%] md:w-[55%] md:h-[59vh] lg:w-[43%] lg:h-[60%] xl:w-[65vh] xl:h-[45vh] h-auto rounded-[30px]">
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 w-[55px] h-[55px] xl:w-[55px] xl:h-[60px] lg:w-[55px] md:h-[60px] md:w-[55px] text-primary text-[2rem] hover:text-secondary text-black flex items-center justify-center rounded-bl-[30px] rounded-tr-[30px] model-btn"
            >
              &times;
            </button>

            {!isDeleteConfirmed ? (
              <div className="xl:h-[35vh] lg:h-[46vh] md:h-[46vh] mt-6 xl:mt-8 lg:mt-6 md:mt-6 text-center">
                <div className="mb-14">
                  <h2 className="font-outfit text-[25px] xl:text-[32px] lg:text-[30px] md:text-[29px] font-bold tracking-wide leading-35 mt-8 text-[#000000]">
                    Do you want to delete {brandToDelete?.businessName || brandToDelete?.name || 'this brand'}?
                  </h2>
                </div>
                <div className="flex flex-row justify-between mt-5 md:mt-9 lg:mt-7 xl:mt-5 px-0 xl:px-2 md:px-0 lg:px-1">
                  <button
                    onClick={handleCloseModal}
                    className="text-[15px] md:text-[17px] xl:text-[20px] lg:text-[19px] leading-[6px] md:leading-[30px] lg:leading-[30px] xl:leading-[30px] h-[6vh] w-[20vh] md:w-[24vh] md:h-[7vh] xl:h-[6.5vh] xl:w-[20vh] lg:h-[7vh] lg:w-[22vh] rounded-[7px] font-medium text-Red bg-primary border border-Red hover:text-primary hover:bg-Red"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="text-[15px] md:text-[17px] xl:text-[20px] lg:text-[19px] leading-[6px] md:leading-[30px] lg:leading-[30px] xl:leading-[30px] h-[6vh] w-[25vh] md:w-[28vh] md:h-[7vh] xl:h-[6.5vh] xl:w-[23vh] lg:h-[7vh] lg:w-[26vh] rounded-[7px] font-medium text-primary bg-Red hover:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-1 h-[50vh]">
                <div className="flex items-center justify-center">
                  <Image
                    src={images.approved.successful}
                    className="w-[50vh] h-[30vh] md:w-[25vh] md:h-[20vh] md:mb-0 md:mt-2 mb-2 mt-4"
                    alt="Successful"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="flex justify-center items-center">
                  <h2 className="w-auto h-auto font-outfit text-[#1F1F1F] text-[22px] md:text-[24px] xl:text-[30px] lg:text-[28px] font-medium xl:mt-7 mt-3 leading-[27px] tracking-wide">
                    Successfully Deleted
                  </h2>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
