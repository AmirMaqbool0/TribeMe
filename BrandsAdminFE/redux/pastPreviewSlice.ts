import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import Cookies from 'js-cookie';

// Define the types for a single past offer preview
interface PastOfferPreview {
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
    uses: string;
    status: string; // Additional field to track past offer status
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
        offerStatus: string; // Assuming there's a status field for past offers
    }[];
    message: string;
    success: boolean;
}

// Async thunk to fetch a single past offer preview by ID
export const fetchPastOfferPreviews = createAsyncThunk<
    PastOfferPreview,
    string,
    { state: RootState; rejectValue: string }
>('offers/fetchPastOfferPreviews', async (offerId, { rejectWithValue }) => {
    const authToken = Cookies.get('authToken');

    if (!authToken) {
        return rejectWithValue('No token available');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/brand/offers/past`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken }`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch past offer preview');
        }

        const data: ApiResponse = await response.json();

        // Filter the offers to get the one with the matching offerId
        const offer = data.data.find((offer) => offer.id === offerId);

        if (!offer) {
            return rejectWithValue('Past Offer not found');
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
                start: new Date(offer.startDate).toISOString().split('T')[0],
                end: new Date(offer.endDate).toISOString().split('T')[0],
            },
            uses, // Include the "uses" field
            status: offer.offerStatus || 'N/A', // Add status of the past offer
        };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Unknown error');
    }
});

// Define the initial state type for a single past offer preview
interface PastOfferPreviewState {
    preview: PastOfferPreview | null;
    isLoading: boolean;
    error: string;
}

// Initial state
const initialState: PastOfferPreviewState = {
    preview: null,
    isLoading: false,
    error: '',
};

// Create the slice
const pastPreviewSlice = createSlice({
    name: 'pastOfferPreviews',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPastOfferPreviews.pending, (state) => {
                state.isLoading = true;
                state.error = '';
            })
            .addCase(fetchPastOfferPreviews.fulfilled, (state, action: PayloadAction<PastOfferPreview>) => {
                state.isLoading = false;
                state.preview = action.payload;
                console.log('Fetched Past Preview:', state.preview); // Debug the fetched data
            })
            .addCase(fetchPastOfferPreviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to load past offer preview';
            });
    },
});

export default pastPreviewSlice.reducer;