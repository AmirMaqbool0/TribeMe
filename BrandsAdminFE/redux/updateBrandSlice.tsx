import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from 'js-cookie';

const BASE_URI = process.env.NEXT_PUBLIC_BASE_URI;

if (!BASE_URI) {
  throw new Error("BASE_URI is not defined in the environment variables.");
}

// Define the structure for the update API request
interface UpdateBrandRequest {
  id: string; // Brand ID
  firstName?: string;
  lastName?: string;
  email?: string;
  category?: string;
  subCategory?: string;
  businessName?: string;
  website?: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  brandDescription?: string;
}

// Define the structure for the update API response
interface UpdateBrandResponse {
  statusCode: number;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    category: string;
    subCategory: string;
    businessName: string;
    website: string;
    address: string;
    phone: string;
    city: string;
    state: string;
    zipCode: string;
    updatedAt: string;
  };
  message: string;
  success: boolean;
}

// Define the state for the update operation
interface UpdateBrandState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  updatedBrand: UpdateBrandResponse["data"] | null;
}

// Initial state
const initialState: UpdateBrandState = {
  status: "idle",
  error: null,
  updatedBrand: null,
};

// Async thunk for updating brand details
export const updateBrandDetails = createAsyncThunk(
  "brand/updateDetails",
  async (updateData: UpdateBrandRequest): Promise<UpdateBrandResponse["data"]> => {
    const authToken = Cookies.get('authToken');

    if (!authToken) {
      throw new Error("No token found in session storage");
    }

    try {
      const { id, ...data } = updateData; // Extract ID and other fields to send as payload
      const response = await axios.put<UpdateBrandResponse>(
        `${BASE_URI}/brand/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update API Full Response:", response);

      // Validate response structure
      if (response?.data?.data) {
        return response.data.data; // Return updated brand details
      } else {
        throw new Error(
          "Unexpected API response structure. 'data' field is missing."
        );
      }
    } catch (error: any) {
      console.error("Error updating brand details:", {
        message: error.message,
        responseData: error.response?.data,
      });

      throw new Error(
        error.response?.data?.message || "Error updating brand details"
      );
    }
  }
);
// Create the slice
const updateBrandSlice = createSlice({
  name: "updateBrand",
  initialState,
  reducers: {}, // No regular reducers needed for now
  extraReducers: (builder) => {
    builder
      .addCase(updateBrandDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateBrandDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.updatedBrand = action.payload; // Save the updated brand details
        console.log("Updated brand details:", action.payload); // Log the correct payload
      })
      .addCase(updateBrandDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Unknown error";
      });
  },
});

// Selectors
export const selectUpdateBrandStatus = (state: { updateBrand: UpdateBrandState }) =>
  state.updateBrand.status;

export const selectUpdateBrandError = (state: { updateBrand: UpdateBrandState }) =>
  state.updateBrand.error;

export const selectUpdatedBrand = (state: { updateBrand: UpdateBrandState }) =>
  state.updateBrand.updatedBrand;

// Export the reducer
export default updateBrandSlice.reducer;
