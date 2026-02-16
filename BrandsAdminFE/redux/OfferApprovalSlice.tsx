import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from "js-cookie";

// Define the types for the slice state
interface OfferState {
  loading: boolean;
  successMessage: string | null;
  error: string | null;
}

interface OfferActionPayload {
  redemptionId: string;
  approve: boolean;
  rejectionReason?: string;
}

interface RejectPayload {
  message: string;
}

interface ApiResponse {
  message: string;
}

const initialState: OfferState = {
  loading: false,
  successMessage: null,
  error: null,
};

// Async thunk for handling offer actions (approve/reject)
export const handleOfferAction = createAsyncThunk<
  string,
  OfferActionPayload,
  { rejectValue: RejectPayload }
>(
  'offerApproval/handleOfferAction',
  async ({ redemptionId, approve, rejectionReason }, { rejectWithValue }) => {
    try {
      const authToken = Cookies.get("authToken");

      if (!authToken) {
        return rejectWithValue({ message: "Authentication required" });
      }

      const response = await axios.post<ApiResponse>(
        `https://brands-member-be.tribeme.com/api/v1/brand/redemptions-request/action/${redemptionId}`,
        {
          approve,
          rejectionReason: approve ? undefined : rejectionReason,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.message || 'Action completed successfully';
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Request failed';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

const offerApprovalSlice = createSlice({
  name: 'offerApproval',
  initialState,
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleOfferAction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(handleOfferAction.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(handleOfferAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'An unexpected error occurred';
      });
  },
});

export const { clearState } = offerApprovalSlice.actions;
export default offerApprovalSlice.reducer;
