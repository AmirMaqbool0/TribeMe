import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import Cookies from 'js-cookie';

// Define the types for a single offer preview
interface OfferPreview {
    id: any;
    eCommerce: boolean;
    offerDeliveryBudgetCapacity: string;
    cities: string;
    retailPrice: string;
    category: string;
    subCategory: string;
    offerType: string;
    offerCode: string;
    offerValidity: {
        start: string;
        end: string;
    };
    uses: string; // New field to store 'unlimited' or the number of uses
}

interface ApiResponse {
    statusCode: number;
    data: {
        id: any;
        eCommerce: boolean;
        offerAmount: string;
        cities: string;
        retailPrice: string;
        offerType: string;
        offerCode: string;
        startDate: string;
        endDate: string;
        offerLimitUnlimited: boolean;
        offerLimitUses: string;
    }[];
    message: string;
    success: boolean;
}

// Async thunk to fetch a single offer preview by ID
export const fetchOfferPreviews = createAsyncThunk<
    OfferPreview, // Type of data to return for a single offer
    string, // Parameter type (offerId)
    { state: RootState; rejectValue: string } // Reject value type
>('offers/fetchOfferPreviews', async (offerId, { rejectWithValue }) => {
    const authToken = Cookies.get('authToken');

    if (!authToken) {
        return rejectWithValue('No token available');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/brand/offers/live`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken }`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch offer preview');
        }

        const data: ApiResponse = await response.json();

        // Filter the offers to get the one with the matching offerId
        const offer = data.data.find((offer) => offer.id === offerId);

        if (!offer) {
            return rejectWithValue('Offer not found');
        }

        // Determine the "uses" field based on offerLimitUnlimited
        const uses = offer.offerLimitUnlimited ? 'unlimited' : offer.offerLimitUses || 'N/A';

        return {
            id: offer.id || 'N/A',
            eCommerce: offer.eCommerce ?? false,
            offerDeliveryBudgetCapacity: offer.offerAmount || 'N/A',
            cities: offer.cities || 'N/A',
            retailPrice: offer.retailPrice || 'N/A',
            category: offer.offerType || 'N/A',
            subCategory: 'N/A', // Set to "N/A" if not available in the response
            offerType: offer.offerType || 'N/A',
            offerCode: offer.offerCode || 'N/A',
            offerValidity: {
                start: new Date(offer.startDate).toISOString().split('T')[0], // Extract only the date
                end: new Date(offer.endDate).toISOString().split('T')[0],     // Extract only the date
            },
            uses, // Include the "uses" field
        };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Unknown error');
    }
});

// Define the initial state type for a single offer preview
interface OfferPreviewState {
    preview: OfferPreview | null; // Handle a single offer preview
    isLoading: boolean;
    error: string;
}

// Initial state
const initialState: OfferPreviewState = {
    preview: null,
    isLoading: false,
    error: '',
};

// Create the slice
const previewSlice = createSlice({
    name: 'offerPreviews',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOfferPreviews.pending, (state) => {
                state.isLoading = true;
                state.error = '';
            })
            .addCase(fetchOfferPreviews.fulfilled, (state, action: PayloadAction<OfferPreview>) => {
                state.isLoading = false;
                state.preview = action.payload; // This should populate the preview state
                console.log('Fetched Preview:', state.preview); // Debug the fetched data
            })
            .addCase(fetchOfferPreviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to load offer preview';
            });
    },
});

export default previewSlice.reducer;
