import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import Cookies from 'js-cookie';

// Define the types for the API response
interface ApiResponse {
  statusCode: number;
  data: any[]; // Using `any[]` to include all fields from the API response
  message: string;
  success: boolean;
}

// Async thunk to fetch past offers
export const fetchPastOffers = createAsyncThunk<
  any[], // Returning the full API response data array
  number, // The type of parameter we expect (currentPage)
  { state: RootState; rejectValue: string } // Reject value type (error message)
>('offers/fetchPastOffers', async (currentPage, { rejectWithValue }) => {
  const authToken = Cookies.get('authToken');


  if (!authToken) {
    return rejectWithValue('No token available');
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URI}/brand/offers/past`, // URL for past offers
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Handle "Not Found" as empty data instead of an error
        return [];
      }
      throw new Error(`Failed to fetch past offers: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data.data || []; // Return data or an empty array
  } catch (error: any) {
    console.error('Error fetching past offers:', error);
    return rejectWithValue(error.message || 'Unknown error');
  }
});

// Define the initial state type
interface PastOfferFetchState {
  offers: any[]; // Store all fields of the offer data
  isLoading: boolean;
  error: string | null; // Nullable error to distinguish no error
}

// Initial state
const initialState: PastOfferFetchState = {
  offers: [],
  isLoading: false,
  error: null,
};

// Create the slice
const pastOfferFetchSlice = createSlice({
  name: 'pastOffers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPastOffers.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Reset error when loading starts
      })
      .addCase(fetchPastOffers.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isLoading = false;
        state.offers = action.payload; // Set the fetched offers
        state.error = null; // Clear any error
      })
      .addCase(fetchPastOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load past offers'; // Set the error
      });
  },
});

export default pastOfferFetchSlice.reducer;
