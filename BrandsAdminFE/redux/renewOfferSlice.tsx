import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define the types for the renew offer data
interface RenewOfferData {
  offerName: string;
  offerCode: string;
  applyTo: string[];
  endDate: string;
}

// Define the payload structure for the renew offer
interface RenewOfferPayload {
  offerId: string;
  renewData: RenewOfferData;
}

// Define the state shape for the slice
interface RenewOfferState {
  data: RenewOfferData | null; // Renewed offer data
  loading: boolean; // API loading state
  error: string | null; // Error message
  success: boolean; // Whether the operation succeeded
}

// Initial state
const initialState: RenewOfferState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

// Async thunk for renewing an offer
export const renewOffer = createAsyncThunk<
  RenewOfferData, // The type of the data returned on success
  RenewOfferPayload, // The type of the arguments passed to the thunk
  { rejectValue: string } // The type of the rejectWithValue payload
>(
  'offers/renewOffer',
  async (
    { offerId, renewData }: RenewOfferPayload,
    { rejectWithValue }
  ): Promise<RenewOfferData | ReturnType<typeof rejectWithValue>> => {
    try {
      const authToken = typeof window !== 'undefined' ? Cookies.get('authToken') : null;

      if (!authToken) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/offers/renew/${offerId}`,
        renewData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data as RenewOfferData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.errors || 'Failed to renew offer. Please try again.';
      return rejectWithValue(errorMessage); // Return the error message from the backend
    }
  }
);

const renewOfferSlice = createSlice({
  name: 'renewOffer',
  initialState,
  reducers: {
    resetRenewOfferState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(renewOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(renewOffer.fulfilled, (state, action: PayloadAction<RenewOfferData>) => {
        state.loading = false;
        state.data = action.payload;
        state.success = true;
      })
      .addCase(renewOffer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred.';
        state.success = false;
      });
  },
});

export const { resetRenewOfferState } = renewOfferSlice.actions;

export default renewOfferSlice.reducer;
