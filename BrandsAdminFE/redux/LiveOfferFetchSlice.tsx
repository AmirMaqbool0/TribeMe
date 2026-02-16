import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import Cookies from 'js-cookie';

// Define the types for the API response
interface ApiResponse {
  statusCode: number;
  data: any[]; // Use `any[]` to include all fields from the API
  message: string;
  success: boolean;
}

// Async thunk to fetch live offers
export const fetchLiveOffers = createAsyncThunk<
  any[], // Returning the full API response data array
  number, // The type of parameter we expect (currentPage)
  { state: RootState; rejectValue: string } // Reject value type (error message)
>('offers/fetchLiveOffers', async (currentPage, { rejectWithValue }) => {
  const authToken = Cookies.get('authToken');

  if (!authToken) {
    return rejectWithValue('No token available');
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URI}/brand/offers/live`, // Corrected the URL
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch offers');
    }

    const data: ApiResponse = await response.json();
    console.log('API data received:', data);

    // Return the full response data without mapping
    return data.data;
  } catch (error: any) {
    console.error('Error fetching live offers:', error); // Added for debugging
    return rejectWithValue(error.message || 'Unknown error');
  }
});

// Define the initial state type
interface LiveOfferFetchState {
  offers: any[]; // Holds the full API response
  isLoading: boolean;
  error: string;
}

// Initial state
const initialState: LiveOfferFetchState = {
  offers: [],
  isLoading: false,
  error: '',
};

// Create the slice
const liveOfferFetchSlice = createSlice({
  name: 'liveOffers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveOffers.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchLiveOffers.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isLoading = false;
        state.offers = action.payload; // Payload contains the full API response
        console.log('Offers after fetch:', state.offers);
      })
      .addCase(fetchLiveOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load offers';
      });
  },
});

export default liveOfferFetchSlice.reducer;
