import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URI = process.env.NEXT_PUBLIC_BASE_URI;

interface OfferData {
  offerName: string;
  offerDescription: string;
  offerTermsCondition: string;
  eCommerce: boolean;
  cities: string[];
  retailPrice: number;
  userLimit: string;
  offerType: string;
  inStore: boolean;
  online: boolean;
  offerCode: string;
  applyTo: string[];
  offerAmount: string;
  discountPercentage: number;
  startDate: string;
  endDate?: string; // Optional if `setTimeUnlimited` is true
  setTimeUnlimited: boolean;
  isShareable: string; // "yes" or "no"
  brandId: string;
}

interface OfferState {
  offerName: string;
  offerDescription: string;
  offerTermsCondition: string;
  eCommerce: boolean;
  cities: string[];
  retailPrice: number;
  userLimit: string;
  offerType: string;
  inStore: boolean;
  online: boolean;
  offerCode: string;
  applyTo: string[];
  offerAmount: string;
  discountPercentage: number;
  startDate: string;
  endDate?: string;
  setTimeUnlimited: boolean;
  isShareable: string;
  brandId: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string;
  offerId: string;
  error: string | null;
}

// Enhanced API error handling
const handleApiError = (error: any) => {
  if (error.response?.data?.error?.errors) {
    return error.response.data.error.errors;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An unexpected error occurred';
};

// Thunk for creating an offer
export const createOffer = createAsyncThunk(
  'offer/createOffer',
  async (offerData: OfferData, { rejectWithValue }) => {
    try {
      const authToken = typeof window !== 'undefined' ? Cookies.get('authToken') : null;

      if (!authToken) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.post(
        `${BASE_URI}/brand/create-offers`,
        offerData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Initial state
const initialState: OfferState = {
  offerName: '',
  offerDescription: '',
  offerTermsCondition: '',
  eCommerce: false,
  cities: [],
  retailPrice: 0,
  userLimit: '',
  offerType: '',
  inStore: false,
  online: false,
  offerCode: '',
  applyTo: [],
  offerAmount: '',
  discountPercentage: 0,
  startDate: '',
  endDate: undefined,
  setTimeUnlimited: false,
  isShareable: '',
  brandId: '',
  status: 'idle',
  message: '',
  offerId: '',
  error: null,
};

// Slice
const offerSlice = createSlice({
  name: 'offer',
  initialState,
  reducers: {
    setOfferField: (state, action: PayloadAction<{ name: keyof OfferState; value: any }>) => {
      const { name, value } = action.payload;
      if (name in state) {
        (state[name] as any) = value;
      }
    },
    resetOfferForm: () => initialState,
    clearOfferError: (state) => {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOffer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createOffer.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.offerId = action.payload.data.id;
        Object.assign(state, initialState, {
          status: 'succeeded',
          message: action.payload.message,
          offerId: action.payload.data.id,
        });
      })
      .addCase(createOffer.rejected, (state, action: PayloadAction<any>) => {
        state.status = 'failed';
        const error = action.payload;
        // Check if the error message exists
        state.error =
          typeof error === 'string'
            ? error
            : error?.errors || // Check for specific "errors" field
              error?.message || // Fallback to "message" field
              'An error occurred'; // Generic fallback
      });
  },
});

export const { setOfferField, resetOfferForm, clearOfferError } = offerSlice.actions;
export default offerSlice.reducer;

// Selectors
export const selectOfferState = (state: { offer: OfferState }) => state.offer;
export const selectOfferStatus = (state: { offer: OfferState }) => state.offer.status;
export const selectOfferError = (state: { offer: OfferState }) => state.offer.error;
