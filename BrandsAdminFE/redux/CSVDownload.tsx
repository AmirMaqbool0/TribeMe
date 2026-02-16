import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define types for payloads
interface FileState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface RejectPayload {
  message: string;
}

// Async thunk for file download
export const downloadFile = createAsyncThunk<
  string, // Success type
  void, // Argument type
  { rejectValue: RejectPayload } // Rejected value type
>(
  'file/download',
  async (_, { rejectWithValue }) => {
    try {
      // Get token from localStorage or a secure source
      const authToken = Cookies.get('authToken');

      // Check if token exists
      if (!authToken) {
        return rejectWithValue({ message: 'Authentication token is missing. Please log in.' });
      }

      // API call to download the file
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/download-file`,
        {
          responseType: 'blob', // Ensures the response is treated as a binary file
          headers: {
            Authorization: `Bearer ${authToken}`, // Include the token in the request headers
          },
        }
      );

      // Ensure response data type is Blob
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'brands_and_offers.csv'); // Set file name and extension
      document.body.appendChild(link);
      link.click();
      link.remove();

      return 'File downloaded successfully';
    } catch (error: any) {
      // Handle error and reject with proper message
      const errorMessage = error?.response?.data?.message || 'Download failed';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Slice
const fileSlice = createSlice({
  name: 'file',
  initialState: {
    loading: false,
    error: null,
    success: null,
  } as FileState,
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(downloadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(downloadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload; // Set success message
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'An error occurred'; // Set error message
      });
  },
});

export const { clearState } = fileSlice.actions;

export default fileSlice.reducer;
