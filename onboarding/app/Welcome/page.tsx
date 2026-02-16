"use client";
import React from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import Link from "next/link";

const Welcome: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: 'white', 
      p: 4 
    }}>
      {/* Header */}
      <Box className="absolute top-4 left-1/2 transform -translate-x-1/2 md:left-4 md:transform-none md:-translate-x-0">
        <Link href="/" passHref>
          <img src="/logo.svg" alt="Logo" className="w-24 h-auto md:w-32" />
        </Link>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center', 
        p: 2 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2, 
            fontWeight: 600 
          }}
        >
          Welcome on board
        </Typography>
        <Typography 
          variant="h3" 
          sx={{ 
            mb: 4, 
            fontWeight: 700 
          }}
        >
          Improdata!
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            color: 'text.secondary' 
          }}
        >
          Your waiting list number is #6534231
        </Typography>

        <Box sx={{ 
          width: '100%', 
          maxWidth: '1000px', 
          textAlign: 'left', 
          mt: 4 
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 600 
            }}
          >
            Share Your Ideas and Customization Requests
          </Typography>
          <Box sx={{ 
            position: 'relative' 
          }}>
            <TextField
              multiline
              rows={6}
              placeholder="Enter Your Requests..."
              variant="outlined"
              fullWidth
              sx={{ 
                bgcolor: 'rgba(30, 42, 59, 0.05)', // Background color with 5% opacity
                borderRadius: '8px', 
                borderColor: 'grey.300',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                },
                '& .MuiInputBase-input': {
                  padding: '16px'
                }
              }}
            />
            <Button
              variant="contained"
              sx={{ 
                position: 'absolute', 
                bottom: 8, // Added bottom spacing
                right: 8, // Added right spacing
                backgroundColor: 'rgb(255, 57, 81)', // Pink background color
                color: 'white', // White text color
                '&:hover': {
                  backgroundColor: 'rgb(255, 57, 81, 0.8)', // Slightly transparent on hover
                },
                borderRadius: '8px',
              }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'white', 
        textAlign: 'center', 
        color: 'text.secondary' 
      }}>
        &copy; 2024 Tribe Me
      </Box>
    </Box>
  );
};

export default Welcome;
