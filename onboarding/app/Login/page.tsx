"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FaFacebookF, FaGoogle, FaApple } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/Welcome');
      } else {
        const result = await response.json();
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex flex-col min-h-screen bg-white">
      <Box className={`flex ${isMobile ? 'justify-center' : 'justify-between'} items-start p-4`}>
        <Link href="/">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-24 sm:w-32 h-auto"
            style={{ backgroundColor: "transparent" }}
          />
        </Link>
      </Box>

      <Box className="flex flex-col md:flex-row max-w-6xl mx-auto p-4 flex-1">
        <Box className="flex-1 flex flex-col justify-center p-4">
          <Typography
            variant="h4"
            className="font-bold mb-2 text-center md:text-left text-black" 
          >
            Login
          </Typography>
          <Typography variant="body1" className="mb-6 text-center md:text-left text-black">
            Login to access your Tribeme account
          </Typography>
          <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField 
              label="Email" 
              type="email" 
              fullWidth 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField 
              label="Password" 
              type="password" 
              fullWidth 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel control={<Checkbox />} label="Remember me" sx={{ color: "black" }}/>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: "rgb(255 57 81 / var(--tw-bg-opacity))",
                "&:hover": {
                  backgroundColor: "rgb(255 57 81 / 0.8)",
                },
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            {error && (
              <Typography variant="body2" color="error" className="text-center mt-2">
                {error}
              </Typography>
            )}

            <Typography variant="body2" className="text-center mt-2 text-black">
              Don't have an account?{" "}
              <Link href="/SignUp" className="text-pink">
                Sign up
              </Link>
            </Typography>
            <Box className="flex items-center my-4">
              <hr className="flex-1 border-t border-gray-300" />
              <Typography variant="body2" className="mx-4 text-gray-500">
                Or login with
              </Typography>
              <hr className="flex-1 border-t border-gray-300" />
            </Box>
            <Box className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outlined"
                className="flex-1 rounded-lg border-gray-300 flex items-center justify-center gap-2"
                startIcon={<FaFacebookF className="text-blue-600" />}
              >
              </Button>
              <Button
                variant="outlined"
                className="flex-1 rounded-lg border-gray-300 flex items-center justify-center gap-2"
                startIcon={<FaGoogle className="text-red-600" />}
              >
              </Button>
            </Box>
          </Box>
        </Box>

        {!isMobile && (
          <Box className="hidden md:flex md:w-1/2 justify-center items-center p-4">
            <Image
              src="/Rectangle 20.png"
              alt="Login"
              width={600}
              height={600}
              className="object-contain"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;
