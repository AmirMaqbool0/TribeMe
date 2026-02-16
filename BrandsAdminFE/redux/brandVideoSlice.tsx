import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

interface BrandVideoState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: BrandVideoState = {
  loading: false,
  success: false,
  error: null,
};

// Async thunk for uploading brand video
export const uploadBrandVideo = createAsyncThunk<
  any,
  { video: File; brandId: string },
  { rejectValue: string }
>('brand/uploadVideo', async ({ video, brandId }, { rejectWithValue }) => {
  try {
    const authToken = Cookies.get('authToken');

    if (!authToken) {
      return rejectWithValue('Authentication required');
    }

    // Validate file type
    if (!video.type.startsWith('video/')) {
      return rejectWithValue('Please upload a valid video file');
    }

    const formData = new FormData();
    formData.append('video', video); // Key should match your backend field

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URI}/brand/upload-brand-video/${brandId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error: any) {
    let errorMessage = 'Upload failed';

    if (error.response) {
      errorMessage = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      errorMessage = 'No response from server';
    }

    return rejectWithValue(errorMessage);
  }
});

const brandVideoSlice = createSlice({
  name: 'brandVideo',
  initialState,
  reducers: {
    resetUploadState(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadBrandVideo.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(uploadBrandVideo.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(uploadBrandVideo.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { resetUploadState } = brandVideoSlice.actions;
export default brandVideoSlice.reducer;
