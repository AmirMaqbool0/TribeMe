import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define state structure
interface UploadVideoState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  response: any | null; // Store the entire response from the API
}

interface UploadVideoArgs {
  file: File;
  brandId: string;
}

// Async thunk for video upload
export const uploadVideo = createAsyncThunk<
  any, // Adjust to match the structure of the full response
  UploadVideoArgs,
  { rejectValue: { message: string } }
>(
  'uploadVideo/uploadVideo',
  async ({ file, brandId }, { rejectWithValue }) => {
    try {
      const authToken = Cookies.get('authToken');

      if (!authToken) {
        return rejectWithValue({ message: 'Authentication required' });
      }

      const formData = new FormData();
      formData.append('video', file); // Match Postman key ("video")

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/upload-offer-video/${brandId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data; // Return the full response
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue({
          message: error.response.data.message || 'Upload failed',
        });
      }
      return rejectWithValue({ message: 'An unexpected error occurred' });
    }
  }
);

const initialState: UploadVideoState = {
  status: 'idle',
  error: null,
  response: null, // Initialize response as null
};

const uploadVideoSlice = createSlice({
  name: 'uploadVideo',
  initialState,
  reducers: {
    resetUploadVideoState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.response = null; // Reset response
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.response = action.payload; // Save the full response
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to upload video';
      });
  },
});

// Export actions
export const { resetUploadVideoState } = uploadVideoSlice.actions;

// Export reducer
export default uploadVideoSlice.reducer;

// Selectors
export const selectUploadVideoState = (state: { uploadVideo: UploadVideoState }) =>
  state.uploadVideo;
export const selectUploadVideoStatus = (state: { uploadVideo: UploadVideoState }) =>
  state.uploadVideo.status;
export const selectUploadVideoError = (state: { uploadVideo: UploadVideoState }) =>
  state.uploadVideo.error;
export const selectUploadVideoResponse = (state: { uploadVideo: UploadVideoState }) =>
  state.uploadVideo.response;
