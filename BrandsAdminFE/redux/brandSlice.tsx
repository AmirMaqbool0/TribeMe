import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from 'js-cookie';


const BASE_URI = process.env.NEXT_PUBLIC_BASE_URI;

if (!BASE_URI) {
  throw new Error("BASE_URI is not defined in the environment variables.");
}

// Define the API response structure
interface BrandApiResponse {
  statusCode: number;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isEmailVerified: boolean;
    password: string;
    category: string;
    subCategory: string;
    businessName: string;
    website: string;
    address: string;
    phone: string;
    city: string;
    state: string;
    zipCode: string;
    createdAt: string;
    updatedAt: string;
    images: Array<{
    id: string;
    originalName: string;
    url: string;
    size: number;
    }>;
    brandDescription?: string;
  };
  message: string;
  success: boolean;
}

// Define the BrandState interface
interface BrandState {
  brandDetails: BrandApiResponse["data"] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: BrandState = {
  brandDetails: null,
  status: "idle",
  error: null,
};

// Async thunk to fetch brand details
export const fetchBrandDetails = createAsyncThunk(
  "brand/fetchDetails",
  async (): Promise<BrandApiResponse["data"]> => {

    const authToken = Cookies.get('authToken');

    if (!authToken) {
      throw new Error("No token found in session storage");
    }

    try {
      const response = await axios.get<BrandApiResponse>(`${BASE_URI}/brand`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log("API Full Response:", response);

      // Validate response structure
      if (response?.data?.data) {
        return response.data.data; // Return brand details
      } else {
        throw new Error(
          "Unexpected API response structure. 'data' field is missing."
        );
      }
    } catch (error: any) {
      console.error("Error fetching brand details:", {
        message: error.message,
        responseData: error.response?.data,
      });

      throw new Error(
        error.response?.data?.message || "Error fetching brand details"
      );
    }
  }
);

// Create the brand slice
const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBrandDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.brandDetails = action.payload; // Assign the payload to the state
        console.log("Fetched brand details:", action.payload); // Log the correct payload
      })
      .addCase(fetchBrandDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Unknown error";
      });
  },
});

// Selectors
export const selectBrandDetails = (state: { brand: BrandState }) =>
  state.brand.brandDetails;

export const selectBrandStatus = (state: { brand: BrandState }) =>
  state.brand.status;

export const selectBrandError = (state: { brand: BrandState }) =>
  state.brand.error;

// Export the reducer
export default brandSlice.reducer;