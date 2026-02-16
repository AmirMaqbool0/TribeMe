import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define the types for the update data
interface UpdateData {
  offerName: string;
  offerDescription: string;
  offerTermsCondition: string;
  eCommerce: boolean;
  inStore:boolean;
  online:boolean;
  cities: string[];
  retailPrice: Number;
  userLimit: string;
  offerType: string;
  offerCode: string;
  applyTo: string[];
  offerAmount: string;
  discountPercentage: Number;
  startDate: string;
  endDate?: string; // Optional if `setTimeUnlimited` is true
  setTimeUnlimited: boolean;
  isShareable: string; // "yes" or "no"
  brandId: string;
}

interface UpdateOfferPayload {
  offerId: string;
  updateData: UpdateData;
}

// Define the state shape for the slice
interface UpdateOfferState {
  data: UpdateData | null; // Updated offer data
  loading: boolean; // API loading state
  error: string | null; // Error message
  success: boolean; // Whether the operation succeeded
}

// Initial state
const initialState: UpdateOfferState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

// Async thunk for updating an offer
export const updateOffer = createAsyncThunk<
  UpdateData, // The type of the data returned on success
  UpdateOfferPayload, // The type of the arguments passed to the thunk
  { rejectValue: string } // The type of the rejectWithValue payload
>(
  'offers/updateOffer',
  async (
    { offerId, updateData }: UpdateOfferPayload,
    { rejectWithValue }
  ): Promise<UpdateData | ReturnType<typeof rejectWithValue>> => {
    try {
      const authToken = typeof window !== 'undefined' ? Cookies.get('authToken') : null;

      console.log(authToken + ' This is token');
      
      if (!authToken) {
        return rejectWithValue('Authentication required'); // Use string as rejectValue
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/offers/update/${offerId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data as UpdateData; // Explicit type assertion
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update offer. Please try again.'
      );
    }
  }
);

const updateOfferSlice = createSlice({
  name: 'updateOffer',
  initialState,
  reducers: {
    resetUpdateOfferState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOffer.fulfilled, (state, action: PayloadAction<UpdateData>) => {
        state.loading = false;
        state.data = action.payload; // Save updated offer data
        state.success = true;
      })
      .addCase(updateOffer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred.';
        state.success = false;
      });
  },
});

export const { resetUpdateOfferState } = updateOfferSlice.actions;

export default updateOfferSlice.reducer;
