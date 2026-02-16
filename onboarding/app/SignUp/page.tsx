"use client";
import React from "react";
import { Box, Grid, TextField, Button, Checkbox, FormControlLabel, Typography, useMediaQuery, useTheme } from "@mui/material";
import Link from 'next/link';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';

const SignUp: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: 'white', 
      p: 2,
    }}>
      {/* Logo */}
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: isSmallScreen ? 'center' : 'flex-start', 
        mb: 4,
        mt: isSmallScreen ? 2 : 0
      }}>
        <Link href="/">
          <img src="/logo.svg" alt="Logo" style={{ width: 150, height: 'auto' }} />
        </Link>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 4,
      }}>
        {/* Left Image Section */}
        <Box sx={{
          width: { xs: '70%', md: '40%' },
          maxWidth: '350px',
          height: 'auto',
          borderRadius: '25px',
          overflow: 'hidden',
          display: isSmallScreen ? 'none' : 'flex', // Hide on small screens
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/rectangle-20@2x.png"
            alt="Sign Up"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top',
            }}
          />
        </Box>

        {/* Right Form Section */}
        <Box sx={{ 
          width: { xs: '100%', md: '60%' }, 
          maxWidth: '600px',
          height: 'auto',
          textAlign: isSmallScreen ? 'center' : 'left', // Center text on small screens
        }}>
          <Box component="form" sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            height: '100%',
          }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 2,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: 'black', 
              }}
            >
              Sign Up
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: 'black' }}
            >
              Let’s get you all set up so you can access your personal account.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="First Name" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Name" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" type="email" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Password" type="password" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Confirm Password" type="password" fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox required />}
                  label="I agree to all the Terms and Privacy Policies"
                  sx={{ color: "black" }}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                backgroundColor: "rgb(255, 57, 81)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgb(255, 57, 81, 0.8)",
                },
                mt: 2,
                borderRadius: '8px',
              }}
            >
              Create Account
            </Button>

            <Box sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: "black" }}>
                Already have an account? <Link href="/Login" className="text-pink">Login</Link>
              </Typography>
            </Box>

            {/* Divider for Social Sign Up */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'text.secondary', marginRight: 2 }} />
              <Typography variant="body2" sx={{ mx: 2, color: "black" }}>
                Or Sign up with
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'text.secondary', marginLeft: 2 }} />
            </Box>

            {/* Social Media Sign-Up Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  padding: '12px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#3b5998',
                  color: '#3b5998',
                  '&:hover': {
                    borderColor: '#2d4373',
                    color: '#2d4373',
                  },
                }}
                startIcon={<FaFacebook size={18} />}
              >
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  padding: '12px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#db4437',
                  color: '#db4437',
                  '&:hover': {
                    borderColor: '#c1351d',
                    color: '#c1351d',
                  },
                }}
                startIcon={<FaGoogle size={18} />}
              >
              </Button>
              {/* <Button
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  padding: '12px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#000000',
                  color: '#000000',
                  '&:hover': {
                    borderColor: '#333333',
                    color: '#333333',
                  },
                }}
                startIcon={<FaApple size={18} />}
              >
                Apple
              </Button> */}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
