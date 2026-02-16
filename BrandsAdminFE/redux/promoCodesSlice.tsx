import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface PromoCode {
  promoCode: string;
  used: boolean;
}

interface PromoCodesState {
  promoCodes: PromoCode[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PromoCodesState = {
  promoCodes: [],
  status: "idle",
  error: null,
};

export const fetchPromoCodesByOfferId = createAsyncThunk<
  PromoCode[],
  string,
  { rejectValue: string }
>(
  "promoCodes/fetchPromoCodesByOfferId",
  async (offerId, { rejectWithValue }) => {
    try {
      const authToken = Cookies.get("authToken");

      if (!authToken) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.get<{ data: PromoCode[] }>(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/promo-codes/${offerId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Assuming the API returns an object with a `data` key:
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch promo codes"
      );
    }
  }
);

const promoCodesSlice = createSlice({
  name: "promoCodes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromoCodesByOfferId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchPromoCodesByOfferId.fulfilled,
        (state, action: PayloadAction<PromoCode[]>) => {
          state.status = "succeeded";
          state.promoCodes = action.payload;
        }
      )
      .addCase(fetchPromoCodesByOfferId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error fetching promo codes";
      });
  },
});

export default promoCodesSlice.reducer;
