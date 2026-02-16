"use client";
import React from "react";
import Link from "next/link";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { CgArrowLeft } from "react-icons/cg";

const ForgotPassword: React.FC = () => {
  return (
    <Box className="flex min-h-screen bg-white relative">
      {/* Responsive Logo */}
      <Box className="absolute top-4 left-1/2 transform -translate-x-1/2 md:left-4 md:transform-none md:-translate-x-0">
        <Link href="/" passHref>
          <img src="/logo.svg" alt="Logo" className="w-24 h-auto md:w-32" />
        </Link>
      </Box>

      {/* Grid Layout */}
      <Grid container className="flex-1">
        {/* Left Form Section */}
        <Grid
          item
          xs={12}
          md={6}
          className="flex justify-center items-center p-4 md:p-8"
        >
          <Box className="w-full max-w-md">
            {/* Back to Login */}
            <Box className="flex items-center mb-4 md:mb-6">
              <Link href="/login" passHref>
                <IconButton>
                  <CgArrowLeft size={24} className="text-gray-600" />
                </IconButton>
              </Link>
              <Link href="/login" passHref>
                <Typography variant="body2" className="ml-2 cursor-pointer">
                  Back to login
                </Typography>
              </Link>
            </Box>

            {/* Forgot Password Form */}
            <Typography variant="h4" className="font-bold mb-3 md:mb-4">
              Forgot your password?
            </Typography>
            <Typography variant="body1" className="mb-4 md:mb-6">
              Don’t worry, happens to all of us. Enter your email below to
              recover your password.
            </Typography>
            <Box component="form" className="flex flex-col gap-4">
              <TextField label="Email" type="email" fullWidth required />
              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{
                  backgroundColor: "rgb(255 57 81 / var(--tw-bg-opacity))",
                  "&:hover": {
                    backgroundColor: "rgb(255 57 81 / 0.8)", // Adjust the hover state color if needed
                  },
                }}
              >
                Reset Password
              </Button>
            </Box>
          </Box>
        </Grid>
        {/* Right Image Section */}
        <Grid
          item
          xs={12}
          md={6}
          className="hidden md:flex justify-center items-center p-4 md:p-8"
        >
          <img
            src="/forgotPass.png"
            alt="Forgot Password"
            className="w-full md:w-4/5 h-auto object-cover rounded-lg"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForgotPassword;
