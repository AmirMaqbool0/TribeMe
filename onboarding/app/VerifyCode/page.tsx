"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Box, Grid, Typography, TextField, Button, IconButton } from "@mui/material";
import { CgArrowLeft } from "react-icons/cg";
import Link from "next/link";

const VerifyCode: React.FC = () => {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push("/login");
  };

  const handleResendCode = () => {
    // Logic for resending the code
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: 'white',
      position: 'relative',
      p: 2,
    }}>
      {/* Logo on Top Left */}
      <Box className="absolute top-4 left-1/2 transform -translate-x-1/2 md:left-4 md:transform-none md:-translate-x-0">
        <Link href="/" passHref>
          <img src="/logo.svg" alt="Logo" className="w-24 h-auto md:w-32" />
        </Link>
      </Box>

      {/* Grid Layout */}
      <Grid container sx={{ flexGrow: 1 }}>
        {/* Left Form Section */}
        <Grid item xs={12} md={6} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 4 
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: '400px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2 
          }}>
            {/* Back to Login */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <IconButton onClick={handleBackToLogin} sx={{ 
                color: 'text.secondary' 
              }}>
                <CgArrowLeft size={24} />
              </IconButton>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  cursor: 'pointer',
                  color: 'text.secondary' 
                }} 
                onClick={handleBackToLogin}
              >
                Back to login
              </Typography>
            </Box>

            {/* Verify Code Form */}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 2 
              }}
            >
              Verify Code
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2 
              }}
            >
              An authentication code has been sent to your email.
            </Typography>
            <Box component="form" sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2 
            }}>
              <TextField 
                label="Enter Code" 
                type="text" 
                fullWidth 
                required 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary', 
                  cursor: 'pointer' 
                }} 
                onClick={handleResendCode}
              >
                Didn’t receive a code? Resend
              </Typography>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{
                  backgroundColor: "rgb(255, 57, 81)", // Pink background color
                  color: "white", // White text color
                  "&:hover": {
                    backgroundColor: "rgb(255, 57, 81, 0.8)", // Slightly transparent on hover
                  },
                  mt: 2,
                }}
              >
                Verify
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Right Image Section */}
        <Grid item xs={12} md={6} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 4 
        }}>
          <img
            src="/Rectangle 20.png"
            alt="Verify Code"
            style={{ 
              width: '60%', 
              height: 'auto', 
              objectFit: 'cover', 
              borderRadius: '16px' 
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default VerifyCode;
