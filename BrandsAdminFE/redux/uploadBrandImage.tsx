import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';


// Define state structure
interface UploadImageState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  imageUrl: string | null;
}

interface UploadImageResponse {
  imageUrl: string;
}

interface UploadImageArgs {
  file: File;
  brandId: string;
}

// Async thunk for image upload
export const uploadImage = createAsyncThunk<
  UploadImageResponse,
  UploadImageArgs,
  { rejectValue: { message: string } }
>(
  'uploadImage/uploadImage',
  async ({ file, brandId }, { rejectWithValue }) => {
    try {
      const authToken = Cookies.get('authToken');

      if (!authToken) {
        return rejectWithValue({ message: 'Authentication required' });
      }

      const formData = new FormData();
      formData.append('images', file); // Match Postman key ("images")

      const response = await axios.put<UploadImageResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URI}/brand/upload-logo/${brandId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data; // Return response directly
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue({
          message: error.response.data.message || 'Upload failed',
        });
      }
      return rejectWithValue({ message: 'An unexpected error occurred' });
    }
  }
);

const initialState: UploadImageState = {
  status: 'idle',
  error: null,
  imageUrl: null,
};

const uploadImageSlice = createSlice({
  name: 'uploadLogo',
  initialState,
  reducers: {
    resetUploadImageState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.imageUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.imageUrl = action.payload.imageUrl;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to upload image';
      });
  },
});

export const { resetUploadImageState } = uploadImageSlice.actions;
export default uploadImageSlice.reducer;

export const selectUploadImageState = (state: { uploadLogo: UploadImageState }) =>
  state.uploadLogo;
export const selectUploadImageStatus = (state: { uploadLogo: UploadImageState }) =>
  state.uploadLogo.status;
export const selectUploadImageError = (state: { uploadLogo: UploadImageState }) =>
  state.uploadLogo.error;
export const selectUploadImageUrl = (state: { uploadLogo: UploadImageState }) =>
  state.uploadLogo.imageUrl;
