import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { USER_LOGIN } from "../constants/types";
import { loginUser } from "../../src/config/apiRoutes";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { FaCheckCircle } from "react-icons/fa";
import Toast from "@/src/components/Toast/Toast";

export const loginUsers = createAsyncThunk(
  USER_LOGIN,
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(loginUser, credentials, {
        withCredentials: true,
      });

      // Extract relevant fields from response
      const { token, ...user } = response.data.data;
      const { message, statusCode, success } = response.data;

      const isSecure = process.env.NODE_ENV === "production";
      Cookies.set("authToken", token, {
        expires: 1,
        secure: isSecure,
        sameSite: isSecure ? "Strict" : "Lax",
        path: "/",
        domain: document.location.hostname,
      });

      return { token, user, message, statusCode, success };
    } catch (error) {
      // Adjusted for your backend error structure
      const errorMessage =
        error.response?.data?.error?.errors || // Extract error message
        "An unexpected error occurred"; // Fallback

      return rejectWithValue(errorMessage);
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState: {
    email: "",
    password: "",
    errors: {
      email: "",
      password: "",
      general: "",
    },
    isAuthenticated: false,
    user: null,
    authToken: null,
    loading: false,
    success: null,
    message: null,
    isCached: false,
    statusCode: null,
  },
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
      if (field === "email") {
        state.errors.email =
          value === "string" && !emailRegex.test(value)
            ? "Please enter a valid email address"
            : "";
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.authToken = null;
      state.errors = { email: "", password: "", general: "" };
      state.email = "";
      state.password = "";
      state.success = null;
      state.message = null;
      Cookies.remove("authToken");
      Cookies.remove("sessionToken");
    },
    clearState: (state) => {
      state.errors = { email: "", password: "", general: "" };
      state.success = null;
      state.email = "";
      state.password = "";
      state.loading = false;
      state.isAuthenticated = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUsers.pending, (state) => {
        state.loading = true;
        state.success = null;
        state.errors.general = "";
      })
      .addCase(loginUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.authToken = action.payload.token;
        state.message = action.payload.message;

        // Trigger a success toast
        toast(
          <Toast
            message={action.payload.message}
            backgroundColor="green"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
      })
      .addCase(loginUsers.rejected, (state, action) => {
        state.loading = false;

        // Update state with the extracted backend error message
        state.errors.general = action.payload;
        state.success = null;
        state.message = null;

        // Display toast with the backend error message
        toast(
          <Toast
            message={action.payload}
            backgroundColor="red"
            textColor="white"
          />,
          {
            closeButton: false,
          }
        );
      });
  },
});

export const { logout, clearState, updateField } = loginSlice.actions;

export default loginSlice.reducer;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
