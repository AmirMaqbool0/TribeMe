import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface Redemption {
  id: string;
  status: string;
  paymentMethod: string;
  promoCodeUsed:string;
  offer:{ name:string };
  user:{ name:string };
}

interface RedemptionsRequestState {
  redemptions: Redemption[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: RedemptionsRequestState = {
  redemptions: [],
  status: "idle",
  error: null,
};

export const fetchRedemptionsRequest = createAsyncThunk<
  Redemption[],
  { status: string; page: number; limit: number; startDate: string },
  { rejectValue: string }
>(
  "redemptionsRequest/fetchRedemptionsRequest",
  async ({ status, page, limit, startDate }, { rejectWithValue }) => {
    try {
      const authToken = Cookies.get("authToken");

      if (!authToken) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.get<{ data: { redemptions: Redemption[] } }>(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/redemptions-request/promo`,
        {
          params: {
            status,
            page,
            limit,
            startDate,
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      return response.data.data.redemptions;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch redemption requests"
      );
    }
  }
);

const redemptionsRequestSlice = createSlice({
  name: "redemptionsRequest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRedemptionsRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchRedemptionsRequest.fulfilled,
        (state, action: PayloadAction<Redemption[]>) => {
          state.status = "succeeded";
          state.redemptions = action.payload;
        }
      )
      .addCase(fetchRedemptionsRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error fetching redemption requests";
      });
  },
});

export default redemptionsRequestSlice.reducer;
