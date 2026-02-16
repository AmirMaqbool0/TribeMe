import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface Offer {
  offerId: string;
  offerName: string;
}

interface OffersState {
  offers: Offer[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OffersState = {
  offers: [],
  status: "idle",
  error: null,
};

// Async thunk to fetch offer names by brand ID
export const fetchOffersByBrandId = createAsyncThunk<Offer[], string, { rejectValue: string }>(
  "offersName/fetchOffersByBrandId",
  async (brandId, { rejectWithValue }) => {
    try {
      const authToken = Cookies.get("authToken");

      if (!authToken) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.get<{ data: Offer[] }>(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/${brandId}/offer-name`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Ensure we return only the data part of the response
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
);

const offersNameSlice = createSlice({
  name: "offersName",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffersByBrandId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOffersByBrandId.fulfilled, (state, action: PayloadAction<Offer[]>) => {
        state.status = "succeeded";
        state.offers = action.payload;
      })
      .addCase(fetchOffersByBrandId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error fetching offers";
      });
  },
});

export default offersNameSlice.reducer;
